#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

function usage() {
  console.log(`Usage:
  node scripts/cloudflare-tunnel-route.js <app-path>

Example:
  node scripts/cloudflare-tunnel-route.js apps/dash-web

Behavior:
  - Reads VITE_APP_FRONTEND_URL and VITE_DEV_PORT from <app-path>/.env.dash.tunnel.
  - Reads CF_API_TOKEN / CF_ACCOUNT_ID / CF_TUNNEL_NAME / CF_ZONE_NAME / CF_ZONE_ID from the
    sibling ../dash-backend-docker/.env (no Cloudflare secrets are duplicated into this repo).
  - Looks up the existing named tunnel (created by dash-backend-docker's tunnel script) and
    merges a single ingress rule for this app's hostname -> http://localhost:<port>, leaving
    every other hostname route (api-dev, ws-dev, other apps) untouched.
  - Ensures a proxied DNS CNAME exists for the hostname.
  - Does NOT spawn cloudflared — the already-running, remotely-managed connector picks up the
    new ingress rule live.
`);
}

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[match[1]] = value;
  }

  return values;
}

async function cfFetch(method, url, apiToken, body) {
  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await resp.json();
  if (!data.success) {
    throw new Error(`Cloudflare API ${method} ${url} failed: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

async function getTunnelIdByName({ apiToken, accountId, tunnelName }) {
  const result = await cfFetch(
    'GET',
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/cfd_tunnel?name=${encodeURIComponent(tunnelName)}&is_deleted=false`,
    apiToken
  );

  const tunnel = result[0];
  if (!tunnel) {
    throw new Error(
      `Named tunnel "${tunnelName}" not found. Start the backend tunnel first: cd dash-backend-docker && node scripts/cloudflare-tunnel.js`
    );
  }

  return tunnel.id;
}

async function ensureIngressRoute({ apiToken, accountId, tunnelId, hostname, service }) {
  const current = await cfFetch(
    'GET',
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    apiToken
  );

  const existingIngress = current?.config?.ingress || [];
  const catchAll = existingIngress.filter((rule) => !rule.hostname);
  const otherHostnameRules = existingIngress.filter(
    (rule) => rule.hostname && rule.hostname !== hostname
  );

  const ingress = [
    ...otherHostnameRules,
    { hostname, service },
    ...(catchAll.length > 0 ? catchAll : [{ service: 'http_status:404' }]),
  ];

  await cfFetch(
    'PUT',
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    apiToken,
    { config: { ingress } }
  );

  console.log(`Routed https://${hostname} -> ${service} on tunnel ${tunnelId}`);
}

async function ensureDnsRecord({ apiToken, zoneName, zoneId, hostName, cnameTarget }) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  let resolvedZoneId = zoneId || '';

  if (!resolvedZoneId) {
    const zoneResp = await fetch(
      `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`,
      { headers }
    );
    const zoneData = await zoneResp.json();
    const zone = zoneData.result?.[0];
    if (!zone?.id) {
      throw new Error(`Cloudflare zone not found for ${zoneName}`);
    }
    resolvedZoneId = zone.id;
  }

  const listResp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records?type=CNAME&name=${encodeURIComponent(hostName)}`,
    { headers }
  );
  const listData = await listResp.json();
  const existing = (listData.result || [])[0];
  const payload = { type: 'CNAME', name: hostName, content: cnameTarget, ttl: 1, proxied: true };

  if (!existing) {
    const createResp = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records`,
      { method: 'POST', headers, body: JSON.stringify(payload) }
    );
    const createData = await createResp.json();
    if (!createData.success) {
      throw new Error(`Failed to create DNS CNAME: ${JSON.stringify(createData.errors)}`);
    }
    console.log(`Created DNS CNAME: ${createData.result.name} -> ${createData.result.content}`);
    return;
  }

  if (existing.content === cnameTarget && existing.proxied === true) {
    console.log(`DNS CNAME already configured: ${existing.name} -> ${existing.content}`);
    return;
  }

  const updateResp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${resolvedZoneId}/dns_records/${existing.id}`,
    { method: 'PUT', headers, body: JSON.stringify(payload) }
  );
  const updateData = await updateResp.json();
  if (!updateData.success) {
    throw new Error(`Failed to update DNS CNAME: ${JSON.stringify(updateData.errors)}`);
  }
  console.log(`Updated DNS CNAME: ${updateData.result.name} -> ${updateData.result.content}`);
}

async function main() {
  const appPath = process.argv[2];
  if (!appPath || appPath === '--help' || appPath === '-h') {
    usage();
    process.exit(appPath ? 0 : 1);
  }

  const repoRoot = path.join(__dirname, '..');
  const appEnvFile = path.join(repoRoot, appPath, '.env.dash.tunnel');
  if (!fs.existsSync(appEnvFile)) {
    console.error(`Tunnel env file not found: ${appEnvFile}`);
    process.exit(1);
  }

  const appValues = parseEnvFile(appEnvFile);
  const frontendUrl = appValues.VITE_APP_FRONTEND_URL || '';
  const devPort = appValues.VITE_DEV_PORT || '';

  if (!frontendUrl || !devPort) {
    console.error(`VITE_APP_FRONTEND_URL and VITE_DEV_PORT must both be set in ${appEnvFile}`);
    process.exit(1);
  }

  const hostname = frontendUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const service = `http://localhost:${devPort}`;

  const backendEnvFile = path.join(repoRoot, '..', 'dash-backend-docker', '.env');
  if (!fs.existsSync(backendEnvFile)) {
    console.error(
      `Cloudflare credentials not found — expected ${backendEnvFile} (sibling dash-backend-docker repo).`
    );
    process.exit(1);
  }

  const backendValues = parseEnvFile(backendEnvFile);
  const apiToken = backendValues.CF_API_TOKEN || '';
  const accountId = backendValues.CF_ACCOUNT_ID || '';
  const tunnelName = backendValues.CF_TUNNEL_NAME || 'dash-dev';
  const zoneName = backendValues.CF_ZONE_NAME || '';
  const zoneId = backendValues.CF_ZONE_ID || '';

  if (!apiToken || !accountId) {
    console.error(`CF_API_TOKEN / CF_ACCOUNT_ID not set in ${backendEnvFile}.`);
    process.exit(1);
  }

  const tunnelId = await getTunnelIdByName({ apiToken, accountId, tunnelName });

  await ensureIngressRoute({ apiToken, accountId, tunnelId, hostname, service });

  if (zoneName || zoneId) {
    await ensureDnsRecord({
      apiToken,
      zoneName,
      zoneId,
      hostName: hostname,
      cnameTarget: `${tunnelId}.cfargotunnel.com`,
    });
  } else {
    console.warn(`CF_ZONE_NAME/CF_ZONE_ID not set in ${backendEnvFile} — skipping DNS automation.`);
  }

  console.log(`Tunnel route ready: https://${hostname} -> ${service}`);
}

main().catch((err) => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});

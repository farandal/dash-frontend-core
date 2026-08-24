import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { ReportsModule } from './ReportsModule';
import type { TranslateFn } from './core/types';

export interface CreateReportsResourceOptions {
  /** Route + API path segment. Defaults to 'reports'. */
  model?: string;
  label?: string;
  group?: string;
  icon?: ReactElement;
  roles?: string[];
  menuTitle?: string;
  translate?: TranslateFn;
  /** Route prefix the admin mounts resources under. */
  urlPrefix?: string;
}

/**
 * The single reports resource.
 *
 * ── Why there is exactly one ──────────────────────────────────────────────────
 *
 * Which reports exist is the backend registry's answer, not the frontend's. A
 * resource per report would put that list in two places and guarantee they
 * drift — a domain registering a new report would get a working API and a menu
 * entry that 404s until someone shipped a frontend change too.
 *
 * ── Why `component` is not set ────────────────────────────────────────────────
 *
 * DASHAdmin does `const ResourceComponent = originalResource.component || ResourceTemplate`
 * and then CALLS it — so supplying `component` REPLACES ResourceTemplate
 * outright. Since `customRoutes` is only evaluated inside ResourceTemplate,
 * a resource that sets both registers no routes at all and every link 404s.
 * Leaving `component` off keeps ResourceTemplate in place, which is what
 * renders the routes below.
 */
export function createReportsResource(options: CreateReportsResourceOptions = {}) {
  const {
    model = 'reports',
    label = 'dash_reports.title',
    group,
    icon,
    roles = ['*'],
    menuTitle,
    translate,
    urlPrefix = '/',
  } = options;

  const fallback: TranslateFn = (key, opts) => String(opts?._ ?? key);
  const t = translate ?? fallback;

  const base = `${urlPrefix}${model}`.replace(/\/{2,}/g, '/');

  return {
    model,
    label,
    group,
    icon,
    roles,
    schema: [],
    // Nothing here is CRUD — the resource exists to own a route and a menu entry.
    list: false,
    create: false,
    edit: false,
    view: false,
    delete: false,
    listViewButton: { enabled: false },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },
    customRoutes: () => (
      <>
        <Route path={base} element={<ReportsModule translate={t} basePath={base} />} />
        <Route path={`${base}/:reportKey`} element={<ReportsModule translate={t} basePath={base} />} />
      </>
    ),
    menu: [{ title: menuTitle ?? label, redirect: base }],
  };
}

export default createReportsResource;

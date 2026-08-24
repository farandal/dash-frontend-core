import { Alert, Box, LinearProgress, Typography, useTheme } from '@mui/material';
import { useDashboardTenants } from './core/useDashboard';
import { TenantDashboard } from './TenantDashboard';
import type { TranslateFn } from './core/types';

export interface ReportsDashboardProps {
  translate: TranslateFn;
  title?: string;
}

/**
 * The home-dashboard stats block.
 *
 * Renders one TenantDashboard per tenant the caller manages — a TenancyAdmin
 * sees every restaurant, a tenant user sees exactly one (and then without a
 * redundant heading naming the only tenant there is).
 *
 * Always live: the window is the tenant's currently-open cash count period, and
 * an operator watching mid-service wants what has happened so far, not a figure
 * frozen earlier. Looking back at a closed period is a deliberate act via the
 * per-tenant period selector, and that view is served from the snapshot taken
 * at closing.
 */
export function ReportsDashboard({ translate, title }: ReportsDashboardProps) {
  const theme = useTheme();
  const { tenants, loading, error } = useDashboardTenants();

  if (loading) return <LinearProgress />;

  if (error) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        {translate('dash_reports.errors.dashboard', { _: 'These stats could not be loaded.' })}
      </Alert>
    );
  }

  if (tenants.length === 0) return null;

  const single = tenants.length === 1;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
        {title ?? translate('dash_reports.dashboard.title', { _: 'This period' })}
      </Typography>

      {tenants.map((entry) => (
        <TenantDashboard
          key={entry.tenant.id}
          tenantId={entry.tenant.id}
          tenantName={entry.tenant.name}
          translate={translate}
          showHeading={!single}
        />
      ))}
    </Box>
  );
}

export default ReportsDashboard;

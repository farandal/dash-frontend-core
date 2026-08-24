/**
 * @dashadmin/dash-reports — the domain-agnostic reporting UI.
 *
 * Renders a report entirely from the spec app/ReportCore serves for it, so a
 * new report is a backend definition plus one resource entry, with no change
 * here.
 */

// Core — framework-agnostic, no chart or MUI import.
export * from './core/types';
export { useReportSpec } from './core/useReportSpec';
export { useReportSeries } from './core/useReportSeries';
export { useReportTable } from './core/useReportTable';
export { useReportList } from './core/useReportList';
export { useReportPreview } from './core/useReportPreview';
export { useReportExport } from './core/useReportExport';
export { toQueryParams } from './core/queryParams';
export { formatBucket, formatBucketLong } from './core/formatBucket';
export {
  registerVisualization,
  getVisualization,
  registeredVisualizations,
} from './core/visualizationRegistry';
export type { VisualizationProps } from './core/visualizationRegistry';

// MUI / Chart.js adapter. Importing it registers the default widget set.
export * from './adapters/mui';

// Composed UI.
export { ReportPage } from './ReportPage';
export type { ReportPageProps } from './ReportPage';
export { ReportFilters } from './ReportFilters';
export { ReportsModule } from './ReportsModule';
export { ReportsDashboard } from './ReportsDashboard';
export { TenantDashboard } from './TenantDashboard';
export {
  useDashboardTenants,
  useTenantDashboard,
  useTenantPeriods,
} from './core/useDashboard';
export type {
  DashboardWidget,
  DashboardTenant,
  DashboardPeriod,
  DashboardData,
} from './core/useDashboard';
export { ReportsIndex } from './ReportsIndex';
export { createReportsResource } from './createReportsResource';
export type { CreateReportsResourceOptions } from './createReportsResource';

// Strings, merged at app entry — see dash-admin's mergeTranslations.
export { en as reportsEn, es as reportsEs } from './i18n';

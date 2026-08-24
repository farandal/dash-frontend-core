/**
 * The wire contract with app/ReportCore.
 *
 * A ReportSpec is the single description the backend serves for a report, and
 * everything this package renders — filters, chart shells, export controls —
 * is derived from it. Nothing here is KitchnTabs-specific: a domain adds a
 * report by registering a definition server-side, and this package renders it
 * without a frontend change.
 *
 * Deliberately NOT called a "manifest": `ResourceManifest` already means a lazy
 * resource-module map in dash-app-common and dash-admin, and reusing the word
 * for a second, unrelated concept would be a genuine ambiguity in a codebase
 * that already has both.
 *
 * Every `label` is a translation KEY, never display text. The previous
 * generation of this feature returned Spanish strings from PHP, which is what
 * made it unusable for a second domain.
 */

export type Granularity =
  /** One bucket for the whole window — a period total, not a timeline. */
  | 'total'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'hourOfDay'
  | 'dayOfWeek';

export type VisualizationType =
  | 'Bar'
  | 'Line'
  | 'Pie'
  | 'Doughnut'
  | 'Kpi'
  | 'Funnel'
  | 'Table';

export interface DimensionValue {
  value: string | number | boolean;
  /** Translation key. */
  label: string;
  /** Backend-resolved text, used when the app has no translation for `label`. */
  labelText?: string;
  icon?: string;
}

export interface ReportDimension {
  key: string;
  label: string;
  labelText?: string;
  type: 'column' | 'jsonpath' | 'relation';
  multiple?: boolean;
  source?: string;
  visibleTo?: string[];
  values?: DimensionValue[];
}

export interface ReportMetric {
  key: string;
  label: string;
  labelText?: string;
  kind: 'count' | 'countNotNull' | 'countDistinct' | 'sum' | 'avg' | 'min' | 'max';
  /** Render as money/decimal rather than an integer. */
  decimal: boolean;
  /** 'minutes' for a duration metric; the UI appends the unit. */
  unit?: string | null;
}

export interface ReportVisualization {
  type: VisualizationType;
  options?: Record<string, unknown>;
}

export interface ReportSpec {
  key: string;
  title: string;
  titleText?: string;
  granularities: Granularity[];
  defaultGranularity: Granularity;
  timezone: string;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  visualizations: ReportVisualization[];
  /** How this report is best read; the tab that opens first. */
  defaultVisualization: VisualizationType;
  previewGranularity: Granularity;
  filters: Record<string, { type: string }>;
  exporters: string[];
  defaultRangeDays: number;
}

export interface ReportSeries {
  key: string;
  /** Translation key (or literal text for a value like a tenant name). */
  label: string;
  /** Backend-resolved text; used when the app has no translation for `label`. */
  labelText?: string;
  metric: string;
  /** Exactly one point per bucket; null means "no data", 0 means "none". */
  data: Array<number | null>;
}

export interface ReportResult {
  key: string;
  granularity: Granularity;
  timezone: string;
  /** Timestamps for series grains, small ints for cyclic ones. */
  buckets: Array<string | number>;
  series: ReportSeries[];
  totals: Record<string, number | null>;
  meta?: {
    start?: string;
    end?: string;
    pivot?: string | null;
    scopedTenantIds?: string[] | null;
  };
}

export interface ReportTablePage {
  data: Array<Record<string, unknown>>;
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface ReportListEntry {
  key: string;
  title: string;
  titleText?: string;
  metrics?: ReportMetric[];
  visualizations: ReportVisualization[];
  /** How this report is best read — drives the list preview and the first tab. */
  defaultVisualization: VisualizationType;
  /** Coarser grain for the preview: a card is too small for a daily series. */
  previewGranularity: Granularity;
  defaultRangeDays: number;
}

/** The user-driven part of a report request. */
export interface ReportFilterState {
  start: string;
  end: string;
  granularity: Granularity;
  pivot?: string;
  /** Dimension key -> selected values. */
  dimensions: Record<string, Array<string | number | boolean>>;
}

/**
 * Injected rather than imported from react-admin, so this package stays usable
 * in a public/light app that has no react-admin i18n provider at all. The `_`
 * option is polyglot's default-value convention, so a missing key renders
 * sensible text instead of the raw key.
 */
export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

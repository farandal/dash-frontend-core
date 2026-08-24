import { registerVisualization } from '../../core/visualizationRegistry';
import { BarWidget } from './BarWidget';
import { LineWidget } from './LineWidget';
import { DoughnutWidget } from './DoughnutWidget';
import { PieWidget } from './PieWidget';
import { KpiWidget } from './KpiWidget';
import { FunnelWidget } from './FunnelWidget';
import { SeriesTableWidget } from './TableWidget';

/**
 * Register the MUI/Chart.js renderers.
 *
 * Importing this module is what wires the adapter up; `core/` never imports a
 * chart library, so a different adapter can register its own set against the
 * same registry without this one being loaded.
 */
registerVisualization('Bar', BarWidget);
registerVisualization('Line', LineWidget);
registerVisualization('Doughnut', DoughnutWidget);
registerVisualization('Pie', PieWidget);
registerVisualization('Kpi', KpiWidget);
registerVisualization('Funnel', FunnelWidget);
registerVisualization('Table', SeriesTableWidget);

export { BarWidget, LineWidget, DoughnutWidget, PieWidget, KpiWidget, FunnelWidget, SeriesTableWidget };
export { DetailTable } from './TableWidget';
export { PreviewWidget } from './PreviewWidget';
export * from './palette';
export { chartChrome, baseChartOptions } from './chartTheme';

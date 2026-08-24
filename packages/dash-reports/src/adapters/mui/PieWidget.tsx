import { DoughnutWidget } from './DoughnutWidget';
import type { VisualizationProps } from '../../core/visualizationRegistry';

/**
 * A doughnut, not a true pie.
 *
 * Kept as a distinct registered type so a report that declares `Pie` renders,
 * but drawn with a centre hole: the hole removes the wedge apexes, where a
 * pie's area is least readable, and gives the legend somewhere to breathe.
 * Nothing is lost — both encode a part-of-whole share by angle.
 */
export function PieWidget(props: VisualizationProps) {
  return <DoughnutWidget {...props} />;
}

export default PieWidget;

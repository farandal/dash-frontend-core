import { Line } from 'react-chartjs-2';
import { ensureChartsRegistered } from './chartSetup';
import { baseChartOptions } from './chartTheme';
import { useChartData } from './useChartData';
import type { VisualizationProps } from '../../core/visualizationRegistry';

ensureChartsRegistered();

/**
 * Change over time.
 *
 * 2px strokes and points that only appear on hover — a marker on every bucket
 * of a 90-day series is noise, but the hover target still has to be reachable,
 * so hitRadius stays generous while the drawn radius is zero. Lines are not
 * filled by default: overlapping translucent areas muddy every colour beneath
 * them, and this chart is for comparing shapes.
 *
 * `spanGaps` is deliberately off. A null is "no data" (an average with nothing
 * to average), and bridging it would draw a straight line through a period the
 * report is explicitly saying nothing about.
 */
export function LineWidget(props: VisualizationProps) {
  const { chrome, datasets, labels, longLabels } = useChartData(props);
  const base = baseChartOptions(chrome, datasets.length > 1);

  const data = {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      borderColor: d.color,
      backgroundColor: d.color,
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0,
      pointHoverRadius: 5,
      // A 12px hit radius on an invisible point: the value stays reachable
      // without asking anyone to land on a 2px line.
      pointHitRadius: 12,
      pointBorderWidth: 2,
      // A surface-coloured ring keeps an active point legible where series
      // overlap, without drawing a border on every mark.
      pointHoverBorderColor: chrome.surface,
      pointHoverBorderWidth: 2,
      spanGaps: false,
      fill: false,
    })),
  };

  return (
    <Line
      data={data}
      height={props.height ?? 320}
      options={{
        ...base,
        plugins: {
          ...base.plugins,
          tooltip: {
            ...base.plugins.tooltip,
            callbacks: {
              title: (items: Array<{ dataIndex: number }>) => longLabels[items[0]?.dataIndex] ?? '',
            },
          },
        },
      }}
    />
  );
}

export default LineWidget;

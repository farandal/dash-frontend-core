import { Bar } from 'react-chartjs-2';
import { ensureChartsRegistered } from './chartSetup';
import { baseChartOptions } from './chartTheme';
import { useChartData } from './useChartData';
import type { VisualizationProps } from '../../core/visualizationRegistry';

ensureChartsRegistered();

/**
 * Magnitude per bucket.
 *
 * Bars are thin with a small rounded cap on the data end only — the baseline
 * end stays square so the bar reads as anchored rather than floating. Grouped
 * rather than stacked by default: a stack answers "what is the total", a group
 * answers "how do these compare", and comparison is what a pivoted report is
 * for. Adjacent fills carry a surface-coloured gap instead of a stroke, so
 * they separate without a border drawn around every mark.
 */
export function BarWidget(props: VisualizationProps) {
  const { chrome, datasets, labels, longLabels } = useChartData(props);
  const stacked = props.options?.stacked === true;

  const data = {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color,
      borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: 'bottom' as const,
      borderWidth: 0,
      maxBarThickness: 28,
      categoryPercentage: 0.7,
      barPercentage: 0.9,
    })),
  };

  const base = baseChartOptions(chrome, datasets.length > 1);

  return (
    <Bar
      data={data}
      height={props.height ?? 320}
      options={{
        ...base,
        scales: {
          ...base.scales,
          x: { ...base.scales.x, stacked },
          y: { ...base.scales.y, stacked },
        },
        plugins: {
          ...base.plugins,
          tooltip: {
            ...base.plugins.tooltip,
            callbacks: {
              title: (items: Array<{ dataIndex: number }>) =>
                longLabels[items[0]?.dataIndex] ?? '',
            },
          },
        },
      }}
    />
  );
}

export default BarWidget;

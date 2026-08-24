import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { ensureChartsRegistered } from './chartSetup';
import { chartChrome } from './chartTheme';
import { label as renderLabel } from '../../core/label';
import { buildSlotMap, colorForSlot, MAX_SERIES } from './palette';
import type { VisualizationProps } from '../../core/visualizationRegistry';

ensureChartsRegistered();

/**
 * Composition across the whole window.
 *
 * Collapses the timeline: each series becomes its window total, so this answers
 * "what share" rather than "when". Only meaningful for a part-of-whole reading,
 * which is why the backend offers it on some reports and not others.
 *
 * A 2px surface-coloured gap between arcs separates neighbours without drawing
 * a stroke around every slice.
 */
export function DoughnutWidget({ result, spec, translate, height }: VisualizationProps) {
  const theme = useTheme();

  const { labels, values, colors, chrome, total } = useMemo(() => {
    const c = chartChrome(theme);
    const pivotKey = result.meta?.pivot ?? undefined;
    const slots = buildSlotMap(spec, pivotKey, result.series.map((s) => s.key));

    const totals = result.series.map((series) => ({
      key: series.key,
      label: renderLabel(translate, series.label, series.labelText),
      slot: slots.get(series.key) ?? 0,
      value: series.data.reduce<number>((sum, v) => sum + (v ?? 0), 0),
    }));

    // Fold the tail rather than inventing a ninth hue.
    const kept = totals.filter((t) => t.slot < MAX_SERIES);
    const folded = totals.filter((t) => t.slot >= MAX_SERIES);

    if (folded.length > 0) {
      kept.push({
        key: '__other__',
        label: translate('dash_reports.other', { _: 'Other', count: folded.length }),
        slot: MAX_SERIES,
        value: folded.reduce((sum, t) => sum + t.value, 0),
      });
    }

    return {
      chrome: c,
      labels: kept.map((t) => t.label),
      values: kept.map((t) => t.value),
      colors: kept.map((t) => colorForSlot(t.slot, c.dark)),
      total: kept.reduce((sum, t) => sum + t.value, 0),
    };
  }, [result, spec, translate, theme]);

  return (
    <Doughnut
      height={height ?? 320}
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: chrome.surface,
          borderWidth: 2,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              color: chrome.axisText,
              usePointStyle: true,
              pointStyle: 'circle' as const,
              boxWidth: 8,
              boxHeight: 8,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: chrome.tooltipBg,
            titleColor: chrome.tooltipText,
            bodyColor: chrome.tooltipText,
            borderColor: chrome.grid,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            usePointStyle: true,
            callbacks: {
              // The share is the point of this chart, so the tooltip states it
              // rather than leaving the reader to estimate an angle.
              label: (item: { label?: string; parsed: number }) => {
                const share = total > 0 ? Math.round((item.parsed / total) * 1000) / 10 : 0;
                return `${item.label}: ${item.parsed.toLocaleString()} (${share}%)`;
              },
            },
          },
        },
      }}
    />
  );
}

export default DoughnutWidget;

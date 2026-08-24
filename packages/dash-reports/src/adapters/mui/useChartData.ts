import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { formatBucket, formatBucketLong } from '../../core/formatBucket';
import { buildSlotMap, colorForSlot, MAX_SERIES } from './palette';
import { chartChrome } from './chartTheme';
import { label as renderLabel } from '../../core/label';
import type { VisualizationProps } from '../../core/visualizationRegistry';

/**
 * Everything the cartesian widgets share: stable colours, folded overflow,
 * formatted labels and the resolved chrome.
 *
 * Series past the eighth are folded into a single "Other" series rather than
 * given a generated hue — nine-plus categorical colours stop being
 * distinguishable, and a reader cannot hold that many identities at once. The
 * fold is additive, so the total still reconciles with the table.
 */
export function useChartData({ result, spec, translate }: VisualizationProps) {
  const theme = useTheme();

  return useMemo(() => {
    const chrome = chartChrome(theme);
    const pivotKey = result.meta?.pivot ?? undefined;

    const slots = buildSlotMap(spec, pivotKey ?? undefined, result.series.map((s) => s.key));

    const kept = result.series.filter((s) => (slots.get(s.key) ?? 0) < MAX_SERIES);
    const overflow = result.series.filter((s) => (slots.get(s.key) ?? 0) >= MAX_SERIES);

    const datasets = kept.map((series) => ({
      key: series.key,
      label: renderLabel(translate, series.label, series.labelText),
      data: series.data,
      color: colorForSlot(slots.get(series.key) ?? 0, chrome.dark),
    }));

    if (overflow.length > 0) {
      // Sum the tail position-wise so the folded series is still a real total.
      const summed = result.buckets.map((_, index) =>
        overflow.reduce<number | null>((acc, series) => {
          const value = series.data[index];
          if (value === null || value === undefined) return acc;
          return (acc ?? 0) + value;
        }, null),
      );

      datasets.push({
        key: '__other__',
        label: translate('dash_reports.other', { _: 'Other', count: overflow.length }),
        data: summed,
        color: colorForSlot(MAX_SERIES, chrome.dark),
      });
    }

    const labels = result.buckets.map((b) => formatBucket(b, result.granularity, translate));
    const longLabels = result.buckets.map((b) => formatBucketLong(b, result.granularity, translate));

    return { chrome, datasets, labels, longLabels, foldedCount: overflow.length };
  }, [result, spec, translate, theme]);
}

export default useChartData;

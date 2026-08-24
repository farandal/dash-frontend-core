import { Box, Typography, useTheme } from '@mui/material';
import { label as renderLabel } from '../../core/label';
import type { VisualizationProps } from '../../core/visualizationRegistry';

/**
 * The headline numbers, with no plot.
 *
 * The window totals come straight from the backend's ungrouped aggregate — not
 * a sum of the series — because averages and extrema do not compose across
 * buckets: averaging twelve monthly averages is not the yearly average.
 *
 * Figures use the body face at a normal weight, and deliberately NOT
 * `tabular-nums`: equal-width digits make a large standalone number look gappy
 * and mechanical. Tabular figures belong in a column of numbers, which is what
 * the table view is for.
 */
/**
 * A figure, in the unit its metric is measured in.
 *
 * Durations are minutes, and are shown as minutes rather than a bare number —
 * "643" beside "Entregado → Cerrado" is ambiguous in a way "643 min" is not.
 * Sub-minute averages keep two decimals so a fast hop reads as 0.26 min rather
 * than rounding to a flat 0, which would look like "no data".
 */
function formatMetricValue(
  value: number | null | undefined,
  metric: { decimal: boolean; unit?: string | null },
  translate: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (value === null || value === undefined) return '—';

  const digits = metric.decimal ? 2 : 0;
  const text = value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  if (metric.unit === 'minutes') {
    return formatMinutes(value, translate);
  }

  return text;
}

/**
 * A duration in the unit a person would say it in.
 *
 * "776.40 min" is technically right and practically unreadable — nobody holds
 * thirteen hours in their head as a minute count. The scale switches at the
 * points where the smaller unit stops being informative: under a minute,
 * seconds; under 90 minutes, minutes; beyond that, hours.
 */
function formatMinutes(
  minutes: number,
  translate: (key: string, options?: Record<string, unknown>) => string,
): string {
  const abs = Math.abs(minutes);

  if (abs < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} ${translate('dash_reports.units.seconds', { _: 's' })}`;
  }

  if (abs < 90) {
    const shown = abs < 10 ? Math.round(minutes * 10) / 10 : Math.round(minutes);
    return `${shown} ${translate('dash_reports.units.minutes', { _: 'min' })}`;
  }

  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} ${translate('dash_reports.units.hours', { _: 'h' })}`;
}

export function KpiWidget({ result, spec, translate }: VisualizationProps) {
  const theme = useTheme();

  const metrics = spec.metrics.filter((m) => result.totals[m.key] !== undefined);

  if (metrics.length === 0) return null;

  // A grid, not a wrapping flex row: with flex-wrap the figures landed at
  // arbitrary x-positions on each line, so nothing lined up vertically and a
  // six-metric tile read as scattered rather than tabulated.
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 2,
        px: 0.5,
        py: 1,
      }}
      role="list"
    >
      {metrics.map((metric) => {
        const value = result.totals[metric.key];

        return (
          <Box key={metric.key} role="listitem" sx={{ minWidth: 140 }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
            >
              {renderLabel(translate, metric.label, metric.labelText)}
            </Typography>
            <Typography
              component="p"
              sx={{
                fontSize: '1.75rem',
                lineHeight: 1.15,
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {formatMetricValue(value, metric, translate)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default KpiWidget;

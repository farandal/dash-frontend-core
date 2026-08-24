import { Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import { colorForSlot } from './palette';
import { label as renderLabel } from '../../core/label';
import type { VisualizationProps } from '../../core/visualizationRegistry';

/**
 * Stage-by-stage drop-off.
 *
 * Rendered as proportional bars rather than the tapering-trapezoid shape a
 * "funnel" usually implies: a trapezoid encodes each stage in an area whose
 * width AND height both change, which overstates the drop. A bar per stage
 * encodes one quantity in one dimension and is simply readable.
 *
 * The stage order is the METRIC order the backend declared, which is the flow
 * order — so this widget renders KitchnTabs' tab lifecycle without knowing
 * anything about it. Percentages are shown against the first stage (overall
 * conversion) and against the previous one (step conversion), because the two
 * answer different questions and reading either off a bar length is guesswork.
 */
export function FunnelWidget({ result, spec, translate }: VisualizationProps) {
  const theme = useTheme();

  const stages = spec.metrics
    .map((metric, index) => ({
      key: metric.key,
      label: renderLabel(translate, metric.label, metric.labelText),
      value: result.totals[metric.key] ?? 0,
      slot: index,
    }))
    .filter((s) => s.value !== null);

  if (stages.length === 0) return null;

  const first = stages[0]?.value || 0;

  return (
    <Stack spacing={1.75} sx={{ px: 0.5, py: 1 }}>
      {stages.map((stage, index) => {
        const previous = index === 0 ? stage.value : stages[index - 1].value;
        const ofFirst = first > 0 ? (stage.value / first) * 100 : 0;
        const ofPrevious = previous > 0 ? (stage.value / previous) * 100 : 0;
        const color = colorForSlot(stage.slot, theme.palette.mode === 'dark');

        return (
          <Box key={stage.key}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 0.5 }}
            >
              {/* The label is the only part allowed to shrink; the figures stay
                  on one line. Previously the percentage column wrapped to three
                  lines ("100%", "etapa", "833.3%") and the row read as noise. */}
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {stage.label}
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'baseline', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                  {stage.value.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {Math.round(ofFirst * 10) / 10}%
                  {/* A step above 100% is not a conversion — it means tabs
                      reached this stage without passing through the previous
                      one (a tab closed straight from CREATED, say). Printing
                      "833% conversion" reads as a broken number; naming the
                      skip states what actually happened. */}
                  {index > 0 && (
                    ofPrevious > 100
                      ? ` · ${translate('dash_reports.funnel.skipped', { _: 'stage skipped' })}`
                      : ` · ${translate('dash_reports.funnel.step', { _: 'step' })} ${Math.round(ofPrevious * 10) / 10}%`
                  )}
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, ofFirst)}
              aria-label={stage.label}
              sx={{
                height: 10,
                borderRadius: 1,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 1 },
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}

export default FunnelWidget;

import { useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, FormControl, LinearProgress, MenuItem,
  Select, Stack, Typography, useTheme,
} from '@mui/material';
import { useTenantDashboard, useTenantPeriods } from './core/useDashboard';
import { getVisualization } from './core/visualizationRegistry';
import { label as renderLabel } from './core/label';
import { visualizationBoxSx } from './core/visualizationLayout';
import type { DashboardWidget } from './core/useDashboard';
import type { ReportSpec, TranslateFn, VisualizationType } from './core/types';
import './adapters/mui';

export interface TenantDashboardProps {
  tenantId: string;
  tenantName?: string;
  translate: TranslateFn;
  /** Hide the tenant heading when only one tenant is ever shown. */
  showHeading?: boolean;
  /**
   * Pin to one period instead of letting the viewer choose.
   *
   * Used by the cash count show view, which is already about one specific
   * period — offering a picker there would let someone navigate away from the
   * record they are looking at without the surrounding page changing.
   */
  period?: string;
  /** Hide the period selector (implied when `period` is given). */
  hidePeriodPicker?: boolean;
}

/**
 * Tile widths as a 12-column span, chosen so rows tile exactly.
 *
 * The previous set (sm 3 / md 4) left a 1-column gap on the first row and a
 * 3-column gap on the second, which is why the dashboard looked ragged.
 */
const SPAN: Record<string, number> = { sm: 4, md: 6, lg: 8, full: 12 };

/**
 * The same, against the 6-column container breakpoint.
 *
 * `sm` is 2 rather than 3 so the three distribution tiles still tile one exact
 * row here; at 3 they wrapped 2+1 and left an orphan.
 */
const SPAN_SM: Record<string, number> = { sm: 2, md: 6, lg: 6, full: 6 };

/**
 * One tenant's period dashboard.
 *
 * Rendered once per tenant: a TenancyAdmin gets one of these per restaurant,
 * a tenant user gets exactly one. Each fetches its own data, so a slow or
 * failing tenant costs one panel rather than the page.
 *
 * The period selector defaults to the open cash count and can look back at
 * closed ones. That distinction is surfaced, not hidden — a closed period is
 * served from the snapshot taken when it was closed, and saying so is the
 * difference between "these numbers are final" and "these are still moving".
 */
export function TenantDashboard({
  tenantId,
  tenantName,
  translate,
  showHeading = true,
  period: pinnedPeriod,
  hidePeriodPicker,
}: TenantDashboardProps) {
  const theme = useTheme();
  const [selectedPeriod, setPeriod] = useState('current');

  const period = pinnedPeriod ?? selectedPeriod;
  const showPicker = !pinnedPeriod && !hidePeriodPicker;

  const { data, loading, error } = useTenantDashboard(tenantId, period);
  // Not fetched at all when the picker is hidden — a request whose only purpose
  // is to fill a control nobody will see.
  const { periods } = useTenantPeriods(showPicker ? tenantId : null);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Title, period and picker share a card of their own.
          Loose on the page they read as page furniture rather than as the
          controls governing the tiles below; boxing them makes the relationship
          explicit and gives the header the same visual weight as the widgets. */}
      <Card variant="outlined" sx={{ mb: 2 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 2,
          py: 1.5,
        }}
      >
        {showHeading && (
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {tenantName ?? tenantId}
          </Typography>
        )}

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          {data?.period && (
            <Chip
              size="small"
              variant="outlined"
              label={`${data.period.start.slice(0, 10)} → ${data.period.end.slice(0, 10)}`}
            />
          )}

          {/* A closed period's figures are frozen; an open one is still moving.
              Conflating the two would let someone quote a number that changes
              under them ten minutes later. */}
          {data && (
            <Chip
              size="small"
              color={data.period?.isOpen ? 'warning' : 'default'}
              label={translate(
                data.period?.isOpen ? 'dash_reports.period.open' : 'dash_reports.period.closed',
                { _: data.period?.isOpen ? 'In progress' : 'Closed' },
              )}
            />
          )}

          {showPicker && periods.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <Select value={selectedPeriod} onChange={(e) => setPeriod(String(e.target.value))}>
                {periods.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.id === 'current'
                      ? translate('dash_reports.period.current', { _: 'Current period' })
                      : p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Stack>
      </Card>

      {loading && <LinearProgress />}

      {error && (
        <Alert severity="warning">
          {translate('dash_reports.errors.dashboard', { _: 'These stats could not be loaded.' })}
        </Alert>
      )}

      {data && (
        <Box
          sx={{
            // Container queries, not viewport breakpoints. This block is
            // rendered both full-width and inside a 50% column, and viewport
            // breakpoints cannot tell those apart — a wide window would lay out
            // twelve columns inside a half-width box and shred the tiles.
            containerType: 'inline-size',
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(12, 1fr)',
            '@container (max-width: 900px)': { gridTemplateColumns: 'repeat(6, 1fr)' },
            '@container (max-width: 560px)': { gridTemplateColumns: '1fr' },
            // Without this, every tile stretches to the tallest in its row —
            // a short KPI tile next to a seven-stage funnel became a mostly
            // empty box the height of the funnel.
            alignItems: 'start',
          }}
        >
          {data.widgets.map((widget) => (
            <WidgetTile key={widget.key} widget={widget} translate={translate} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function WidgetTile({ widget, translate }: { widget: DashboardWidget; translate: TranslateFn }) {
  const theme = useTheme();
  const span = SPAN[widget.size ?? 'md'] ?? 4;

  const Visualization = widget.visualization ? getVisualization(widget.visualization as VisualizationType) : null;

  return (
    <Card
      variant="outlined"
      sx={{
        gridColumn: `span ${span}`,
        // Matches the container breakpoints on the grid above.
        '@container (max-width: 900px)': {
          gridColumn: `span ${SPAN_SM[widget.size ?? 'md'] ?? 6}`,
        },
        '@container (max-width: 560px)': { gridColumn: '1 / -1' },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
          {renderLabel(translate, widget.title, widget.titleText)}
        </Typography>

        {widget.error ? (
          // One tile's failure is one tile, never the dashboard.
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {translate('dash_reports.errors.widget', { _: 'Unavailable' })}
          </Typography>
        ) : widget.result && Visualization && hasData(widget) ? (
          // Canvas widgets get a definite height; Kpi/Funnel/Table size to
          // their content. Without the bound, Chart.js grows the tile forever.
          <Box sx={visualizationBoxSx(widget.visualization, 220)}>
            <Visualization
              result={widget.result}
              spec={specFor(widget)}
              translate={translate}
            />
          </Box>
        ) : (
          <Box sx={{ py: 3, display: 'grid', placeItems: 'center' }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {translate('dash_reports.no_data', { _: 'No data for this range.' })}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * The minimal spec a widget renderer needs.
 *
 * A tile does not fetch the report's full spec — that would be a second request
 * per tile for information the series response already carries. The renderers
 * only read `metrics` (for Kpi and Funnel labels) and `dimensions` (for stable
 * colour slots), so this supplies exactly that.
 */
/**
 * Whether a tile has anything worth drawing.
 *
 * A doughnut whose every slice is zero renders as an empty ring with a legend
 * of nothings — strictly worse than saying "no data", because it looks like a
 * chart that failed rather than a period in which nothing happened.
 */
function hasData(widget: DashboardWidget): boolean {
  const result = widget.result;
  if (!result) return false;

  const anySeries = (result.series ?? []).some((s) =>
    (s.data ?? []).some((v) => v !== null && v !== undefined && v !== 0),
  );

  const anyTotal = Object.values(result.totals ?? {}).some(
    (v) => v !== null && v !== undefined && v !== 0,
  );

  return anySeries || anyTotal;
}

function specFor(widget: DashboardWidget): ReportSpec {
  // The backend ships the real definitions; the series fallback exists only
  // for a pivoted tile, whose series are dimension values rather than metrics.
  // Falling back for a metric tile would lose `decimal` and format an average
  // of 0.26 minutes as "0".
  const metrics = widget.result?.metrics
    ?? (widget.result?.series ?? []).map((s) => ({
      key: s.key,
      label: s.label,
      labelText: s.labelText,
      kind: 'count' as const,
      decimal: false,
    }));

  return {
    key: widget.reportKey,
    title: widget.title,
    granularities: ['total'],
    defaultGranularity: 'total',
    defaultVisualization: (widget.visualization ?? 'Bar') as VisualizationType,
    previewGranularity: 'total',
    timezone: widget.result?.timezone ?? 'UTC',
    dimensions: [],
    metrics,
    visualizations: [],
    filters: {},
    exporters: [],
    defaultRangeDays: 30,
  };
}

export default TenantDashboard;

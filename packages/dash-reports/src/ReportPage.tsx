import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Badge, Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, Tab, Tabs, Typography, useTheme,
} from '@mui/material';
import { useReportSpec } from './core/useReportSpec';
import { label } from './core/label';
import { visualizationBoxSx } from './core/visualizationLayout';
import { useReportSeries } from './core/useReportSeries';
import { useReportTable } from './core/useReportTable';
import { getVisualization } from './core/visualizationRegistry';
import { ReportFiltersDrawer } from './ReportFiltersDrawer';
import { DetailTable } from './adapters/mui/TableWidget';
import { useReportExport } from './core/useReportExport';
import type { ReportFilterState, TranslateFn, VisualizationType } from './core/types';
import './adapters/mui';

export interface ReportPageProps {
  reportKey: string;
  translate: TranslateFn;
  /** Optional heading override; defaults to the spec's translated title. */
  title?: string;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * A whole report, rendered from its spec.
 *
 * Nothing here knows what the report contains — the filters, the available
 * chart types, the metric labels and the export formats all come from the
 * backend. Adding a report to a domain is a backend change plus one resource
 * entry; this component does not change.
 */
export function ReportPage({ reportKey, translate, title }: ReportPageProps) {
  const theme = useTheme();
  const { spec, loading: specLoading, error: specError } = useReportSpec(reportKey);

  const [filters, setFilters] = useState<ReportFilterState | null>(null);
  const [activeViz, setActiveViz] = useState<VisualizationType | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // One definition of "the default filters", used both to seed and to reset —
  // two copies would drift and Reset would stop returning to the initial view.
  const defaultFilters = useMemo<ReportFilterState | null>(
    () =>
      spec
        ? {
            start: isoDaysAgo(spec.defaultRangeDays ?? 30),
            end: new Date().toISOString().slice(0, 10),
            granularity: spec.defaultGranularity,
            pivot: undefined,
            dimensions: {},
          }
        : null,
    [spec],
  );

  // Seed once the spec arrives — the default window and granularity are the
  // report's to choose, not this component's.
  useEffect(() => {
    if (!defaultFilters || filters) return;

    setFilters(defaultFilters);
    // The report's declared default, not merely the first in the array —
    // otherwise reordering visualizations silently changes what opens.
    setActiveViz(
      (spec?.defaultVisualization as VisualizationType | undefined)
        ?? spec?.visualizations[0]?.type
        ?? null,
    );
  }, [defaultFilters, filters, spec]);

  /**
   * What is currently narrowing the data, as readable chips.
   *
   * The drawer hides the filter state while closed, so this keeps it on screen:
   * a filter someone cannot see is one they forget is applied, and then read the
   * numbers as if it were not.
   */
  const activeChips = useMemo(() => {
    if (!spec || !filters) return [];

    const chips: string[] = [];

    Object.entries(filters.dimensions ?? {}).forEach(([key, values]) => {
      if (!Array.isArray(values) || values.length === 0) return;

      const dimension = spec.dimensions.find((d) => d.key === key);
      if (!dimension) return;

      const labels = values.map((v) => {
        const option = dimension.values?.find((o) => String(o.value) === String(v));
        return option ? label(translate, option.label, option.labelText) : String(v);
      });

      chips.push(`${label(translate, dimension.label, dimension.labelText)}: ${labels.join(', ')}`);
    });

    if (filters.pivot) {
      const dimension = spec.dimensions.find((d) => d.key === filters.pivot);
      if (dimension) {
        chips.push(
          `${translate('dash_reports.filters.pivot', { _: 'Split by' })}: ${label(translate, dimension.label, dimension.labelText)}`,
        );
      }
    }

    return chips;
  }, [spec, filters, translate]);

  const { result, loading: seriesLoading, error: seriesError } = useReportSeries(reportKey, filters);
  const table = useReportTable(reportKey, filters, showDetail);
  const { exporting, exportReport } = useReportExport(reportKey);

  const Visualization = useMemo(
    () => (activeViz ? getVisualization(activeViz) : null),
    [activeViz],
  );

  if (specLoading) return <LinearProgress />;

  if (specError || !spec) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {translate('dash_reports.errors.spec', { _: 'This report could not be loaded.' })}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>
          {title ?? label(translate, spec.title, spec.titleText)}
        </Typography>

        <Stack direction="row" spacing={1}>
          {spec.exporters.map((format) => (
            <Button
              key={format}
              size="small"
              variant="outlined"
              disabled={exporting || !filters}
              onClick={() => filters && exportReport(filters, format)}
            >
              {translate(`dash_reports.export.${format}`, { _: format.toUpperCase() })}
            </Button>
          ))}

          <Badge badgeContent={activeChips.length} color="primary">
            <Button size="small" variant="outlined" onClick={() => setFiltersOpen(true)}>
              {translate('dash_reports.filters.title', { _: 'Filters' })}
            </Button>
          </Badge>
        </Stack>
      </Stack>

      {/* The window is always narrowing the data, so it is always shown —
          unlike the dimension chips, which appear only when something is set. */}
      {filters && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
          <Chip
            size="small"
            variant="outlined"
            label={`${filters.start} → ${filters.end}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={translate(`dash_reports.granularity.${filters.granularity}`, { _: filters.granularity })}
          />
          {activeChips.map((chip) => (
            <Chip
              key={chip}
              size="small"
              label={chip}
              onDelete={undefined}
            />
          ))}
        </Stack>
      )}

      {seriesError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {translate('dash_reports.errors.series', { _: 'This range could not be loaded.' })}
        </Alert>
      )}

      <Card variant="outlined">
        {spec.visualizations.length > 1 && (
          <>
            <Tabs
              value={activeViz}
              onChange={(_, next) => setActiveViz(next)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {spec.visualizations.map((v) => (
                <Tab
                  key={v.type}
                  value={v.type}
                  label={translate(`dash_reports.viz.${v.type}`, { _: v.type })}
                />
              ))}
            </Tabs>
            <Divider />
          </>
        )}

        {/* A refetch dims the existing chart rather than replacing it with a
            skeleton — flashing an empty box on every filter change loses the
            reader's place and reads as slower than it is. */}
        <Box sx={{ position: 'relative', opacity: seriesLoading && result ? 0.55 : 1, transition: 'opacity 120ms' }}>
          {seriesLoading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
          )}

          {/* A DEFINITE height for canvas charts. minHeight is a floor, not a
              bound, and Chart.js with maintainAspectRatio:false grows to fill
              its parent — which grows the parent, which resizes the canvas,
              forever. */}
          <CardContent>
            {result && Visualization ? (
              <Box sx={visualizationBoxSx(activeViz, 340)}>
                <Visualization result={result} spec={spec} translate={translate} />
              </Box>
            ) : (
              <Box sx={{ height: 340, display: 'grid', placeItems: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {seriesLoading
                    ? translate('dash_reports.loading', { _: 'Loading…' })
                    : translate('dash_reports.no_data', { _: 'No data for this range.' })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Box>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Button size="small" onClick={() => setShowDetail((v) => !v)}>
          {showDetail
            ? translate('dash_reports.hide_detail', { _: 'Hide detail rows' })
            : translate('dash_reports.show_detail', { _: 'Show detail rows' })}
        </Button>
      </Box>

      {showDetail && (
        <Card variant="outlined" sx={{ mt: 1 }}>
          <DetailTable
            page={table.page}
            loading={table.loading}
            currentPage={table.currentPage}
            onPageChange={table.setPage}
            translate={translate}
          />
        </Card>
      )}

      {filters && (
        <ReportFiltersDrawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          spec={spec}
          value={filters}
          onChange={setFilters}
          onReset={() => defaultFilters && setFilters(defaultFilters)}
          translate={translate}
        />
      )}
    </Box>
  );
}

export default ReportPage;

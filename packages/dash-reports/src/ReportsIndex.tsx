import { Alert, Box, Card, CardActionArea, CardContent, LinearProgress, Typography, useTheme } from '@mui/material';
import { useReportList } from './core/useReportList';
import { label } from './core/label';
import { useReportPreview } from './core/useReportPreview';
import { PreviewWidget } from './adapters/mui/PreviewWidget';
import type { ReportListEntry, TranslateFn } from './core/types';

export interface ReportsIndexProps {
  translate: TranslateFn;
  onOpen: (reportKey: string) => void;
}

/**
 * The report picker.
 *
 * Renders from the list endpoint alone — ONE request. The engine this replaces
 * fetched every report's full dataset up front to draw its landing page (a
 * monthly series plus one request per chart type, per report), so opening the
 * index cost 2N requests before anyone had chosen anything. Data is fetched
 * when a report is opened, not before.
 *
 * The list is already role-filtered server-side, so whatever arrives is what
 * this caller may see.
 */
/**
 * One report's card, with its own preview request.
 *
 * A component per card rather than one batched fetch, so the previews load in
 * parallel and fail independently: a report whose preview errors shows a card
 * without a chart instead of taking the whole list down with it.
 */
function ReportCard({
  report, translate, onOpen,
}: { report: ReportListEntry; translate: TranslateFn; onOpen: (key: string) => void }) {
  const theme = useTheme();
  const { result, loading } = useReportPreview(
    report.key,
    report.previewGranularity,
    report.defaultRangeDays,
  );

  return (
    <Card variant="outlined">
      <CardActionArea onClick={() => onOpen(report.key)} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {label(translate, report.title, report.titleText)}
          </Typography>

          <PreviewWidget
            result={result}
            loading={loading}
            type={report.defaultVisualization}
            translate={translate}
            metrics={report.metrics}
          />

        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ReportsIndex({ translate, onOpen }: ReportsIndexProps) {
  const theme = useTheme();
  const { reports, loading, error } = useReportList();

  if (loading) return <LinearProgress />;

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {translate('dash_reports.errors.list', { _: 'Reports could not be loaded.' })}
      </Alert>
    );
  }

  if (reports.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          {translate('dash_reports.no_reports', { _: 'No reports are available for your account.' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 3 }}>
        {translate('dash_reports.title', { _: 'Reports' })}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
        }}
      >
        {reports.map((report) => (
          <ReportCard key={report.key} report={report} translate={translate} onOpen={onOpen} />
        ))}
      </Box>
    </Box>
  );
}

export default ReportsIndex;

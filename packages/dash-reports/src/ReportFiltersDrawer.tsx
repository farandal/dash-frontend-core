import { Box, Button, Divider, Drawer, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { ReportFilters } from './ReportFilters';
import type { ReportFilterState, ReportSpec, TranslateFn } from './core/types';

export interface ReportFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  spec: ReportSpec;
  value: ReportFilterState;
  onChange: (next: ReportFilterState) => void;
  onReset: () => void;
  translate: TranslateFn;
}

/**
 * The filter panel, anchored right.
 *
 * Changes apply live rather than behind an "Apply" button: the charts already
 * refetch on every filter change and keep the previous result visible while
 * loading, so there is nothing for a confirm step to protect against — it would
 * only add a click and a second source of truth for "what is currently applied".
 *
 * `keepMounted` because the drawer holds live form state; unmounting it on
 * close would reset every select the moment the user peeked at the chart.
 */
export function ReportFiltersDrawer({
  open, onClose, spec, value, onChange, onReset, translate,
}: ReportFiltersDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      slotProps={{ paper: { sx: { backgroundImage: 'none' } } }}
    >
      <Stack sx={{ height: '100%' }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}
        >
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {translate('dash_reports.filters.title', { _: 'Filters' })}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label={translate('ra.action.close', { _: 'Close' })}>
            <Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>×</Box>
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <ReportFilters spec={spec} value={value} onChange={onChange} translate={translate} />
        </Box>

        <Divider />

        <Stack direction="row" spacing={1} sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={onReset}>
            {translate('dash_reports.filters.reset', { _: 'Reset' })}
          </Button>
          <Button fullWidth variant="contained" onClick={onClose}>
            {translate('dash_reports.filters.done', { _: 'Done' })}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default ReportFiltersDrawer;

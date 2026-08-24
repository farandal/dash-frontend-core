import {
  Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField,
} from '@mui/material';
import { label } from './core/label';
import type { ReportFilterState, ReportSpec, TranslateFn } from './core/types';

export interface ReportFiltersProps {
  spec: ReportSpec;
  value: ReportFilterState;
  onChange: (next: ReportFilterState) => void;
  translate: TranslateFn;
}

/**
 * The filter form.
 *
 * Laid out as a single column because it lives in a right-hand drawer — every
 * control gets full width, so long option labels (a restaurant name, a product)
 * are readable instead of truncated into a narrow inline slot.
 *
 * One filter set for the whole report, not per chart: every visualisation on
 * the page reads the same query, and per-chart filters would imply they can
 * disagree. Because the drawer hides that state while closed, ReportPage keeps
 * a summary of what is applied visible in the header — a filter nobody can see
 * is a filter they forget is on.
 */
export function ReportFilters({ spec, value, onChange, translate }: ReportFiltersProps) {
  const set = (patch: Partial<ReportFilterState>) => onChange({ ...value, ...patch });

  const setDimension = (key: string, selected: Array<string | number | boolean>) =>
    onChange({ ...value, dimensions: { ...value.dimensions, [key]: selected } });

  return (
    <Stack spacing={2.5} sx={{ p: 2.5, width: { xs: '86vw', sm: 360 } }}>
      <TextField
        type="date"
        size="small"
        fullWidth
        label={translate('dash_reports.filters.start', { _: 'From' })}
        slotProps={{ inputLabel: { shrink: true } }}
        value={value.start}
        onChange={(e) => set({ start: e.target.value })}
      />

      <TextField
        type="date"
        size="small"
        fullWidth
        label={translate('dash_reports.filters.end', { _: 'To' })}
        slotProps={{ inputLabel: { shrink: true } }}
        value={value.end}
        onChange={(e) => set({ end: e.target.value })}
      />

      <FormControl size="small" fullWidth>
        <InputLabel id="report-granularity">
          {translate('dash_reports.filters.granularity', { _: 'Group by' })}
        </InputLabel>
        <Select
          labelId="report-granularity"
          label={translate('dash_reports.filters.granularity', { _: 'Group by' })}
          value={value.granularity}
          onChange={(e) => set({ granularity: e.target.value as ReportFilterState['granularity'] })}
        >
          {spec.granularities.map((g) => (
            <MenuItem key={g} value={g}>
              {translate(`dash_reports.granularity.${g}`, { _: g })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {spec.dimensions.length > 0 && (
        <FormControl size="small" fullWidth>
          <InputLabel id="report-pivot">
            {translate('dash_reports.filters.pivot', { _: 'Split by' })}
          </InputLabel>
          <Select
            labelId="report-pivot"
            label={translate('dash_reports.filters.pivot', { _: 'Split by' })}
            value={value.pivot ?? ''}
            onChange={(e) => set({ pivot: e.target.value || undefined })}
          >
            {/* No split is a real choice, not an absence — with none, the chart
                shows one series per metric instead. */}
            <MenuItem value="">
              {translate('dash_reports.filters.no_pivot', { _: 'Nothing' })}
            </MenuItem>
            {spec.dimensions.map((d) => (
              <MenuItem key={d.key} value={d.key}>
                {label(translate, d.label, d.labelText)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {spec.dimensions
        .filter((d) => (d.values?.length ?? 0) > 0)
        .map((dimension) => {
          const selected = value.dimensions[dimension.key] ?? [];

          return (
            <FormControl key={dimension.key} size="small" fullWidth>
              <InputLabel id={`report-dim-${dimension.key}`}>
                {label(translate, dimension.label, dimension.labelText)}
              </InputLabel>
              <Select
                labelId={`report-dim-${dimension.key}`}
                multiple={dimension.multiple !== false}
                value={selected}
                input={<OutlinedInput label={label(translate, dimension.label, dimension.labelText)} />}
                onChange={(e) => {
                  const next = e.target.value;
                  setDimension(dimension.key, Array.isArray(next) ? next : [next]);
                }}
                renderValue={(picked) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(Array.isArray(picked) ? picked : [picked]).map((v) => {
                      const option = dimension.values?.find((o) => String(o.value) === String(v));
                      return (
                        <Chip
                          key={String(v)}
                          size="small"
                          label={option ? label(translate, option.label, option.labelText) : String(v)}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {dimension.values?.map((option) => (
                  <MenuItem key={String(option.value)} value={option.value as string}>
                    {label(translate, option.label, option.labelText)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })}
    </Stack>
  );
}

export default ReportFilters;

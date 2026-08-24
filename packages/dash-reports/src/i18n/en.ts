/**
 * This package's own strings.
 *
 * Namespaced under a single root key so merging into an app's bundle can never
 * clobber a sibling subtree — the reason mergeTranslations exists rather than a
 * shallow spread.
 *
 * Report titles, metric labels and dimension labels are NOT here: those keys
 * come from the backend spec and belong to whichever domain declared the
 * report. Only the package's own chrome lives in this file.
 */
export const en = {
  dash_reports: {
    title: 'Reports',
    units: {
      seconds: 's',
      minutes: 'min',
      hours: 'h',
    },
    dashboard: {
      title: 'This period',
    },
    period: {
      open: 'In progress',
      closed: 'Closed',
      current: 'Current period',
    },
    back_to_list: 'All reports',
    no_reports: 'No reports are available for your account.',
    loading: 'Loading…',
    no_data: 'No data for this range.',
    no_rows: 'No rows for this range.',
    other: 'Other',
    show_detail: 'Show detail rows',
    hide_detail: 'Hide detail rows',
    week_of: 'Week of %{date}',
    filters: {
      title: 'Filters',
      reset: 'Reset',
      done: 'Done',
      start: 'From',
      end: 'To',
      granularity: 'Group by',
      pivot: 'Split by',
      no_pivot: 'Nothing',
    },
    granularity: {
      daily: 'Day',
      weekly: 'Week',
      monthly: 'Month',
      yearly: 'Year',
      total: 'Whole period',
      hourOfDay: 'Hour of day',
      dayOfWeek: 'Day of week',
    },
    viz: {
      Bar: 'Bars',
      Line: 'Trend',
      Pie: 'Share',
      Doughnut: 'Share',
      Kpi: 'Totals',
      Funnel: 'Funnel',
      Table: 'Table',
    },
    funnel: {
      step: 'step',
      skipped: 'stage skipped',
    },
    table: {
      period: 'Period',
    },
    weekdays: {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    },
    export: {
      xlsx: 'Excel',
      csv: 'CSV',
    },
    errors: {
      spec: 'This report could not be loaded.',
      list: 'Reports could not be loaded.',
      series: 'This range could not be loaded.',
      dashboard: 'These stats could not be loaded.',
      widget: 'Unavailable',
    },
  },
};

export default en;

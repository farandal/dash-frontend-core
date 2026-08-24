import type { Granularity, TranslateFn } from './types';

/**
 * Turn a bucket key into an axis label.
 *
 * Series grains arrive as 'YYYY-MM-DD HH:mm:ss' in the REPORTING timezone —
 * already local, already truncated. They are formatted by string slicing rather
 * than by `new Date(...)`, deliberately: parsing them into a Date would apply
 * the browser's timezone to a value the server already converted, shifting
 * every label by the offset between the viewer and the venue. A restaurant in
 * Santiago read from a laptop in Madrid must still show Santiago's days.
 */
export function formatBucket(
  bucket: string | number,
  granularity: Granularity,
  translate: TranslateFn,
): string {
  // A total has exactly one bucket covering the whole window, so it has no
  // meaningful axis label — the surrounding card already states the period.
  if (granularity === 'total') {
    return translate('dash_reports.granularity.total', { _: 'Total' });
  }

  if (granularity === 'hourOfDay') {
    return `${String(bucket).padStart(2, '0')}:00`;
  }

  if (granularity === 'dayOfWeek') {
    // ISO day: 1 = Monday .. 7 = Sunday.
    const key = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][Number(bucket) - 1];
    return translate(`dash_reports.weekdays.${key}`, { _: key ?? String(bucket) });
  }

  const raw = String(bucket);
  const date = raw.slice(0, 10);          // YYYY-MM-DD
  const [year, month, day] = date.split('-');

  switch (granularity) {
    case 'yearly':
      return year;
    case 'monthly':
      return `${month}/${year}`;
    case 'weekly':
      return `${day}/${month}`;
    case 'daily':
    default:
      return `${day}/${month}`;
  }
}

/** A longer form for tooltips, where there is room to disambiguate. */
export function formatBucketLong(
  bucket: string | number,
  granularity: Granularity,
  translate: TranslateFn,
): string {
  if (granularity === 'total' || granularity === 'hourOfDay' || granularity === 'dayOfWeek') {
    return formatBucket(bucket, granularity, translate);
  }

  const raw = String(bucket);
  const [year, month, day] = raw.slice(0, 10).split('-');

  if (granularity === 'yearly') return year;
  if (granularity === 'monthly') return `${month}/${year}`;
  if (granularity === 'weekly') {
    return translate('dash_reports.week_of', { _: `Week of ${day}/${month}/${year}`, date: `${day}/${month}/${year}` });
  }

  return `${day}/${month}/${year}`;
}

export default formatBucket;

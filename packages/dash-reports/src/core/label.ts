import type { TranslateFn } from './types';

/**
 * Render a backend label.
 *
 * The API sends a translation KEY plus the text the backend resolved for it.
 * This prefers the app's own translation of the key and falls back to the
 * backend's text — polyglot's `_` option does exactly that, returning the
 * default whenever the key is missing.
 *
 * Why both: sending only the key means every app must redeclare every report's
 * vocabulary, and a newly registered report renders as `reports.x.title` until
 * someone ships a frontend change. Sending only text would take the override
 * away and make responses locale-bound. This way a new report is readable with
 * no frontend change, and an app that wants different wording still wins by
 * defining the key.
 */
export function label(
  translate: TranslateFn,
  key: string | undefined,
  text?: string,
): string {
  if (!key) return text ?? '';

  return translate(key, { _: text ?? key });
}

export default label;

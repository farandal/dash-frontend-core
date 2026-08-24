import type { ReportSpec } from '../../core/types';

/**
 * The categorical series palette.
 *
 * Eight hues, in a fixed order, validated for colour-vision deficiency against
 * both surfaces (worst adjacent CVD ΔE 9.1 light / 8.4 dark on the OKLab×100
 * scale; worst adjacent normal-vision ΔE 19.6 / 19.3). The dark column is the
 * same eight hues re-stepped for a dark surface — not an automatic flip of the
 * light values, which would drop several below the 3:1 contrast floor.
 *
 * Three light-mode hues (aqua, yellow, magenta) sit under 3:1 against the light
 * surface. That is permitted only with "relief": a legend is always rendered
 * for two or more series and every report also offers a Table visualisation,
 * so no value is reachable by colour alone.
 */
export const SERIES_LIGHT = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const;

export const SERIES_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
] as const;

/** Anything past the eighth slot folds into this rather than inventing a hue. */
export const OTHER_LIGHT = '#8a8a80';
export const OTHER_DARK = '#6f6f66';

export const MAX_SERIES = SERIES_LIGHT.length;

export function seriesPalette(dark: boolean): readonly string[] {
  return dark ? SERIES_DARK : SERIES_LIGHT;
}

/**
 * A stable slot for every series key.
 *
 * Keyed on the ENTITY, never on its position in the current result. Assigning
 * by index would repaint every surviving series the moment a filter removed one
 * above it — the reader sees "delivered" change from aqua to orange and reads it
 * as a different thing. The spec's declared dimension values give a fixed order
 * that survives filtering; metric order does the same when there is no pivot.
 * Keys the spec does not declare (a free-form pivot like product name) fall back
 * to first-seen order, which is at least stable within one result.
 */
export function buildSlotMap(spec: ReportSpec | null, pivotKey: string | undefined, seriesKeys: string[]): Map<string, number> {
  const ordered: string[] = [];

  const pivotDimension = pivotKey ? spec?.dimensions?.find((d) => d.key === pivotKey) : undefined;

  if (pivotDimension?.values?.length) {
    pivotDimension.values.forEach((v) => ordered.push(String(v.value)));
  } else if (!pivotKey && spec?.metrics?.length) {
    spec.metrics.forEach((m) => ordered.push(m.key));
  }

  seriesKeys.forEach((k) => {
    if (!ordered.includes(k)) ordered.push(k);
  });

  const map = new Map<string, number>();
  ordered.forEach((key, index) => map.set(key, index));

  return map;
}

export function colorForSlot(slot: number, dark: boolean): string {
  if (slot >= MAX_SERIES) return dark ? OTHER_DARK : OTHER_LIGHT;

  return seriesPalette(dark)[slot];
}

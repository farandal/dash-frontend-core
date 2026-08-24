import type { VisualizationType } from './types';

/**
 * Which visualizations draw to a <canvas>, and therefore need a parent with a
 * DEFINITE height.
 *
 * Chart.js with `responsive: true` + `maintainAspectRatio: false` sizes its
 * canvas from the parent box. If that parent's height is content-derived —
 * `minHeight`, `auto`, or nothing at all — the canvas grows to fill it, which
 * grows the parent, which fires another resize, which grows the canvas again.
 * The card expands without bound and the page never settles. `minHeight` does
 * NOT prevent this: it sets a floor, not a bound.
 *
 * Kpi, Funnel and Table are ordinary DOM and must size to their content
 * instead — pinning them to a fixed height would clip a long funnel or a wide
 * table.
 */
const CANVAS: ReadonlySet<string> = new Set<VisualizationType>(['Bar', 'Line', 'Pie', 'Doughnut']);

export function isCanvasVisualization(type: string | null | undefined): boolean {
  return !!type && CANVAS.has(type);
}

/**
 * The sx for a visualization's container: a definite height for canvases, and
 * content height for everything else.
 */
export function visualizationBoxSx(type: string | null | undefined, height: number) {
  return isCanvasVisualization(type)
    ? { height, minHeight: height, maxHeight: height, overflow: 'hidden' }
    : { minHeight: 0 };
}

export default isCanvasVisualization;

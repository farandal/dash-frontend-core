import type { ComponentType } from 'react';
import type { ReportResult, ReportSpec, TranslateFn, VisualizationType } from './types';

/**
 * Which component renders which visualization type.
 *
 * A registry rather than a switch so the chart library is a swappable detail:
 * the MUI/Chart.js adapter registers one set, and a different adapter (or a
 * single overridden widget) can replace any of them without this package
 * changing. It is also what keeps `core/` free of any chart import, so the
 * hooks and types stay usable somewhere Chart.js is not wanted.
 */

export interface VisualizationProps {
  result: ReportResult;
  spec: ReportSpec;
  translate: TranslateFn;
  options?: Record<string, unknown>;
  height?: number;
}

const registry = new Map<VisualizationType, ComponentType<VisualizationProps>>();

export function registerVisualization(
  type: VisualizationType,
  component: ComponentType<VisualizationProps>,
): void {
  registry.set(type, component);
}

export function getVisualization(type: VisualizationType): ComponentType<VisualizationProps> | null {
  return registry.get(type) ?? null;
}

export function registeredVisualizations(): VisualizationType[] {
  return Array.from(registry.keys());
}

export default registry;

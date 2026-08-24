import type { ReportFilterState } from './types';

/**
 * Flatten filter state into the query the backend expects.
 *
 * Dimension selections are sent under their own key (`?status[]=CREATED`),
 * which is what ReportQuery::resolveFilters reads. Empty selections are
 * omitted entirely rather than sent as an empty array — an empty `whereIn`
 * matches nothing, so sending one would turn "no filter" into "no rows".
 */
export function toQueryParams(filters: ReportFilterState): Record<string, unknown> {
  const params: Record<string, unknown> = {
    start: filters.start,
    end: filters.end,
    granularity: filters.granularity,
  };

  if (filters.pivot) params.pivot = filters.pivot;

  Object.entries(filters.dimensions ?? {}).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) params[key] = values;
  });

  return params;
}

export default toQueryParams;

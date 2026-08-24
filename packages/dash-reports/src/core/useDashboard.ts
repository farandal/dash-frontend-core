import { useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import type { ReportMetric, ReportResult, VisualizationType } from './types';

export interface DashboardPeriod {
  id: string;
  label: string;
  start: string;
  end: string;
  isOpen: boolean;
}

export interface DashboardWidget {
  key: string;
  reportKey: string;
  title: string;
  titleText?: string;
  pivot?: string;
  metrics?: string[];
  visualization?: VisualizationType;
  size?: 'sm' | 'md' | 'lg' | 'full';
  result?: ReportResult & { metrics?: ReportMetric[] };
  error?: string;
}

export interface DashboardTenant {
  tenant: { id: string; name: string };
  period: DashboardPeriod | null;
}

/**
 * The tenants whose dashboards this user should see, each with its period.
 *
 * One cheap call so the page knows how many tenant panels to mount before any
 * of them fetches data — a TenancyAdmin sees one panel per restaurant, a
 * tenant user sees exactly one.
 */
export function useDashboardTenants() {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [tenants, setTenants] = useState<DashboardTenant[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;

    axiosRef.current
      .get('report/dashboard')
      .then((response: { data: { data: DashboardTenant[]; widgets: DashboardWidget[] } }) => {
        if (!alive) return;
        setTenants(response.data?.data ?? []);
        setWidgets(response.data?.widgets ?? []);
      })
      .catch((e: Error) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { tenants, widgets, loading, error };
}

export interface DashboardData {
  tenantId: string;
  period: DashboardPeriod;
  /** 'live' | 'live-no-snapshot' | 'snapshot' — see the backend controller. */
  source: string;
  widgets: DashboardWidget[];
}

/**
 * One tenant's widgets for one period.
 *
 * Fetched per tenant rather than in one batch so panels load in parallel and
 * fail independently — a tenant whose data errors shows one broken panel, not
 * an empty dashboard.
 */
export function useTenantDashboard(tenantId: string | null, period = 'current') {
  const axios = useAxios();
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sequence = useRef(0);

  useEffect(() => {
    if (!tenantId) return;

    const ticket = ++sequence.current;
    setLoading(true);
    setError(null);

    axiosRef.current
      .get(`report/dashboard/${encodeURIComponent(tenantId)}`, { params: { period } })
      .then((response: { data: DashboardData }) => {
        if (ticket === sequence.current) setData(response.data);
      })
      .catch((e: Error) => {
        if (ticket === sequence.current) setError(e);
      })
      .finally(() => {
        if (ticket === sequence.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, period]);

  return { data, loading, error };
}

/** The period picker's options for one tenant. */
export function useTenantPeriods(tenantId: string | null) {
  const axios = useAxios();
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [periods, setPeriods] = useState<DashboardPeriod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    let alive = true;
    setLoading(true);

    axiosRef.current
      .get(`report/dashboard/${encodeURIComponent(tenantId)}/periods`)
      .then((response: { data: { data: DashboardPeriod[] } }) => {
        if (alive) setPeriods(response.data?.data ?? []);
      })
      .catch(() => {
        // A missing period list is not worth surfacing — the dashboard still
        // works on the current period, which is the default.
        if (alive) setPeriods([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return { periods, loading };
}

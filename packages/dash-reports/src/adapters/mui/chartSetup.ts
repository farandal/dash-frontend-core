import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  ArcElement,
  DoughnutController,
  PieController,
  PointElement,
  Tooltip,
} from 'chart.js';

/**
 * Register only the Chart.js pieces these widgets use.
 *
 * Explicit registration rather than `registerables`, which pulls in every
 * controller, scale and plugin Chart.js ships. The legacy Stats page imported
 * the lot for two chart types.
 *
 * Note what is absent: the datalabels plugin. A value printed on every point is
 * an anti-pattern — it is unreadable at any real series count and goes unread.
 * Values are reachable through the tooltip and, always, the table view.
 */
let registered = false;

export function ensureChartsRegistered(): void {
  if (registered) return;

  ChartJS.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    ArcElement,
    DoughnutController,
    PieController,
    CategoryScale,
    LinearScale,
    Filler,
    Legend,
    Tooltip,
  );

  registered = true;
}

export default ensureChartsRegistered;

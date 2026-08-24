import type { Theme } from '@mui/material';

/**
 * Chart chrome, taken from the app's MUI theme.
 *
 * Grid and axis lines are deliberately recessive — a chart's ink belongs to its
 * data, and heavy or dashed rules read as content. Text uses the theme's own
 * ink tokens, never a series colour: a coloured mark beside a label carries the
 * identity, so colouring the text as well adds nothing and costs contrast.
 */
export interface ChartChrome {
  dark: boolean;
  grid: string;
  axisText: string;
  tooltipBg: string;
  tooltipText: string;
  surface: string;
}

export function chartChrome(theme: Theme): ChartChrome {
  const dark = theme.palette.mode === 'dark';

  return {
    dark,
    // ~8% ink: present enough to read a value against, quiet enough to ignore.
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    axisText: theme.palette.text.secondary,
    tooltipBg: dark ? 'rgba(32,32,30,0.96)' : 'rgba(255,255,255,0.96)',
    tooltipText: theme.palette.text.primary,
    surface: theme.palette.background.paper,
  };
}

/** Shared scale/plugin options so every widget reads the same. */
export function baseChartOptions(chrome: ChartChrome, showLegend: boolean) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      // Whole-bucket hover: the hit target is the column, not the mark, so a
      // thin bar or a small point does not demand pixel-accurate aim.
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          color: chrome.axisText,
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: chrome.tooltipBg,
        titleColor: chrome.tooltipText,
        bodyColor: chrome.tooltipText,
        borderColor: chrome.grid,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: chrome.grid },
        ticks: { color: chrome.axisText, maxRotation: 0, autoSkipPadding: 12 },
      },
      y: {
        beginAtZero: true,
        grid: { color: chrome.grid },
        border: { display: false },
        ticks: { color: chrome.axisText, precision: 0 as unknown as number },
      },
    },
  };
}

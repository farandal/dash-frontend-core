/**
 * GlobalSmallLoader
 *
 * A minimal loading component that doesn't depend on heavy UI libraries.
 * Used during initial app load before heavier dependencies are available.
 */
import React from "react";

export interface GlobalSmallLoaderProps {
    message?: string;
    showMessage?: boolean;
}

/**
 * Brand-neutral default icon — a plain square using `currentColor` so it
 * inherits `.initial-loader`'s themed text color out of the box. This core
 * package intentionally ships no brand marks (core owns the platform, not
 * the business) — every domain app is expected to call `setGlobalLoaderIcon()`
 * once at boot with its own mark. Until an app does, this square renders.
 */
const DEFAULT_LOADER_ICON_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="2" fill="currentColor"/></svg>`;

let loaderIconMarkup: string = DEFAULT_LOADER_ICON_MARKUP;

/**
 * Configure the icon rendered inside the spinner ring for both
 * `GlobalSmallLoader` (React) and `GlobalLoaderHtmlMarkup` (raw HTML string).
 *
 * Call this once, as early as possible in an app's boot sequence — right
 * alongside `initializeThemeEarly()` in `main.tsx`, before the first render —
 * so the configured icon is in place before `GlobalSmallLoader` ever mounts
 * (e.g. as a `React.Suspense` fallback).
 *
 * @param svgMarkup Raw SVG (or other inline HTML) markup string.
 */
export const setGlobalLoaderIcon = (svgMarkup: string): void => {
    loaderIconMarkup = svgMarkup;
};

const LoaderIcon: React.FC = () => (
    <span dangerouslySetInnerHTML={{ __html: loaderIconMarkup }} />
);

/**
 * Global small loader component
 */
export const GlobalSmallLoader: React.FC<GlobalSmallLoaderProps> = ({
    message,
    showMessage = false,
}) => {
    // Idempotent — safe to call on every render; only injects once.
    injectCriticalStyles();

    return (
        <div className="initial-loader">
            <div className="initial-loader-spinner">
                <span className="initial-loader-icon">
                    <LoaderIcon />
                </span>
            </div>
            {showMessage && message && <div className="initial-loader-text">{message}</div>}
        </div>
    );
};

/**
 * HTML markup for the loader (for use in index.html, before React/JS boots).
 * A function (not a static string) so it always reflects the icon most
 * recently set via `setGlobalLoaderIcon()`.
 */
export const GlobalLoaderHtmlMarkup = (message: string = ''): string => `<div class="initial-loader">
    <div class="initial-loader-spinner">
        <span class="initial-loader-icon">${loaderIconMarkup}</span>
    </div>
    ${message ? `<div class="initial-loader-text">${message}</div>` : ''}
</div>`;

/**
 * Inject critical CSS styles for the loader
 * Call this early in the app lifecycle
 */
export const injectCriticalStyles = (): void => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('critical-loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'critical-loading-styles';
    style.textContent = `
        .initial-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: var(--text-color, #fff);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 9999;
        }
        .initial-loader-spinner {
            width: 40px;
            height: 40px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        /* The ring lives on a pseudo-element (not the container itself) so its
           rotation never touches .initial-loader-icon — a real DOM child would
           inherit a parent's animated transform and spin along with the ring. */
        .initial-loader-spinner::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 3px solid var(--border-color, rgba(128,128,128,0.25));
            border-top-color: var(--highlight-color, #49a000);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .initial-loader-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }
        .initial-loader-text {
            margin-top: 16px;
            font-size: 14px;
            opacity: 0.7;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
};

export default GlobalSmallLoader;

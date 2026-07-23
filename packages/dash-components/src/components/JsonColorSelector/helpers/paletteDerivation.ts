/**
 * Palette derivation — computes the full DASH theme palette from 5 base colors
 * per mode, entirely in the frontend (no AI required).
 *
 * Design-system bases (per mode, from the DASH Design System):
 *   --primary-color      brand color (sidebar, table headers, links)
 *   --primary-contrast   companion shade of primary (darker variant, NOT text color)
 *   --secondary-color    action/CTA color (buttons)
 *   --secondary-contrast text color on secondary (buttons text)
 *   --highlight-color    accent color (badges, highlights)
 *
 * Derivation rules were reverse-engineered from config/tenants.php theme_colors
 * defaults and the kitchntabs app dash-variables.less overrides:
 *   - Brand families (sidebar, buttons, links, table headers, scrollbars) inherit
 *     from the 5 bases via lighten/darken/alpha transforms.
 *   - Greyscale neutrals (module-bg, component-bg, framed_layout-bg, text-*, ...)
 *     and semantic alerts (alert-*) are intentionally NOT derived — they keep
 *     their current/template values so backgrounds stay greyscale and alert
 *     semantics (red=error, green=success...) are never lost.
 */

export type ThemeMode = 'light' | 'dark';

export interface BasicPalette {
    primaryColor: string;
    primaryContrast: string;
    secondaryColor: string;
    secondaryContrast: string;
    highlightColor: string;
    // Page/surface background pair — NOT derived from the 5 brand bases above (they
    // stay neutral so content stays readable); set and extracted as plain pass-through
    // values. Real usage today: MUI DataGrid row striping (bodybg-primary = even rows,
    // bodybg-secondary = odd rows) — see dash-styles/src/index.tsx.
    bodyBgPrimary: string;
    bodyBgSecondary: string;
}

export const BASIC_COLOR_DEFS: { key: keyof BasicPalette; cssBase: string; label: string; description: string }[] = [
    { key: 'primaryColor', cssBase: 'primary-color', label: 'Primary', description: 'Brand color: sidebar, headers, links' },
    { key: 'primaryContrast', cssBase: 'primary-contrast', label: 'Primary Contrast', description: 'Darker companion of primary' },
    { key: 'secondaryColor', cssBase: 'secondary-color', label: 'Secondary', description: 'Action color: buttons, CTAs' },
    { key: 'secondaryContrast', cssBase: 'secondary-contrast', label: 'Secondary Contrast', description: 'Text over secondary' },
    { key: 'highlightColor', cssBase: 'highlight-color', label: 'Highlight', description: 'Accent: badges, highlights' },
    { key: 'bodyBgPrimary', cssBase: 'bodybg-primary', label: 'Body Background', description: 'Page surface (e.g. table row background)' },
    { key: 'bodyBgSecondary', cssBase: 'bodybg-secondary', label: 'Body Background 2', description: 'Page surface, alternate (e.g. striped rows)' },
];

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

interface RGBA { r: number; g: number; b: number; a: number }

const clamp = (v: number, min = 0, max = 255) => Math.min(max, Math.max(min, v));

export const parseColor = (input: string): RGBA | null => {
    if (!input) return null;
    const value = input.trim();

    if (value.startsWith('#')) {
        let hex = value.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
            if ([r, g, b].some(isNaN)) return null;
            return { r, g, b, a };
        }
        return null;
    }

    const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map(p => parseFloat(p.trim()));
        if (parts.length >= 3 && parts.slice(0, 3).every(n => !isNaN(n))) {
            return { r: clamp(parts[0]), g: clamp(parts[1]), b: clamp(parts[2]), a: parts[3] !== undefined && !isNaN(parts[3]) ? parts[3] : 1 };
        }
    }
    return null;
};

export const toHex = ({ r, g, b }: RGBA): string =>
    `#${[r, g, b].map(v => Math.round(clamp(v)).toString(16).padStart(2, '0')).join('')}`;

/** Mix `color` toward `target` by weight 0..1 (0 = color, 1 = target). */
const mixRgb = (color: RGBA, target: RGBA, weight: number): RGBA => ({
    r: color.r + (target.r - color.r) * weight,
    g: color.g + (target.g - color.g) * weight,
    b: color.b + (target.b - color.b) * weight,
    a: color.a,
});

const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };

/** Lighten a color by mixing toward white. amount 0..1 */
export const lighten = (color: string, amount: number): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;
    return toHex(mixRgb(rgba, WHITE, amount));
};

/** Darken a color by mixing toward black. amount 0..1 */
export const darken = (color: string, amount: number): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;
    return toHex(mixRgb(rgba, BLACK, amount));
};

/** rgba() string of a color with the given alpha. */
export const withAlpha = (color: string, alphaValue: number): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;
    return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${alphaValue})`;
};

export const relativeLuminance = (color: string): number => {
    const rgba = parseColor(color);
    if (!rgba) return 0;
    return (0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b) / 255;
};

/** '#ffffff' or '#000000' depending on which reads better over the color. */
export const contrastText = (color: string): string =>
    relativeLuminance(color) > 0.55 ? '#000000' : '#ffffff';

// ---------------------------------------------------------------------------
// HSL helpers (for image → bases mapping)
// ---------------------------------------------------------------------------

const rgbToHsl = ({ r, g, b }: RGBA): { h: number; s: number; l: number } => {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h: number;
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
    return { h, s, l };
};

const hueDistance = (a: number, b: number): number => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
};

// ---------------------------------------------------------------------------
// Brand-derived palette
// ---------------------------------------------------------------------------

/**
 * Compute the brand-derived subset of the theme for one mode.
 * Returns keys WITHOUT the mode suffix. Neutral/semantic keys are deliberately
 * absent — callers must merge this over the existing full palette.
 */
export const deriveModePalette = (bases: BasicPalette, mode: ThemeMode): Record<string, string> => {
    const P = bases.primaryColor;
    const PC = bases.primaryContrast;
    const S = bases.secondaryColor;
    const SC = bases.secondaryContrast;
    const H = bases.highlightColor;
    const dark = mode === 'dark';

    return {
        // Core bases
        'primary-color': P,
        'primary-contrast': PC,
        'primary-contrast-color': PC,
        'secondary-color': S,
        'secondary-contrast': SC,
        'highlight-color': H,
        'highlight-color-contrast': contrastText(H),

        // Page background pair — pass-through, not derived from the brand bases.
        'bodybg-primary': bases.bodyBgPrimary,
        'bodybg-secondary': bases.bodyBgSecondary,

        // Buttons — action family from secondary
        'btn-bg': S,
        'btn-primary-bg': S,
        'btn-hover-bg': darken(S, 0.14),
        'btn-active-bg': darken(S, 0.24),
        'btn-border-color': darken(S, 0.10),
        'btn-color': SC,
        'btn-primary-color': SC,

        // Links — primary family
        'link-color': dark ? lighten(P, 0.30) : darken(P, 0.12),
        'link-hover': dark ? lighten(P, 0.45) : lighten(P, 0.18),
        'link-hover-color': dark ? lighten(P, 0.45) : lighten(P, 0.18),
        'link-active': dark ? lighten(P, 0.20) : darken(P, 0.24),
        'link-active-color': dark ? lighten(P, 0.20) : darken(P, 0.24),
        'dash-link-color': dark ? lighten(P, 0.35) : darken(P, 0.16),

        // Table headers — primary family
        'table-header-bg': dark ? darken(P, 0.24) : P,
        'table-header-color': contrastText(dark ? darken(P, 0.24) : P),

        // Header badge — highlight family
        'header-badge': H,
        'header-badge-hover': lighten(H, 0.12),

        // Dash sidebar — primary family
        'dash-sidebar-bg': dark ? darken(P, 0.30) : P,
        'dash-sidebar-bg-primary': dark ? darken(P, 0.30) : P,
        'dash-sidebar-bg-contrast': dark ? lighten(P, 0.08) : PC,
        'dash-sidebar-bg-hover': dark ? lighten(P, 0.08) : PC,
        'dash-sidebar-submenu-bg-contrast': dark ? lighten(P, 0.08) : PC,
        'dash-sidebar-submenu-bg-primary': dark ? 'rgba(18, 18, 18, 0.16)' : lighten(P, 0.85),
        'dash-sidebar-color': dark ? lighten(P, 0.25) : contrastText(P),
        'dash-sidebar-color-primary': dark ? lighten(P, 0.25) : contrastText(P),
        'dash-sidebar-color-active': dark ? '#fafafa' : lighten(P, 0.85),
        'dash-sidebar-color-contrast': dark ? lighten(P, 0.55) : lighten(P, 0.85),
        'dash-sidebar-submenu-color-contrast': dark ? lighten(P, 0.55) : lighten(P, 0.85),
        'dash-sidebar-submenu-color-primary': dark ? '#d4d4d4' : P,
        'dash-sidebar-icon-color': dark ? '#f5f5f5' : P,
        'dash-sidebar-icon-color-primary': dark ? '#f5f5f5' : P,
        'dash-sidebar-icon-color-active': dark ? P : lighten(P, 0.85),
        'dash-sidebar-icon-color-secondary': dark ? lighten(P, 0.10) : lighten(P, 0.85),
        'dash-sidebar-handle-primary': dark ? withAlpha(lighten(P, 0.15), 0.4) : 'rgba(255, 255, 255, 0.2)',
        'dash-sidebar-handle-contrast': dark ? withAlpha(P, 0.6) : 'rgba(255, 255, 255, 0.5)',

        // Dash surfaces / scrollbars — primary family
        'dash-scroll-thumb-color': dark ? P : lighten(P, 0.30),
        'dash-scroll-track-color': dark ? darken(P, 0.30) : lighten(P, 0.88),
        'dash-main-background': dark ? darken(P, 0.35) : '#ffffff',
        'dash-framed-layout-background': dark ? P : '#ffffff',
        'dash-border-color': dark ? '#000000' : lighten(P, 0.72),
        'body-background': dark ? darken(P, 0.28) : P,
        'component-active-background': dark ? darken(P, 0.28) : '#e6e6e6',
        'component-hover-background': dark ? darken(P, 0.22) : '#f8f8f8',
        'component-border-color': dark ? '#000000' : lighten(P, 0.72),
        'border-color-base': dark ? '#000000' : lighten(P, 0.72),
        'border-color-split': dark ? '#000000' : lighten(P, 0.72),
        'module-background': dark ? darken(P, 0.34) : '#f8f8f8',
    };
};

/** Full `{ 'key--mode': value }` record for the brand-derived keys, both modes. */
export const deriveBrandPairs = (light: BasicPalette, darkBases: BasicPalette): Record<string, string> => {
    const out: Record<string, string> = {};
    Object.entries(deriveModePalette(light, 'light')).forEach(([k, v]) => { out[`${k}--light`] = v; });
    Object.entries(deriveModePalette(darkBases, 'dark')).forEach(([k, v]) => { out[`${k}--dark`] = v; });
    return out;
};

// ---------------------------------------------------------------------------
// Reading bases from an existing palette
// ---------------------------------------------------------------------------

const FALLBACK_BASES: Record<ThemeMode, BasicPalette> = {
    light: {
        primaryColor: '#41ab5d',
        primaryContrast: '#005a32',
        secondaryColor: '#367800',
        secondaryContrast: '#ffffff',
        highlightColor: '#49a000',
        bodyBgPrimary: '#ffffff',
        bodyBgSecondary: '#ececec',
    },
    dark: {
        primaryColor: '#41ab5d',
        primaryContrast: '#005a32',
        secondaryColor: '#238b45',
        secondaryContrast: '#f7fcf5',
        highlightColor: '#74c476',
        bodyBgPrimary: '#101010',
        bodyBgSecondary: 'rgba(36, 36, 36, 1)',
    },
};

/** Extract the 7 base colors for a mode from a full palette record; falls back to defaults. */
export const extractBases = (colors: Record<string, string>, mode: ThemeMode): BasicPalette => {
    const get = (base: string, fallback: string) => {
        const v = colors[`${base}--${mode}`];
        return v && parseColor(v) ? v : fallback;
    };
    const fb = FALLBACK_BASES[mode];
    return {
        primaryColor: get('primary-color', fb.primaryColor),
        primaryContrast: get('primary-contrast', fb.primaryContrast),
        secondaryColor: get('secondary-color', fb.secondaryColor),
        secondaryContrast: get('secondary-contrast', fb.secondaryContrast),
        highlightColor: get('highlight-color', fb.highlightColor),
        bodyBgPrimary: get('bodybg-primary', fb.bodyBgPrimary),
        bodyBgSecondary: get('bodybg-secondary', fb.bodyBgSecondary),
    };
};

// ---------------------------------------------------------------------------
// Image palette → bases (local, no AI)
// ---------------------------------------------------------------------------

/**
 * Map a ColorThief palette (RGB triples ordered by dominance) to the 5 base
 * colors for both modes. Pure frontend heuristic:
 *   primary   = most dominant sufficiently-saturated color
 *   secondary = next color with a distinct hue (>40° away)
 *   highlight = most vivid remaining color
 * Contrasts are computed (primary-contrast = darker companion,
 * secondary-contrast = readable text color).
 */
export const basesFromImagePalette = (palette: number[][]): { light: BasicPalette; dark: BasicPalette } => {
    const candidates = palette
        .map(rgb => {
            const rgba: RGBA = { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
            return { hex: toHex(rgba), ...rgbToHsl(rgba) };
        });

    const saturated = candidates.filter(c => c.s > 0.15 && c.l > 0.08 && c.l < 0.92);
    const pool = saturated.length > 0 ? saturated : candidates;

    const primary = pool[0];
    const secondary =
        pool.find(c => c !== primary && hueDistance(c.h, primary.h) > 40) ||
        pool.find(c => c !== primary) ||
        primary;
    const vividness = (c: { s: number; l: number }) => c.s * (1 - Math.abs(c.l - 0.5) * 2);
    const highlight =
        [...pool]
            .filter(c => c !== primary && c !== secondary)
            .sort((a, b) => vividness(b) - vividness(a))[0] ||
        secondary;

    // Normalize for usable contrast: primary shouldn't be near-white/near-black.
    const normalize = (hex: string, minL = 0.18, maxL = 0.72): string => {
        const l = rgbToHsl(parseColor(hex)!).l;
        if (l > maxL) return darken(hex, (l - maxL) / (1 - maxL) * 0.6);
        if (l < minL) return lighten(hex, (minL - l) / minL * 0.6);
        return hex;
    };

    const pLight = normalize(primary.hex);
    const sLight = normalize(secondary.hex);

    const light: BasicPalette = {
        primaryColor: pLight,
        primaryContrast: darken(pLight, 0.40),
        secondaryColor: sLight,
        secondaryContrast: contrastText(sLight),
        highlightColor: normalize(highlight.hex, 0.25, 0.8),
        // Body background stays neutral even when deriving from an image — a page
        // background tinted to a vivid extracted color reads as garish/low-contrast
        // for content. Left at the template default; fine-tune manually if desired.
        bodyBgPrimary: FALLBACK_BASES.light.bodyBgPrimary,
        bodyBgSecondary: FALLBACK_BASES.light.bodyBgSecondary,
    };
    // Dark mode: same hues, slightly brighter for legibility over dark surfaces.
    const pDark = lighten(pLight, 0.08);
    const sDark = lighten(sLight, 0.12);
    const dark: BasicPalette = {
        primaryColor: pDark,
        primaryContrast: darken(pDark, 0.40),
        secondaryColor: sDark,
        secondaryContrast: contrastText(sDark),
        highlightColor: lighten(light.highlightColor, 0.10),
        bodyBgPrimary: FALLBACK_BASES.dark.bodyBgPrimary,
        bodyBgSecondary: FALLBACK_BASES.dark.bodyBgSecondary,
    };

    return { light, dark };
};

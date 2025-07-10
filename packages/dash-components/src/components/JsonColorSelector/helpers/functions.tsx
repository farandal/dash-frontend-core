import { ColorFormat, ColorFormatType, KeyValuePair } from "../interfaces/interfaces";

// Helper function to determine text color based on background
export const getContrastColor = (color: string): string => {
    // Handle different color formats
    let r: number, g: number, b: number, a: number = 1;

    if (color.startsWith('#')) {
        // Hex color
        const hex = color.replace('#', '');
        if (hex.length === 8) {
            // RGBA hex
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
            a = parseInt(hex.substr(6, 2), 16) / 255;
        } else {
            // RGB hex
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
    } else if (color.startsWith('rgb')) {
        // RGB/RGBA color
        const match = color.match(/rgba?\(([^)]+)\)/);
        if (match) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            [r, g, b, a = 1] = values;
        } else {
            return '#000000';
        }
    } else if (color.startsWith('hsl')) {
        // For HSL, we'll use a simple approach
        return '#000000';
    } else {
        return '#000000';
    }

    // Calculate luminance considering alpha
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const effectiveLuminance = luminance * a + (1 - a); // Blend with white background

    return effectiveLuminance > 0.5 ? '#000000' : '#ffffff';
};

// Helper function to convert color to different formats
// Helper function to convert color to different formats - Updated
export const convertColor = (color: ColorFormat, format: ColorFormatType): string => {
    switch (format) {
        case 'hex':
            // For hex, we'll ignore alpha or convert to 8-digit hex if alpha < 1
            if (color.rgb.a !== undefined && color.rgb.a < 1) {
                const alpha = Math.round(color.rgb.a * 255);
                const alphaHex = alpha.toString(16).padStart(2, '0');
                return `${color.hex}${alphaHex}`;
            }
            return color.hex;
        case 'rgb':
            return `rgb(${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)})`;
        case 'rgba':
            const alpha = color.rgb.a !== undefined ? Number(color.rgb.a.toFixed(2)) : 1;
            return `rgba(${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)}, ${alpha})`;
        case 'hsl':
            return `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%)`;
        case 'hsla':
            const hslaAlpha = color.hsl.a !== undefined ? Number(color.hsl.a.toFixed(2)) : 1;
            return `hsla(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%, ${hslaAlpha})`;
        default:
            return color.hex;
    }
};
// Helper function to parse color key and create chips
export const parseColorKey = (key: string) => {
    const parts = key.split('--');
    const baseName = parts[0];
    const mode = parts[1];

    // Split base name by hyphens for individual chips
    const baseChips = baseName.split('-').filter(part => part.length > 0);

    return { baseChips, mode };
};

// Helper function to extract available modes from color keys
export const extractAvailableModes = (pairs: KeyValuePair[]): string[] => {
    const modes = new Set<string>();

    pairs.forEach(pair => {
        const { mode } = parseColorKey(pair.key);
        if (mode) {
            modes.add(mode);
        }
    });

    return Array.from(modes).sort();
};

// Helper function to get mode icon
export const getModeIcon = (mode: string | undefined): string => {
    if (!mode) return '';

    switch (mode.toLowerCase()) {
        case 'light':
            return '☀️'; // Sun icon
        case 'dark':
            return '🌙'; // Moon icon
        default:
            return mode; // Plain text for other modes
    }
};

// Helper function to convert RGB array to hex
export const rgbArrayToHex = (rgb: number[]): string => {
    const [r, g, b] = rgb;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Helper function to convert RGB array to rgb string
export const rgbArrayToRgbString = (rgb: number[]): string => {
    const [r, g, b] = rgb;
    return `rgb(${r}, ${g}, ${b})`;
};


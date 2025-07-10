
import { RGBColor } from 'react-color';


export interface KeyValuePair {
    key: string;
    value: string;
    id: string;
}

export interface ColorFormat {
    hex: string;
    rgb: RGBColor;
    hsl: { h: number; s: number; l: number; a?: number };
}

export type ColorFormatType = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

// Color mapping interface
export interface ColorMapping {
    [key: string]: string;
}

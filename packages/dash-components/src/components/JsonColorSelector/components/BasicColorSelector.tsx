import { Box, Card, TextField, Typography } from '@mui/material';
import { useRef } from 'react';
import {
    BASIC_COLOR_DEFS,
    BasicPalette,
    ThemeMode,
    contrastText,
    deriveModePalette,
    lighten,
    parseColor,
    toHex,
    withAlpha,
} from '../helpers/paletteDerivation';

interface BasicColorSelectorProps {
    lightBases: BasicPalette;
    darkBases: BasicPalette;
    onBaseChange: (mode: ThemeMode, key: keyof BasicPalette, color: string) => void;
    readOnly?: boolean;
}

/** Mini browser-like preview painted with the derived palette for one mode. */
const MiniPreview: React.FC<{ bases: BasicPalette; mode: ThemeMode }> = ({ bases, mode }) => {
    const derived = deriveModePalette(bases, mode);
    const dark = mode === 'dark';

    // Page background pair, driven by the two new base swatches — primary is the
    // overall content surface, secondary shows on the "row"/card beneath it, echoing
    // their real usage as MUI DataGrid even/odd row backgrounds.
    const surface = derived['bodybg-primary'];
    const text = dark ? '#f2f2f2' : '#1a1a1a';
    const textLight = dark ? '#b5b5b5' : '#6c6c6c';
    const moduleBg = derived['bodybg-secondary'];
    const moduleBorder = dark ? '#404040' : '#dddddd';

    return (
        <Box
            sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                border: `1px solid ${moduleBorder}`,
                fontSize: 0,
                userSelect: 'none',
            }}
        >
            {/* Browser chrome bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, backgroundColor: dark ? '#1c1c1c' : '#e4e4e4' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                    <Box key={c} sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c }} />
                ))}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    height: 168,
                    // Page surface as a gradient between the two body-background bases,
                    // rather than a flat fill — echoes how the pair reads together
                    // instead of showing bodybg-secondary only via row striping.
                    background: `linear-gradient(160deg, ${surface} 0%, ${moduleBg} 100%)`,
                }}
            >
                {/* Sidebar — mimics the real dash menu: logo, then nav rows with an
                    icon dot + label bar each, one marked "active" with a highlight-
                    color accent stripe and hover-tinted pill background. Every row
                    (including the logo) shares the same icon-slot width so label
                    bars all start at the same x-offset instead of drifting per row. */}
                <Box sx={{ width: 56, backgroundColor: derived['dash-sidebar-bg'], display: 'flex', flexDirection: 'column', gap: 0.4, p: 0.6, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 0.4, pl: 0.3, borderLeft: '2px solid transparent', mb: 0.2 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: derived['highlight-color'], flexShrink: 0 }} />
                        <Box sx={{ flexGrow: 1, height: 6, borderRadius: 0.5, backgroundColor: derived['dash-sidebar-color'], opacity: 0.85 }} />
                    </Box>
                    {[true, false, false, false].map((active, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                py: 0.3,
                                pr: 0.4,
                                pl: 0.3,
                                borderRadius: 0.5,
                                backgroundColor: active ? derived['dash-sidebar-bg-hover'] : 'transparent',
                                borderLeft: `2px solid ${active ? derived['highlight-color'] : 'transparent'}`,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                    backgroundColor: active ? derived['dash-sidebar-icon-color-active'] : derived['dash-sidebar-icon-color'],
                                }}
                            />
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    height: 5,
                                    borderRadius: 0.5,
                                    width: `${70 + (i % 3) * 8}%`,
                                    backgroundColor: active ? derived['dash-sidebar-color-active'] : derived['dash-sidebar-color'],
                                    opacity: active ? 0.95 : 0.55,
                                }}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Main area */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.75, borderBottom: `1px solid ${moduleBorder}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, backgroundColor: derived['table-header-bg'] }} />
                            <Box sx={{ width: 50, height: 7, borderRadius: 0.5, backgroundColor: textLight, opacity: 0.6 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ position: 'relative', width: 14, height: 14 }}>
                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: derived['header-badge'] }} />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -2,
                                        right: -2,
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        backgroundColor: derived['highlight-color'],
                                        border: `1px solid ${dark ? '#1c1c1c' : '#e4e4e4'}`,
                                    }}
                                />
                            </Box>
                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: text, opacity: 0.15 }} />
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.75, flexGrow: 1 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: text, lineHeight: 1.2 }}>
                            Title text
                        </Typography>
                        <Typography sx={{ fontSize: 8, color: textLight, lineHeight: 1.3 }}>
                            Subtext preview of body copy rendered over the {mode} surface.
                        </Typography>
                        <Typography sx={{ fontSize: 8, color: derived['link-color'], textDecoration: 'underline', lineHeight: 1.2 }}>
                            A link in primary
                        </Typography>

                        {/* Tag chip + status badge — a couple more miniature details */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                sx={{
                                    px: 0.75,
                                    py: 0.15,
                                    borderRadius: 4,
                                    backgroundColor: withAlpha(derived['primary-color'], dark ? 0.25 : 0.12),
                                    border: `1px solid ${derived['primary-color']}`,
                                }}
                            >
                                <Typography sx={{ fontSize: 7, fontWeight: 600, lineHeight: 1.4, color: dark ? lighten(derived['primary-color'], 0.4) : derived['primary-color'] }}>
                                    Tag
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    minWidth: 14,
                                    height: 12,
                                    px: 0.4,
                                    borderRadius: 4,
                                    backgroundColor: derived['highlight-color'],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography sx={{ fontSize: 7, fontWeight: 700, lineHeight: 1.4, color: contrastText(derived['highlight-color']) }}>
                                    3
                                </Typography>
                            </Box>
                        </Box>

                        {/* Mini card + button */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 'auto' }}>
                            <Box sx={{ flexGrow: 1, backgroundColor: moduleBg, border: `1px solid ${moduleBorder}`, borderRadius: 0.75, p: 0.75 }}>
                                <Box sx={{ width: '55%', height: 6, borderRadius: 0.5, backgroundColor: text, opacity: 0.75, mb: 0.5 }} />
                                <Box sx={{ width: '85%', height: 5, borderRadius: 0.5, backgroundColor: textLight, opacity: 0.6 }} />
                            </Box>
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 0.75,
                                    backgroundColor: derived['btn-bg'],
                                    color: derived['btn-color'],
                                    fontSize: 8,
                                    fontWeight: 600,
                                    lineHeight: 1,
                                }}
                            >
                                Button
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

/** One swatch row: color square (native picker) + hex text input. */
const BaseSwatch: React.FC<{
    def: (typeof BASIC_COLOR_DEFS)[number];
    value: string;
    onChange: (color: string) => void;
    readOnly?: boolean;
    labelColor: string;
    sublabelColor: string;
}> = ({ def, value, onChange, readOnly, labelColor, sublabelColor }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const parsed = parseColor(value);
    const pickerValue = parsed ? toHex(parsed) : '#000000';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
                onClick={() => !readOnly && inputRef.current?.click()}
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    backgroundColor: value,
                    border: '2px solid rgba(128,128,128,0.35)',
                    cursor: readOnly ? 'default' : 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                <input
                    ref={inputRef}
                    type="color"
                    value={pickerValue}
                    disabled={readOnly}
                    onChange={e => onChange(e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }}
                />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, lineHeight: 1.2 }}>
                    {def.label}
                </Typography>
                <Typography noWrap sx={{ fontSize: 10, color: sublabelColor, lineHeight: 1.2 }}>
                    {def.description}
                </Typography>
            </Box>
            <TextField
                value={value}
                size="small"
                disabled={readOnly}
                onChange={e => onChange(e.target.value)}
                inputProps={{ style: { fontFamily: 'monospace', fontSize: 11, padding: '4px 8px', width: 84 } }}
                sx={{ '& .MuiInputBase-root': { backgroundColor: 'rgba(255,255,255,0.85)' } }}
            />
        </Box>
    );
};

/**
 * Basic color selector: one card per mode (light-grey card for light mode,
 * dark-grey card for dark mode), each with a mini browser-style preview and
 * the base design-system colors (5 brand colors + the bodybg page-surface pair).
 */
const BasicColorSelector: React.FC<BasicColorSelectorProps> = ({ lightBases, darkBases, onBaseChange, readOnly }) => {
    const cards: { mode: ThemeMode; bases: BasicPalette; cardBg: string; title: string }[] = [
        { mode: 'light', bases: lightBases, cardBg: '#e9e9e9', title: '☀️ Light mode' },
        { mode: 'dark', bases: darkBases, cardBg: '#3a3a3a', title: '🌙 Dark mode' },
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {cards.map(({ mode, bases, cardBg, title }) => {
                const labelColor = contrastText(cardBg);
                const sublabelColor = mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
                return (
                    <Card
                        key={mode}
                        elevation={2}
                        sx={{
                            backgroundColor: cardBg,
                            // MUI layers a semi-transparent white elevation overlay onto any
                            // Paper/Card whenever the app's ACTIVE theme is dark, regardless of
                            // this card's own explicit background — that washes out low-contrast
                            // text (e.g. dark text on the light-mode card) while saturated chips/
                            // buttons still show through. These cards are intentionally themed
                            // independently of the app's current mode, so opt out of it.
                            backgroundImage: 'none',
                            p: 2,
                            borderRadius: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: labelColor, mb: 1.5 }}>
                            {title}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <MiniPreview bases={bases} mode={mode} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            {BASIC_COLOR_DEFS.map(def => (
                                <BaseSwatch
                                    key={def.key}
                                    def={def}
                                    value={bases[def.key]}
                                    readOnly={readOnly}
                                    labelColor={labelColor}
                                    sublabelColor={sublabelColor}
                                    onChange={color => onBaseChange(mode, def.key, color)}
                                />
                            ))}
                        </Box>
                    </Card>
                );
            })}
        </Box>
    );
};

export default BasicColorSelector;

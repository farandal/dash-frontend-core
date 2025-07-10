import {
    Box,
    Button,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChromePicker } from 'react-color';
import { useState, useEffect } from 'react';
import { ColorFormat, ColorFormatType, KeyValuePair } from '../interfaces/interfaces';
import { convertColor, getContrastColor, rgbArrayToHex } from '../helpers/functions';


// Color edit dialog component
const ColorEditDialog: React.FC<{
    open: boolean;
    pair: KeyValuePair | null;
    onClose: () => void;
    onSave: (pair: KeyValuePair) => void;
    onDelete: (id: string) => void;
    existingKeys: string[];
    updateSingleDomColor: (key: string, color: string) => void;
    extractedColors?: number[][]; // Add this prop
}> = ({ open, pair, onClose, onSave, onDelete, existingKeys, updateSingleDomColor, extractedColors = [] }) => {
    const [editedPair, setEditedPair] = useState<KeyValuePair | null>(null);
    const [colorFormat, setColorFormat] = useState<ColorFormatType>('hex');
    const [keyError, setKeyError] = useState<string>('');
    const [tabValue, setTabValue] = useState(0);
    useEffect(() => {
        if (pair) {
            setEditedPair({ ...pair });
            // Detect color format - improved detection
            const value = pair.value.toLowerCase().trim();
            if (value.startsWith('rgba(')) {
                setColorFormat('rgba');
            } else if (value.startsWith('rgb(')) {
                setColorFormat('rgb');
            } else if (value.startsWith('hsla(')) {
                setColorFormat('hsla');
            } else if (value.startsWith('hsl(')) {
                setColorFormat('hsl');
            } else if (value.startsWith('#') && value.length === 9) {
                // 8-digit hex with alpha
                setColorFormat('rgba'); // Treat as rgba for editing
            } else {
                setColorFormat('hex');
            }
        }
        setKeyError('');
    }, [pair]);

    const handleKeyChange = (newKey: string) => {
        if (!editedPair) return;

        const isDuplicate = existingKeys.some(key => key === newKey && newKey !== pair?.key);
        setKeyError(isDuplicate ? 'Key already exists' : '');

        setEditedPair({ ...editedPair, key: newKey });
    };
    // Add this helper function to parse color strings into ChromePicker-compatible format
    const parseColorForPicker = (colorString: string): any => {
        const trimmed = colorString.toLowerCase().trim();

        if (trimmed.startsWith('rgba(')) {
            const match = trimmed.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                const [r, g, b, a = 1] = values;
                return {
                    r: Math.round(r),
                    g: Math.round(g),
                    b: Math.round(b),
                    a: a
                };
            }
        } else if (trimmed.startsWith('rgb(')) {
            const match = trimmed.match(/rgb\(([^)]+)\)/);
            if (match) {
                const values = match[1].split(',').map(v => parseFloat(v.trim()));
                const [r, g, b] = values;
                return {
                    r: Math.round(r),
                    g: Math.round(g),
                    b: Math.round(b),
                    a: 1
                };
            }
        } else if (trimmed.startsWith('hsla(')) {
            // For HSLA, convert to RGBA first or return the string
            return colorString;
        } else if (trimmed.startsWith('hsl(')) {
            // For HSL, convert to RGB first or return the string
            return colorString;
        } else if (trimmed.startsWith('#')) {
            // Hex color
            const hex = trimmed.replace('#', '');
            if (hex.length === 8) {
                // RGBA hex
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                const a = parseInt(hex.substr(6, 2), 16) / 255;
                return { r, g, b, a };
            } else if (hex.length === 6) {
                // RGB hex
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                return { r, g, b, a: 1 };
            }
        }

        // Fallback
        return colorString;
    };

    // Update the handleColorChange function in ColorEditDialog
    const handleColorChange = (color: any) => {
        if (!editedPair) return;

        // The color object from ChromePicker already has the correct structure
        // color.rgb = { r, g, b, a }
        // color.hsl = { h, s, l, a }
        // color.hex = "#rrggbb"

        // Create a proper ColorFormat object with preserved alpha
        const colorFormatObj: ColorFormat = {
            hex: color.hex,
            rgb: {
                r: Math.round(color.rgb.r),
                g: Math.round(color.rgb.g),
                b: Math.round(color.rgb.b),
                a: color.rgb.a !== undefined ? color.rgb.a : 1
            },
            hsl: {
                h: Math.round(color.hsl.h || 0),
                s: color.hsl.s || 0,
                l: color.hsl.l || 0,
                a: color.hsl.a !== undefined ? color.hsl.a : (color.rgb.a !== undefined ? color.rgb.a : 1)
            }
        };

        // Convert to the selected format type
        const newValue = convertColor(colorFormatObj, colorFormat);
        setEditedPair({ ...editedPair, value: newValue });

        updateSingleDomColor(editedPair.key, newValue);
    };


    const handleExtractedColorSelect = (colorRgb: number[]) => {
        if (!editedPair) return;

        const hexColor = rgbArrayToHex(colorRgb);
        setEditedPair({ ...editedPair, value: hexColor });
        updateSingleDomColor(editedPair.key, hexColor);
    };

    const handleSave = () => {
        if (!editedPair || keyError || !editedPair.key.trim()) return;
        onSave(editedPair);
        onClose();
    };

    const handleDelete = () => {
        if (!editedPair) return;
        onDelete(editedPair.id);
        onClose();
    };

    if (!editedPair) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md" // Changed to md for more space
            fullWidth
            PaperProps={{
                sx: { minHeight: 600 }
            }}
        >
            <DialogTitle>
                {pair?.key ? `Edit Color: ${pair.key}` : 'Add New Color'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                    {/* Color Name */}
                    <TextField
                        fullWidth
                        label="Color Name"
                        value={editedPair.key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        error={!!keyError}
                        helperText={keyError}
                        placeholder="e.g., primary-color--light, background-dark--dark"
                    />

                    {/* Color Format Selector */}
                    <FormControl fullWidth>
                        <InputLabel>Color Format</InputLabel>
                        <Select
                            value={colorFormat}
                            label="Color Format"
                            onChange={(e) => setColorFormat(e.target.value as ColorFormatType)}
                        >
                            <MenuItem value="hex">HEX</MenuItem>
                            <MenuItem value="rgb">RGB</MenuItem>
                            <MenuItem value="rgba">RGBA (with alpha)</MenuItem>
                            <MenuItem value="hsl">HSL</MenuItem>
                            <MenuItem value="hsla">HSLA (with alpha)</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Color Picker and Extracted Colors Side by Side */}
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Left Side - Color Picker */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Color Picker
                            </Typography>

                            {/* Color Picker Tabs */}
                            <Box>
                                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                                    <Tab label="Picker" />
                                    <Tab label="Manual" />
                                </Tabs>

                                {/*tabValue === 0 && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <ChromePicker
                                        color={editedPair.value}
                                        onChange={handleColorChange}
                                        disableAlpha={!['rgba', 'hsla'].includes(colorFormat)} // This will show alpha when rgba or hsla is selected
                                    />
                                </Box>
                            )*/}

                                {tabValue === 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <ChromePicker
                                            color={editedPair.value}
                                            onChange={handleColorChange}
                                            disableAlpha={false} // Change this to false to always show alpha
                                        />
                                    </Box>
                                )}

                                {tabValue === 1 && (
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            label={`Color Value (${colorFormat.toUpperCase()})`}
                                            value={editedPair.value}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setEditedPair({ ...editedPair, value: newValue });
                                                // Also update the DOM color for preview
                                                updateSingleDomColor(editedPair.key, newValue);
                                            }}
                                            placeholder={
                                                colorFormat === 'hex' ? '#ff0000' :
                                                    colorFormat === 'rgb' ? 'rgb(255, 0, 0)' :
                                                        colorFormat === 'rgba' ? 'rgba(255, 0, 0, 0.5)' :
                                                            colorFormat === 'hsl' ? 'hsl(0, 100%, 50%)' :
                                                                'hsla(0, 100%, 50%, 0.5)'
                                            }
                                            helperText={
                                                colorFormat === 'rgba' ? 'Alpha value should be between 0 and 1 (e.g., 0.1, 0.5, 1)' :
                                                    colorFormat === 'hsla' ? 'Alpha value should be between 0 and 1 (e.g., 0.1, 0.5, 1)' :
                                                        undefined
                                            }
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                backgroundColor: editedPair.value,
                                                                border: '1px solid #ccc',
                                                                borderRadius: 1,
                                                                // Add a checkerboard pattern background for transparency preview
                                                                backgroundImage: colorFormat === 'rgba' || colorFormat === 'hsla' ?
                                                                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' :
                                                                    'none',
                                                                backgroundSize: '4px 4px',
                                                                backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Right Side - Extracted Colors */}
                        {extractedColors.length > 0 && (
                            <Box sx={{ flex: '0 0 200px' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Extracted Colors
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    p: 2,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 1,
                                    backgroundColor: '#fafafa'
                                }}>
                                    {extractedColors.map((color, index) => {
                                        const hexColor = rgbArrayToHex(color);
                                        const isSelected = editedPair.value === hexColor;

                                        return (
                                            <Avatar
                                                key={index}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: hexColor,
                                                    border: isSelected ? '3px solid #1976d2' : '2px solid #ccc',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: 2,
                                                    },
                                                    color: getContrastColor(hexColor),
                                                    fontWeight: 'bold',
                                                }}
                                                onClick={() => handleExtractedColorSelect(color)}
                                                title={`Use extracted color: ${hexColor}`}
                                            >
                                                {index + 1}
                                            </Avatar>
                                        );
                                    })}
                                </Box>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                    Click any color to use it
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Color Preview */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Preview
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                height: 80,
                                backgroundColor: editedPair.value,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                // Add checkerboard background for alpha preview
                                backgroundImage: (editedPair.value.includes('rgba') || editedPair.value.includes('hsla')) ?
                                    'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)' :
                                    'none',
                                backgroundSize: '10px 10px',
                                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: editedPair.value,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: getContrastColor(editedPair.value),
                                        fontWeight: 'bold',
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        padding: '4px 8px',
                                        borderRadius: 1,
                                    }}
                                >
                                    {editedPair.key || 'Color Preview'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                {pair?.key && (
                    <Button
                        onClick={handleDelete}
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!!keyError || !editedPair.key.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColorEditDialog;
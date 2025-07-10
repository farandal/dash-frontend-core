import {
    Box,
    Button,
    IconButton,
    Typography,
    Card,
    CardMedia,
    CircularProgress,
    Input,
    Alert,
    TextField,
    Divider,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UpdateIcon from '@mui/icons-material/Update';
import { useState, useEffect, memo, useCallback } from 'react';
import { useAsyncColorThief } from '../useAsyncColorThief';
import { getContrastColor, rgbArrayToHex } from '../helpers/functions';
import { KeyValuePair } from '../interfaces/interfaces';
import { useAxios } from 'dash-axios-hook';

const ImageColorExtractor = memo<{
    onColorsExtracted: (colors: number[][]) => void;
    onColorsUpdate?: (newPairs: KeyValuePair[]) => void;
    existingPairs?: KeyValuePair[];
}>(({ onColorsExtracted, onColorsUpdate, existingPairs = [] }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [themePrompt, setThemePrompt] = useState<string>('');
    const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false);
    const [themeError, setThemeError] = useState<string | null>(null);
    
    // Add state to preserve extracted colors independently
    const [extractedPalette, setExtractedPalette] = useState<number[][]>([]);
    
    const axios = useAxios();
    const { dominantColor, palette, loading, error } = useAsyncColorThief(imageUrl, {
        colorCount: 8,
        quality: 10
    });

    // Update internal extracted palette state
    useEffect(() => {
        if (palette && palette.length > 0) {
            setExtractedPalette(palette);
            onColorsExtracted(palette);
        }
    }, [palette, onColorsExtracted]);

    // Handle file selection for upload
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            setUploadedFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImageUrl(previewUrl);
        }
    };

    // Handle image removal
    const handleImageRemove = () => {
        if (imageUrl && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }

        setImageUrl(null);
        setUploadedFile(null);
        setExtractedPalette([]); // Clear internal palette state
        onColorsExtracted([]); // Clear extracted colors
    };

    // Generate theme using AI - Modified to merge with existing colors
    const handleGenerateTheme = useCallback(async () => {
        if (!extractedPalette || extractedPalette.length === 0) {
            setThemeError('Please extract colors from an image first');
            return;
        }

        setIsGeneratingTheme(true);
        setThemeError(null);

        try {
            const response = await axios.post('/tenant/tenant/settings/theme-generator', {
                colors: extractedPalette,
                prompt: themePrompt,
                output_format: 'json'
            });
            
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = response.data;

            if (result.success && result.data) {
                // Convert the generated theme to KeyValuePair format
                const newPairs: KeyValuePair[] = Object.entries(result.data).map(([key, value]) => ({
                    key,
                    value: String(value),
                    id: Math.random().toString(36).substring(2, 11)
                }));

                // Merge with existing pairs instead of replacing them
                const mergedPairs = [...existingPairs];
                
                newPairs.forEach(newPair => {
                    const existingIndex = mergedPairs.findIndex(existing => existing.key === newPair.key);
                    if (existingIndex >= 0) {
                        // Update existing pair
                        mergedPairs[existingIndex] = newPair;
                    } else {
                        // Add new pair
                        mergedPairs.push(newPair);
                    }
                });

                // Update the colors in the parent component
                if (onColorsUpdate) {
                    onColorsUpdate(mergedPairs);
                }
            } else {
                throw new Error(result.message || 'Failed to generate theme');
            }
        } catch (error) {
            console.error('Theme generation error:', error);
            setThemeError(error instanceof Error ? error.message : 'Failed to generate theme');
        } finally {
            setIsGeneratingTheme(false);
        }
    }, [extractedPalette, themePrompt, existingPairs, onColorsUpdate, axios]);

    return (
        <Box sx={{ mt: 3, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon />
                AI Theme Generator
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Image Upload Section */}
            <Box sx={{ mb: 3 }}>
                {!imageUrl ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        border: '2px dashed #e0e0e0'
                    }}>
                        <Input
                            type="file"
                            inputProps={{ accept: 'image/*' }}
                            onChange={handleFileSelect}
                            sx={{ display: 'none' }}
                            id="color-extractor-upload"
                        />
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            Upload an Image to Extract Colors
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select an image file and we'll automatically extract a color palette
                        </Typography>
                        <label htmlFor="color-extractor-upload">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                size="large"
                            >
                                Choose Image
                            </Button>
                        </label>
                    </Box>
                ) : (
                    <Card sx={{ maxWidth: 400, mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={imageUrl}
                                alt="Uploaded image"
                                sx={{ objectFit: 'contain' }}
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                    },
                                }}
                                onClick={handleImageRemove}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Card>
                )}
            </Box>

            {/* Color Extraction Status */}
            {loading && (
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                    <CircularProgress size={20} />
                    <Typography>Extracting colors from image...</Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {themeError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {themeError}
                </Alert>
            )}

            {/* Extracted Colors Display - Use internal state */}
            {extractedPalette && extractedPalette.length > 0 && !loading && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Extracted Colors ({extractedPalette.length} colors found)
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 3 }}>
                        {extractedPalette.map((color, index) => {
                            const hexColor = rgbArrayToHex(color);
                            const isDominant = dominantColor &&
                                color[0] === dominantColor[0] &&
                                color[1] === dominantColor[1] &&
                                color[2] === dominantColor[2];

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        backgroundColor: hexColor,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: isDominant ? '3px solid #4caf50' : '2px solid #ccc',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                    title={`${hexColor} ${isDominant ? '(Dominant)' : ''}`}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: getContrastColor(hexColor),
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        {index + 1}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Theme Generation Controls */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Optional: Describe the theme style you want (e.g., 'modern and minimalist', 'warm and cozy', 'professional corporate')"
                            value={themePrompt}
                            onChange={(e) => setThemePrompt(e.target.value)}
                            sx={{ mb: 2 }}
                            label="Theme Description (Optional)"
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={isGeneratingTheme ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                                onClick={handleGenerateTheme}
                                disabled={isGeneratingTheme}
                                color="primary"
                            >
                                {isGeneratingTheme ? 'Generating...' : 'Generate AI Theme'}
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        • <strong>Generate AI Theme:</strong> Uses AI to create a complete color scheme based on extracted colors and your description
                    </Typography>
                </Box>
            )}
        </Box>
    );
});

export default ImageColorExtractor;

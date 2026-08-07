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
import { useTranslate } from 'react-admin';
import { useAsyncColorThief } from '../useAsyncColorThief';
import { getContrastColor, rgbArrayToHex } from '../helpers/functions';
import { KeyValuePair } from '../interfaces/interfaces';
import { useAxios } from 'dash-axios-hook';

const MAX_IMAGE_MB = 5;

const ImageColorExtractor = memo<{
    onColorsExtracted: (colors: number[][]) => void;
    onColorsUpdate?: (newPairs: KeyValuePair[]) => void;
    existingPairs?: KeyValuePair[];
    /** When false, the OpenAI theme generation UI is hidden — only local extraction applies. */
    aiEnabled?: boolean;
    /** Local (no-AI) apply: receives the extracted RGB palette so the caller can map it to base colors. */
    onApplyLocal?: (palette: number[][]) => void;
}>(({ onColorsExtracted, onColorsUpdate, existingPairs = [], aiEnabled = true, onApplyLocal }) => {
    const translate = useTranslate();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [themePrompt, setThemePrompt] = useState<string>('');
    const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false);
    const [themeError, setThemeError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

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

    // Shared validation + preview setup for a file coming from either the file
    // input or a drag-and-drop, so the two paths can never drift apart.
    const processFile = useCallback((file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert(translate('colorSelector.imageExtractor.invalid_file_type'));
            return;
        }

        // Validate file size
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            alert(translate('colorSelector.imageExtractor.file_too_large', { limit: MAX_IMAGE_MB }));
            return;
        }

        setUploadedFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImageUrl(previewUrl);
    }, [translate]);

    // Handle file selection for upload
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    // Drag-and-drop onto the upload dropzone
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

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
            setThemeError(translate('colorSelector.imageExtractor.no_palette_error'));
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
                throw new Error(result.message || translate('colorSelector.imageExtractor.theme_generation_failed'));
            }
        } catch (error) {
            console.error('Theme generation error:', error);
            setThemeError(
                error instanceof Error
                    ? error.message
                    : translate('colorSelector.imageExtractor.theme_generation_failed')
            );
        } finally {
            setIsGeneratingTheme(false);
        }
    }, [extractedPalette, themePrompt, existingPairs, onColorsUpdate, axios, translate]);

    return (
        <Box sx={{ mt: 3, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon />
                {aiEnabled
                    ? translate('colorSelector.imageExtractor.title_ai')
                    : translate('colorSelector.imageExtractor.title_local')}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Image Upload Section */}
            <Box sx={{ mb: 3 }}>
                {!imageUrl ? (
                    <Box
                        onDragEnter={handleDragOver}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            textAlign: 'center',
                            py: 4,
                            backgroundColor: isDragOver ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 1,
                            border: isDragOver ? '2px dashed #1976d2' : '2px dashed #e0e0e0',
                            transition: 'background-color 0.2s ease, border-color 0.2s ease',
                        }}
                    >
                        <Input
                            type="file"
                            inputProps={{ accept: 'image/*' }}
                            onChange={handleFileSelect}
                            sx={{ display: 'none' }}
                            id="color-extractor-upload"
                        />
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {translate('colorSelector.imageExtractor.upload_prompt')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {translate('colorSelector.imageExtractor.upload_hint')}
                        </Typography>
                        <label htmlFor="color-extractor-upload">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                size="large"
                            >
                                {translate('colorSelector.imageExtractor.upload_button')}
                            </Button>
                        </label>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1.5 }}>
                            {translate('colorSelector.imageExtractor.drop_hint')}
                        </Typography>
                    </Box>
                ) : (
                    <Card sx={{ maxWidth: 400, mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={imageUrl}
                                alt={translate('colorSelector.imageExtractor.uploaded_image_alt')}
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
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 3,
                        p: 2,
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        borderRadius: 1
                    }}>
                    <CircularProgress size={20} />
                    <Typography>{translate('colorSelector.imageExtractor.extracting')}</Typography>
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
                        {translate('colorSelector.imageExtractor.extracted_colors', { count: extractedPalette.length })}
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
                                    title={`${hexColor} ${isDominant ? `(${translate('colorSelector.imageExtractor.dominant_label')})` : ''}`}
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
                        {aiEnabled && (
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder={translate('colorSelector.imageExtractor.theme_description_placeholder')}
                                value={themePrompt}
                                onChange={(e) => setThemePrompt(e.target.value)}
                                sx={{ mb: 2 }}
                                label={translate('colorSelector.imageExtractor.theme_description_label')}
                            />
                        )}

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {onApplyLocal && (
                                <Button
                                    variant={aiEnabled ? 'outlined' : 'contained'}
                                    startIcon={<UpdateIcon />}
                                    onClick={() => onApplyLocal(extractedPalette)}
                                    color="primary"
                                >
                                    {translate('colorSelector.imageExtractor.apply_colors_button')}
                                </Button>
                            )}
                            {aiEnabled && (
                                <Button
                                    variant="contained"
                                    startIcon={isGeneratingTheme ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                                    onClick={handleGenerateTheme}
                                    disabled={isGeneratingTheme}
                                    color="primary"
                                >
                                    {isGeneratingTheme
                                        ? translate('colorSelector.imageExtractor.generating_button')
                                        : translate('colorSelector.imageExtractor.generate_button')}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        {onApplyLocal && (
                            <>
                                • <strong>{translate('colorSelector.imageExtractor.apply_colors_help_label')}</strong>{' '}
                                {translate('colorSelector.imageExtractor.apply_colors_help_desc')}
                                <br />
                            </>
                        )}
                        {aiEnabled && (
                            <>
                                • <strong>{translate('colorSelector.imageExtractor.generate_help_label')}</strong>{' '}
                                {translate('colorSelector.imageExtractor.generate_help_desc')}
                            </>
                        )}
                    </Typography>
                </Box>
            )}
        </Box>
    );
});

export default ImageColorExtractor;

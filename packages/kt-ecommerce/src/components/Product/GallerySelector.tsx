import React, { useState, useEffect } from 'react';
import { AutocompleteInput, useGetOne, useNotify } from 'react-admin';
import { useWatch, useController } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from "react-admin";
import { dashStorage } from 'dash-utils';
import {
    Box,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    IconButton,
    Tabs,
    Tab,
    CircularProgress,
    LinearProgress
} from "@mui/material";
import { FileUploader } from "react-drag-drop-files";
import * as Icons from "@mui/icons-material";
import { IGalleryImage } from "../../interfaces";
import {useAxios} from "dash-axios-hook";

const THUMB_SIZE = [120, 120];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`gallery-tabpanel-${index}`}
            aria-labelledby={`gallery-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const GalleryPreview = ({ gallery }: { gallery: any }) => {
    if (!gallery || !gallery.images || gallery.images.length === 0) {
        return (
            <Card sx={{ 
                mt: 2, 
                p: 2,
                backgroundColor: 'var(--component-bg)',
                border: '1px solid var(--component-border)',
                color: 'var(--component-text)'
            }}>
                <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                    No images in this gallery
                </Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ 
            mt: 2,
            backgroundColor: 'var(--component-bg)',
            border: '1px solid var(--component-border)',
            color: 'var(--component-text)'
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h4" sx={{ 
                        flexGrow: 1,
                        color: 'var(--heading-color)'
                    }}>
                        {gallery.title}
                    </Typography>
                    <Chip 
                        label={`${gallery.images_count} image${gallery.images_count !== 1 ? 's' : ''}`} 
                        size="small" 
                        sx={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'var(--primary-contrast)'
                        }}
                    />
                </Box>
                
                {gallery.description && (
                    <Typography variant="body2" sx={{ 
                        mb: 2,
                        color: 'var(--text-light)'
                    }}>
                        {gallery.description}
                    </Typography>
                )}

                <ImageList 
                    sx={{ width: '100%', height: 'auto', m: 0 }} 
                    cols={Math.min(4, gallery.images.length)} 
                    rowHeight={THUMB_SIZE[1]} 
                    gap={8}
                >
                    {gallery.images.map((image: IGalleryImage, index: number) => (
                        <ImageListItem
                            key={image.id}
                            sx={{
                                position: "relative",
                                overflow: 'hidden',
                                borderRadius: 'var(--border-radius-base)',
                                border: gallery.primary_image_id === image.id 
                                    ? '3px solid var(--primary-color)' 
                                    : '1px solid var(--component-border)',
                                '& img': {
                                    transform: 'scale(1)',
                                    transition: 'transform 0.3s ease-in-out',
                                },
                                '&:hover img': {
                                    transform: 'scale(1.05)',
                                }
                            }}
                        >
                            <img
                                src={image.url}
                                alt={`${gallery.title} - Image ${index + 1}`}
                                style={{
                                    width: THUMB_SIZE[0],
                                    height: THUMB_SIZE[1],
                                    objectFit: "cover",
                                }}
                                loading="lazy"
                            />
                            
                            {gallery.primary_image_id === image.id && (
                                <ImageListItemBar
                                    sx={{
                                        background: 'linear-gradient(to bottom, rgba(25,118,210,0.8) 0%, rgba(25,118,210,0.4) 70%, rgba(0,0,0,0) 100%)',
                                    }}
                                    position="top"
                                    title={
                                        <Chip 
                                            label="Primary" 
                                            size="small" 
                                            variant="filled"
                                            sx={{ 
                                                backgroundColor: 'var(--primary-color)',
                                                color: 'var(--primary-contrast)',
                                                fontSize: '0.7rem',
                                                height: '20px'
                                            }} 
                                        />
                                    }
                                />
                            )}
                        </ImageListItem>
                    ))}
                </ImageList>

                {gallery.primary_image_url && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-light)' }}>
                            Primary Image: {gallery.primary_image_url}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const GalleryManager = ({ gallery, onGalleryUpdate }: { gallery: any, onGalleryUpdate: () => void }) => {
    const [galleryImages, setGalleryImages] = useState<IGalleryImage[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const notify = useNotify();
    const fileTypes = ["JPG", "PNG", "JPEG"];
    const axios = useAxios();
    
    const getApiConfig = () => {
        return {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
    };

    useEffect(() => {
        if (gallery?.images) {
            setGalleryImages(gallery.images);
            setSelectedImage(gallery.primary_image_id || null);
        }
    }, [gallery]);

    const handleFileChange = (fileUploaded: FileList) => {
        const fileListArray = Array.from(fileUploaded);
        setFiles((prevState) => [...prevState, ...fileListArray]);
    };

    const removeFile = (index: number) => {
        setFiles((prevState) => prevState.filter((_, i) => i !== index));
    };

    const removeGalleryImage = (imageId: number) => {
        setGalleryImages((prevState) => prevState.filter((item) => item.id !== imageId));
    };

    const setPrimaryImage = (imageId: number) => {
        setSelectedImage(imageId);
    };

    const saveGallery = async () => {
        if (!gallery?.id) {
            notify('No hay galería seleccionada', { type: 'error' });
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            
            files.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            const currentImageIds = galleryImages.map(img => img.id);
            currentImageIds.forEach((id, index) => {
                formData.append(`current_images[${index}]`, id.toString());
            });
            
            if (selectedImage) {
                formData.append('primary_image_id', selectedImage.toString());
            }

            formData.append('tenant_id', dashStorage.getItem('tenant_id'));
            formData.append('_method', 'PUT');

            const config = getApiConfig();
            
            const response = await axios.post(
                `ecommerce/gallery/${gallery.id}`,
                formData,
                {
                    headers: config.headers,
                    timeout: 30000,
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                        }
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                notify('Galería actualizada exitosamente', { type: 'success' });
                setFiles([]);
                onGalleryUpdate();
            } else {
                throw new Error('Unexpected response status');
            }

        } catch (error: any) {
            console.error('Error updating gallery:', error);
            
            let errorMessage = 'Error al actualizar la galería';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            notify(errorMessage, { type: 'error' });
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    const hasChanges = () => {
        return (
            files.length > 0 || 
            galleryImages.length !== gallery?.images?.length || 
            selectedImage !== gallery?.primary_image_id
        );
    };

    return (
        <Box>
            {/* Progress Bar */}
            {isLoading && (
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                            flexGrow: 1,
                            color: 'var(--text-light)'
                        }}>
                            Subiendo imágenes de galería...
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                            {uploadProgress}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 'var(--border-radius-base)',
                            backgroundColor: 'var(--component-border)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 'var(--border-radius-base)',
                                backgroundColor: 'var(--success-color)',
                            }
                        }} 
                    />
                </Box>
            )}

            {/* File Upload Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'var(--heading-color)' }}>
                    Agregar Nuevas Imágenes
                </Typography>
                <Box sx={{ 
                    border: '2px dashed var(--component-border)', 
                    borderRadius: 'var(--border-radius-base)', 
                    p: 4, 
                    minHeight: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    backgroundColor: 'var(--component-bg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'var(--component-hover-bg)',
                        borderColor: 'var(--primary-color)',
                    }
                }}>
                    <FileUploader
                    /* @ts-ignore */
                        handleChange={handleFileChange}
                        name="file"
                        types={fileTypes}
                        multiple={true}
                        disabled={isLoading}
                        children={
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <Icons.CloudUpload sx={{ fontSize: 48, color: 'var(--primary-color)' }} />
                                <Button 
                                    variant="outlined" 
                                    disabled={isLoading}
                                    sx={{
                                        borderColor: 'var(--component-border)',
                                        color: 'var(--component-text)',
                                        '&:hover': {
                                            borderColor: 'var(--primary-color)',
                                            backgroundColor: 'var(--component-hover-bg)',
                                        }
                                    }}
                                >
                                    Arrastra imágenes aquí o haz clic para subir
                                </Button>
                                <Typography variant="caption" sx={{ color: 'var(--text-light)' }}>
                                    JPG, PNG, JPEG - Múltiples archivos permitidos
                                </Typography>
                            </Box>
                        }
                    />
                </Box>
            </Box>

            {/* New Files Preview */}
            {files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'var(--heading-color)' }}>
                        Nuevas Imágenes a Subir ({files.length})
                    </Typography>
                    <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={THUMB_SIZE[1]} gap={8}>
                        {files.map((file, index) => {
                            const img = URL.createObjectURL(file);
                            return (
                                <ImageListItem
                                    key={index}
                                    sx={{
                                        position: "relative",
                                        overflow: 'hidden',
                                        borderRadius: 'var(--border-radius-base)',
                                        border: '2px solid var(--success-color)'
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`New image ${index + 1}`}
                                        style={{
                                            width: THUMB_SIZE[0],
                                            height: THUMB_SIZE[1],
                                            objectFit: "cover",
                                        }}
                                        loading="lazy"
                                    />
                                    <ImageListItemBar
                                        sx={{ 
                                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)' 
                                        }}
                                        position="top"
                                        actionIcon={
                                            <IconButton
                                                sx={{ color: "var(--error-color)" }}
                                                onClick={() => removeFile(index)}
                                                size="small"
                                                disabled={isLoading}
                                            >
                                                <Icons.Delete />
                                            </IconButton>
                                        }
                                        actionPosition="right"
                                    />
                                    <Chip 
                                        label="New" 
                                        size="small" 
                                        sx={{ 
                                            position: 'absolute',
                                            bottom: 4,
                                            left: 4,
                                            fontSize: '0.7rem',
                                            backgroundColor: 'var(--success-color)',
                                            color: 'var(--primary-contrast)'
                                        }}
                                    />
                                </ImageListItem>
                            );
                        })}
                    </ImageList>
                </Box>
            )}

            {/* Existing Gallery Images */}
            {galleryImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'var(--heading-color)' }}>
                        Current Gallery Images ({galleryImages.length})
                    </Typography>
                    <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={THUMB_SIZE[1]} gap={8}>
                        {galleryImages.map((image: IGalleryImage, index: number) => (
                            <ImageListItem
                                key={image.id}
                                sx={{
                                    position: "relative",
                                    overflow: 'hidden',
                                    borderRadius: 'var(--border-radius-base)',
                                    border: selectedImage === image.id 
                                        ? '3px solid var(--primary-color)' 
                                        : '1px solid var(--component-border)',
                                    cursor: 'pointer',
                                    opacity: isLoading ? 0.6 : 1,
                                    '&:hover': {
                                        borderColor: 'var(--primary-color)',
                                    }
                                }}
                                onClick={() => !isLoading && setPrimaryImage(image.id)}
                            >
                                <img
                                    src={image.url}
                                    alt={`Gallery image ${index + 1}`}
                                    style={{
                                        width: THUMB_SIZE[0],
                                        height: THUMB_SIZE[1],
                                        objectFit: "cover",
                                    }}
                                    loading="lazy"
                                />
                                
                                {/* Delete button */}
                                <ImageListItemBar
                                    sx={{ 
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)' 
                                    }}
                                    position="top"
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: "var(--error-color)" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isLoading) {
                                                    removeGalleryImage(image.id);
                                                }
                                            }}
                                            size="small"
                                            disabled={isLoading}
                                        >
                                            <Icons.Delete />
                                        </IconButton>
                                    }
                                    actionPosition="right"
                                />

                                {/* Primary image indicator */}
                                {selectedImage === image.id && (
                                    <Chip 
                                        label="Primary" 
                                        size="small" 
                                        sx={{ 
                                            position: 'absolute',
                                            bottom: 4,
                                            left: 4,
                                            fontSize: '0.7rem',
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'var(--primary-contrast)'
                                        }}
                                    />
                                )}

                                {/* Set as primary button */}
                                <ImageListItemBar
                                    sx={{ background: 'transparent' }}
                                    position="bottom"
                                    actionIcon={
                                        <IconButton
                                            sx={{ 
                                                color: selectedImage === image.id 
                                                    ? "var(--primary-color)" 
                                                    : "var(--primary-contrast)",
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isLoading) {
                                                    setPrimaryImage(image.id);
                                                }
                                            }}
                                            size="small"
                                            disabled={isLoading}
                                        >
                                            {selectedImage === image.id ? <Icons.Star /> : <Icons.StarBorder />}
                                        </IconButton>
                                    }
                                    actionPosition="left"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Box>
            )}

            {/* Save Button */}
            {hasChanges() && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                        variant="contained" 
                        onClick={saveGallery}
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Icons.Save />}
                        size="large"
                        disabled={isLoading}
                        sx={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'var(--primary-contrast)',
                            '&:hover': {
                                backgroundColor: 'var(--primary-color)',
                                opacity: 0.9,
                            },
                            '&:disabled': {
                                backgroundColor: 'var(--disabled-bg)',
                                color: 'var(--disabled-color)',
                            }
                        }}
                    >
                        {isLoading ? `Guardando Galería... ${uploadProgress}%` : 'Guardar Cambios de Galería'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

const GallerySelectorEdit = ({ method, attribute, resourceConfig, ...props }: IDashAutoAdminCustomFieldComponent) => {
    const [tabValue, setTabValue] = useState(0);
    const record = useRecordContext();
    const currentGalleryId = useWatch({ name: 'gallery_id' });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const notify = useNotify();
    const fileTypes = ["JPG", "PNG", "JPEG", "WEBP"];
    
    // Form controller for gallery_images (for when no gallery is selected)
    const galleryImagesField = useController({ name: "gallery_images", defaultValue: [] });

    const { data: currentGallery, isPending, refetch } = useGetOne(
        'ecommerce/gallery',
        { id: currentGalleryId },
        { enabled: !!currentGalleryId }
    );

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleGalleryUpdate = () => {
        refetch();
    };

    // Sync newFiles to form field
    useEffect(() => {
        galleryImagesField.field.onChange(newFiles);
    }, [newFiles]);

    // Handle file upload
    const handleFileChange = (uploadedFiles: FileList | File[]) => {
        const fileListArray = Array.from(uploadedFiles);
        
        // Validate file sizes (max 10MB each)
        const validFiles = fileListArray.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                notify(`El archivo "${file.name}" excede el límite de 10MB`, { type: 'warning' });
                return false;
            }
            return true;
        });

        setNewFiles((prevState) => [...prevState, ...validFiles]);
    };

    // Remove file from queue
    const removeFile = (index: number) => {
        setNewFiles((prevState) => prevState.filter((_, i) => i !== index));
    };

    // Show image upload UI when no gallery is selected (same as create mode)
    if (!currentGalleryId) {
        return (
            <Box>
                <AutocompleteInput
                    {...props}
                    optionText="title"
                    optionValue="id"
                    debounce={300}
                    filterToQuery={(searchText) => ({ q: searchText })}
                    shouldRenderSuggestions={(val) => val.trim().length > 1}
                    suggestionLimit={20}
                    emptyText="Sin galería"
                    emptyValue=""
                    TextFieldProps={{
                        placeholder: 'Buscar galería existente...',
                    }}
                    /* @ts-ignore */
                    options={{ refetchOnWindowFocus: false }}
                />

                <Card sx={{ 
                    mt: 2,
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <Icons.PhotoLibrary sx={{ color: 'var(--primary-color)' }} />
                            <Typography variant="h6" sx={{ color: 'var(--heading-color)' }}>
                                Subir Imágenes del Producto
                            </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-light)' }}>
                            Sube imágenes para crear automáticamente una galería al guardar el producto.
                            También puedes seleccionar una galería existente en el campo de arriba.
                        </Typography>

                        {/* File Upload Section */}
                        <Box sx={{ 
                            border: '2px dashed var(--component-border)', 
                            borderRadius: 'var(--border-radius-base)', 
                            p: 2, 
                            textAlign: 'center',
                            backgroundColor: 'var(--component-bg)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'var(--component-hover-bg)',
                                borderColor: 'var(--primary-color)',
                            }
                        }}>
                            <FileUploader
                            /* @ts-ignore */
                                handleChange={handleFileChange}
                                name="gallery_images"
                                types={fileTypes}
                                multiple={true}
                                children={
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<Icons.CloudUpload />}
                                        sx={{
                                            borderColor: 'var(--component-border)',
                                            color: 'var(--component-text)',
                                            '&:hover': {
                                                borderColor: 'var(--primary-color)',
                                                backgroundColor: 'var(--component-hover-bg)',
                                            }
                                        }}
                                    >
                                        Arrastra imágenes o haz clic para subir
                                    </Button>
                                }
                            />
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--text-light)' }}>
                                JPG, PNG, JPEG, WEBP - Máximo 10MB por archivo
                            </Typography>
                        </Box>

                        {/* New Files Preview */}
                        {newFiles.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1, color: 'var(--heading-color)' }}>
                                        Imágenes a subir ({newFiles.length})
                                    </Typography>
                                    <Chip 
                                        label={`${newFiles.length} imagen${newFiles.length !== 1 ? 'es' : ''}`} 
                                        size="small" 
                                        sx={{
                                            backgroundColor: 'var(--success-color)',
                                            color: 'white'
                                        }}
                                    />
                                </Box>
                                <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={THUMB_SIZE[1]} gap={8}>
                                    {newFiles.map((file, index) => {
                                        const img = URL.createObjectURL(file);
                                        return (
                                            <ImageListItem
                                                key={index}
                                                sx={{
                                                    position: "relative",
                                                    overflow: 'hidden',
                                                    borderRadius: 'var(--border-radius-base)',
                                                    border: '2px solid var(--success-color)'
                                                }}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`New image ${index + 1}`}
                                                    style={{
                                                        width: THUMB_SIZE[0],
                                                        height: THUMB_SIZE[1],
                                                        objectFit: "cover",
                                                    }}
                                                    loading="lazy"
                                                    onLoad={() => URL.revokeObjectURL(img)}
                                                />
                                                <ImageListItemBar
                                                    sx={{ 
                                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)' 
                                                    }}
                                                    position="top"
                                                    actionIcon={
                                                        <IconButton
                                                            sx={{ color: "var(--error-color)" }}
                                                            onClick={() => removeFile(index)}
                                                            size="small"
                                                        >
                                                            <Icons.Delete />
                                                        </IconButton>
                                                    }
                                                    actionPosition="right"
                                                />
                                                <Chip 
                                                    label="Nueva" 
                                                    size="small" 
                                                    sx={{ 
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        left: 4,
                                                        fontSize: '0.7rem',
                                                        backgroundColor: 'var(--success-color)',
                                                        color: 'white'
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        right: 4,
                                                        color: 'white',
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        px: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: '0.6rem',
                                                        maxWidth: '60%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {file.name}
                                                </Typography>
                                            </ImageListItem>
                                        );
                                    })}
                                </ImageList>
                                
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 1.5, 
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                    borderRadius: 'var(--border-radius-base)',
                                    border: '1px solid rgba(25, 118, 210, 0.3)'
                                }}>
                                    <Typography variant="body2" sx={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icons.Info fontSize="small" />
                                        Las imágenes se subirán y se creará una galería automáticamente al guardar el producto.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Empty state - no files uploaded */}
                        {newFiles.length === 0 && (
                            <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                textAlign: 'center',
                                border: '1px dashed var(--component-border)',
                                borderRadius: 'var(--border-radius-base)'
                            }}>
                                <Icons.PhotoLibrary sx={{ 
                                    fontSize: 32, 
                                    color: 'var(--text-light)',
                                    mb: 1 
                                }} />
                                <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                                    No hay imágenes seleccionadas
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            <AutocompleteInput
                {...props}
                optionText="title"
                optionValue="id"
                debounce={300}
                filterToQuery={(searchText) => ({ q: searchText })}
                shouldRenderSuggestions={(val) => val.trim().length > 1}
                suggestionLimit={20}
                emptyText="Sin galería"
                emptyValue=""
                TextFieldProps={{
                    placeholder: 'Buscar galería...',
                }}
                /* @ts-ignore */
                options={{ refetchOnWindowFocus: false }}
            />

            {/* Loading state */}
            {isPending && currentGalleryId && (
                <Card sx={{ 
                    mt: 2, 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress sx={{ color: 'var(--primary-color)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                            Loading gallery preview...
                        </Typography>
                    </Box>
                </Card>
            )}

            {/* Gallery Management Tabs */}
            {!isPending && currentGallery && (
                <Card sx={{ 
                    mt: 2, 
                    position: 'relative',
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'var(--component-border)' 
                    }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            aria-label="gallery tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'var(--text-color)',
                                    '&.Mui-selected': {
                                        color: 'var(--primary-color)',
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'var(--primary-color)',
                                }
                            }}
                        >
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icons.Visibility />
                                        Preview
                                    </Box>
                                } 
                                id="gallery-tab-0"
                                aria-controls="gallery-tabpanel-0"
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icons.Edit />
                                        Manage Images
                                    </Box>
                                } 
                                id="gallery-tab-1"
                                aria-controls="gallery-tabpanel-1"
                            />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <GalleryPreview gallery={currentGallery} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <GalleryManager 
                            gallery={currentGallery} 
                            onGalleryUpdate={handleGalleryUpdate}
                        />
                    </TabPanel>
                </Card>
            )}

            {/* Gallery selected but not loaded yet */}
            {currentGalleryId && !isPending && !currentGallery && (
                <Card sx={{ 
                    mt: 2, 
                    p: 2,
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <Typography variant="body2" sx={{ 
                        color: 'var(--text-light)',
                        textAlign: 'center' 
                    }}>
                        Gallery not found or failed to load
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

const GallerySelectorCreate = ({ method, attribute, resourceConfig, ...props }: IDashAutoAdminCustomFieldComponent) => {
    const currentGalleryId = useWatch({ name: 'gallery_id' });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const notify = useNotify();
    const fileTypes = ["JPG", "PNG", "JPEG", "WEBP"];
    
    // Form controller for gallery_images
    const galleryImagesField = useController({ name: "gallery_images", defaultValue: [] });

    const { data: currentGallery, isPending } = useGetOne(
        'ecommerce/gallery',
        { id: currentGalleryId },
        { enabled: !!currentGalleryId }
    );

    // Sync newFiles to form field
    useEffect(() => {
        galleryImagesField.field.onChange(newFiles);
    }, [newFiles]);

    // Handle file upload
    const handleFileChange = (uploadedFiles: FileList | File[]) => {
        const fileListArray = Array.from(uploadedFiles);
        
        // Validate file sizes (max 10MB each)
        const validFiles = fileListArray.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                notify(`El archivo "${file.name}" excede el límite de 10MB`, { type: 'warning' });
                return false;
            }
            return true;
        });

        setNewFiles((prevState) => [...prevState, ...validFiles]);
    };

    // Remove file from queue
    const removeFile = (index: number) => {
        setNewFiles((prevState) => prevState.filter((_, i) => i !== index));
    };

    return (
        <Box>
            <AutocompleteInput
                {...props}
                optionText="title"
                optionValue="id"
                debounce={300}
                filterToQuery={(searchText) => ({ q: searchText })}
                shouldRenderSuggestions={(val) => val.trim().length > 1}
                suggestionLimit={20}
                emptyText="Sin galería"
                emptyValue=""
                TextFieldProps={{
                    placeholder: 'Buscar galería existente...',
                }}
                /* @ts-ignore */
                options={{ refetchOnWindowFocus: false }}
            />

            {/* If gallery selected, show preview */}
            {!isPending && currentGallery && (
                <GalleryPreview gallery={currentGallery} />
            )}

            {/* Loading state for selected gallery */}
            {isPending && currentGalleryId && (
                <Card sx={{ 
                    mt: 2, 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress sx={{ color: 'var(--primary-color)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                            Cargando galería...
                        </Typography>
                    </Box>
                </Card>
            )}

            {/* NEW: Upload images section - only when NO gallery is selected */}
            {!currentGalleryId && (
                <Card sx={{ 
                    mt: 2,
                    backgroundColor: 'var(--component-bg)',
                    border: '1px solid var(--component-border)',
                    color: 'var(--component-text)'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                            <Icons.PhotoLibrary sx={{ color: 'var(--primary-color)' }} />
                            <Typography variant="h6" sx={{ color: 'var(--heading-color)' }}>
                                Subir Imágenes del Producto
                            </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-light)' }}>
                            Sube imágenes para crear automáticamente una galería al guardar el producto.
                            También puedes seleccionar una galería existente en el campo de arriba.
                        </Typography>

                        {/* File Upload Section */}
                        <Box sx={{ 
                            border: '2px dashed var(--component-border)', 
                            borderRadius: 'var(--border-radius-base)', 
                            p: 2, 
                            textAlign: 'center',
                            backgroundColor: 'var(--component-bg)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'var(--component-hover-bg)',
                                borderColor: 'var(--primary-color)',
                            }
                        }}>
                            <FileUploader
                            /* @ts-ignore */
                                handleChange={handleFileChange}
                                name="gallery_images"
                                types={fileTypes}
                                multiple={true}
                                children={
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<Icons.CloudUpload />}
                                        sx={{
                                            borderColor: 'var(--component-border)',
                                            color: 'var(--component-text)',
                                            '&:hover': {
                                                borderColor: 'var(--primary-color)',
                                                backgroundColor: 'var(--component-hover-bg)',
                                            }
                                        }}
                                    >
                                        Arrastra imágenes o haz clic para subir
                                    </Button>
                                }
                            />
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--text-light)' }}>
                                JPG, PNG, JPEG, WEBP - Máximo 10MB por archivo
                            </Typography>
                        </Box>

                        {/* New Files Preview */}
                        {newFiles.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1, color: 'var(--heading-color)' }}>
                                        Imágenes a subir ({newFiles.length})
                                    </Typography>
                                    <Chip 
                                        label={`${newFiles.length} imagen${newFiles.length !== 1 ? 'es' : ''}`} 
                                        size="small" 
                                        sx={{
                                            backgroundColor: 'var(--success-color)',
                                            color: 'white'
                                        }}
                                    />
                                </Box>
                                <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={THUMB_SIZE[1]} gap={8}>
                                    {newFiles.map((file, index) => {
                                        const img = URL.createObjectURL(file);
                                        return (
                                            <ImageListItem
                                                key={index}
                                                sx={{
                                                    position: "relative",
                                                    overflow: 'hidden',
                                                    borderRadius: 'var(--border-radius-base)',
                                                    border: '2px solid var(--success-color)'
                                                }}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`New image ${index + 1}`}
                                                    style={{
                                                        width: THUMB_SIZE[0],
                                                        height: THUMB_SIZE[1],
                                                        objectFit: "cover",
                                                    }}
                                                    loading="lazy"
                                                    onLoad={() => URL.revokeObjectURL(img)}
                                                />
                                                <ImageListItemBar
                                                    sx={{ 
                                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)' 
                                                    }}
                                                    position="top"
                                                    actionIcon={
                                                        <IconButton
                                                            sx={{ color: "var(--error-color)" }}
                                                            onClick={() => removeFile(index)}
                                                            size="small"
                                                        >
                                                            <Icons.Delete />
                                                        </IconButton>
                                                    }
                                                    actionPosition="right"
                                                />
                                                <Chip 
                                                    label="Nueva" 
                                                    size="small" 
                                                    sx={{ 
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        left: 4,
                                                        fontSize: '0.7rem',
                                                        backgroundColor: 'var(--success-color)',
                                                        color: 'white'
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        right: 4,
                                                        color: 'white',
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        px: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: '0.6rem',
                                                        maxWidth: '60%',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {file.name}
                                                </Typography>
                                            </ImageListItem>
                                        );
                                    })}
                                </ImageList>
                                
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 1.5, 
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                    borderRadius: 'var(--border-radius-base)',
                                    border: '1px solid rgba(25, 118, 210, 0.3)'
                                }}>
                                    <Typography variant="body2" sx={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icons.Info fontSize="small" />
                                        Las imágenes se subirán y se creará una galería automáticamente al guardar el producto.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Empty state - no files uploaded */}
                        {newFiles.length === 0 && (
                            <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                textAlign: 'center',
                                border: '1px dashed var(--component-border)',
                                borderRadius: 'var(--border-radius-base)'
                            }}>
                                <Icons.PhotoLibrary sx={{ 
                                    fontSize: 32, 
                                    color: 'var(--text-light)',
                                    mb: 1 
                                }} />
                                <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                                    No hay imágenes seleccionadas
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

const GallerySelector = ({ method, attribute, resourceConfig, ...props }: IDashAutoAdminCustomFieldComponent) => {
    console.log("GallerySelector", method, props);
    switch (method) {
        case "edit":
            return <GallerySelectorEdit method={method} attribute={attribute} resourceConfig={resourceConfig} {...props} />;
        case "create":
            return <GallerySelectorCreate method={method} attribute={attribute} resourceConfig={resourceConfig} {...props} />;
        case "view":
        case "list":
            return <></>
        default:
            // Fallback to create mode if method is undefined or unknown
            return <GallerySelectorCreate method={method || "create"} attribute={attribute} resourceConfig={resourceConfig} {...props} />;
    }
}

export default GallerySelector;

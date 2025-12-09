import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useCallback } from "react";
import { useRecordContext } from "react-admin";
import { 
  Box, 
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { 
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useFormContext, useController } from "react-hook-form";

interface SystemMarketplaceImageProps extends IDashAutoAdminCustomFieldComponent {}

const SystemMarketplaceImageView: React.FC<SystemMarketplaceImageProps> = ({ 
  attribute 
}) => {
  const record = useRecordContext();
  
  if (!record || !record[attribute.listAttribute]) {
    return null;
  }

  return (
    <Box
      sx={{
        width: 300,
        height: 104,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <img
        src={record[attribute.listAttribute]}
        alt="Marketplace Icon"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
};

const SystemMarketplaceImageEdit: React.FC<SystemMarketplaceImageProps> = ({ 
  attribute 
}) => {
  const record = useRecordContext();
  const { setValue } = useFormContext();
  const { field } = useController({ name: attribute.attribute });
  
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get current image URL from record
  const currentImageUrl = record?.[attribute.listAttribute] || null;

  // Process file
  const processFile = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Use JPEG, PNG, GIF, WebP o SVG.');
      return false;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 2MB.');
      return false;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // Set the file in the form
    // For react-admin ImageInput compatibility, we need to set it as an object with rawFile
    setValue(attribute.attribute, {
      rawFile: file,
      src: preview,
      title: file.name,
    });

    return true;
  }, [attribute.attribute, setValue]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    event.target.value = '';
  }, [processFile]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader title={attribute.label || "Icono"} />
      <CardContent>
        <Box
          component="label"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            width: 300,
            height: 104,
            border: isDragging ? '2px solid #1976d2' : displayUrl ? '1px solid #e0e0e0' : '2px dashed #ccc',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDragging ? '#e3f2fd' : '#f5f5f5',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': displayUrl ? {
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                pointerEvents: 'none',
              }
            } : {
              backgroundColor: '#e8f4f8',
              borderColor: '#90caf9',
            }
          }}
        >
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              {isDragging && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(25, 118, 210, 0.8)',
                    zIndex: 1,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'white' }} />
                </Box>
              )}
            </>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? '#1976d2' : '#ccc' }} />
              <Typography variant="caption" color="textSecondary" textAlign="center">
                {isDragging ? 'Suelte la imagen aquí' : 'Arrastre una imagen o haga clic'}
              </Typography>
            </Box>
          )}
          <input
            type="file"
            hidden
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileSelect}
          />
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="textSecondary" display="block">
            Formatos: JPEG, PNG, GIF, WebP, SVG
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Tamaño máximo: 2MB
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const SystemMarketplaceImage = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case 'edit':
    case 'create':
      return <SystemMarketplaceImageEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case 'view':
      return <SystemMarketplaceImageView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
  }
};

export default SystemMarketplaceImage;

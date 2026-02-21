import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import { useRecordContext } from 'react-admin';
import { Box } from '@mui/material';

const ICON_SETTINGS = {
  // Thumbnail settings
  THUMBNAIL: {
    WIDTH: 48,
    HEIGHT: 48,
    OBJECT_FIT: 'contain' as const
  },
  
  // Zoom settings
  ZOOM: {
    WIDTH: 200,
    HEIGHT: 70,
    OBJECT_FIT: 'contain' as const,
    BACKDROP_COLOR: 'rgba(0, 0, 0, 0.5)',
    BORDER_RADIUS: '8px',
    ANIMATION_DURATION: 200 // milliseconds
  },
  
  // Portal settings
  PORTAL: {
    Z_INDEX: 9999,
    OFFSET_X: 10, // pixels from cursor
    OFFSET_Y: 10  // pixels from cursor
  },
  
  // Label settings
  LABEL: {
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.8)',
    TEXT_COLOR: '#ffffff',
    FONT_SIZE: '12px',
    FONT_WEIGHT: '500',
    PADDING: '4px 8px',
    BORDER_RADIUS: '4px',
    MAX_WIDTH: '200px'
  }
} as const;

interface ZoomPortalProps {
  src: string;
  alt: string;
  gatewayName: string;
  mousePosition: { x: number; y: number };
  isVisible: boolean;
}

const ZoomPortal: React.FC<ZoomPortalProps> = ({ src, alt, gatewayName, mousePosition, isVisible }) => {
  if (!isVisible) return null;

  const portalStyle: React.CSSProperties = {
    position: 'fixed',
    left: mousePosition.x + ICON_SETTINGS.PORTAL.OFFSET_X,
    top: mousePosition.y + ICON_SETTINGS.PORTAL.OFFSET_Y,
    zIndex: ICON_SETTINGS.PORTAL.Z_INDEX,
    pointerEvents: 'none',
    transition: `opacity ${ICON_SETTINGS.ZOOM.ANIMATION_DURATION}ms ease-in-out`,
    opacity: isVisible ? 1 : 0,
    backgroundColor: ICON_SETTINGS.ZOOM.BACKDROP_COLOR,
    borderRadius: ICON_SETTINGS.ZOOM.BORDER_RADIUS,
    padding: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const imageStyle: React.CSSProperties = {
    width: ICON_SETTINGS.ZOOM.WIDTH,
    height: ICON_SETTINGS.ZOOM.HEIGHT,
    objectFit: ICON_SETTINGS.ZOOM.OBJECT_FIT,
    borderRadius: ICON_SETTINGS.ZOOM.BORDER_RADIUS,
    display: 'block',
  };

  const labelStyle: React.CSSProperties = {
    backgroundColor: ICON_SETTINGS.LABEL.BACKGROUND_COLOR,
    color: ICON_SETTINGS.LABEL.TEXT_COLOR,
    fontSize: ICON_SETTINGS.LABEL.FONT_SIZE,
    fontWeight: ICON_SETTINGS.LABEL.FONT_WEIGHT,
    padding: ICON_SETTINGS.LABEL.PADDING,
    borderRadius: ICON_SETTINGS.LABEL.BORDER_RADIUS,
    marginTop: '4px',
    textAlign: 'center',
    maxWidth: ICON_SETTINGS.LABEL.MAX_WIDTH,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return createPortal(
    <div style={portalStyle}>
      <img 
        src={src} 
        alt={alt} 
        style={imageStyle}
        draggable={false}
      />
      {gatewayName && (
        <div style={labelStyle}>
          {gatewayName}
        </div>
      )}
    </div>,
    document.body
  );
};

const SystemPaymentGatewayIconList: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
  method, 
  attribute, 
  resourceConfig 
}) => {
  const record = useRecordContext();
  
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const iconUrl = record?.icon_url;
  const gatewayName = record?.name;

  const handleMouseEnter = () => {
    if (iconUrl) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsZooming(false);
    };
  }, []);

  const thumbnailStyle: React.CSSProperties = {
    width: ICON_SETTINGS.THUMBNAIL.WIDTH,
    height: ICON_SETTINGS.THUMBNAIL.HEIGHT,
    objectFit: ICON_SETTINGS.THUMBNAIL.OBJECT_FIT,
    cursor: iconUrl ? 'zoom-in' : 'default',
    transition: `transform ${ICON_SETTINGS.ZOOM.ANIMATION_DURATION}ms ease-in-out`,
    transform: isZooming ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <>
      <div
        ref={imageRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ display: 'inline-block' }}
      >
        <ImagePlaceHolder
          placeHolder={
            <Box
              sx={{
                width: ICON_SETTINGS.THUMBNAIL.WIDTH,
                height: ICON_SETTINGS.THUMBNAIL.HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              <Box
                sx={{
                  fontSize: '10px',
                  color: '#999',
                  textAlign: 'center',
                }}
              >
                No icon
              </Box>
            </Box>
          }
          src={iconUrl}
          style={thumbnailStyle}
          alt={gatewayName || 'Payment gateway icon'}
        />
      </div>
      
      {iconUrl && (
        <ZoomPortal
          src={iconUrl}
          alt={gatewayName || 'Payment gateway icon'}
          gatewayName={gatewayName || ''}
          mousePosition={mousePosition}
          isVisible={isZooming}
        />
      )}
    </>
  );
};

const SystemPaymentGatewayIcon = ({ 
  method, 
  attribute, 
  resourceConfig 
}: IDashAutoAdminCustomFieldComponent) => {
  return (
    <SystemPaymentGatewayIconList 
      attribute={attribute} 
      method={method} 
      resourceConfig={resourceConfig} 
    />
  );
};

export default SystemPaymentGatewayIcon;

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import { useRecordContext } from 'react-admin';

export const IMAGE_SETTINGS = {
  // Thumbnail settings
  THUMBNAIL: {
    WIDTH: 36,
    HEIGHT: 36,
    OBJECT_FIT: 'contain' as const
  },
  
  // Zoom settings
  ZOOM: {
    WIDTH: 100,
    HEIGHT: 100,
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
  galleryTitle: string;
  mousePosition: { x: number; y: number };
  isVisible: boolean;
}

const ZoomPortal: React.FC<ZoomPortalProps> = ({ src, alt, galleryTitle, mousePosition, isVisible }) => {
  if (!isVisible) return null;

  const portalStyle: React.CSSProperties = {
    position: 'fixed',
    left: mousePosition.x + IMAGE_SETTINGS.PORTAL.OFFSET_X,
    top: mousePosition.y + IMAGE_SETTINGS.PORTAL.OFFSET_Y,
    zIndex: IMAGE_SETTINGS.PORTAL.Z_INDEX,
    pointerEvents: 'none',
    transition: `opacity ${IMAGE_SETTINGS.ZOOM.ANIMATION_DURATION}ms ease-in-out`,
    opacity: isVisible ? 1 : 0,
    backgroundColor: IMAGE_SETTINGS.ZOOM.BACKDROP_COLOR,
    borderRadius: IMAGE_SETTINGS.ZOOM.BORDER_RADIUS,
    padding: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const imageStyle: React.CSSProperties = {
    width: IMAGE_SETTINGS.ZOOM.WIDTH,
    height: IMAGE_SETTINGS.ZOOM.HEIGHT,
    objectFit: IMAGE_SETTINGS.ZOOM.OBJECT_FIT,
    borderRadius: IMAGE_SETTINGS.ZOOM.BORDER_RADIUS,
    display: 'block',
  };

  const labelStyle: React.CSSProperties = {
    backgroundColor: IMAGE_SETTINGS.LABEL.BACKGROUND_COLOR,
    color: IMAGE_SETTINGS.LABEL.TEXT_COLOR,
    fontSize: IMAGE_SETTINGS.LABEL.FONT_SIZE,
    fontWeight: IMAGE_SETTINGS.LABEL.FONT_WEIGHT,
    padding: IMAGE_SETTINGS.LABEL.PADDING,
    borderRadius: IMAGE_SETTINGS.LABEL.BORDER_RADIUS,
    marginTop: '4px',
    textAlign: 'center',
    maxWidth: IMAGE_SETTINGS.LABEL.MAX_WIDTH,
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
      {galleryTitle && (
        <div style={labelStyle}>
          {galleryTitle}
        </div>
      )}
    </div>,
    document.body
  );
};

const ProductImageList: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const record = useRecordContext();
  const gallery = record[attribute.attribute];
  
  const [isZooming, setIsZooming] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // gallery is like: 
  /*
    "gallery": {
      "id": 104,
      "title": "Gimmari",
      "description": null,
      "tenant_id": 95,
      "created_at": "2025-07-03T05:37:05.000000Z",
      "updated_at": "2025-07-03T05:37:09.000000Z",
      "images": [
        {
          "id": 681,
          "url": "https:\/\/s3.amazonaws.com\/pinoywok\/galleries\/104\/conversions\/8-Medium-preview.jpg"
        }
      ],
      "primary_image_id": 681,
      "primary_image_url": "https:\/\/s3.amazonaws.com\/pinoywok\/galleries\/104\/conversions\/8-Medium-preview.jpg",
      "images_count": 1,
      "has_images": true
    },
  */

  const handleMouseEnter = () => {
    if (gallery?.primary_image_url) {
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
    width: IMAGE_SETTINGS.THUMBNAIL.WIDTH,
    height: IMAGE_SETTINGS.THUMBNAIL.HEIGHT,
    objectFit: IMAGE_SETTINGS.THUMBNAIL.OBJECT_FIT,
    cursor: gallery?.primary_image_url ? 'zoom-in' : 'default',
    transition: `transform ${IMAGE_SETTINGS.ZOOM.ANIMATION_DURATION}ms ease-in-out`,
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
          placeHolder={<></>}
          src={gallery?.primary_image_url}
          style={thumbnailStyle}
          alt={gallery?.title || 'Product image'}
        />
      </div>
      
      {gallery?.primary_image_url && (
        <ZoomPortal
          src={gallery.primary_image_url}
          alt={gallery?.title || 'Product image'}
          galleryTitle={gallery?.title || ''}
          mousePosition={mousePosition}
          isVisible={isZooming}
        />
      )}
    </>
  );
};

const ProductImage = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  return <ProductImageList attribute={attribute} method={method} resourceConfig={resourceConfig} />
}

export default ProductImage;

import { Avatar } from '@mui/material';
import React from 'react';

interface TenantAvatarComponentProps {
    imageUrl?: string | null;
    size?: number;
    alt?: string;
}

const TenantAvatarComponent: React.FC<TenantAvatarComponentProps> = ({ 
    imageUrl, 
    size = 40, 
    alt = "Tenant Logo" 
}) => {
    return (
        <div className='dash-tenant-avatar'>
            {imageUrl ? (
                <Avatar 
                    src={imageUrl} 
                    alt={alt}
                    sx={{ 
                        width: size, 
                        height: size,
                        '& img': {
                            objectFit: 'contain' // Ensure logo maintains aspect ratio
                        }
                    }}
                    variant="square" // Use square variant for logos
                />
            ) : (
                <Avatar 
                    sx={{ 
                        width: size, 
                        height: size 
                    }}
                    variant="square"
                >
                    T
                </Avatar>
            )}
        </div>
    );
};

export default TenantAvatarComponent;

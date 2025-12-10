import { Avatar } from '@mui/material';
import React from 'react';

// @ts-ignore - Asset imports may not exist
import Logo from '@app/assets/logo-horizontal.png';
// @ts-ignore - Asset imports may not exist
import LogoSquared from  '@app/assets/logo-squared.png';
// @ts-ignore - Asset imports may not exist
import BackImage from  '@app/assets/login-back.png';

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
                        width: '100%', 
                        height: '100%', 
                        '& img': {
                            objectFit: 'contain' // Ensure logo maintains aspect ratio
                        }
                    }}
                    variant="square" // Use square variant for logos
                />
            ) : (
                <Avatar 
                src={LogoSquared}
                    sx={{ 
                        width: '100%', 
                        height: '100%', 
                    }}
                    variant="square"
                />
                
            )}
        </div>
    );
};

export default TenantAvatarComponent;

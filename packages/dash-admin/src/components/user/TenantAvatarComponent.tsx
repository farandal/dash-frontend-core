import { Height, WidthFull } from '@mui/icons-material';
import { Avatar, Box } from '@mui/material';
import React from 'react';

// @ts-ignore - Asset imports may not exist
//import Logo from '@app/assets/logo-horizontal.png';
// @ts-ignore - Asset imports may not exist
//import LogoSquared from  '@app/assets/logo-squared.png';
// @ts-ignore - Asset imports may not exist
//import BackImage from  '@app/assets/login-back.png';

type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

interface TenantAvatarComponentProps {
    imageUrl?: string | null;
    maxWidth?: number | string;
    maxHeight?: number | string;
    alt?: string;
    sidebarPosition?: SidebarPosition;
    sidebarSmallWidth?: number | string;
    navExpanded?: boolean;
    navSize?: "small" | "large";
    onClick?: () => void;
}

const TenantAvatarComponent: React.FC<TenantAvatarComponentProps> = ({ 
    imageUrl, 
    maxWidth = 130,
    maxHeight = 130,
    alt = "Tenant Logo",
    sidebarPosition = "left",
    sidebarSmallWidth = '64px',
    navExpanded = false,
    navSize = "large",
    onClick
}) => {
    // For horizontal positions (top/bottom), we primarily use maxWidth/maxHeight
    const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";
    const isVertical = sidebarPosition === "left" || sidebarPosition === "right";
    
    // Container styling based on sidebar orientation
    const containerSx = {
        padding: '8px',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        
        // Horizontal sidebar (top/bottom): constrain by height, let width be auto
        ...(isHorizontal && { 
            height: maxHeight,
            maxHeight: maxHeight,
        }),
        
        // Vertical sidebar (left/right): constrain by width based on nav state
        ...(isVertical && navSize === "small" && { 
            width: sidebarSmallWidth,
            maxWidth: sidebarSmallWidth,
        }),
        ...(isVertical && navSize === "large" && navExpanded && { 
            width: maxWidth,
            maxWidth: maxWidth,
        }),
        ...(isVertical && navSize === "large" && !navExpanded && { 
            width: sidebarSmallWidth,
            maxWidth: sidebarSmallWidth,
        }),
    };

    return (
        <Box 
            component={'div'} 
            sx={{ 
                ...containerSx, 
                //m: 1,
                cursor: onClick ? 'pointer' : 'default',
            }} 
            className='dash-tenant-avatar'
            onClick={onClick}
        >
             
            
                <img 
                    src={imageUrl} 
                    alt={alt}
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                    //variant="square" // Use square variant for logos
                />
          
        </Box>
    );
};

export default TenantAvatarComponent;

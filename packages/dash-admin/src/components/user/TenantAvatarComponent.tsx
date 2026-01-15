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
    maxWidth = 40,
    maxHeight = 40,
    alt = "Tenant Logo",
    sidebarPosition = "left",
    sidebarSmallWidth = '64px',
    navExpanded = false,
    navSize = "large",
    onClick
}) => {
    // For horizontal positions (top/bottom), we primarily use maxWidth/maxHeight
    const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";
    
    // Determine dimensions to use
    // Using explicit maxWidth/maxHeight 
    //const effectiveWidth = maxWidth;
    //const effectiveHeight = maxHeight;

    const containerSx = {
        //width: isHorizontal ? 'auto' : effectiveWidth,
        //height: isHorizontal ? '100%' : effectiveHeight, 
        maxWidth: maxWidth || '100%',
        maxHeight: maxHeight || '100%',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        //height:  maxHeight || '100%',
        //width:  maxWidth || '100%'
        ...(isHorizontal && (sidebarPosition === "top" || sidebarPosition === "bottom") && { height: maxHeight  }),
       
        
        ...(!isHorizontal && navSize === "small" && (sidebarPosition === "left" || sidebarPosition === "right") && { width: sidebarSmallWidth  }),
        ...(!isHorizontal && navSize === "large" && navExpanded && (sidebarPosition === "left" || sidebarPosition === "right") && { width: maxWidth  }),
        //...(!isHorizontal && !navExpanded && (sidebarPosition === "left" || sidebarPosition === "right") && { height: sidebarSmallWidth  }),
       

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

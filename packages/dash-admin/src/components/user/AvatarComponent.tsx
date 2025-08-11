import { Avatar, CircularProgress, Menu, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { IconMenuItem } from 'mui-nested-menu';
import ReactDOM from 'react-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';

import { useWindowSize } from 'dash-utils';
import { useAuthContext } from '../../';

import { useRedirect } from 'react-admin';
import { useNavigate } from 'react-router-dom';

const AvatarComponent: React.FC = (_props) => {
    const { user, logout, authenticated } = useAuthContext();
    const windowSize = useWindowSize();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const ra_redirect = useRedirect();

    // Add state to track user data changes and force re-renders
    const [currentUser, setCurrentUser] = useState(user);

    // Update local user state when auth context user changes
  // Update local user state when auth context user changes
useEffect(() => {
    console.log('AvatarComponent: User data changed in auth context:', user);
    setCurrentUser(user);
    
    // Force a re-render by updating a key when user image changes
    if (user?.image_url !== currentUser?.image_url || user?.image_path !== currentUser?.image_path) {
        console.log('AvatarComponent: User image changed, forcing update');
    }
}, [user, user?.name, user?.image_url, user?.image_path, user?.id]); // Add user.id to dependencies
    useEffect(() => {
        if (document.body.classList.contains('webview')) {
            setWebView(true);
        } else {
            setWebView(false);
        }
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        /*try {
            await logout();
            
            redirect('/login');
        } catch (error) {
            
            console.error('Logout failed:', error);
            // Fallback logout - redirect to login
            window.location.href = '/login';
        }*/
    
        logout();
        navigate('/login');
    };

    const handleProfileRedirect = () => {
        //window.location.href = '/profile';
        ra_redirect('/profile');
    };

    const calculateMenuPosition = () => {
        if (avatarRef.current && windowSize.width) {
            const rect = avatarRef.current.getBoundingClientRect();
            const menuWidth = 230; // minWidth from styles
            
            let left = rect.left + window.scrollX;
            
            // Ensure menu doesn't go off-screen using windowSize
            if (left + menuWidth > windowSize.width) {
                left = windowSize.width - menuWidth - 10; // 10px margin
            }
            if (left < 10) {
                left = 10; // 10px margin
            }
            
            setMenuPosition({ 
                top: rect.top + window.scrollY, 
                left: left + 40
            });
        }
    };

    const handleAvatarMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("handleAvatarMouseEnter");
        e.preventDefault();
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        setOpen(true);
        calculateMenuPosition();
    };

    const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("handleAvatarClick");
        e.preventDefault();
        setOpen(prevOpen => !prevOpen);
        calculateMenuPosition();
    };

    const handleMouseLeave = () => {
        console.log("handleMouseLeave");
        if (!webView) {
            // Add a small delay before closing to allow moving to menu
            timeoutRef.current = setTimeout(() => {
                setOpen(false);
            }, 100);
        }
    };

    const handleMenuMouseEnter = () => {
        console.log("handleMenuMouseEnter");
        // Clear timeout when entering menu
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleMenuMouseLeave = () => {
        console.log("handleMenuMouseLeave");
        if (!webView) {
            setOpen(false);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Recalculate position on window size change
    useEffect(() => {
        if (open) {
            calculateMenuPosition();
        }
    }, [windowSize.width, windowSize.height, open, isSmallScreen]);

    // Show loading state if not authenticated or no user data
    if (!authenticated || !currentUser) {
        return (
            <Avatar>
                <CircularProgress size={24} />
            </Avatar>
        );
    }

    // Get the most current image URL - check both possible properties
    const getAvatarImageUrl = () => {
       
        return currentUser?.image_url || currentUser?.image_path || null;
    };

    // Get user display name
    const getUserDisplayName = () => {
        return currentUser?.name || 'Usuario';
    };

    // Get user initials for fallback avatar
    const getUserInitials = () => {
        const name = getUserDisplayName();
        return name ? name.charAt(0).toUpperCase() : '?';
    };
       
    return (
        <> 
            <div
                ref={avatarRef}
                className='dash-user-avatar'
                {...(!webView ? { 
                    onMouseEnter: handleAvatarMouseEnter, 
                    onMouseLeave: handleMouseLeave 
                } : { 
                    onClick: handleAvatarClick 
                })}
            >
                {getAvatarImageUrl() ? (
                    <Avatar 
                        src={getAvatarImageUrl()} 
                        key={getAvatarImageUrl()} // Force re-render when image changes
                    />
                ) : (
                    <Avatar>
                        {getUserInitials()}
                    </Avatar>
                )}
            </div>

            {open && ReactDOM.createPortal(
                <div 
                    ref={menuRef}
                    className="dash-user-menu-portal"
                    onMouseEnter={!webView ? handleMenuMouseEnter : undefined}
                    onMouseLeave={!webView ? handleMenuMouseLeave : undefined}
                >
                    <div
                                  className={`dash-user-menu ${open ? 'show' : ''}`}
                        style={{
                            zIndex: 10000,
                            position: 'absolute',
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <span className='dash-user-name' style={{ padding: '8px 16px', display: 'block' }}>
                            {getUserDisplayName()}
                        </span>
                        <IconMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                setOpen(false);
                                handleProfileRedirect();
                            }}
                            leftIcon={
                                <span className='dash-user-icon'>
                                    <AccountCircleIcon />
                                </span>
                            }
                            label='Perfil'
                            className='dash-user-item'
                        />
                        <IconMenuItem
                            onClick={(e) => {
                                setOpen(false);
                                handleLogout(e);
                            }}
                            leftIcon={
                                <span className='dash-user-icon'>
                                    <LogoutIcon />
                                </span>
                            }
                            label='Cerrar sesión'
                            className='dash-user-item'
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

//AvatarComponent.whyDidYouRender = true;

export default AvatarComponent;

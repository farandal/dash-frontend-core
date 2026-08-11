import { Avatar, CircularProgress, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';

import { useWindowSize } from 'dash-utils';
import { useAuthContext } from '../../contexts/auth/AuthContext';

import { useRedirect, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { NavEventManager } from '../../utils/navEvents';

interface AvatarComponentProps {
    sidebarPosition?: 'left' | 'right' | 'top' | 'bottom';
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({ sidebarPosition = 'left' }) => {
    const { user, logout, authenticated } = useAuthContext();
    const windowSize = useWindowSize();
    const translate = useTranslate();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    //const ra_redirect = useRedirect();

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
        localStorage.clear();
        await logout();
        //navigate('/');
        window.location.href = '/';
    };

    const handleProfileRedirect = () => {
        //window.location.href = '/profile';
        //ra_redirect('/profile');
        navigate('/profile');
    };

    const calculateMenuPosition = () => {
        if (avatarRef.current && windowSize.width && windowSize.height) {
            const rect = avatarRef.current.getBoundingClientRect();
            const menuWidth = 230; // minWidth from styles
            const menuHeight = 120; // approximate menu height
            
            let left = rect.left + window.scrollX;
            let top = rect.top + window.scrollY;
            
            // Ensure menu doesn't go off-screen horizontally
            if (left + menuWidth > windowSize.width) {
                left = windowSize.width - menuWidth - 10; // 10px margin
            }
            if (left < 10) {
                left = 10; // 10px margin
            }
            
            // For bottom sidebar position, open menu above the avatar
            if (sidebarPosition === 'bottom') {
                top = rect.top + window.scrollY - menuHeight - 10; // Open above
            }
            
            setMenuPosition({ 
                top: top, 
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

    // Listen for other submenus/menus opening and close this one
    useEffect(() => {
        const unsubscribeSubmenuOpened = NavEventManager.onSubmenuOpened(() => {
            setOpen(false);
        });
        
        const unsubscribeCloseAll = NavEventManager.onCloseAllSubmenus(() => {
            setOpen(false);
        });
        
        return () => {
            unsubscribeSubmenuOpened();
            unsubscribeCloseAll();
        };
    }, []);

    // Show loading state if not authenticated or no user data
    if (!authenticated || !currentUser) {
        /*return (
            <Avatar>
                <CircularProgress size={24} />
            </Avatar>
        );*/
        return null;
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
                        className='dash-icon-button-color dash-icon-button-bg'
                    />
                ) : (
                    <Avatar
                        className='dash-icon-button-color dash-icon-button-bg'
                    >
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
                        <MenuList>
                            {/* Plain MUI MenuItem composition — mui-nested-menu's IconMenuItem
                                (peer deps top out at @mui/material v7) renders a <MenuItem> that
                                doesn't satisfy MUI v9's MenuListContext requirement and crashes
                                with "MUI: MenuListContext is missing." A real MenuItem always
                                stays compatible with whatever MUI version the app is on. */}
                            <MenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpen(false);
                                    handleProfileRedirect();
                                }}
                                className='dash-icon-button-color dash-icon-button-bg'
                            >
                                <ListItemIcon>
                                    <span className='dash-user-icon'>
                                        <AccountCircleIcon />
                                    </span>
                                </ListItemIcon>
                                <ListItemText>{translate('ra.auth.user_menu', { _: 'Perfil' })}</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={(e) => {
                                    setOpen(false);
                                    handleLogout(e);
                                }}
                                className='dash-icon-button-color dash-icon-button-bg'
                            >
                                <ListItemIcon>
                                    <span className='dash-user-icon'>
                                        <LogoutIcon />
                                    </span>
                                </ListItemIcon>
                                <ListItemText>{translate('ra.auth.logout', { _: 'Cerrar sesión' })}</ListItemText>
                            </MenuItem>
                        </MenuList>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

//AvatarComponent.whyDidYouRender = true;

export default AvatarComponent;

import { Avatar, Menu, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch } from 'react-redux';
import {
    useRedirect,
    useLogout,
    LoadingIndicator,
    useGetIdentity,
    LinearProgress,
} from 'react-admin';
import { IconMenuItem } from 'mui-nested-menu';
import { removeCookie } from 'dash-admin/src/utils/cookies';
import ReactDOM from 'react-dom';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import {useAuthContext} from 'dash-admin';
//import {DarkToggleMode, useAuthContext} from 'dash-admin';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';

const AvatarComponent: React.FC= (_props) => {

    //const { data, isPending, error } = useGetIdentity();
    const { user, logout } = useAuthContext();
    //const user = data?.user || null;

   // const dispatch = useDispatch();
    const redirect = useRedirect();
   // const logout = useLogout();
    const handleLogout = async (e: React.MouseEvent) => {
      
                           
        await logout();
                         
    };

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [webView,setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if(document.body.classList.contains('webview')) {
           
            setWebView(true)
        } else {
       
            setWebView(false)
        }

    }, []);

    const calculateMenuPosition = () => {
        if (avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect();
            const menuWidth = 230; // minWidth from styles
            
            let left = rect.left + window.scrollX;
            
            /*if (isSmallScreen) {
                // Position to the left on small screens
                left = rect.right + window.scrollX - menuWidth;
            } else {
                // Position to the right on medium+ screens
                left = rect.left + window.scrollX;
            }*/

            left = rect.left + window.scrollX;
            
            // Ensure menu doesn't go off-screen
            const viewportWidth = window.innerWidth;
            if (left + menuWidth > viewportWidth) {
                left = viewportWidth - menuWidth - 10; // 10px margin
            }
            if (left < 10) {
                left = 10; // 10px margin
            }
            
            setMenuPosition({ 
                top: rect.top + window.scrollY + 30, 
                left: left
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

    // Recalculate position on screen resize
    useEffect(() => {
        const handleResize = () => {
            if (open) {
                calculateMenuPosition();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open, isSmallScreen]);

    if (!user) {
       
        return (
            <Avatar>
                <LoadingIndicator />
            </Avatar>
        );
    }
       
    return (
        <> 
            <div
                ref={avatarRef}
                className='dash-user-avatar'
                {... !webView ? { 
                    onMouseEnter: handleAvatarMouseEnter, 
                    onMouseLeave: handleMouseLeave 
                } : { 
                    onClick: handleAvatarClick 
                }}
            >
                {user?.image_url ? (
                    <Avatar {...(user?.image_url && { src: user.image_url })} />
                ) : (
                    <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
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
                            {user && user.name}
                        </span>
                        <IconMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                setOpen(false);
                                redirect('/profile');
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

export default AvatarComponent;

import { Avatar, Menu } from '@mui/material';
import { useEffect, useState } from 'react';
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

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';

import {DarkToggleMode, useAuthContext} from 'dash-admin';
const AvatarComponent: React.FC<{}> = ({ ...props }) => {

    const {user, authenticated} = useAuthContext();
    const dispatch = useDispatch();
    const redirect = useRedirect();
    const logout = useLogout();
    const handleLogout = (e: React.MouseEvent) => {
        // TODO! there should be a service or another method where this needs to be performed.
        e.preventDefault();
        /*removeCookie('token');
        localStorage.clear();
        localStorage.setItem('authenticated', 'false');
        localStorage.setItem('roles', 'guest');*/

         dispatch(
                                DASH_REDUX_ACTIONS.updateAuth({
                                    user: null,
                                    authenticated: false,
                                    auth: null,
                                }),
                            );

        logout();
    };

    const [webView,setWebView] = useState<boolean>(false);

    useEffect(() => {
        if(document.body.classList.contains('webview')) {
            console.log("webview true");
            setWebView(true)
        } else {
            console.log("webview false");
            setWebView(false)
        }

    }, []);

    // Avatar config
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleAvatarMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("handleAvatarMouseEnter");
        e.preventDefault();
        setAnchorEl(e.currentTarget);
    };

    const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("handleAvatarClick");
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        
    };
    const handleAvatarClose = (e?: React.MouseEvent) => {
        console.log("handleAvatarClose");
        e?.preventDefault();
        setAnchorEl(null);
    };

    if (!authenticated) {
       
        return (
            <Avatar sx={{ width: 65, height: 65 }}>
                <LoadingIndicator />
            </Avatar>
        );
    }
       
    return (
        <> 
            <div
                className='dash-user-avatar'
                {... !webView ? { onMouseEnter:handleAvatarMouseEnter} : {onClick:handleAvatarClick}}
            >
                {user.image_path ? (
                    <Avatar {...(user.image_path && { src: user.image_path })} />
                ) : (
                    <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                )}
            </div>

            <Menu
                className='dash-user-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={handleAvatarClose}
               
            >
                <span className='dash-user-name'>{user && user.name}</span>
                <IconMenuItem
                    onClick={(e) => {
                        e.preventDefault();
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
                    onClick={handleLogout}
                    leftIcon={
                        <span className='dash-user-icon'>
                            <LogoutIcon />
                        </span>
                    }
                    label='Cerrar sesión'
                    className='dash-user-item'
                />
                 <DarkToggleMode/>
            </Menu>
        </>
    );
};

export default AvatarComponent;
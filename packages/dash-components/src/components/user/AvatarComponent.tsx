import { Avatar, Menu } from '@mui/material';
import { useEffect, useState } from 'react';
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

const AvatarComponent: React.FC<{}> = ({ ...props }) => {

    const { identity, isLoading: identityLoading } = useGetIdentity();

    const redirect = useRedirect();
    const logout = useLogout();
    const handleLogout = () => {
        removeCookie('token');
        localStorage.clear();
        localStorage.setItem('authenticated', 'false');
        localStorage.setItem('roles', 'guest');
        logout();
    };

    // Avatar config
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        setAnchorEl(e.currentTarget);
    const handleAvatarClose = () => setAnchorEl(null);

    useEffect(() => {

        //console.log(identity)
    }, [identity])

    if (!identity || identityLoading)
        return (
            <Avatar sx={{ width: 65, height: 65 }}>
                <LoadingIndicator />
            </Avatar>
        );
       
    return (
        <>

            <div
                className='dash-user-avatar'
                onMouseEnter={(e) => handleAvatarClick(e)}
            >
                {identity.image_path ? (
                    <Avatar {...(identity.image_path && { src: identity.image_path })} />
                ) : (
                    <Avatar>{identity.name.charAt(0).toUpperCase()}</Avatar>
                )}
            </div>

            <Menu
                className='dash-user-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={handleAvatarClose}
            >
                <span className='dash-user-name'>{identity && identity.name}</span>
                <IconMenuItem
                    onClick={() => redirect('/profile')}
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
            </Menu>
        </>
    );
};

export default AvatarComponent;

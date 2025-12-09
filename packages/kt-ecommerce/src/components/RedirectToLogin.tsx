import React, { useEffect } from 'react';
import { useRedirect } from 'react-admin';

const RedirectToLogin: React.FC<any> = (props) => {
    const redirect = useRedirect();
   
    useEffect(()=>{
         
        redirect('/login');
    },[]);
    return (
        <></>
    )
};

export default RedirectToLogin;

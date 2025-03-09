import React, { useEffect } from 'react';
import { useRedirect } from 'react-admin';

export interface IRedirect {
	path: string;
    timer?: number
}
const Redirect: React.FC<IRedirect> = ({ path, timer }) => {
	const redirect = useRedirect();
	useEffect(() => {

        if(timer) {
        
          setTimeout(() => {
                    redirect(path);
                }, 10);
        } else {
        
		redirect(path);
        }
	}, []);
	return <></>;
};

export default Redirect;

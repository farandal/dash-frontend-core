import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface IRedirect {
	path: string;
    timer?: number
}
const Redirect: React.FC<IRedirect> = ({ path, timer }) => {
	const navigate = useNavigate();
	useEffect(() => {
        if(timer) {
          setTimeout(() => {
                    navigate(path);
                }, 10);
        } else {
        
		navigate(path);
        }
	}, []);
	return <></>;
};

export default Redirect;
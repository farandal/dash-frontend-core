import React, { FC, JSX } from 'react';

export interface IAppLogo {
	type?: 'logo';
	horizontalLogo: JSX.Element;
	squaredLogo: JSX.Element;
}

const AppLogo: FC<IAppLogo> = ({ type = 'logo', horizontalLogo, squaredLogo }) => {
	return type === 'logo' ? horizontalLogo : squaredLogo;
};

export default AppLogo;

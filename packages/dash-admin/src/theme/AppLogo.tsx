import React, { FC } from 'react';

export interface IAppLogo {
	type?: 'iso' | 'logo';
	logoBig: JSX.Element;
	logoSmall: JSX.Element;
}

const AppLogo: FC<IAppLogo> = ({ type = 'logo', logoBig, logoSmall }) => {
	return type === 'logo' ? logoBig : logoSmall;
};

export default AppLogo;

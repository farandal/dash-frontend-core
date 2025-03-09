import React from 'react';

export type IWindowContext = {
	isMobile: boolean;
	width: number;
	height: number;
	mq: string;
};

export const WindowContext = React.createContext<IWindowContext>({
	isMobile: false,
	width: 0,
	height: 0,
	mq: 'all',
});

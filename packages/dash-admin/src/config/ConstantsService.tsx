import * as React from 'react';

import constants, {
	IDASHAdminSystemConstants,
} from 'dash-constants/src/DASHAdminSystemConstants';

export interface IConstantContext<T> {
	systemConstants: IDASHAdminSystemConstants;
	appConstants: T;
	setAppConstants: React.Dispatch<React.SetStateAction<T>>;
}

export const createConstantsContext = function constantsContextWrapper<T>():React.Context<IConstantContext<T>> {
	return React.createContext<IConstantContext<T> | null>(null);
};

export const ConstantsContext = createConstantsContext();

export interface IConstantsProvider<T> extends React.PropsWithChildren {
	initialAppConstants?: T;
}

const ConstantsProvider = function ConstantsProviderWrapper<T>(
	props: IConstantsProvider<T>,
) {
	const { initialAppConstants, children } = props;

	const [appConstants, setAppConstants] = React.useState<T>(
		initialAppConstants || null,
	);

	const defaultState: IConstantContext<T> = {
		appConstants: appConstants,
		systemConstants: constants,
		setAppConstants: setAppConstants,
	};
	/* @ts-ignore : TODO Known issue with context interface */
	return <ConstantsContext.Provider value={defaultState}>
		{children}
	</ConstantsContext.Provider>;
	
};

export default ConstantsProvider;

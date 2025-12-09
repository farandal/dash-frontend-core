/* eslint react/jsx-key: off */
import React, { Suspense } from 'react';
import GlobalLoader from './components/loader/GlobalLoader';
import { Loading } from 'react-admin';

import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
	return <Loading loadingPrimary='Error' loadingSecondary={error.message} />;
};

const AppComponent = React.lazy(() => {
	return new Promise((resolve) => setTimeout(resolve, 1 * 1000)).then(
		// @ts-ignore
		() => import('@app/DASHApp'), 
	);
});

const AppAsyncWrapper: React.FC<any> = () => {

	return (
		<>
			<ErrorBoundary
                FallbackComponent={ErrorFallback}
                //</>onReset={() => {
                    // reset the state of your app so the error doesn't happen again
               //}}
            >
                <Suspense fallback={<Loading loadingPrimary='' loadingSecondary='' />}>
                    <AppComponent />
                </Suspense>
            </ErrorBoundary>
        
            <GlobalLoader>
                {/*<SlideInSpinner transitionDuration={0.5}  isSlideIn={true} />*/}
                ...
            </GlobalLoader>
		</>
	);
};

export default AppAsyncWrapper;

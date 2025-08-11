import React, { PropsWithChildren, Suspense, useState, useTransition } from 'react';
import { GlobalLoader } from '../';
import { Loading } from 'react-admin';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
//import LoaderAnimation from 'react-spinners/PuffLoader';
//import { SlideInSpinner } from './layout/MotionWrapper';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return <Loading loadingPrimary='Error' loadingSecondary={error?.message || 'Unknown error'} />;
};

const AppWrapper: React.FC<PropsWithChildren> = (props) => {
    const { children } = props;
    const [isPending, startTransition] = useTransition();
    const [isInitialRender, setIsInitialRender] = useState(true);

    React.useEffect(() => {
        // Mark this content rendering as a transition
        startTransition(() => {
            setIsInitialRender(false);
        });
    }, []);

    return (
        <>
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onReset={() => {
                    // reset the state of your app so the error doesn't happen again
                }}
            >
                <Suspense fallback={<Loading loadingPrimary='' loadingSecondary='' />}>
                    {children}
                </Suspense>
            </ErrorBoundary>
            <GlobalLoader>
                {/*<SlideInSpinner transitionDuration={3} />*/}
                ...
            </GlobalLoader>
            <div className={!isPending && !isInitialRender ? 'dash-splash fade-out' : 'dash-splash'}></div>
        </>
    );
};

export default AppWrapper;
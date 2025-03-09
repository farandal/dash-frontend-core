import React, { PropsWithChildren, Suspense, useState, useTransition } from 'react';
import { GlobalLoader } from 'dash-admin';
import { Loading } from 'react-admin';
import { ErrorBoundary } from 'react-error-boundary';
import LoaderAnimation from 'react-spinners/PuffLoader';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return <Loading loadingPrimary='Error' loadingSecondary={error.message} />;
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
            <GlobalLoader overlayBackground='rgba(255, 255, 255, 0.0)'>
                <LoaderAnimation
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    size={20}
                    color={'#222'}
                    loading={isPending || isInitialRender}
                />
            </GlobalLoader>
            <div className={!isPending && !isInitialRender ? 'dash-splash fade-out' : 'dash-splash'}></div>
        </>
    );
};

export default AppWrapper;
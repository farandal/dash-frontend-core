/**
 * AppWrapperLight
 * 
 * A lightweight app wrapper that doesn't depend on react-admin.
 * Used for the initial app shell to avoid pulling in heavy dependencies.
 * Provides error boundary and suspense fallback.
 */
import React, { PropsWithChildren, Suspense, useState, useTransition } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

/**
 * Inline simple error fallback - no react-admin import
 */
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '16px',
            color: 'var(--text-color)',
            backgroundColor: 'var(--bodybg-primary)',
        }}
    >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Something went wrong</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>{error?.message || 'Unknown error'}</p>
        <button
            onClick={resetErrorBoundary}
            style={{
                padding: '8px 24px',
                backgroundColor: 'var(--primary-color)',
                color: 'var(--primary-contrast)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
            }}
        >
            Try Again
        </button>
    </div>
);

/**
 * Inline simple loader - no react-admin import
 */
const SimpleLoader: React.FC = () => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--bodybg-primary)',
        }}
    >
        <div
            className="loading-spinner"
            style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--primary-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }}
        />
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export interface AppWrapperLightProps extends PropsWithChildren {
    onReset?: () => void;
    showSplash?: boolean;
}

/**
 * Lightweight app wrapper with error boundary and suspense
 */
export const AppWrapperLight: React.FC<AppWrapperLightProps> = ({ 
    children,
    onReset,
    showSplash = true,
}) => {
    const [isPending, startTransition] = useTransition();
    const [isInitialRender, setIsInitialRender] = useState(true);

    React.useEffect(() => {
        startTransition(() => {
            setIsInitialRender(false);
        });
    }, []);

    const handleReset = () => {
        if (onReset) {
            onReset();
        } else {
            window.location.reload();
        }
    };

    return (
        <>
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
                <Suspense fallback={<SimpleLoader />}>
                    {children}
                </Suspense>
            </ErrorBoundary>
            {showSplash && (
                <div className={!isPending && !isInitialRender ? 'dash-splash fade-out' : 'dash-splash'} />
            )}
        </>
    );
};

export default AppWrapperLight;

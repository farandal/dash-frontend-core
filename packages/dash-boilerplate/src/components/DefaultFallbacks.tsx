/**
 * Default Fallback Components
 * 
 * Provides default UI components for error states and loading states.
 * All components are designed to be overridable by the consuming application.
 */
import React from 'react';

export interface DefaultErrorFallbackProps {
    error?: Error | string | null;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    containerStyle?: React.CSSProperties;
    messageStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
}

export interface DefaultLoadingFallbackProps {
    message?: string;
    containerStyle?: React.CSSProperties;
}

/**
 * Default container styles for fallback components
 */
const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '16px',
    color: 'var(--text-color, #333)',
    backgroundColor: 'var(--background-color, #fff)',
};

const defaultErrorMessageStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 500,
    color: '#f44336',
};

const defaultButtonStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
};

/**
 * Default error fallback for initialization errors
 */
export const DefaultInitializationErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    error,
    message = 'Failed to initialize application',
    onRetry = () => window.location.reload(),
    retryLabel = 'Retry',
    containerStyle,
    messageStyle,
    buttonStyle,
}) => {
    const errorMessage = error instanceof Error ? error.message : (error || message);
    
    return (
        <div style={{ ...defaultContainerStyle, ...containerStyle }}>
            <h6 style={{ ...defaultErrorMessageStyle, ...messageStyle }}>
                {errorMessage}
            </h6>
            <button
                onClick={onRetry}
                style={{ ...defaultButtonStyle, ...buttonStyle }}
            >
                {retryLabel}
            </button>
        </div>
    );
};

/**
 * Default error fallback for app load failures
 */
export const DefaultAppLoadErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    message = 'Failed to load application',
    onRetry = () => window.location.reload(),
    retryLabel = 'Retry',
    containerStyle,
    messageStyle,
    buttonStyle,
}) => {
    const appLoadContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#000000',
        gap: '12px',
    };

    const appLoadButtonStyle: React.CSSProperties = {
        padding: '8px 24px',
        backgroundColor: '#57005aff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    return (
        <div style={{ ...appLoadContainerStyle, ...containerStyle }}>
            <h1 style={messageStyle}>{message}</h1>
            <button
                onClick={onRetry}
                style={{ ...appLoadButtonStyle, ...buttonStyle }}
            >
                {retryLabel}
            </button>
        </div>
    );
};

/**
 * Create a lazy app loader with error handling
 * This wraps React.lazy with proper error fallback
 */
export interface CreateLazyAppLoaderOptions {
    importFn: () => Promise<{ default: React.ComponentType<any> }>;
    delay?: number;
    ErrorFallback?: React.FC<DefaultErrorFallbackProps>;
    errorMessage?: string;
}

export const createLazyAppLoader = ({
    importFn,
    delay = 100,
    ErrorFallback = DefaultAppLoadErrorFallback,
    errorMessage = 'Failed to load application',
}: CreateLazyAppLoaderOptions): React.LazyExoticComponent<React.ComponentType<any>> => {
    return React.lazy<React.ComponentType<any>>(() => {
        return new Promise<{ default: React.ComponentType<any> }>((resolve) => {
            setTimeout(() => {
                importFn()
                    .then((mod) => {
                        resolve({ default: mod.default });
                    })
                    .catch((error) => {
                        console.error('Failed to load application:', error);
                        resolve({
                            default: () => (
                                <ErrorFallback
                                    error={error}
                                    message={errorMessage}
                                />
                            ),
                        });
                    });
            }, delay);
        });
    });
};

export default {
    DefaultInitializationErrorFallback,
    DefaultAppLoadErrorFallback,
    createLazyAppLoader,
};

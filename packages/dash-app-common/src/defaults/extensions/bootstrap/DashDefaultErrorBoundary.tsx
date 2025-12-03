/**
 * Default Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
import React from 'react';

export interface DashDefaultErrorBoundaryProps {
    children: React.ReactNode;
    /** Custom fallback component to render on error */
    fallback?: React.ReactNode;
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface DashDefaultErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Default error display component
 */
const DefaultErrorDisplay: React.FC<{ error?: Error; onReload: () => void }> = ({ 
    error, 
    onReload 
}) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#ffffff',
        flexDirection: 'column',
        gap: '20px'
    }}>
        <h2>Something went wrong</h2>
        {error && (
            <p style={{ 
                color: '#ff6b6b', 
                maxWidth: '600px', 
                textAlign: 'center',
                padding: '0 20px'
            }}>
                {error.message}
            </p>
        )}
        <button 
            onClick={onReload}
            style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Reload Page
        </button>
    </div>
);

/**
 * Dash Default Error boundary for catching and handling React component errors
 * 
 * @example
 * ```tsx
 * <DashDefaultErrorBoundary onError={(error) => logError(error)}>
 *     <App />
 * </DashDefaultErrorBoundary>
 * ```
 */
export class DashDefaultErrorBoundary extends React.Component<DashDefaultErrorBoundaryProps, DashDefaultErrorBoundaryState> {
    constructor(props: DashDefaultErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): DashDefaultErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('DashDefaultErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReload = (): void => {
        window.location.reload();
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            
            return (
                <DefaultErrorDisplay 
                    error={this.state.error} 
                    onReload={this.handleReload} 
                />
            );
        }

        return this.props.children;
    }
}

export default DashDefaultErrorBoundary;

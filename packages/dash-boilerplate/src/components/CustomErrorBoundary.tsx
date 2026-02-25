/**
 * CustomErrorBoundary
 * 
 * A React error boundary component for catching and displaying errors gracefully.
 * Doesn't depend on heavy UI libraries.
 */
import React from "react";

export interface CustomErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface CustomErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class CustomErrorBoundary extends React.Component<
    CustomErrorBoundaryProps,
    CustomErrorBoundaryState
> {
    constructor(props: CustomErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): CustomErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('CustomErrorBoundary caught error:', error, errorInfo);
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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        backgroundColor: 'var(--bodybg-primary, #121212)',
                        color: 'var(--text-color, #ffffff)',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <h2>Something went wrong</h2>
                    <p style={{ opacity: 0.8 }}>{this.state.error?.message}</p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--primary-color, #007bff)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default CustomErrorBoundary;

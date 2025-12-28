/**
 * Default Initial Loader Component
 * 
 * Displayed during app lazy loading while the main application bundle is being fetched.
 */
import React from 'react';

export interface DashDefaultLoaderProps {
    /** Custom loading message */
    message?: string;
    /** Custom background color (CSS variable or color value) */
    background?: string;
    /** Custom text color (CSS variable or color value) */
    textColor?: string;
}

/**
 * Dash Default loader component shown during app lazy loading
 */
export const DashDefaultLoader: React.FC<DashDefaultLoaderProps> = ({
    message = 'Loading...',
    background = 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
    textColor = 'var(--text-color, @text-color--dark)'
}) => (
   <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            gap: '16px',
            background,
            color: textColor
        }}
    >
        <div
            style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                borderTop: '4px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
        <div style={{ fontSize: '16px' }}>
            {message}
        </div>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default DashDefaultLoader;

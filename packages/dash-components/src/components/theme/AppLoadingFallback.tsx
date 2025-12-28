import React from 'react';

export interface AppLoadingFallbackProps {
  message?: string;
}

const AppLoadingFallback: React.FC<AppLoadingFallbackProps> = ({ message = "Loading..." }) => (
  <div 
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '16px',
      background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
      color: 'var(--text-color, @text-color--dark)'
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
    <h6 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>
      {message}
    </h6>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default AppLoadingFallback;

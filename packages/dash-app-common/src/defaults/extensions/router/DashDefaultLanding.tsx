/**
 * DashDefaultLanding
 * 
 * Simple default landing page for the public app.
 * Separated into its own file to support lazy loading,
 * which ensures useNavigate is called inside Router context.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashDefaultLanding: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--text-color, #ffffff)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center'
            }}
        >
            <h1 style={{ marginBottom: '16px', fontSize: '2rem' }}>Welcome to Dash</h1>
            <p style={{ marginBottom: '24px', opacity: 0.7 }}>
                Please login to continue
            </p>
            <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Go to Login
            </button>
        </div>
    );
};

export default DashDefaultLanding;

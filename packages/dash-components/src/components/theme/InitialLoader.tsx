import React from 'react';

const InitialLoader: React.FC = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
        color: 'var(--text-color, @text-color--dark)'
    }}>
        <div>Loading...</div>
    </div>
);

export default InitialLoader;

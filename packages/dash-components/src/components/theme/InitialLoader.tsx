import React from 'react';

const InitialLoader: React.FC = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--body-bg, #121212)',
        color: 'var(--text-color, #ffffff)'
    }}>
        <div>Loading...</div>
    </div>
);

export default InitialLoader;

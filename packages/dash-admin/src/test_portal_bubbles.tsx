import * as React from 'react';

const SidebarItem = ({ children, onTouchStart }) => {
    console.log('SidebarItem render');
    return (
        <div 
            onTouchStart={(e) => {
                console.log('Parent onTouchStart');
                if (onTouchStart) onTouchStart(e);
            }}
            style={{ padding: '20px', border: '1px solid black' }}
        >
            Parent Item
            {children}
        </div>
    );
};

const SubmenuItem = () => {
    return (
        <div 
            onTouchStart={(e) => {
                console.log('Child onTouchStart');
                // e.stopPropagation(); // If we don't stop this, it bubbles to parent in React tree
            }}
            onClick={() => console.log('Child Click')}
            style={{ padding: '10px', background: 'red' }}
        >
            Child (Portaled in React tree)
        </div>
    );
};

export default function Test() {
    return (
        <SidebarItem onTouchStart={() => console.log('Closing menu')}>
            <SubmenuItem />
        </SidebarItem>
    );
}

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export interface ITransitionWrapper {
  pageTransition?: boolean;
  loadingSpinner?: boolean;
  transitionDuration?: number;
}

const TransitionWrapper: React.FC<ITransitionWrapper> = (props) => {
  const {
    pageTransition = true,
    loadingSpinner = true,
    transitionDuration = 500 // in ms
  } = props;
  
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerOpacity, setSpinnerOpacity] = useState(0);
  const [isReady, setIsReady] = useState(true);
  
  useEffect(() => {
    // Skip transition for same route
    if (!pageTransition || location.pathname === displayLocation.pathname) {
      return;
    }
    
    // Sequence the transition
    const sequence = async () => {
      // Step 1: Mark as not ready (prevents premature outlet updates)
      setIsReady(false);
      
      // Step 2: Show spinner container with opacity 0
      setShowSpinner(true);
      
      // Step 3: Wait a frame to ensure DOM is updated
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Step 4: Fade in spinner
      setSpinnerOpacity(1);
      
      // Step 5: Wait for spinner to fully fade in
      await new Promise(resolve => setTimeout(resolve, transitionDuration));
      
      // Step 6: Update outlet content (while spinner is fully visible)
      setDisplayLocation(location);
      
      // Step 7: Wait a moment to ensure outlet content is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 8: Start fading out spinner
      setSpinnerOpacity(0);
      
      // Step 9: Wait for spinner to fully fade out
      await new Promise(resolve => setTimeout(resolve, transitionDuration));
      
      // Step 10: Hide spinner container
      setShowSpinner(false);
      
      // Step 11: Mark as ready for next transition
      setIsReady(true);
    };
    
    sequence();
  }, [location, displayLocation, pageTransition, transitionDuration]);
  
  return (
    <div className="transition-container" style={{ position: 'relative', height: '100%' }}>
      {/* Main content */}
      <div>
        <Outlet key={displayLocation.pathname} />
      </div>
      
      {/* Spinner overlay */}
      {loadingSpinner && showSpinner && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: spinnerOpacity,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
          }}
        >
          <div className="spinner">
            <style>{`
              .spinner {
                display: inline-block;
                position: relative;
                width: 80px;
                height: 80px;
              }
              .spinner:after {
                content: " ";
                display: block;
                border-radius: 50%;
                width: 0;
                height: 0;
                margin: 8px;
                box-sizing: border-box;
                border: 32px solid #3f51b5;
                border-color: #3f51b5 transparent #3f51b5 transparent;
                animation: spinner 1.2s infinite;
              }
              @keyframes spinner {
                0% { transform: rotate(0); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitionWrapper;
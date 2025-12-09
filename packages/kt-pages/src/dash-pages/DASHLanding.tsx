import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

import { Box } from '@mui/material';
import { AuthPersistenceService } from 'dash-auth';
import { useEffect } from 'react';
const DashLanding = () => {
    const navigate = useNavigate();
    // Animation triggers
    const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const [platformsRef, platformsInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const [ctaRef, ctaInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const panelSettings = useSelector((store: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => store.common.panelSettings);
    const Background = panelSettings?.loginBackground
    const HorizontalLogo = panelSettings?.horizontalLogo
    const authenticated = AuthPersistenceService.isAuthValid();

    useEffect(() => { 
    console.log('Panel Settings:', panelSettings);
  
    }, [panelSettings]);
    return (
        <div className="dash-landing">
            <section
                ref={heroRef}
                className={`hero ${heroInView ? 'animate-fade-in' : ''}`}
            >
                <Box className="hero-image">
                    <img src={Background} alt="image" />
                </Box>

                <Box className="hero-content">
                    <img src={HorizontalLogo} alt="image" />
                    {!authenticated && <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="cta-button" onClick={() => navigate('/login')}>Ingresar</button>
                        {/*<button className="cta-button" onClick={() => navigate('/signup')}>Registrarse</button>*/}
                    </Box>
                    }
                </Box>
            </section>
        </div>
    );
};

export default DashLanding;
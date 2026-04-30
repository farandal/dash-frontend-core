import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { TextField, Button, Box } from "@mui/material";

// Import SVGs as modules so Vite bundles them
import Telemedicine01 from "@app/assets/img/Telemedicine_01.svg";
import HeroAnimation01 from "@app/assets/img/hero-animation-01.svg";
import Telemedicine03 from "@app/assets/img/Telemedicine_03.svg";
import HeroAnimation03 from "@app/assets/img/hero-animation-03.svg";
import HeroBgShape2 from "@app/assets/img/hero-bg-shape-2.svg";

export default function HeroThree() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate('/signup', { state: { email: email.trim() } });
    } else {
      navigate('/signup');
    }
  };

  return (
    <>
    
      <section className="hero-section hero-section-3 ptb-100">
        <div className="circles">
          <div className="point animated-point-1"></div>
          <div className="point animated-point-2"></div>
          <div className="point animated-point-3"></div>
          <div className="point animated-point-4"></div>
          <div className="point animated-point-5"></div>
          <div className="point animated-point-6"></div>
        </div>

        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 col-lg-6">
              <div className="hero-content-left ptb-100">
                <h1>
                  <span>{translate('landing.hero.title')}</span>
                </h1>
                <p className="lead">
                  {translate('landing.hero.description')}
                </p>
                
                {/* Trial signup form */}
                <div className="hero-signup-form mt-4">
                  <h4 className="mb-2" style={{ fontWeight: 600 }}>
                    {translate('landing.hero.trialTitle')}
                  </h4>
                  <p className="text-muted mb-3" style={{ fontSize: '1rem' }}>
                    {translate('landing.hero.trialSubtitle')}
                  </p>
                  <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      alignItems: 'stretch'
                    }}
                  >
                    <TextField
                      type="email"
                      placeholder={translate('landing.hero.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="outlined"
                      size="medium"
                      sx={{
                        flex: 1,
                        minWidth: '250px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          /*backgroundColor: '#fff',
                          '& fieldset': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#9sbc13c',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9bc13c',
                          },*/
                        },
                        '& .MuiInputBase-input': {
                          padding: '12px 20px',
                          fontSize: '1rem',
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: '8px',
                        padding: '12px 28px',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#9bc13c',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#7faa00',
                        }
                      }}
                    >
                      {translate('landing.hero.createStore')}
                    </Button>
                  </Box>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="hero-animation-img">
                <img
                  className="img-fluid d-block m-auto animation-one"
                  src={Telemedicine01}
                  width="150"
                  alt="animation "
                />
                <img
                  className="img-fluid d-none d-lg-block animation-two"
                  src={HeroAnimation01}
                  alt="animation "
                  width="120"
                />
                <img
                  className="img-fluid d-none d-lg-block animation-three"
                  src={Telemedicine03}
                  alt="animation "
                  width="120"
                />
                <img
                  className="img-fluid d-none d-lg-block animation-four"
                  src={HeroAnimation03}
                  alt="animation "
                  width="200"
                />
              </div>
            </div>
          </div>
        </div>

        <img
          src={HeroBgShape2}
          className="shape-image"
          alt="shape "
        />
      </section>
    </>
  );
}

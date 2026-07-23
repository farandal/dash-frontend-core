import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { TextField, Button, Box, Typography } from "@mui/material";

interface CtaSignupProps {
  bgColor?: boolean;
}

export default function CtaSignup({ bgColor = true }: CtaSignupProps) {
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
    <section 
      className={`cta-signup-section ptb-100`}
   
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4"
                component="h2"
                sx={{ 
                  mb: 2,
                  fontWeight: 700, 
                  color: '#1a2b57',
                  fontSize: '2rem'
                }}
              >
                {translate('landing.cta.title')}
              </Typography>
              <Typography 
                sx={{ 
                  mb: 4,
                  color: '#6c757d',
                  fontSize: '1.1rem'
                }}
              >
                {translate('landing.cta.subtitle')}
              </Typography>
              
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  maxWidth: '500px',
                  margin: '0 auto'
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
                    minWidth: '280px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      /*backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9bc13c',
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
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
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
            </Box>
          </div>
        </div>
      </div>
    </section>
  );
}

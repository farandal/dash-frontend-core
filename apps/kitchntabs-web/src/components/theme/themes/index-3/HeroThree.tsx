import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { TextField, Button, Box } from "@mui/material";
import HeroSection from "@app/components/theme/components/hero/HeroSection";
import HeroAnimation from "@app/components/theme/components/hero/HeroAnimation";

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
    <HeroSection animation={<HeroAnimation />}>
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
    </HeroSection>
  );
}

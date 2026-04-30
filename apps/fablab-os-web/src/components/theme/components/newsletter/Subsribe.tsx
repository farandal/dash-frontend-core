import React, { useState } from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Grid, TextField, Button, Typography } from "@mui/material";

export default function Subsribe() {
  const translate = useTranslate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscription email:", email);
  };

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: 'primary.main',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" align="center" gutterBottom>
              {translate('landing.newsletter.title')}
            </Typography>
            <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
              {translate('landing.newsletter.description')}
            </Typography>
            
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={translate('landing.newsletter.placeholder')}
                variant="outlined"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  minWidth: { xs: '100%', sm: '150px' }
                }}
              >
                {translate('landing.newsletter.subscribe')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

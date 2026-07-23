import React from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Grid, Typography, TextField, Button, Paper } from "@mui/material";

export default function Contact({ bgColor }: { bgColor?: boolean }) {
  const translate = useTranslate();

  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: 12,
        bgcolor: bgColor ? 'grey.100' : 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={5}>
            <Typography variant="h3" component="h2" gutterBottom>
              {translate('landing.contact.title')}
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              {translate('landing.contact.description')}
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                <strong>{translate('landing.contact.office')}</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                121 King St, Melbourne VIC 3000, Australia
              </Typography>
              <Typography variant="body2">
                Phone: +61 2 8376 6284
              </Typography>
              <Typography variant="body2">
                {translate('landing.contact.contactEmail')}: 
                <a href="mailto:hello@dash.com" style={{ marginLeft: '4px' }}>
                  hello@dash.com
                </a>
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {translate('landing.contact.formTitle')}
              </Typography>
              
              <Box component="form" noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      name="name"
                      label={translate('landing.contact.name')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      name="email"
                      label={translate('landing.contact.email')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label={translate('landing.contact.phone')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="company"
                      label={translate('landing.contact.company')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      name="message"
                      label={translate('landing.contact.message')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {translate('landing.contact.submit')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

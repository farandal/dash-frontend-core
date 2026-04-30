import React from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function FeatureImgThree() {
  const translate = useTranslate();

  const benefits = [
    'fasterProcessing',
    'improvedCommunication',
    'reducedErrors',
    'betterTiming',
    'insights',
    'coordination',
  ];

  return (
    <Box component="section" id="benefits" sx={{ py: 12, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            {translate('landing.benefits.title')}
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {benefits.map((benefit) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={benefit}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h2" component="div" sx={{ mb: 2 }}>
                    {translate(`landing.benefits.${benefit}.icon`)}
                  </Typography>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {translate(`landing.benefits.${benefit}.title`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {translate(`landing.benefits.${benefit}.description`)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

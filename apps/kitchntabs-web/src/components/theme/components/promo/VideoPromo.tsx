import React, { useState } from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoModal from "../others/VideoModal";

export default function VideoPromo() {
  const [isOpen, setIsOpen] = useState(false);
  const translate = useTranslate();

  return (
    <Box
      component="section"
      sx={{
        py: 12,
        minHeight: 320,
        background: 'linear-gradient(135deg, #1B5E20 0%, #43A047 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#fff',
              color: '#43A047',
              '&:hover': {
                bgcolor: '#f0f0f0',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s',
              mb: 2,
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {translate('landing.videoPromo.title')}
          </Typography>
        </Box>
      </Container>
      <VideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Box>
  );
}

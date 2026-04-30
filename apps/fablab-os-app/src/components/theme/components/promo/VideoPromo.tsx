import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoModal from "../others/VideoModal";

// Import images as modules
import MobileScreenshots from "@app/assets/img/mobile_screenshots.png";
import HeroBg1 from "@app/assets/img/hero-bg-1.jpg";

export default function VideoPromo() {
  const [isOpen, setIsOpen] = useState(false);
  const translate = useTranslate();

  return (
    <>
      <Box
        component="section"
        sx={{
          py: 12,
          background: `url('${HeroBg1}') no-repeat center center / cover`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={MobileScreenshots}
              alt="Mobile App Screenshots"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: 400,
                mb: 4,
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
            />
            <IconButton
              onClick={() => setIsOpen(true)}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
                mb: 3
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <Typography variant="h5" sx={{ color: 'white', mt: 2 }}>
              {translate('landing.vision.title')}
            </Typography>
          </Box>
        </Container>
        <VideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </Box>
    </>
  );
}

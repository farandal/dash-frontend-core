import React from "react";
import { Box, Button, Typography, Grid, Paper, Stack } from "@mui/material";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";

// Icons
import WindowsIcon from "@mui/icons-material/DesktopWindows";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import KioskIcon from "@mui/icons-material/PointOfSale";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { getEnv } from "dash-constants";

// App version from build-time environment
//const version = import.meta.env.VITE_LATEST_RELEASE_VERSION || "1.0.0";
const version = getEnv("LATEST_RELEASE_VERSION") || "1.0.0";

// Download URLs with dynamic version
const S3_BASE = "https://kitchntabs-releases.s3.us-east-2.amazonaws.com/releases";
const DOWNLOAD_URLS = {
  windows: `${S3_BASE}/kitchntabs-${version}.exe`,
  raspberry: `${S3_BASE}/kitchntabs-${version}-arm64.AppImage`,
  android: `${S3_BASE}/kitchntabs-${version}-arm64.apk`,
  //android: "https://play.google.com/store/apps/details?id=com.kitchntabs.app",
};

export default function DownloadCta() {
  const translate = useTranslate();

  const features = [
    {
      icon: "📲",
      titleKey: "landing.download.features.digitize.title",
      descKey: "landing.download.features.digitize.description",
    },
    {
      icon: "🍳",
      titleKey: "landing.download.features.kitchen.title",
      descKey: "landing.download.features.kitchen.description",
    },
    {
      icon: "🔄",
      titleKey: "landing.download.features.sync.title",
      descKey: "landing.download.features.sync.description",
    },
    {
      icon: "🧩",
      titleKey: "landing.download.features.independence.title",
      descKey: "landing.download.features.independence.description",
    },
    {
      icon: "📊",
      titleKey: "landing.download.features.visibility.title",
      descKey: "landing.download.features.visibility.description",
    },
    {
      icon: "🚀",
      titleKey: "landing.download.features.scale.title",
      descKey: "landing.download.features.scale.description",
    },
  ];

  return (
    <section id="download" className="video-promo ptb-100">
      <div className="container">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {translate("landing.download.title")}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: "auto", mb: 3 }}>
            {translate("landing.download.subtitle")}
          </Typography>
        </Box>

        {/* What is KitchnTabs */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {translate("landing.download.what_is_title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {translate("landing.download.what_is_description")}
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {translate(feature.titleKey)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {translate(feature.descKey)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Download Section */}
        <Box
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "inherit" }}>
            {translate("landing.download.download_title")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, color: "inherit" }}>
            {translate("landing.download.download_subtitle")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<WindowsIcon />}
              href={DOWNLOAD_URLS.windows}
              target="_blank"
              /*sx={{
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                minWidth: 180,
              }}*/
            >
              Windows
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<AndroidIcon />}
              href={DOWNLOAD_URLS.android}
              target="_blank"
              /*sx={{
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                minWidth: 180,
              }}*/
            >
              Android
            </Button>
     
            <Button
              variant="contained"
              size="large"
              startIcon={<KioskIcon />}
              href={DOWNLOAD_URLS.raspberry}
              target="_blank"
             /* sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" },
                minWidth: 180,
              }}*/
            >
              Kiosk (Raspberry | Debian | Arm64)
            </Button>

                   <Button
              variant="contained"
              size="large"
              disabled
              startIcon={<AppleIcon />}
              /*sx={{
                backgroundColor: "rgba(255,255,255,0.5)",
                color: "rgba(0,0,0,0.5)",
                minWidth: 180,
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.6)",
                },
              }}*/
            >
              macOS (Coming Soon)
            </Button>
            <Button
              variant="contained"
              size="large"
              disabled
              startIcon={<PhoneIphoneIcon />}
              /*sx={{
                backgroundColor: "rgba(255,255,255,0.5)",
                color: "rgba(0,0,0,0.5)",
                minWidth: 180,
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.6)",
                },
              }}*/
            >
              iOS (Coming Soon)
            </Button>
          </Stack>
        </Box>

        {/* Admin Panel Link */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {translate("landing.download.admin_panel_text")}
          </Typography>
          <Button
            variant="outlined"
            href="https://app.kitchntabs.com"
            target="_blank"
            sx={{ borderRadius: 2 }}
          >
            {translate("landing.download.admin_panel_button")}
          </Button>
        </Box>
      </div>
    </section>
  );
}

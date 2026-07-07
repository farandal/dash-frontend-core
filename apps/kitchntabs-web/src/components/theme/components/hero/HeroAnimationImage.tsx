import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import KtLanding from "@app/assets/ktlanding2.png";
import VideoModal from "@app/components/theme/components/others/VideoModal";

/**
 * Static PNG replacement for the layered SVG hero visual, with the intro
 * video's play button overlaid on top (previously its own VideoPromo section).
 * See HeroAnimation.tsx to switch between this and HeroAnimationSvg.
 */
export default function HeroAnimationImage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box sx={{ position: "relative" }}>
      <img
        className="img-fluid d-block m-auto"
        src={KtLanding}
        alt="KitchnTabs"
      />
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 72,
          height: 72,
          bgcolor: "#43A047",
          color: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          "&:hover": {
            bgcolor: "#fff",
            color: "#43A047",
            transform: "translate(-50%, -50%) scale(1.1)",
          },
          transition: "all 0.3s",
        }}
      >
        <PlayArrowIcon sx={{ fontSize: 36 }} />
      </IconButton>
      <VideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Box>
  );
}

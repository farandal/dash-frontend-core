
import { useTheme } from "@mui/material";
import { useTranslate } from "../hooks/usePolyglotTranslation";
import LatestNewsOne from "../theme/components/blogs/LatestNewsOne";
import Contact from "../theme/components/contact/Contact";
import FeatureImgThree from "../theme/components/features/FeatureImgThree";
import Features from "../theme/components/features/Features";
import Subsribe from "../theme/components/newsletter/Subsribe";
import Price from "../theme/components/prices/Price";
import Promo from "../theme/components/promo/Promo";
import VideoPromo from "../theme/components/promo/VideoPromo";
import Team from "../theme/components/team/Team";
import BrandCarousel from "../theme/components/testimonial/BrandCarousel";
import HeroThree from "../theme/themes/index-3/HeroThree";
import Screenshot from "../theme/components/screenshot/Screenshot";
import Download from "../theme/pages/Download";

export default function HomeThree() {
  const theme = useTheme();
  const isLightMode = theme.palette.mode === "light";
  const translate = useTranslate();

  return (
    <>
      <HeroThree />
      <Promo />
      <VideoPromo />
      <Download />
      {/*<Promo />
      <Features />
      <FeatureImgThree />
      <VideoPromo />
      <Price hasBg={true} />
      <Screenshot hasBg={true} />
      <LatestNewsOne bgColor="primary-bg" light={isLightMode} />
      <Team hasTitle={true} bgColor={"#336699"} />
      <Contact bgColor />
      <BrandCarousel hasBg={true} />
      <Subsribe />*/}

    </>
  );
}

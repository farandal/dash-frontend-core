import { useTheme } from "@mui/material";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Contact from "../../components/contact/Contact";
import FeatureImgThree from "../../components/features/FeatureImgThree";
import Features from "../../components/features/Features";

import Subsribe from "../../components/newsletter/Subsribe";
import Price from "../../components/prices/Price";
import Promo from "../../components/promo/Promo";
import VideoPromo from "../../components/promo/VideoPromo";
import Screenshot from "../../components/screenshot/Screenshot";
import Team from "../../components/team/Team";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import HeroThree from "./HeroThree";

export default function HomeThree() {
  const theme = useTheme();
  const isLightMode = theme.palette.mode === "light";

  return (
    <>
      <HeroThree />
      <Promo />
      <Features />
      <FeatureImgThree />
      <VideoPromo />
      <Price hasBg={true} />
      <Screenshot hasBg />
      <LatestNewsOne bgColor="primary-bg" light={isLightMode} />
      <Team hasTitle={true} bgColor={"#336699"} />
      <Contact bgColor />
      <BrandCarousel hasBg={true} />
      <Subsribe />

    </>
  );
}

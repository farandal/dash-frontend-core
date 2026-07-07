// Import SVGs as modules so Vite bundles them
import Telemedicine03 from "@app/assets/img/Telemedicine_03.svg";
import Waiter from "@app/assets/waiter_male.svg";
import MotoAnimation from "@app/assets/moto.svg";
import KitchenAnim from "@app/assets/kitchen.svg";

/**
 * Original layered SVG animation set for the hero's right-side visual.
 * See HeroAnimation.tsx to switch between this and HeroAnimationImage.
 */
export default function HeroAnimationSvg() {
  return (
    <>
      <img
        className="img-fluid d-block m-auto animation-one"
        src={Waiter}
        width="150"
        alt="animation "
      />
      <img
        className="img-fluid d-none d-lg-block animation-two"
        src={MotoAnimation}
        alt="animation "
        width="120"
      />
      <img
        className="img-fluid d-none d-lg-block animation-three"
        src={Telemedicine03}
        alt="animation "
        width="120"
      />
      <img
        className="img-fluid d-none d-lg-block animation-four"
        src={KitchenAnim}
        alt="animation "
        width="200"
      />
    </>
  );
}

import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";

// Import SVGs as modules so Vite bundles them
import Waiter from "@app/assets/waiter_male.svg";
import MotoAnimation from "@app/assets/moto.svg";
import Telemedicine03 from "@app/assets/user.svg";
import KitchenAnim from "@app/assets/kitchen.svg";
import HeroBgShape2 from "@app/assets/img/hero-bg-shape-2.svg";
import DASHLightWeightLogin from "./DASHLightWeightLogin";

export default function HomeLogingWrapper() {
  const translate = useTranslate();

  return (
    <>
      <section className="hero-section hero-section-3 ptb-100">
        <div className="circles">
          <div className="point animated-point-1"></div>
          <div className="point animated-point-2"></div>
          <div className="point animated-point-3"></div>
          <div className="point animated-point-4"></div>
          <div className="point animated-point-5"></div>
          <div className="point animated-point-6"></div>
        </div>

        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 col-lg-6">
              <div className="hero-content-left ptb-100">
              
                <div className="hero-signup-form mt-4">



                        <DASHLightWeightLogin/>



                        
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="hero-animation-img">
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
              </div>
            </div>
          </div>
        </div>

        <img
          src={HeroBgShape2}
          className="shape-image"
          alt="shape "
        />
      </section>
    </>
  );
}

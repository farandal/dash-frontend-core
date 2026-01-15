import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";

// Import SVGs as modules so Vite bundles them
import Telemedicine01 from "@app/assets/img/Telemedicine_01.svg";
import HeroAnimation01 from "@app/assets/img/hero-animation-01.svg";
import Telemedicine03 from "@app/assets/img/Telemedicine_03.svg";
import HeroAnimation03 from "@app/assets/img/hero-animation-03.svg";
import HeroBgShape2 from "@app/assets/img/hero-bg-shape-2.svg";

export default function HeroThree() {
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
                <h1>
                  <span>{translate('landing.hero.title')}</span>
                </h1>
                <p className="lead">
                  {translate('landing.hero.description')}
                </p>

               {/* <a href="#contact" className="btn solid-btn">
                  {translate('landing.hero.cta')}
                </a>*/}
              </div>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="hero-animation-img">
                <img
                  className="img-fluid d-block m-auto animation-one"
                  src={Telemedicine01}
                  width="150"
                  alt="animation "
                />
                <img
                  className="img-fluid d-none d-lg-block animation-two"
                  src={HeroAnimation01}
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
                  src={HeroAnimation03}
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

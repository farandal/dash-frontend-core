import React from "react";
import OwlCarousel from "react-owl-carousel";

// Import images as modules
import Img01 from "@app/assets/img/01.png";
import Img02 from "@app/assets/img/02.png";
import Img03 from "@app/assets/img/03.png";
import Img04 from "@app/assets/img/04.png";
import Img05 from "@app/assets/img/05.png";
import Img06 from "@app/assets/img/06.png";

export default function Screenshot({ hasBg }) {
  const options = {
    loop: true,
    margin: 0,
    center: true,
    dots: true,
    nav: false,
    autoplay: true,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 3,
      },
      991: {
        items: 4,
      },
      1200: {
        items: 4,
      },
      1920: {
        items: 4,
      },
    },
  };
  return (
    <>
      <section
        id="screenshots"
        className={`screenshots-section ptb-100 ${
          hasBg ? "gray-light-bg" : ""
        }`}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="section-heading text-center">
                {hasBg ? (
                  <span className="text-uppercase color-secondary sub-title">
                    App Screenshots
                  </span>
                ) : (
                  ""
                )}
                <h2>App Screenshots Looks Awesome</h2>
                <p className="lead">
                  Credibly synthesize multimedia based networks vis-a-vis
                  top-line growth strategies. Continually leverage existing
                  worldwide interfaces
                </p>
              </div>
            </div>
          </div>
          <div className="screen-slider-content mt-5">
            <div className="screenshot-frame"></div>
            <OwlCarousel
              className="screen-carousel owl-carousel owl-theme dot-indicator"
              {...options}
            >
              <img
                src={Img01}
                className="img-fluid"
                alt="screenshots"
              />
              <img
                src={Img02}
                className="img-fluid"
                alt="screenshots"
              />
              <img
                src={Img03}
                className="img-fluid"
                alt="screenshots"
              />
              <img
                src={Img04}
                className="img-fluid"
                alt="screenshots"
              />
              <img
                src={Img05}
                className="img-fluid"
                alt="screenshots"
              />
              <img
                src={Img06}
                className="img-fluid"
                alt="screenshots"
              />
            </OwlCarousel>
          </div>
        </div>
      </section>
    </>
  );
}

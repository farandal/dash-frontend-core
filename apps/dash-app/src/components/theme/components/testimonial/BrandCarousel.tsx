import React from "react";
import OwlCarousel from "react-owl-carousel";

// Import client logos as modules
import Client1Color from "@app/assets/img/client-1-color.png";
import Client2Color from "@app/assets/img/client-2-color.png";
import Client3Color from "@app/assets/img/client-3-color.png";
import Client4Color from "@app/assets/img/client-4-color.png";
import Client5Color from "@app/assets/img/client-5-color.png";
import Client6Color from "@app/assets/img/client-6-color.png";
import Client7Color from "@app/assets/img/client-7-color.png";

export default function BrandCarousel({ hasBg }) {
  const options = {
    autoplay: true,
    loop: true,
    margin: 15,
    dots: true,
    slidetransition: "linear",
    autoplayTimeout: 4500,
    autoplayHoverPause: true,
    autoplaySpeed: 4500,
    responsive: {
      0: {
        items: 2,
      },
      500: {
        items: 3,
      },
      600: {
        items: 4,
      },
      800: {
        items: 5,
      },
      1200: {
        items: 6,
      },
    },
  };

  return (
    <>
      <section
        className={`client-section ptb-100 ${hasBg ? "gray-light-bg" : ""}`}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="section-heading text-center mb-5">
                {hasBg ? (
                  <span className="text-uppercase color-secondary sub-title">
                    Our Trusted Clients
                  </span>
                ) : (
                  ""
                )}
                <h2>Trusted by Companies</h2>
                <p className="lead">
                  Rapidiously morph transparent internal or "organic" sources
                  whereas resource sucking e-business. Conveniently innovate
                  compelling internal.
                </p>
              </div>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-md-12">
              <OwlCarousel
                className="owl-carousel owl-theme clients-carousel dot-indicator"
                {...options}
              >
                <div className="item single-client">
                  <img
                    src={Client5Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client1Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client6Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client3Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client4Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client5Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client7Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client2Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client1Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
                <div className="item single-client">
                  <img
                    src={Client3Color}
                    alt="client logo"
                    className="client-img"
                  />
                </div>
              </OwlCarousel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

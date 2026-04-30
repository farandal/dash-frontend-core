import React from "react";
import { Link } from "react-router-dom";
export default function HeroSeven() {
  return (
    <>
      <section
        className="hero-section background-img ptb-100"
        style={{
          background:
            "url('assets/img/particle.svg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-7 col-lg-6">
              <div className="position-relative mt-lg-0 mt-md-0 mt-5 text-white">
                <h3 className="text-white">Black Friday Sale!</h3>
                <h1 className="text-white big-text mb-0">
                  <span>UP TO</span> 90% OFF
                </h1>
                <p className="lead">
                  Limited time offer download and updated our app, synthesize
                  accurate users whereas communities assertively evolve
                  technically sound whereas real-time materials.
                </p>
                <Link to="/signup-two" className="btn google-play-btn">
                  Get Started Now
                </Link>
              </div>
            </div>
            <div className="col-md-5 col-lg-5">
              <div className="offer-tag-wrap position-relative z-index">
                <img
                  src="/assets/img/offer-single-img.png"
                  alt="app"
                  className="img-fluid"
                />
                <div className="offer-tag">
                  <div className="ribbon-2">
                    <span>Start From</span>
                  </div>
                  <div className="offer-price">
                    <span>$</span>0.99<small>/Mo</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

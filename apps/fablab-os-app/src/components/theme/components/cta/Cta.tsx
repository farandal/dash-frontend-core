import React from "react";
import { Link } from "react-router-dom";

const Cta = () => {
  return (
    <>
      <section
        className="download-section pt-100 background-img"
        style={{
          background:
            "url('assets/img/app-hero-bg.jpg') no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-7">
              <div className="download-content text-white pb-100">
                <h2 className="text-white">
                  Start Managing your Apps Business, more Faster
                </h2>
                <p className="lead">
                  Objectively deliver professional value with diverse
                  web-readiness. Collaboratively transition wireless customer
                  service without goal-oriented catalysts for change.
                  Collaboratively.
                </p>

                <div className="download-btn">
                  <Link to="/" className="btn google-play-btn mr-3">
                    <span className="ti-android"></span> Google Play
                  </Link>
                  <Link to="/" className="btn app-store-btn">
                    <span className="ti-apple"></span> App Store
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="download-img d-flex align-items-end">
                <img
                  src="/assets/img/app-hand-top.png"
                  alt="download"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cta;

import React from "react";
import Counter from "../../components/counter/Counter";

export default function HeroTwo() {
  return (
    <>
      <section
        className="hero-section pt-100 background-img"
        style={{
          background:
            "url('assets/img/hero-bg-1.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 col-lg-6">
              <div className="hero-content-left text-white mt-5">
                <span className="text-uppercase h6">
                  Customer First Priority
                </span>
                <h1 className="text-white">
                  <span>We Deliver</span> Your Product More Faster
                </h1>
                <p className="lead">
                  Quickly morph client-centric results through performance based
                  applications. Proactively facilitate professional human
                  capital for cutting-edge.
                </p>

                <a href="#download" className="btn app-store-btn">
                  Download Now
                </a>
              </div>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="hero-animation-img">
                <img
                  src="/assets/img/image-14.png"
                  alt="img"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
          <Counter />
        </div>
      </section>
    </>
  );
}

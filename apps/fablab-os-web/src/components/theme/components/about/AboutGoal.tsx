import React from "react";

export default function AboutGoal() {
  return (
    <>
      <section id="about" className="about-us ptb-100 gray-light-bg">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6">
              <div className="about-content-left section-heading">
                <span className="text-uppercase color-secondary sub-title">
                  About Our Goal
                </span>
                <h2>We Help Drive your Business Forward Faster</h2>
                <p>
                  Proactively syndicate open-source e-markets after low-risk
                  high-yield synergy. Professionally simplify visionary
                  technology before team driven sources grow bleeding-edge
                  leadership.{" "}
                </p>

                <div className="single-feature mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="ti-vector rounded mr-3 icon icon-color-1"></span>
                    <h5 className="mb-0">Easy to use</h5>
                  </div>
                  <p>
                    Synergistically deliver next-generation relationships
                    whereas bleeding-edge resources. Continually pontificate
                    stand-alone benefits whereas.
                  </p>
                </div>
                <div className="single-feature mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="ti-dashboard rounded mr-3 icon icon-color-2"></span>
                    <h5 className="mb-0">Increase conversion</h5>
                  </div>
                  <p>
                    Phosfluorescently empower compelling intellectual capital
                    and revolutionary web services. Compellingly develop
                    cross-media.
                  </p>
                </div>

                <div className="single-feature mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="ti-alarm-clock rounded mr-3 icon icon-color-3"></span>
                    <h5 className="mb-0">24/7 Support</h5>
                  </div>
                  <p>
                    Phosfluorescently matrix enterprise-wide metrics vis-a-vis
                    extensive imperatives. Energistically empower best-of-breed
                    human
                  </p>
                </div>
                <a href="#/" className="btn solid-btn mt-2">
                  View additional 10+ features
                </a>
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-content-right">
                <img
                  src="/assets/img/about-img.png"
                  alt="about us"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

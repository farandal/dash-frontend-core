import React from "react";

export default function FeatureImgFour() {
  return (
    <>
      <section
        id="features"
        className="imageblock-section switchable switchable-content"
      >
        <div className="imageblock-section-img col-lg-5 col-md-4">
          <div
            className="background-image-holder"
            style={{
              background:
                "url('assets/img/about-img.jpg')no-repeat center center / cover",
              opacity: 1,
            }}
          >
            {" "}
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-7">
              <div className="row align-items-center ptb-100">
                <div className="col-lg-12">
                  <div className="d-flex align-items-start mb-5">
                    <div className="pr-4">
                      <div className="icon icon-shape icon-color-1 rounded-circle">
                        <span className="ti-face-smile"></span>
                      </div>
                    </div>
                    <div className="icon-text">
                      <h5>Responsive web design</h5>
                      <p className="mb-0">
                        Modular and interchangable componente between layouts
                        and even demos.
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start mb-5">
                    <div className="pr-4">
                      <div className="icon icon-shape icon-color-2 rounded-circle">
                        <span className="ti-vector"></span>
                      </div>
                    </div>
                    <div className="icon-text">
                      <h5>Loaded with features</h5>
                      <p className="mb-0">
                        Modular and interchangable componente between layouts
                        and even demos.
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="pr-4">
                      <div className="icon icon-shape icon-color-3 rounded-circle">
                        <span className="ti-headphone-alt"></span>
                      </div>
                    </div>
                    <div className="icon-text">
                      <h5>Friendly online support</h5>
                      <p className="mb-0">
                        Modular and interchangable componente between layouts
                        and even demos.
                      </p>
                    </div>
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

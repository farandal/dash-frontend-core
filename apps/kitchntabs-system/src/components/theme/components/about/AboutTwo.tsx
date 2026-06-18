import React from "react";

export default function AboutTwo() {
  return (
    <>
      <section id="about" className="about-us ptb-100 gray-light-bg">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="about-content-right">
                <img
                  src="/assets/img/delivery-app.svg"
                  width="500"
                  alt="about us"
                  className="img-fluid"
                />
              </div>
            </div>
            <div className="col-lg-5">
              <h2>Deliver your Product Using AppCo</h2>
              <p className="mb-4 lh-190">
                Quick has all the right tools in order to make your website
                building process a breeze and automatize your time-consuming
                tasks in your development workflow.
              </p>
              <ul className="list-unstyled">
                <li className="py-2">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="badge badge-circle badge-primary mr-3">
                        <span className="ti-check"></span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0">Tones of SASS variables</p>
                    </div>
                  </div>
                </li>
                <li className="py-2">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="badge badge-circle badge-primary mr-3">
                        <span className="ti-check"></span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0">
                        Create your own skin to match your brand
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-2">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="badge badge-circle badge-primary mr-3">
                        <span className="ti-check"></span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0">
                        Globally orchestrate tactical channels whereas bricks
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-2">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="badge badge-circle badge-primary mr-3">
                        <span className="ti-check"></span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0">
                        Use Gulp to prepare all assets for production
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-2">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="badge badge-circle badge-primary mr-3">
                        <span className="ti-check"></span>
                      </div>
                    </div>
                    <div>
                      <p className="mb-0">
                        Collaboratively predominate vertical manufactured
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

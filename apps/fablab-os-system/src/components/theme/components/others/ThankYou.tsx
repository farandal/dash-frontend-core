import React from "react";

export default function ThankYou() {
  return (
    <>
      <section
        className="hero-section ptb-100 background-img full-screen"
        style={{
          background:
            "url('assets/img/hero-bg-1.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-9 col-lg-7">
              <div className="hero-content-left text-white text-center">
                <h1 className="text-white">Thank You !</h1>

                <p className="lead">
                  We will be in touch shortly. We're looking forward to your
                  demo. If you have any questions prior to your demo feel free
                  to give us a call.
                </p>

                <div className="mb-5">
                  <h5 className="mb-0 text-white">
                    {" "}
                    <span className="ti-mobile mr-2 align-items-center"></span>{" "}
                    (612) 255-461
                  </h5>
                </div>
                <form
                  action="#"
                  method="post"
                  className="subscribe-form text-center m-auto"
                >
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control input"
                      id="email"
                      name="email"
                      placeholder="info@yourdomain.com"
                    />
                    <input
                      type="submit"
                      className="button btn solid-btn"
                      id="submit"
                      value="Subscribe"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

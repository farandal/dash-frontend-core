import React from "react";

export default function ComingSoon() {
  return (
    <>
      <section
        className="hero-section ptb-100 background-img full-screen"
        style={{
          background:
            "url('assets/img/app-hero-bg.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-9 col-lg-7">
              <div className="hero-content-left text-white text-center">
                <h1 className="text-white">We're Coming Soon</h1>
                <p className="lead">
                  Our website is under construction. We'll be here soon with our
                  new awesome site, subscribe to be notified.
                </p>

                <div id="clock" className="countdown-wrap my-5">
                  <div className="row">
                    <div className="col">
                      <h2 className="mb-1">16</h2>
                      <h5>Days</h5>
                    </div>
                    <div className="col">
                      <h2 className="mb-1">12</h2>
                      <h5>Hours</h5>
                    </div>
                    <div className="col">
                      <h2 className="mb-1">13</h2>
                      <h5>Minutes</h5>
                    </div>
                    <div className="col">
                      <h2 className="mb-1">04</h2>
                      <h5>Seconds</h5>
                    </div>
                  </div>
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

import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
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
          <div className="row align-items-center justify-content-between pt-5 pt-sm-5 pt-md-5 pt-lg-0">
            <div className="col-md-7 col-lg-6">
              <div className="hero-content-left text-white">
                <h1 className="text-white">Create Your Account</h1>
                <p className="lead">
                  Keep your face always toward the sunshine - and shadows will
                  fall behind you.
                </p>
              </div>
            </div>
            <div className="col-md-5 col-lg-5">
              <div className="card login-signup-card shadow-lg mb-0">
                <div className="card-body px-md-5 py-5">
                  <div className="mb-5">
                    <h6 className="h3">Create account</h6>
                    <p className="text-muted mb-0">
                      Made with love by developers for developers.
                    </p>
                  </div>
                  <form className="login-signup-form">
                    <div className="form-group">
                      <label className="pb-1">Your Name</label>

                      <div className="input-group input-group-merge">
                        <div className="input-icon">
                          <span className="ti-user color-primary"></span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="pb-1">Email Address</label>

                      <div className="input-group input-group-merge">
                        <div className="input-icon">
                          <span className="ti-email color-primary"></span>
                        </div>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@address.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="pb-1">Password</label>

                      <div className="input-group input-group-merge">
                        <div className="input-icon">
                          <span className="ti-lock color-primary"></span>
                        </div>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>

                    <div className="my-4">
                      <div className="custom-control custom-checkbox mb-3">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="check-terms"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="check-terms"
                        >
                          I agree to the <a href="#/">terms and conditions</a>
                        </label>
                      </div>
                    </div>

                    <button className="btn btn-lg btn-block solid-btn border-radius mt-4 mb-3">
                      Sign up
                    </button>
                  </form>
                </div>
                <div className="card-footer px-md-5 bg-transparent border-top">
                  <small>Already have an account?</small>
                  <Link to="/login" className="small">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-img-absolute">
          <img
            src="/assets/img/wave-shap.svg"
            alt="wave shape"
            className="img-fluid"
          />
        </div>
      </section>
    </>
  );
}

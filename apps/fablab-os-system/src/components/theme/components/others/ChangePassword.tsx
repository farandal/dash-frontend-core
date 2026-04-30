import React from "react";
import { Link } from "react-router-dom";

export default function ChangePassword() {
  return (
    <>
      <section className="hero-section full-screen gray-light-bg">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 col-md-7 col-lg-6 col-xl-8 d-none d-lg-block">
              <div
                className="bg-cover vh-100 ml-n3 background-img"
                style={{ background: "url(/assets/img/hero-bg-3.jpg)" }}
              >
                <div className="position-absolute login-signup-content">
                  <div className="position-relative text-white col-md-12 col-lg-7">
                    <h2 className="text-white">Change Your Password</h2>
                    <p className="lead">
                      Keep your face always toward the sunshine - and shadows
                      will fall behind you. Continually pursue fully researched
                      niches whereas timely platforms. Credibly parallel task
                      optimal catalysts for change after focused catalysts for
                      change.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5 col-lg-6 col-xl-4 px-lg-6">
              <div className="login-signup-wrap px-4 px-lg-5 my-5">
                <h1 className="text-center mb-1">Change Password</h1>

                <p className="text-muted text-center mb-5">
                  Enter your new password
                </p>

                <form className="login-signup-form">
                  <div className="form-group">
                    <label className="pb-1">New Password</label>
                    <div className="input-group input-group-merge">
                      <div className="input-icon">
                        <span className="ti-lock color-primary"></span>
                      </div>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="New password"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="pb-1">Confirm Password</label>
                    <div className="input-group input-group-merge">
                      <div className="input-icon">
                        <span className="ti-lock color-primary"></span>
                      </div>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <button className="btn btn-lg btn-block solid-btn border-radius mt-4 mb-3">
                    Change Password
                  </button>

                  <div className="text-center">
                    <small className="text-muted text-center">
                      Remember your password? <Link to="/login">Log in</Link>.
                    </small>
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

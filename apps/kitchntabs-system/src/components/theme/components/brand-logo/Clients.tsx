import React from "react";

export default function Clients() {
  return (
    <>
      <div className="client-section mt--80 d-none d-md-block d-lg-block">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="customer-slider-wrap client-section-wrap text-center gray-light-bg shadow-lg p-5">
                <span className="shape-left"></span>
                <span className="shape-right"></span>
                <div className="text-center">
                  <p className="lead">
                    Trusted by over{" "}
                    <strong className="color-secondary font-weight-bold">
                      4,500+
                    </strong>{" "}
                    customers, some of them are here
                  </p>
                </div>
                <ul className="list-inline justify-content-between">
                  <li className="list-inline-item">
                    <img
                      src="/assets/img/client-1-color.png"
                      width="85"
                      alt="client"
                      className="img-fluid"
                    />
                  </li>
                  <li className="list-inline-item">
                    <img
                      src="/assets/img/client-2-color.png"
                      width="85"
                      alt="client"
                      className="img-fluid"
                    />
                  </li>
                  <li className="list-inline-item">
                    <img
                      src="/assets/img/client-3-color.png"
                      width="85"
                      alt="client"
                      className="img-fluid"
                    />
                  </li>
                  <li className="list-inline-item">
                    <img
                      src="/assets/img/client-4-color.png"
                      width="85"
                      alt="client"
                      className="img-fluid"
                    />
                  </li>
                  <li className="list-inline-item">
                    <img
                      src="/assets/img/client-5-color.png"
                      width="85"
                      alt="client"
                      className="img-fluid"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

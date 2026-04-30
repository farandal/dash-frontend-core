import React from "react";

export default function PromoTwo() {
  return (
    <>
      <section className="promo-section mt-5 ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-10">
              <div className="section-heading mb-5">
                <span className="text-uppercase color-secondary sub-title">
                  Key features
                </span>
                <h2 className="mb-6">
                  We Will Helps you to Build Beautiful Websites
                </h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3 col-sm-6 mb-lg-0">
              <div className="card single-promo-card single-promo-hover">
                <div className="card-body">
                  <div className="pb-2">
                    <span className="ti-credit-card icon-md color-secondary"></span>
                  </div>
                  <div className="pt-2 pb-3">
                    <h5>Modular</h5>
                    <p className="text-muted mb-0">
                      All components are built to be used in any combination.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card single-promo-card single-promo-hover mb-lg-0">
                <div className="card-body">
                  <div className="pb-2">
                    <span className="ti-control-record icon-md color-secondary"></span>
                  </div>
                  <div className="pt-2 pb-3">
                    <h5>Responsive</h5>
                    <p className="text-muted mb-0">
                      Quick is optimized to work for most devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card single-promo-card single-promo-hover mb-lg-0">
                <div className="card-body">
                  <div className="pb-2">
                    <span className="ti-vector icon-md color-secondary"></span>
                  </div>
                  <div className="pt-2 pb-3">
                    <h5>Scalable</h5>
                    <p className="text-muted mb-0">
                      Remain consistent while developing new features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="card single-promo-card single-promo-hover mb-lg-0">
                <div className="card-body">
                  <div className="pb-2">
                    <span className="ti-receipt icon-md color-secondary"></span>
                  </div>
                  <div className="pt-2 pb-3">
                    <h5>Customizable</h5>
                    <p className="text-muted mb-0">
                      Change a few variables and the whole theme adapts.
                    </p>
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

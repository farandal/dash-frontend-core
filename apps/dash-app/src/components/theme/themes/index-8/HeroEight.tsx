export default function HeroEight() {
  return (
    <>
      <section className="hero-section hero-section-3 ptb-100">
        <div className="circles">
          <div className="point animated-point-1"></div>
          <div className="point animated-point-2"></div>
          <div className="point animated-point-3"></div>
          <div className="point animated-point-4"></div>
          <div className="point animated-point-5"></div>
          <div className="point animated-point-6"></div>
        </div>
        <div className="container" id="animation-area-1">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 col-md-9 col-lg-7 col-xl-6">
              <div className="hero-content section-title text-center text-lg-left my-5 mt-lg-0">
                <span className="text-uppercase color-secondary font-weight-bold">
                  Best Design Quality
                </span>
                <h1 className="font-weight-bold">
                  We Build Best Apps that Users Love
                </h1>
                <p className="lead">
                  Progressively fashion impactful synergy after covalent quality
                  vectors. Phosfluorescently administrate highly efficient
                  e-business without 24/7 partnerships.{" "}
                </p>
                <div className="action-btn mt-4">
                  <a href="#/" className="btn solid-btn">
                    Get our Services
                  </a>
                </div>
              </div>
            </div>
            <div className="col-9 col-md-7 col-lg-5 offset-xl-1 align-self-sm-end">
              <div className="hero-img position-relative">
                <div className="image-bg-positioning">
                  <img
                    src="/assets/img/app-product.png"
                    alt=""
                    className="img-fluid"
                  />
                </div>
                <div className="animation-item d-none d-md-block d-lg-block">
                  <div className="p-4 w-75 rounded-custom d-flex white-bg hero-animated-card-1">
                    <p className="gr-text-11 mb-0 text-mirage-2">
                      “A better way to manage your sales, team, clients.”
                    </p>
                    <div className="small-card-img ml-3">
                      <img
                        src="/assets/img/team-2.jpg"
                        alt=""
                        width="80px"
                        className="rounded-circle img-fluid"
                      />
                    </div>
                  </div>
                  <div className="p-4 w-75 rounded-custom d-flex secondary-bg hero-animated-card-2">
                    <div className="small-card-img mr-3 text-white">
                      <img
                        src="/assets/img/team-5.jpg"
                        alt=""
                        width="80px"
                        className="rounded-circle img-fluid"
                      />
                    </div>
                    <p className="gr-text-11 mb-0 text-white">
                      “Ensuring the best return on investment for business”
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

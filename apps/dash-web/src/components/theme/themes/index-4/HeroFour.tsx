export default function HeroFour() {
  return (
    <>
      <section className="hero-section hero-section-2 ptb-100">
        <div className="circles">
          <div className="point animated-point-1"></div>
          <div className="point animated-point-2"></div>
          <div className="point animated-point-3"></div>
          <div className="point animated-point-4"></div>
          <div className="point animated-point-5"></div>
          <div className="point animated-point-6"></div>
          <div className="point animated-point-7"></div>
          <div className="point animated-point-8"></div>
          <div className="point animated-point-9"></div>
        </div>
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 col-lg-6">
              <div className="hero-content-left ptb-100 text-white">
                <h1 className="text-white">
                  <span>Best Way to Connect</span> with Your Customers
                </h1>
                <p className="lead">
                  Conveniently generate multifunctional markets and B2C vortals.
                  Uniquely enable inexpensive materials rather than sticky
                  products target multidisciplinary process .
                </p>

                <a href="#contact" className="btn app-store-btn">
                  Contact with us
                </a>
              </div>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="hero-animation-img">
                <img
                  className="img-fluid d-block animation-one"
                  src="/assets/img/hero-animation-04.svg"
                  alt="animation "
                />
                <img
                  className="img-fluid d-none d-lg-block animation-two"
                  src="/assets/img/hero-animation-01.svg"
                  alt="animation "
                  width="120"
                />
                <img
                  className="img-fluid d-none d-lg-block animation-three"
                  src="/assets/img/hero-animation-02.svg"
                  alt="animation "
                  width="120"
                />
                <img
                  className="img-fluid d-none d-lg-block animation-four"
                  src="/assets/img/hero-animation-03.svg"
                  alt="animation "
                  width="230"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

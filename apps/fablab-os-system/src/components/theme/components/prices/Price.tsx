export default function Price({ hasBg }) {
  return (
    <>
      <div className="overflow-hidden">
        <section
          id="pricing"
          className={`package-section ${
            hasBg ? "gray-light-bg" : "background-shape-right"
          } ptb-100`}
        >
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="section-heading text-center mb-5">
                  <h2>
                    Affordable Pricing and Packages <br />
                    Choose your Best One
                  </h2>
                  <p className="lead">
                    Distinctively brand cutting-edge imperatives through
                    synergistic infrastructures customize low-risk high-yield
                    processes rather than user friendly.
                  </p>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md">
                <div className="card text-center single-pricing-pack p-5">
                  <h5 className="mb-2">Basic</h5>
                  <div className="pricing-img mt-3 mb-4">
                    <img
                      src="/assets/img/basic.svg"
                      alt="pricing img"
                      className="img-fluid"
                    />
                  </div>

                  <div className="card-body p-0">
                    <ul className="list-unstyled text-sm pricing-feature-list">
                      <li>5 Users access same time</li>
                      <li>Integrated eCommerce</li>
                      <li>Customization interface</li>
                      <li>Weekly updated</li>
                      <li>24/7 Phone Support</li>
                      <li>Event Analytics</li>
                    </ul>
                    <div className="py-4 border-0 pricing-header">
                      <div className="h1 text-center mb-0 color-secondary">
                        $<span className="price font-weight-bolder">29</span>
                      </div>
                    </div>
                    <a href="#/" className="btn outline-btn" target="_blank">
                      Purchase now
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md">
                <div className="card text-center popular-price single-pricing-pack p-5">
                  <h5 className="mb-2">Standard</h5>
                  <div className="pricing-img mt-3 mb-4">
                    <img
                      src="/assets/img/standard.svg"
                      alt="pricing img"
                      className="img-fluid"
                    />
                  </div>

                  <div className="card-body p-0">
                    <ul className="list-unstyled text-sm pricing-feature-list">
                      <li>10 Users access same time</li>
                      <li>Integrated eCommerce</li>
                      <li>Customization interface</li>
                      <li>Daily updated</li>
                      <li>24/7 Phone Support</li>
                      <li>Event Analytics</li>
                    </ul>
                    <div className="py-4 border-0 pricing-header">
                      <div className="h1 text-center mb-0 color-secondary">
                        $<span className="price font-weight-bolder">145</span>
                      </div>
                    </div>
                    <a href="#/" className="btn solid-btn" target="_blank">
                      Purchase now
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md">
                <div className="card text-center single-pricing-pack p-5">
                  <h5 className="mb-2">Unlimited</h5>
                  <div className="pricing-img mt-3 mb-4">
                    <img
                      src="/assets/img/unlimited.svg"
                      alt="pricing img"
                      className="img-fluid"
                    />
                  </div>

                  <div className="card-body p-0">
                    <ul className="list-unstyled text-sm pricing-feature-list">
                      <li>20 Users access same time</li>
                      <li>Integrated eCommerce</li>
                      <li>Fully Customization interface</li>
                      <li>Free updated</li>
                      <li>24/7 Phone Support</li>
                      <li>Event Analytics</li>
                    </ul>
                    <div className="py-4 border-0 pricing-header">
                      <div className="h1 text-center mb-0 color-secondary">
                        $<span className="price font-weight-bolder">249</span>
                      </div>
                    </div>
                    <a href="#/" className="btn outline-btn" target="_blank">
                      Purchase now
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 text-center">
              <p className="mb-2">
                If you need custom services or Need more?
                <a href="#/" className="color-secondary">
                  {" "}
                  Contact us{" "}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

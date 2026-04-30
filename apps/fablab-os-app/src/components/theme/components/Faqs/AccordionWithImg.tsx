export default function AccordionWithImg() {
  return (
    <>
      <section
        className="download-section pt-100 background-img"
        style={{
          background:
            "url('assets/img/app-hero-bg.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6">
              <div id="accordion-1" className="accordion accordion-faq pb-100">
                <div className="card">
                  <div
                    className="card-header py-4"
                    id="heading-1-1"
                    data-toggle="collapse"
                    role="button"
                    data-target="#collapse-1-1"
                    aria-expanded="false"
                    aria-controls="collapse-1-1"
                  >
                    <h6 className="mb-0">
                      <span className="ti-receipt mr-3"></span> Which license do
                      I need?
                    </h6>
                  </div>
                  <div
                    id="collapse-1-1"
                    className="collapse show"
                    aria-labelledby="heading-1-1"
                    data-parent="#accordion-1"
                  >
                    <div className="card-body">
                      <p>
                        Uniquely leverage other's distinctive infomediaries
                        rather than leveraged supply chains. Continually seize
                        distributed collaboration and idea-sharing whereas user.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div
                    className="card-header py-4"
                    id="heading-1-2"
                    data-toggle="collapse"
                    role="button"
                    data-target="#collapse-1-2"
                    aria-expanded="false"
                    aria-controls="collapse-1-2"
                  >
                    <h6 className="mb-0">
                      <span className="ti-gallery mr-3"></span> How do I get
                      access to a theme?
                    </h6>
                  </div>
                  <div
                    id="collapse-1-2"
                    className="collapse"
                    aria-labelledby="heading-1-2"
                    data-parent="#accordion-1"
                  >
                    <div className="card-body">
                      <p>
                        Rapidiously incentivize virtual e-commerce and
                        exceptional e-tailers. Progressively network focused
                        catalysts for change without orthogonal benefits.
                        Dramatically empower.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div
                    className="card-header py-4"
                    id="heading-1-3"
                    data-toggle="collapse"
                    role="button"
                    data-target="#collapse-1-3"
                    aria-expanded="false"
                    aria-controls="collapse-1-3"
                  >
                    <h6 className="mb-0">
                      <span className="ti-wallet mr-3"></span> How do I see
                      previous orders?
                    </h6>
                  </div>
                  <div
                    id="collapse-1-3"
                    className="collapse"
                    aria-labelledby="heading-1-3"
                    data-parent="#accordion-1"
                  >
                    <div className="card-body">
                      <p>
                        Proactively monetize long-term high-impact innovation
                        and scalable relationships. Dynamically mesh
                        principle-centered functionalities before
                        next-generation best practices. Distinctively empower.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="download-img d-flex align-items-end">
                <img
                  src="/assets/img/image-13.png"
                  alt="download"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

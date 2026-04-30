import React from "react";

export default function Accordion({ Title }) {
  return (
    <>
      <section className={`container accordions ${Title ? "ptb-100" : ""}`}>
        {Title ? (
          <div className="row">
            <div className="col-lg-8 col-md-9">
              <div className="section-heading mb-5">
                <h2>Frequently Asked Questions</h2>
                <p className="lead">
                  Quickly morph client-centric results through performance based
                  applications. Proactively facilitate professional human
                  capital for cutting-edge.
                </p>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="row">
          <div className="col-lg-6">
            <div id="accordion-1" className="accordion accordion-faq">
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
                    <span className="ti-receipt mr-3 color-secondary"></span>
                    Which license do I need?
                  </h6>
                </div>
                <div
                  id="collapse-1-1"
                  className="collapse"
                  aria-labelledby="heading-1-1"
                  data-parent="#accordion-1"
                >
                  <div className="card-body">
                    <p>
                      Uniquely leverage other's distinctive infomediaries rather
                      than leveraged supply chains. Continually seize
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
                    <span className="ti-gallery mr-3 color-secondary"></span>
                    How do I get access to a theme?
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
                      Rapidiously incentivize virtual e-commerce and exceptional
                      e-tailers. Progressively network focused catalysts for
                      change without orthogonal benefits. Dramatically empower.
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
                    <span className="ti-wallet mr-3 color-secondary"></span> How
                    do I see previous orders?
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
                      Proactively monetize long-term high-impact innovation and
                      scalable relationships. Dynamically mesh
                      principle-centered functionalities before next-generation
                      best practices. Distinctively empower.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div id="accordion-2" className="accordion accordion-faq">
              <div className="card">
                <div
                  className="card-header py-4"
                  id="heading-2-1"
                  data-toggle="collapse"
                  role="button"
                  data-target="#collapse-2-1"
                  aria-expanded="false"
                  aria-controls="collapse-2-1"
                >
                  <h6 className="mb-0">
                    <span className="ti-receipt mr-3 color-secondary"></span>
                    Which license do I need?
                  </h6>
                </div>
                <div
                  id="collapse-2-1"
                  className="collapse"
                  aria-labelledby="heading-2-1"
                  data-parent="#accordion-2"
                >
                  <div className="card-body">
                    <p>
                      Distinctively recaptiualize customer directed channels
                      before installed base communities. Continually
                      disintermediate distinctive web services vis-a-vis team
                      building e-commerce.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  className="card-header py-4"
                  id="heading-2-2"
                  data-toggle="collapse"
                  role="button"
                  data-target="#collapse-2-2"
                  aria-expanded="false"
                  aria-controls="collapse-2-2"
                >
                  <h6 className="mb-0">
                    <span className="ti-lock mr-3 color-secondary"></span> How
                    do I get access to a theme?
                  </h6>
                </div>
                <div
                  id="collapse-2-2"
                  className="collapse"
                  aria-labelledby="heading-2-2"
                  data-parent="#accordion-2"
                >
                  <div className="card-body">
                    <p>
                      Quickly recaptiualize revolutionary meta-services and
                      multimedia based channels. Seamlessly impact diverse
                      deliverables rather than cooperative strategic theme
                      areas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  className="card-header py-4"
                  id="heading-2-3"
                  data-toggle="collapse"
                  role="button"
                  data-target="#collapse-2-3"
                  aria-expanded="false"
                  aria-controls="collapse-2-3"
                >
                  <h6 className="mb-0">
                    <span className="ti-widget mr-3 color-secondary"></span> How
                    do I see previous orders?
                  </h6>
                </div>
                <div
                  id="collapse-2-3"
                  className="collapse"
                  aria-labelledby="heading-2-3"
                  data-parent="#accordion-2"
                >
                  <div className="card-body">
                    <p>
                      Efficiently supply B2B networks vis-a-vis best-of-breed
                      schemas. Dramatically parallel task reliable technology
                      with cross functional core competencies.
                      Phosfluorescently.
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

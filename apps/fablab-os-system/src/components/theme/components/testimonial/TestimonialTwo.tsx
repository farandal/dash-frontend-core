import React from "react";
import OwlCarousel from "react-owl-carousel";

export default function TestimonialTwo({ hasBg }) {
  const options = {
    loop: false,
    margin: 30,
    items: 1,
    nav: true,
    dots: false,
    responsiveClass: true,
    autoplay: false,
    autoplayHoverPause: true,
    lazyLoad: true,
  };
  return (
    <>
      <section
        className={`testimonial-section ptb-100 ${
          hasBg ? "gray-light-bg " : ""
        }`}
      >
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-md-6">
              <div className="section-heading mb-5">
                {hasBg ? (
                  <span className="text-uppercase color-secondary sub-title">
                    Our Trusted Clients
                  </span>
                ) : (
                  ""
                )}
                <h2>What Clients Say About Us</h2>
                <p className="lead">
                  Rapidiously morph transparent internal or "organic" sources
                  whereas resource sucking e-business. Conveniently innovate
                  compelling internal.
                </p>

                <div className="client-section-wrap d-flex flex-row align-items-center">
                  <ul className="list-inline">
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
                        src="/assets/img/client-6-color.png"
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
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <OwlCarousel
                className="owl-carousel owl-theme client-testimonial arrow-indicator"
                {...options}
              >
                <div className="item">
                  <div className="testimonial-quote-wrap">
                    <div className="media author-info mb-3">
                      <div className="author-img mr-3">
                        <img
                          src="/assets/img/client-1.jpg"
                          alt="client"
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="media-body">
                        <h5 className="mb-0">John Charles</h5>
                        <span>Google</span>
                      </div>
                    </div>
                    <div className="client-say">
                      <p>
                        <img
                          src="/assets/img/quote.png"
                          alt="quote"
                          className="img-fluid"
                        />
                        Interactively optimize fully researched expertise
                        vis-a-vis plug-and-play relationships. Intrinsicly
                        develop viral core competencies for fully tested
                        customer service. Enthusiastically create
                        next-generation growth strategies and.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimonial-quote-wrap">
                    <div className="media author-info mb-3">
                      <div className="author-img mr-3">
                        <img
                          src="/assets/img/client-2.jpg"
                          alt="client"
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="media-body">
                        <h5 className="mb-0">Arabella Ora</h5>
                        <span>Amazon</span>
                      </div>
                    </div>
                    <div className="client-say">
                      <p>
                        <img
                          src="/assets/img/quote.png"
                          alt="quote"
                          className="img-fluid"
                        />
                        Rapidiously develop user friendly growth strategies
                        after extensive initiatives. Conveniently grow
                        innovative benefits through fully tested deliverables.
                        Rapidiously utilize focused platforms through end-to-end
                        schemas.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimonial-quote-wrap">
                    <div className="media author-info mb-3">
                      <div className="author-img mr-3">
                        <img
                          src="/assets/img/client-1.jpg"
                          alt="client"
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="media-body">
                        <h5 className="mb-0">Jeremy Jere</h5>
                        <span>Themetags</span>
                      </div>
                    </div>
                    <div className="client-say">
                      <p>
                        <img
                          src="/assets/img/quote.png"
                          alt="quote"
                          className="img-fluid"
                        />
                        Objectively synthesize client-centered e-tailers for
                        maintainable channels. Holisticly administrate customer
                        directed vortals whereas tactical functionalities.
                        Energistically monetize reliable imperatives through
                        client-centric best practices. Collaboratively.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="testimonial-quote-wrap">
                    <div className="media author-info mb-3">
                      <div className="author-img mr-3">
                        <img
                          src="/assets/img/client-1.jpg"
                          alt="client"
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="media-body">
                        <h5 className="mb-0">John Charles</h5>
                        <span>Google</span>
                      </div>
                    </div>
                    <div className="client-say">
                      <p>
                        <img
                          src="/assets/img/quote.png"
                          alt="quote"
                          className="img-fluid"
                        />
                        Enthusiastically innovate B2C data without
                        clicks-and-mortar convergence. Monotonectally deliver
                        compelling testing procedures vis-a-vis B2B testing
                        procedures. Competently evisculate integrated resources
                        whereas global processes. Enthusiastically.
                      </p>
                    </div>
                  </div>
                </div>
              </OwlCarousel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

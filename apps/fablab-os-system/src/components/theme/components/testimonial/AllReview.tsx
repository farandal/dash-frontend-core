import React from "react";
import { reviewData } from "../../data";

export default function AllReview() {
  return (
    <>
      <section className="customer-review-section ptb-100 gray-light-bg">
        <div className="container">
          <div className="row">
            {reviewData.map((review) => (
              <div className="col-md-6 col-sm-6 col-lg-6" key={review.id}>
                <div className="testimonial-quote-wrap my-lg-3 my-md-3 rounded white-bg shadow-sm p-5">
                  <div className="client-say">
                    <p>
                      <img
                        src="/assets/img/quote.png"
                        alt="quote"
                        className="img-fluid"
                      />
                      {review.quote}
                    </p>
                  </div>
                  <div className="media author-info mb-3">
                    <div className="author-img mr-3">
                      <img
                        src={review.authImg}
                        alt="client"
                        className="img-fluid rounded-circle"
                      />
                    </div>
                    <div className="media-body">
                      <h5 className="mb-0">{review.authName}</h5>
                      <span>{review.authTitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

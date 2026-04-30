import React from "react";

export default function FaqStatic({ Title, space }) {
  return (
    <>
      <section className={`gray-light-bg  ${space ? "ptb-100" : "pb-60"}`}>
        <div className="container">
          {Title ? (
            <div className="row justify-content-center">
              <div className="col-md-9 col-lg-8">
                <div className="section-heading mb-5 text-center">
                  <h2>Frequently Asked Questions</h2>
                  <p className="lead">
                    Quickly morph client-centric results through performance
                    based applications. Proactively facilitate professional
                    human capital for cutting-edge.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="row">
            <div className="col-md-6">
              <div className="single-faq">
                <h5>How can I pay for this?</h5>
                <p>
                  Intrinsicly implement high standards in strategic theme areas
                  via inexpensive solutions. Assertively conceptualize
                  prospective bandwidth whereas client-based imperatives.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-faq">
                <h5>Is it possible to pay yearly?</h5>
                <p>
                  Assertively iterate user friendly innovation without
                  open-source markets. Monotonectally extend resource sucking
                  manufactured products without high-payoff paradigms.
                  Objectively customize ubiquitous information before
                  economically sound relationships.{" "}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-faq">
                <h5>Do you offer discounts on multiple items?</h5>
                <p>
                  Dramatically target focused testing procedures after holistic
                  ideas. Collaboratively maximize high-payoff ROI and
                  value-added products. Distinctively deliver cooperative
                  collaboration and idea-sharing whereas customized
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-faq">
                <h5>Is VAT included in plan prices?</h5>
                <p>
                  Distinctively simplify high-quality initiatives for highly
                  efficient applications. Monotonectally repurpose integrated
                  customer service after magnetic e-services.{" "}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-faq">
                <h5>Will I pay more for some features?</h5>
                <p>
                  Enthusiastically pontificate resource-leveling supply chains
                  whereas scalable markets. Authoritatively streamline resource
                  maximizing methods of empowerment
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="single-faq">
                <h5>Why are there no limits on the number of messages?</h5>
                <p>
                  Assertively target turnkey ideas for market-driven portals.
                  Appropriately e-enable world-class intellectual capital
                  whereas 2.0 mindshare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

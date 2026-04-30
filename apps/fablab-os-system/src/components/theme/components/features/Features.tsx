import React from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";

// Import images as modules
import Image11 from "@app/assets/img/image-11.png";

const Features = () => {
  const translate = useTranslate();

  return (
    <>
      <div className="overflow-hidden">
        <section id="features" className="about-us ptb-100 background-shape-img">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-7 col-md-8">
                <div className="section-heading text-center">
                  <h2>{translate('landing.features.title')}</h2>
                  <p className="lead">{translate('landing.features.subtitle')}</p>
                </div>
              </div>
            </div>
            <div className="row align-items-center justify-content-between">
              <div className="col-md-7">
                <div className="about-content-left section-heading">
                  <div className="single-feature mb-4 mt-5">
                    <div className="icon-box-wrap d-flex align-items-center mb-2">
                      <div className="mr-3 icon-box">
                        <span style={{ fontSize: '2rem' }}>{translate('landing.features.independence.icon')}</span>
                      </div>
                      <div>
                        <h5>{translate('landing.features.independence.title')}</h5>
                        <p className="mb-0">{translate('landing.features.independence.description')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="single-feature mb-4">
                    <div className="icon-box-wrap mb-2 d-flex align-items-center">
                      <div className="mr-3 icon-box">
                        <span style={{ fontSize: '2rem' }}>{translate('landing.features.unifiedExperience.icon')}</span>
                      </div>
                      <div>
                        <h5>{translate('landing.features.unifiedExperience.title')}</h5>
                        <p className="mb-0">{translate('landing.features.unifiedExperience.description')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="single-feature mb-4">
                    <div className="icon-box-wrap mb-2 d-flex align-items-center">
                      <div className="mr-3 icon-box">
                        <span style={{ fontSize: '2rem' }}>{translate('landing.features.visibility.icon')}</span>
                      </div>
                      <div>
                        <h5>{translate('landing.features.visibility.title')}</h5>
                        <p className="mb-0">{translate('landing.features.visibility.description')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="single-feature mb-4">
                    <div className="icon-box-wrap mb-2 d-flex align-items-center">
                      <div className="mr-3 icon-box">
                        <span style={{ fontSize: '2rem' }}>{translate('landing.features.onlineSales.icon')}</span>
                      </div>
                      <div>
                        <h5>{translate('landing.features.onlineSales.title')}</h5>
                        <p className="mb-0">{translate('landing.features.onlineSales.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="about-content-right">
                  <img
                    src={Image11}
                    alt="KitchnTabs Features"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Features;

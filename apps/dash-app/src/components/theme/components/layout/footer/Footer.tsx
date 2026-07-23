import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";

export default function Footer({ space }) {
  const translate = useTranslate();
  const panelSettings = useSelector((state: any) => state.common.panelSettings);
  const horizontalLogo = panelSettings?.horizontalLogo;
  return (
    <>
      <footer className="footer-section">
        <div
          className={`footer-top background-img-2 pt-60`}
          style={{
            background:
              "url('assets/img/footer-bg.png') no-repeat center top / cover",
          }}
        >
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-md-12 col-lg-4 mb-4 mb-md-4 mb-sm-4 mb-lg-0">
                <div className="footer-nav-wrap text-white">
                  {typeof horizontalLogo === "string" ? (
                    <img
                      src={horizontalLogo}
                      width="120"
                      alt="footer logo"
                      className="img-fluid mb-3"
                    />
                  ) : (
                    horizontalLogo || (
                      <img
                        src="/assets/img/logo-white-1x.png"
                        alt="footer logo"
                        width="120"
                        className="img-fluid mb-3"
                      />
                    )
                  )}
                  <p>
                    {translate('landing.footer.description')}
                  </p>
                </div>
              </div>
              <div className="col-md-12 col-lg-8">
                <div className="row">
                  <div className="col-sm-6 col-md-4 col-lg-4">
                    <div className="footer-nav-wrap text-white">
                      <h5 className="mb-3 text-white">{translate('landing.footer.contact')}</h5>
                      <ul className="list-unstyled support-list">
                        <li className="mb-2 d-flex align-items-center">
                          <span className="ti-email mr-2"></span>
                          <a href="mailto:info@dash.com">
                            {" "}
                            info@dash.com
                          </a>
                        </li>
                        <li className="mb-2 d-flex align-items-center">
                          <span className="ti-world mr-2"></span>
                          <a href="https://www.dash.com"> www.dash.com</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom border-gray-light mt-5 py-3">
            <div className="container">
              <div className="row">
                <div className="col-md-6 col-lg-7">
                  <div className="copyright-wrap small-text">
                    <p className="mb-0 text-white">
                      {translate('landing.footer.copyright')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

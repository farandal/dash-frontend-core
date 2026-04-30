import React from "react";

export default function PageHeader({ PageTitle, HeaderTitle, Parent }) {
  return (
    <>
      <section
        className="hero-section ptb-100 background-img"
        style={{
          background:
            " url('assets/img/hero-bg-1.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-9 col-lg-7">
              <div className="page-header-content text-white text-center pt-sm-5 pt-md-5 pt-lg-0">
                <h1 className="text-white mb-0">{HeaderTitle}</h1>
                <div className="custom-breadcrumb">
                  <ol className="breadcrumb d-inline-block bg-transparent list-inline py-0">
                    <li className="list-inline-item breadcrumb-item">
                      <a href="#/">Home</a>
                    </li>
                    <li className="list-inline-item breadcrumb-item">
                      <a href="#/">{Parent}</a>
                    </li>
                    <li className="list-inline-item breadcrumb-item active">
                      {PageTitle}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

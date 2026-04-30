import React from "react";

export default function Pagination({ hasBg }) {
  return (
    <>
      <section className={`pagination ${hasBg ? "gray-light-bg pb-100" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <nav className="custom-pagination-nav mt-4">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <a className="page-link" href="#/">
                      <span className="ti-angle-left"></span>
                    </a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#/">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#/">
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#/">
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#/">
                      4
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#/">
                      <span className="ti-angle-right"></span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

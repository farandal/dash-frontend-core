import { Link } from "react-router-dom";

export default function LatestNewsOne({ bgColor, light }) {
  return (
    <>
      <section id="blog" className={`our-blog-section ptb-100 ${bgColor}`}>
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <div className="section-heading mb-5">
                <h2 className={`${light ? "text-black" : "text-white"}`}>
                  Our Latest News
                </h2>
                <p className="lead">
                  Enthusiastically drive revolutionary opportunities before
                  emerging leadership. Distinctively transform tactical methods
                  of resource sucking core.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="single-blog-card card border-0 shadow-sm">
                <span className="category position-absolute badge badge-pill badge-primary">
                  Lifestyle
                </span>
                <img
                  src="/assets/img/blog/1.jpg"
                  className="card-img-top position-relative"
                  alt="blog"
                />
                <div className="card-body">
                  <div className="post-meta mb-2">
                    <ul className="list-inline meta-list">
                      <li className="list-inline-item">Jan 21, 2019</li>
                      <li className="list-inline-item">
                        <span>45</span> Comments
                      </li>
                      <li className="list-inline-item">
                        <span>10</span> Share
                      </li>
                    </ul>
                  </div>
                  <h3 className="h5 card-title">
                    <Link to="/blog-details">
                      Appropriately productize fully
                    </Link>
                  </h3>
                  <p className="card-text text-dark">
                    Some quick example text to build on the card title and make
                    up the bulk.
                  </p>
                  <Link to="/blog-details" className="detail-link">
                    Read more <span className="ti-arrow-right"></span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="single-blog-card card border-0 shadow-sm">
                <span className="category position-absolute badge badge-pill badge-danger">
                  Technology
                </span>
                <img
                  src="/assets/img/blog/2.jpg"
                  className="card-img-top position-relative"
                  alt="blog"
                />
                <div className="card-body">
                  <div className="post-meta mb-2">
                    <ul className="list-inline meta-list">
                      <li className="list-inline-item">May 26, 2019</li>
                      <li className="list-inline-item">
                        <span>30</span> Comments
                      </li>
                      <li className="list-inline-item">
                        <span>5</span> Share
                      </li>
                    </ul>
                  </div>
                  <h3 className="h5 card-title">
                    <Link to="/blog-details">Quickly formulate backend</Link>
                  </h3>
                  <p className="card-text text-dark">
                    Synergistically engage effective ROI after customer directed
                    partnerships.
                  </p>
                  <Link to="/blog-details" className="detail-link">
                    Read more <span className="ti-arrow-right"></span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="single-blog-card card border-0 shadow-sm">
                <span className="category position-absolute badge badge-pill badge-info">
                  Science
                </span>
                <img
                  src="/assets/img/blog/3.jpg"
                  className="card-img-top"
                  alt="blog"
                />
                <div className="card-body">
                  <div className="post-meta mb-2">
                    <ul className="list-inline meta-list">
                      <li className="list-inline-item">Apr 25, 2019</li>
                      <li className="list-inline-item">
                        <span>41</span> Comments
                      </li>
                      <li className="list-inline-item">
                        <span>30</span> Share
                      </li>
                    </ul>
                  </div>
                  <h3 className="h5 card-title">
                    <Link to="/blog-details">Objectively extend extensive</Link>
                  </h3>
                  <p className="card-text text-dark">
                    Holisticly mesh open-source leadership rather than proactive
                    users.
                  </p>
                  <Link to="/blog-details" className="detail-link">
                    Read more <span className="ti-arrow-right"></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import React from "react";
import { blogData } from "../../data";
import { Link } from "react-router-dom";

export default function BlogCard() {
  return (
    <>
      <section className="our-blog-section pt-100 gray-light-bg">
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <div className="section-heading mb-5">
                <h2>Our Latest News</h2>
                <p>
                  Enthusiastically drive revolutionary opportunities before
                  emerging leadership. Distinctively transform tactical methods
                  of empowerment via resource sucking core.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {blogData.map((data) => (
              <div className="col-md-4">
                <div className="single-blog-card card border-0 shadow-sm">
                  <span className="category position-absolute badge badge-pill badge-primary">
                    {data.category}
                  </span>
                  <img
                    src={data.thumbnail}
                    className="card-img-top position-relative"
                    alt="blog"
                  />
                  <div className="card-body">
                    <div className="post-meta mb-2">
                      <ul className="list-inline meta-list">
                        <li className="list-inline-item">{data.date}</li>
                        <li className="list-inline-item">
                          <span>{data.comments}</span> Comments
                        </li>
                        <li className="list-inline-item">
                          <span>{data.share}</span> Share
                        </li>
                      </ul>
                    </div>
                    <h3 className="h5 card-title">
                      <Link to="/blog-details">{data.title}</Link>
                    </h3>
                    <p className="card-text">{data.excerpt} </p>
                    <Link to="/blog-details" className="detail-link">
                      Read more <span className="ti-arrow-right"></span>
                    </Link>
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

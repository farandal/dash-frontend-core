import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <>
      <div className="col-lg-4 col-md-4">
        <div className="sidebar-left pr-4">
          <aside className="widget widget-search">
            <form>
              <input
                className="form-control"
                type="search"
                placeholder="Type Search Words"
              />
              <button className="search-button" type="submit">
                <span className="ti-search"></span>
              </button>
            </form>
          </aside>

          <aside className="widget widget-categories">
            <div className="widget-title">
              <h6>Categories</h6>
            </div>
            <ul>
              <li>
                <a href="#/">
                  Journey <span className="float-right">112</span>
                </a>
              </li>
              <li>
                <a href="#/">
                  Development <span className="float-right">86</span>
                </a>
              </li>
              <li>
                <a href="#/">
                  Sport <span className="float-right">10</span>
                </a>
              </li>
              <li>
                <a href="#/">
                  Photography <span className="float-right">144</span>
                </a>
              </li>
              <li>
                <a href="#/">
                  Symphony <span className="float-right">18</span>
                </a>
              </li>
            </ul>
          </aside>

          <aside className="widget widget-recent-entries-custom">
            <div className="widget-title">
              <h6>Recent Posts</h6>
            </div>
            <ul>
              <li className="clearfix">
                <div className="wi">
                  <Link to="/blog-details">
                    <img
                      src="/assets/img/blog/1.jpg"
                      alt="recent post"
                      className="img-fluid rounded"
                    />
                  </Link>
                </div>
                <div className="wb">
                  <Link to="/blog-details">
                    Map where your photos were taken and discover local points.
                  </Link>
                  <span className="post-date">May 8, 2016</span>
                </div>
              </li>
              <li className="clearfix">
                <div className="wi">
                  <Link to="/blog-details">
                    <img
                      src="/assets/img/blog/2.jpg"
                      alt="recent post"
                      className="img-fluid rounded"
                    />
                  </Link>
                </div>
                <div className="wb">
                  <Link to="/blog-details">
                    Map where your photos were taken and discover local points.
                  </Link>
                  <span className="post-date">May 8, 2016</span>
                </div>
              </li>
              <li className="clearfix">
                <div className="wi">
                  <a href="#/">
                    <img
                      src="/assets/img/blog/3.jpg"
                      alt="recent post"
                      className="img-fluid rounded"
                    />
                  </a>
                </div>
                <div className="wb">
                  <Link to="/blog-details">
                    Map where your photos were taken and discover local points.
                  </Link>
                  <span className="post-date">May 8, 2016</span>
                </div>
              </li>
            </ul>
          </aside>

          <aside className="widget widget-categories">
            <div className="widget-title">
              <h6>Newsletter</h6>
            </div>
            <p>Enter your email address below to subscribe to my newsletter</p>
            <form
              action="#//"
              method="post"
              className="d-none d-md-block d-lg-block"
            >
              <input
                type="text"
                className="form-control input"
                id="email-footer"
                name="email"
                placeholder="info@yourdomain.com"
              />
              <button
                type="submit"
                className="btn solid-btn btn-block btn-not-rounded mt-3"
              >
                Subscribe
              </button>
            </form>
          </aside>

          <aside className="widget widget-tag-cloud">
            <div className="widget-title">
              <h6>Tags</h6>
            </div>
            <div className="tag-cloud">
              <a href="#//">e-commerce</a>
              <a href="#//">portfolio</a>
              <a href="#//">responsive</a>
              <a href="#//">bootstrap</a>
              <a href="#//">business</a>
              <a href="#//">corporate</a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

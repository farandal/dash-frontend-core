import React from "react";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";

export default function BlogPost() {
  return (
    <>
      <div className="col-lg-8 col-md-8">
        <article className="post">
          <div className="post-preview">
            <Link to="/blog-details">
              <img src="/assets/img/blog/2-w.jpg" alt="blog" />
            </Link>
          </div>
          <div className="post-wrapper">
            <div className="post-header">
              <h2 className="post-title">
                <Link to="/blog-details">
                  Objectively communicate business core competencies{" "}
                </Link>
              </h2>
              <ul className="post-meta">
                <li>November 18, 2016</li>
                <li>
                  <Link to="/blog-details">Branding</Link>,{" "}
                  <Link to="/blog-details">Design</Link>
                </li>
                <li>
                  <Link to="/blog-details">3 Comments</Link>
                </li>
              </ul>
            </div>
            <div className="post-content">
              <p>
                Just then her head struck against the roof of the hall in fact
                she was now more than nine feet high and she at once took up the
                little golden key and hurried off to the garden door. The first
                question of course was, how to get dry again: they had a
                consultation about this, and after a few minutes it seemed quite
                natural to Alice to find herself talking familiarly with them.
              </p>
            </div>
            <div className="post-more pt-4 align-items-center d-flex">
              <Link to="/blog-details" className="btn solid-btn">
                Read more <span className="ti-arrow-right"></span>
              </Link>
            </div>
          </div>
        </article>

        <article className="post">
          <div className="post-preview">
            <Link to="/blog-details">
              <img src="/assets/img/blog/3-w.jpg" alt="blog" />
            </Link>
          </div>
          <div className="post-wrapper">
            <div className="post-header">
              <h2 className="post-title">
                <Link to="/blog-details">
                  Objectively communicate business core competencies{" "}
                </Link>
              </h2>
              <ul className="post-meta">
                <li>November 18, 2016</li>
                <li>
                  <Link to="/blog-details">Branding</Link>,{" "}
                  <Link to="/blog-details">Design</Link>
                </li>
                <li>
                  <Link to="/blog-details">3 Comments</Link>
                </li>
              </ul>
            </div>
            <div className="post-content">
              <p>
                Just then her head struck against the roof of the hall in fact
                she was now more than nine feet high and she at once took up the
                little golden key and hurried off to the garden door. The first
                question of course was, how to get dry again: they had a
                consultation about this, and after a few minutes it seemed quite
                natural to Alice to find herself talking familiarly with them.
              </p>
            </div>
            <div className="post-more pt-4 align-items-center d-flex">
              <Link to="/blog-details" className="btn solid-btn">
                Read more <span className="ti-arrow-right"></span>
              </Link>
            </div>
          </div>
        </article>

        <article className="post">
          <div className="post-preview">
            <Link to="/blog-details">
              <img src="/assets/img/blog/4-w.jpg" alt="blog" />
            </Link>
          </div>
          <div className="post-wrapper">
            <div className="post-header">
              <h2 className="post-title">
                <Link to="/blog-details">
                  Objectively communicate business core competencies{" "}
                </Link>
              </h2>
              <ul className="post-meta">
                <li>November 18, 2016</li>
                <li>
                  <Link to="/blog-details">Branding</Link>,{" "}
                  <Link to="/blog-details">Design</Link>
                </li>
                <li>
                  <Link to="/blog-details">3 Comments</Link>
                </li>
              </ul>
            </div>
            <div className="post-content">
              <p>
                Just then her head struck against the roof of the hall in fact
                she was now more than nine feet high and she at once took up the
                little golden key and hurried off to the garden door. The first
                question of course was, how to get dry again: they had a
                consultation about this, and after a few minutes it seemed quite
                natural to Alice to find herself talking familiarly with them.
              </p>
            </div>
            <div className="post-more pt-4 align-items-center d-flex">
              <Link to="/blog-details" className="btn solid-btn">
                Read more <span className="ti-arrow-right"></span>
              </Link>
            </div>
          </div>
        </article>
        <Pagination />
      </div>
    </>
  );
}

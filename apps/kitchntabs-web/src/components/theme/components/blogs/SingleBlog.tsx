import React from "react";
import Comments from "./Comments";
import Sidebar from "./Sidebar";

export default function SingleBlog() {
  return (
    <>
      <div className="module ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-8">
              <article className="post">
                <div className="post-preview">
                  <img
                    src="/assets/img/blog/1-w.jpg"
                    alt="article"
                    className="img-fluid"
                  />
                </div>
                <div className="post-wrapper">
                  <div className="post-header">
                    <h1 className="post-title">Minimalist Chandelier</h1>
                    <ul className="post-meta">
                      <li>November 18, 2016</li>
                      <li>
                        In <a href="#/">Branding</a>, <a href="#/">Design</a>
                      </li>
                      <li>
                        <a href="#/">3 Comments</a>
                      </li>
                    </ul>
                  </div>
                  <div className="post-content">
                    <p>
                      Meh synth Schlitz, tempor duis single-origin coffee ea
                      next level ethnic fingerstache fanny pack nostrud. Seitan
                      High Life reprehenderit consectetur cupidatat kogi about
                      me. Photo booth anim 8-bit hella, PBR 3 wolf moon beard
                      Helvetica. Salvia esse nihil, flexitarian Truffaut synth
                      art party deep v chillwave. Seitan High Life reprehenderit
                      consectetur cupidatat kogi.
                    </p>
                    <p>
                      Exercitation photo booth stumptown tote bag Banksy, elit
                      small batch freegan sed. Craft beer elit seitan
                      exercitation, photo booth et 8-bit kale chips proident
                      chillwave deep v laborum. Aliquip veniam delectus, Marfa
                      eiusmod Pinterest in do umami readymade swag. Selfies
                      iPhone Kickstarter, drinking vinegar jean shorts fixie
                      consequat flexitarian four loko.
                    </p>
                    <blockquote className="blockquote">
                      <p>
                        To be yourself in a world that is constantly trying to
                        make you something else is the greatest accomplishment.
                      </p>
                      <footer className="blockquote-footer">
                        Amanda Pollock, Google Inc.
                      </footer>
                    </blockquote>
                    <p>
                      Meh synth Schlitz, tempor duis single-origin coffee ea
                      next level ethnic fingerstache fanny pack nostrud. Seitan
                      High Life reprehenderit consectetur cupidatat kogi about
                      me. Photo booth anim 8-bit hella, PBR 3 wolf moon beard
                      Helvetica.
                    </p>
                    <p>
                      Meh synth Schlitz, tempor duis single-origin coffee ea
                      next level ethnic fingerstache fanny pack nostrud. Seitan
                      High Life reprehenderit consectetur cupidatat kogi about
                      me. Photo booth anim 8-bit hella, PBR 3 wolf moon beard
                      Helvetica. Salvia esse nihil, flexitarian Truffaut synth
                      art party deep v chillwave. Seitan High Life reprehenderit
                      consectetur cupidatat kogi.
                    </p>
                    <ol>
                      <li>Digital Strategy</li>
                      <li>Software Development</li>
                      <li>Interaction Design</li>
                    </ol>
                    <p>
                      Meh synth Schlitz, tempor duis single-origin coffee ea
                      next level ethnic fingerstache fanny pack nostrud. Seitan
                      High Life reprehenderit consectetur cupidatat kogi about
                      me. Photo booth anim 8-bit hella, PBR 3 wolf moon beard
                      Helvetica.
                    </p>
                    <p>
                      Exercitation photo booth stumptown tote bag Banksy, elit
                      small batch freegan sed. Craft beer elit seitan
                      exercitation, photo booth et 8-bit kale chips proident
                      chillwave deep v laborum. Aliquip veniam delectus, Marfa
                      eiusmod Pinterest in do umami readymade swag. Selfies
                      iPhone Kickstarter, drinking vinegar jean shorts fixie
                      consequat flexitarian four loko.
                    </p>
                  </div>
                  <div className="post-footer">
                    <div className="post-tags">
                      <a href="#/">Lifestyle</a>
                      <a href="#/">Music</a>
                      <a href="#/">News</a>
                      <a href="#/">Travel</a>
                    </div>
                  </div>
                </div>
              </article>

              <Comments />
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}

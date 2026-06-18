import React from "react";

export default function Comments() {
  return (
    <>
      <div className="comments-area mb-5">
        <h5 className="comments-title">3 Comments</h5>
        <div className="comment-list">
          <div className="comment">
            <div className="comment-author">
              <img
                className="avatar img-fluid rounded-circle"
                src="/assets/img/client-2.jpg"
                alt="comment"
              />
            </div>
            <div className="comment-body">
              <div className="comment-meta">
                <div className="comment-meta-author">
                  <a href="#/">Jason Ford</a>
                </div>
                <div className="comment-meta-date">
                  <a href="#/">May 5, 2015 at 4:51 am</a>
                </div>
              </div>
              <div className="comment-content">
                <p>
                  Meh synth Schlitz, tempor duis single-origin coffee ea next
                  level ethnic fingerstache fanny pack nostrud. Seitan High Life
                  reprehenderit consectetur cupidatat kogi about me. Photo booth
                  anim 8-bit hella, PBR 3 wolf moon beard Helvetica.
                </p>
              </div>
              <div className="comment-reply">
                <a href="#/">Reply</a>
              </div>
            </div>

            <div className="children">
              <div className="comment">
                <div className="comment-author">
                  <img
                    className="avatar img-fluid rounded-circle"
                    src="/assets/img/client-3.jpg"
                    alt="comment"
                  />
                </div>
                <div className="comment-body">
                  <div className="comment-meta">
                    <div className="comment-meta-author">
                      <a href="#/">Harry Benson</a>
                    </div>
                    <div className="comment-meta-date">
                      <a href="#/">May 5, 2015 at 4:51 am</a>
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>
                      Meh synth Schlitz, tempor duis single-origin coffee ea
                      next level ethnic fingerstache fanny pack nostrud. Seitan
                      High Life reprehenderit consectetur cupidatat kogi about
                      me. Photo booth anim 8-bit hella.
                    </p>
                  </div>
                  <div className="comment-reply">
                    <a href="#/">Reply</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="comment">
            <div className="comment-author">
              <img
                className="avatar img-fluid rounded-circle"
                src="/assets/img/client-4.jpg"
                alt="comment"
              />
            </div>
            <div className="comment-body">
              <div className="comment-meta">
                <div className="comment-meta-author">
                  <a href="#/">Henry Cain</a>
                </div>
                <div className="comment-meta-date">
                  <a href="#/">May 5, 2015 at 4:51 am</a>
                </div>
              </div>
              <div className="comment-content">
                <p>
                  Meh synth Schlitz, tempor duis single-origin coffee ea next
                  level ethnic fingerstache fanny pack nostrud. Seitan High Life
                  reprehenderit consectetur cupidatat kogi about me. Photo booth
                  anim 8-bit hella, PBR 3 wolf moon beard Helvetica.
                </p>
              </div>
              <div className="comment-reply">
                <a href="#/">Reply</a>
              </div>
            </div>
          </div>
        </div>
        <div className="comment-respond">
          <h5 className="comment-reply-title">Leave a Reply</h5>
          <p className="comment-notes">
            Your email address will not be published. Required fields are marked
          </p>
          <form className="comment-form row">
            <div className="form-group col-md-4">
              <input className="form-control" type="text" placeholder="Name" />
            </div>
            <div className="form-group col-md-4">
              <input className="form-control" type="text" placeholder="Email" />
            </div>
            <div className="form-group col-md-4">
              <input
                className="form-control"
                type="url"
                placeholder="Website"
              />
            </div>
            <div className="form-group col-md-12">
              <textarea
                className="form-control"
                rows="8"
                placeholder="Comment"
              ></textarea>
            </div>
            <div className="form-submit col-md-12">
              <button className="btn solid-btn" type="submit">
                Post Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

import React, { useState } from "react";

import { Link } from "react-router-dom";
import VideoModal from "../others/VideoModal";

export default function VideoPromoTwo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <section
        id="download"
        className="video-promo ptb-100 background-img"
        style={{
          background:
            "url('assets/img/video-bg.jpg')no-repeat center center / cover",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="video-promo-content mt-4 text-center">
                <Link
                  to="#"
                  className="popup-youtube video-play-icon d-inline-block"
                >
                  <span
                    className="ti-control-play"
                    onClick={() => setIsOpen(true)}
                  ></span>{" "}
                </Link>
                <h5 className="mt-4 text-white">Watch video overview</h5>

                <div className="download-btn mt-5">
                  <a href="#/" className="btn google-play-btn mr-3">
                    <span className="ti-android"></span> Google Play
                  </a>
                  <a href="#/" className="btn app-store-btn">
                    <span className="ti-apple"></span> App Store
                  </a>
                </div>
              </div>
            </div>
          </div>
          <VideoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      </section>
    </>
  );
}

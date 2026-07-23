export default function HeroFive() {
  return (
    <>
      <section className="hero-section position-relative min-vh-100 background-video-overly flex-column d-flex justify-content-center">
        <video
          className="fit-cover w-100 h-100 position-absolute z--1"
          autoPlay
          muted
          loop
          id="myVideo"
        >
          <source
            src="https://corporx.themetags.com/corporate.mp4"
            type="video/mp4"
          />
        </video>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-8 col-lg-8">
              <div className="hero-content-left text-white text-center mt-5 ptb-100">
                <h1 className="text-white">
                  Build Anything that You Want
                </h1>
                <p className="lead">
                  We offer Digital Marketing / SEO in Kalawad Road Rajkot,
                  Gujarat. Find here details infomediaries whereas performance
                  based about our company.{" "}
                </p>

                <a href="/" className="btn google-play-btn">
                  Contact with us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

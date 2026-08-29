import { Link } from "react-router-dom";
import "./LandingScreen.css";
import FeaturedFlowers from "../Components/Flowers/FeaturedFlowers";
import About from "../Components/About/About";
import FrequentlyAskedQuestions from "../Components/FAQ/FrequentlyAskedQuestions";
import Contact from "../Components/Contact/Contact";

function LandingScreen() {
  return (
    <div className="landing-screen">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-color">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            BloomBox Florals
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item ">
                <a className="nav-link" href="#">
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Flowers
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  About
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  FAQs
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Contact
                </a>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-danger">
                Login
              </Link>

              <Link to="/signup" className="btn btn-danger">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero-section position-relative">
        <img
          src="src/assets/images/bloombox-florals.jpg"
          alt="BloomBox Florals"
          className="img-fluid w-100 hero-image"
        />

        <div className="hero-text position-absolute text-white">
          <h1>Bloom for every moment.</h1>

          <p>
            From gifting bouquets to grand events, make every corner bloom with
            life.
          </p>
          <Link to="/login" className="btn btn-danger btn-lg text-white">
            Browse Flowers
          </Link>
        </div>
      </section>

      <section className="categories-section">
        <div className="categories-header mt-5 text-center">
          <p>Bloom for Every Occasion</p>
          <h3>Find the perfect bouquet for every special moment.</h3>
        </div>

        <div className="categories-layout mt-5 mb-5">
          {/* LEFT SIDE */}
          <div className="category-column">
            <div className="category-card">
              <img alt="Birthdays" />

              <div className="category-overlay"></div>

              <h3>Birthdays</h3>
            </div>

            <div className="category-card">
              <img alt="Wedding" />

              <div className="category-overlay"></div>

              <h3>Wedding</h3>
            </div>
          </div>
          <div className="category-card category-featured">
            <img alt="Grand Celebrations" />

            <div className="category-overlay"></div>

            <h3>Grand Celebrations</h3>
          </div>

          <div className="category-column">
            <div className="category-card">
              <img alt="Anniversary" />

              <div className="category-overlay"></div>

              <h3>Anniversary</h3>
            </div>

            <div className="category-card">
              <img alt="Graduation" />

              <div className="category-overlay"></div>

              <h3>Graduation</h3>
            </div>
          </div>
        </div>
      </section>
      <FeaturedFlowers />
      <About />
      <FrequentlyAskedQuestions />
      <Contact />
    </div>
  );
}

export default LandingScreen;

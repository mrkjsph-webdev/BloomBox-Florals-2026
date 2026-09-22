import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./LandingScreen.css";
import heroImage from "../assets/bloombox-florals.jpg";
import sunflowerImage from "../assets/bouquet.png";
import birthdaysImage from "../assets/birthday.png";
import weddingImage from "../assets/wedding.jpeg";
import grandCelebrationsImage from "../assets/celebration.jpg";
import FeaturedFlowers from "./FeaturedFlowers";
import About from "./About";
import FrequentlyAskedQuestions from "./FrequentlyAskedQuestions";
import Contact from "./Contact";

function LandingScreen() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("bloom-box-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("bloom-box-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={`landing-screen${darkMode ? " dark-mode" : ""}`}>
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
            <ul className="navbar-nav me-auto">
              <li className="nav-item ">
                <a className="nav-link" href="#home">
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#flowers">
                  Flowers
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#faqs">
                  FAQs
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>

            <div className="navbar-actions d-flex flex-wrap align-items-center gap-2">
              <button
                className="theme-toggle"
                type="button"
                onClick={() => setDarkMode((enabled) => !enabled)}
                aria-pressed={darkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? "☀ Light" : "☾ Dark"}
              </button>
              <Link to="/login" className="btn btn-outline-danger">
                Login
              </Link>

              <Link to="/signup" className="btn gold-button">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="hero-section position-relative" id="home">
        <img
          src={heroImage}
          alt="BloomBox Florals"
          className="img-fluid w-100 hero-image"
        />

        <img
          src={sunflowerImage}
          alt="Sunflower"
          className="hero-sunflower"
        />

        <div className="hero-text position-absolute text-white">
          <h1>Bloom for every moment.</h1>

          <p>
            From gifting bouquets to grand events, make every corner bloom with
            life.
          </p>
          <Link to="/login" className="btn gold-button btn-lg">
            Browse Flowers
          </Link>
        </div>
      </section>

      <section className="categories-section" id="occasions">
        <div className="categories-header text-center">
          <p>Bloom for Every Occasion</p>
          <h3>Find the perfect bouquet for every special moment.</h3>
        </div>

        <div className="categories-layout">
          {/* LEFT SIDE */}
          <div className="category-column">
            <div className="category-card">
              <img src={birthdaysImage} alt="Birthdays" />

              <div className="category-overlay"></div>

              <h3>Birthdays</h3>
            </div>

            <div className="category-card">
              <img src={weddingImage} alt="Wedding" />

              <div className="category-overlay"></div>

              <h3>Wedding</h3>
            </div>
          </div>
          <div className="category-card category-featured">
            <img src={grandCelebrationsImage} alt="Grand Celebrations" />

            <div className="category-overlay"></div>

            <h3>Grand Celebrations</h3>
          </div>

          <div className="category-column">
            <div className="category-card">
              <img src="https://i.pinimg.com/736x/41/64/c1/4164c1316a47685d85f4ee6e769056c3.jpg "alt="Anniversary" />

              <div className="category-overlay"></div>

              <h3>Anniversary</h3>
            </div>

            <div className="category-card">
              <img src="https://www.sarinasflorist.com.au/images/products/large/nif7gujtzh.jpg"alt="Graduation" />

              <div className="category-overlay"></div>

              <h3>Graduation</h3>
            </div>
          </div>
        </div>
      </section>
      <FeaturedFlowers />
      <About />
      <div id="faqs">
        <FrequentlyAskedQuestions />
      </div>
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}

export default LandingScreen;

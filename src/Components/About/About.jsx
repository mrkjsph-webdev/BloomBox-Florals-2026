import "./About.css";

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-image">
        <img src="" alt="BloomBox Florals team" />
      </div>

      <div className="about-content">
        <p className="about-label">About BloomBox Florals</p>

        <h2>Flowers Made Personal</h2>

        <p className="about-description">
          BloomBox Florals makes it simple to create a bouquet that feels
          uniquely yours. Choose from our selection of beautiful flowers and
          create an arrangement made for every special moment.
        </p>

        <div className="mission-vision">

          <div className="mission">
            <h3>Our Mission</h3>

            <p>
              To make flower gifting more personal and meaningful by giving
              everyone the freedom to create a bouquet that reflects their
              feelings and the moments they celebrate.
            </p>
          </div>

          <div className="vision">
            <h3>Our Vision</h3>

            <p>
              To become a trusted floral destination where creativity,
              personalization, and the beauty of flowers come together to
              make every moment bloom.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;
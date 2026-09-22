import "./Contact.css";

function Contact() {
  return (
    <section className="contact-section">

      {/* ================= HEADER ================= */}

      <div className="contact-header">
        <h2>BloomBox Florals</h2>

        <p>
          Let every moment bloom with something beautiful.
        </p>
      </div>


      {/* ================= CONTACT CONTENT ================= */}

      <div className="contact-content">

        {/* NAVIGATION */}

        <div className="contact-column">
          <h3>Navigation</h3>

          <a href="#home">Home</a>
          <a href="#flowers">Flowers</a>
          <a href="#about">About</a>
          <a href="#faqs">FAQs</a>
          <a href="#contact">Contact</a>
        </div>


        {/* CONTACT INFORMATION */}

        <div className="contact-column">
          <h3>Contact Us</h3>

          <p>Email: bloomboxflorals@gmail.com</p>
          <p>Phone: +63 912 345 6789</p>
          <p>Location: Philippines</p>
        </div>


        {/* PRIVACY */}

        <div className="contact-column">
          <h3>Privacy & Policies</h3>

          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>

      </div>


      {/* ================= COPYRIGHT ================= */}

      <div className="contact-bottom">
        <p>
          © 2026 BloomBox Florals. All rights reserved.
        </p>
      </div>

    </section>
  );
}

export default Contact;
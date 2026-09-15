import "./Footer.css";

const logo = "/images/fundamentals/logo.png";
const X_logo = "/images/footer/x.png";
const tiktok_logo = "/images/footer/tiktok.webp";
const facebook_logo = "/images/footer/facebook.webp";
const instagram_logo = "/images/footer/instagram.webp";
const quickLinks = ["Home", "Flower Details", "Shopping Cart", "Track Order"];
const contactInfo = ["(603) 555-0123", "Dasmarinas City, Cavite", "bloom.box@email.com"];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={logo} alt="BloomBox Florals" className="footer-logo" />

        <p>Bloom for every moment.</p>

        <div className="footer-socials">
          <img src={X_logo} alt="X" />
          <img src={tiktok_logo} alt="TikTok" />
          <img src={facebook_logo} alt="Facebook" />
          <img src={instagram_logo} alt="Instagram" />
        </div>
      </div>

      <div className="footer-column">
        <h4>Quick Links</h4>
        {quickLinks.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>

      <div className="footer-column">
        <h4>Contact</h4>
        {contactInfo.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>

      <div className="footer-bottom">
        <p>©2026 BloomBox. All rights reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
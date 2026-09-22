import "./Footer.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import logo from "../assets/fundamentals/logo.png";
import X_logo from "../assets/footer/x.png";
import tiktok_logo from "../assets/footer/tiktok.webp";
import facebook_logo from "../assets/footer/facebook.webp";
import instagram_logo from "../assets/footer/instagram.webp";

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
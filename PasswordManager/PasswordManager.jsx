import { Link } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./password-manager.css";

function PasswordManager() {
  return (
    <main className="password-page">
      <header className="password-header"><Link to="/" className="password-brand">BloomBox <span>Florals</span></Link><Link to="/home" className="password-dashboard-link">Back to dashboard</Link></header>
      <section className="password-banner"><h1>My Account</h1><p><Link to="/">Home</Link> / <strong>Password Manager</strong></p></section>
      <section className="password-layout">
        <aside className="password-menu" aria-label="Account menu"><Link to="/profile">Personal Information</Link><Link to="/orders">My Orders</Link><Link to="/address">Address</Link><Link to="/payment-methods">Payment Methods</Link><Link className="active" to="/password-manager">Password Manager</Link><Link to="/">Logout</Link></aside>
        <div className="password-panel"><p className="password-eyebrow">Account security</p><h2>Password Manager</h2><p className="password-intro">Choose a strong password to help keep your BloomBox account safe.</p>
          <form className="password-form"><label>Current Password*<input type="password" placeholder="Enter current password" /></label><label>New Password*<input type="password" placeholder="Enter new password" /></label><label>Confirm New Password*<input type="password" placeholder="Confirm new password" /></label><p className="password-hint">Use at least 8 characters with a mix of letters, numbers, and symbols.</p><button type="button">Update Password</button></form>
        </div>
      </section>
      <div className="password-contact"><Contact /></div>
    </main>
  );
}

export default PasswordManager;

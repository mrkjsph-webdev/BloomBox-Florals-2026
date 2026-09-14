import { Link } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./profile.css";

function Profile() {
  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-brand">BloomBox <span>Florals</span></Link>
        <Link to="/home" className="profile-dashboard-link">Back to dashboard</Link>
      </header>

      <section className="profile-banner">
        <h1>My Account</h1>
        <p><Link to="/">Home</Link> / <strong>My Account</strong></p>
      </section>

      <section className="profile-layout">
        <aside className="account-menu" aria-label="Account menu">
          <Link className="active" to="/profile">Personal Information</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/address">Address</Link>
          <Link to="/payment-methods">Payment Methods</Link>
          <Link to="/password-manager">Password Manager</Link>
          <Link to="/">Logout</Link>
        </aside>

        <div className="profile-form-panel" id="profile-form">
          <div className="profile-form-heading">
            <span className="profile-avatar" aria-hidden="true">MB</span>
            <div><p className="profile-eyebrow">Personal Information</p><h2>My Profile</h2></div>
          </div>
          <form className="profile-form">
            <div className="profile-form-row">
              <label>First Name*<input type="text" defaultValue="Maria" /></label>
              <label>Last Name*<input type="text" defaultValue="Bloom" /></label>
            </div>
            <label>Email*<input type="email" defaultValue="maria@example.com" /></label>
            <label>Phone Number*<input type="tel" defaultValue="+63 912 345 6789" /></label>
            <label>Gender*
              <select defaultValue="Prefer not to say"><option>Female</option><option>Male</option><option>Prefer not to say</option></select>
            </label>
            <button className="profile-submit" type="button">Save Profile</button>
          </form>
        </div>
      </section>

      <div className="profile-contact"><Contact /></div>
    </main>
  );
}

export default Profile;

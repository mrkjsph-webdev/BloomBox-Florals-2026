import { Link } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./address.css";

function Address() {
  return (
    <main className="address-page">
      <header className="address-header"><Link to="/" className="address-brand">BloomBox <span>Florals</span></Link><Link to="/home" className="address-dashboard-link">Back to dashboard</Link></header>
      <section className="address-banner"><h1>My Account</h1><p><Link to="/">Home</Link> / <strong>Address</strong></p></section>
      <section className="address-layout">
        <aside className="address-menu" aria-label="Account menu"><Link to="/profile">Personal Information</Link><Link to="/orders">My Orders</Link><Link className="active" to="/address">Address</Link><Link to="/payment-methods">Payment Methods</Link><Link to="/password-manager">Password Manager</Link><Link to="/">Logout</Link></aside>
        <div className="address-panel"><p className="address-eyebrow">Delivery details</p><h2>My Address</h2><p className="address-intro">Keep your delivery information up to date for a smooth and thoughtful arrival.</p>
          <form className="address-form"><div className="address-form-row"><label>First Name*<input defaultValue="Maria" /></label><label>Last Name*<input defaultValue="Bloom" /></label></div><label>Street Address*<input defaultValue="24 Sampaguita Street" /></label><div className="address-form-row"><label>City*<input defaultValue="Makati" /></label><label>Postal Code*<input defaultValue="1200" /></label></div><div className="address-form-row"><label>Province*<input defaultValue="Metro Manila" /></label><label>Country*<select defaultValue="Philippines"><option>Philippines</option><option>Singapore</option><option>United States</option></select></label></div><label>Phone Number*<input type="tel" defaultValue="+63 912 345 6789" /></label><button type="button">Save Address</button></form>
        </div>
      </section>
      <div className="address-contact"><Contact /></div>
    </main>
  );
}

export default Address;

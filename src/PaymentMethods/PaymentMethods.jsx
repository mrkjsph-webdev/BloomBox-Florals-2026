import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./payment-methods.css";
function PaymentMethods() {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState("card");
  function handleLogout() {
    // Clear all session-based data, including the BouquetCustomizer mini-cart
    sessionStorage.clear();

    // Remove the logged-in client
    localStorage.removeItem("client");

    // Notify other components that the login status changed
    window.dispatchEvent(new Event("loginStatusChanged"));

    // Return to the landing page
    navigate("/");
  }
  return (
    <main className="payment-page">
      {" "}
      <header className="payment-header">
        {" "}
        <Link to="/" className="payment-brand">
          {" "}
          BloomBox <span>Florals</span>{" "}
        </Link>{" "}
        <Link to="/home" className="payment-dashboard-link">
          {" "}
          Back to dashboard{" "}
        </Link>{" "}
      </header>{" "}
      <section className="payment-banner">
        {" "}
        <h1>My Account</h1>{" "}
        <p>
          {" "}
          <Link to="/">Home</Link> / <strong>Payment Methods</strong>{" "}
        </p>{" "}
      </section>{" "}
      <section className="payment-layout">
        {" "}
        <aside className="payment-menu" aria-label="Account menu">
          {" "}
          <Link to="/profile"> Personal Information </Link>{" "}
          <Link to="/orders"> My Orders </Link>{" "}
          <Link to="/address"> Address </Link>{" "}
          <Link className="active" to="/payment-methods">
            {" "}
            Payment Methods{" "}
          </Link>{" "}
          <Link to="/password-manager"> Password Manager </Link>{" "}
          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            {" "}
            Logout{" "}
          </button>{" "}
        </aside>{" "}
        <div className="payment-panel">
          {" "}
          <p className="payment-eyebrow">Secure checkout</p>{" "}
          <h2>Payment Methods</h2>{" "}
          <p className="payment-intro">
            {" "}
            Manage the cards and payment details you use when sending a
            beautiful arrangement.{" "}
          </p>{" "}
          <div className="saved-methods">
            {" "}
            <div className="saved-card">
              {" "}
              <div>
                {" "}
                <strong>Visa ending in 4242</strong>{" "}
                <span>Expires 08/28</span>{" "}
              </div>{" "}
              <span className="default-label">Default</span>{" "}
              <button type="button"> Remove </button>{" "}
            </div>{" "}
            <div className="saved-card">
              {" "}
              <div>
                {" "}
                <strong>GCash</strong>{" "}
                <span>Mobile number ending in 6789</span>{" "}
              </div>{" "}
              <button type="button"> Remove </button>{" "}
            </div>{" "}
          </div>{" "}
          <form className="payment-form">
            {" "}
            <h3>Add a payment method</h3>{" "}
            <div className="payment-options">
              {" "}
              <label className="payment-option">
                {" "}
                <input
                  type="radio"
                  name="payment-method"
                  value="card"
                  checked={paymentType === "card"}
                  onChange={() => setPaymentType("card")}
                />{" "}
                Card{" "}
              </label>{" "}
              <label className="payment-option">
                {" "}
                <input
                  type="radio"
                  name="payment-method"
                  value="gcash"
                  checked={paymentType === "gcash"}
                  onChange={() => setPaymentType("gcash")}
                />{" "}
                GCash{" "}
              </label>{" "}
            </div>{" "}
            {paymentType === "card" ? (
              <>
                {" "}
                <label>
                  {" "}
                  Cardholder Name* <input defaultValue="Maria Bloom" />{" "}
                </label>{" "}
                <label>
                  {" "}
                  Card Number*{" "}
                  <input
                    inputMode="numeric"
                    defaultValue="4242 4242 4242 4242"
                  />{" "}
                </label>{" "}
                <div className="payment-form-row">
                  {" "}
                  <label>
                    {" "}
                    Expiry Date* <input defaultValue="08/28" />{" "}
                  </label>{" "}
                  <label>
                    {" "}
                    CVV* <input type="password" defaultValue="123" />{" "}
                  </label>{" "}
                </div>{" "}
              </>
            ) : (
              <label>
                {" "}
                GCash Mobile Number*{" "}
                <input type="tel" placeholder="09XX XXX XXXX" />{" "}
              </label>
            )}{" "}
            <button type="button"> Add Payment Method </button>{" "}
          </form>{" "}
        </div>{" "}
      </section>{" "}
      <div className="payment-contact">
        {" "}
        <Contact />{" "}
      </div>{" "}
    </main>
  );
}
export default PaymentMethods;

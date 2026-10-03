import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./payment-methods.css";

const API_URL = "http://localhost/bbf_clientdb/payment_methods.php";

function PaymentMethods() {
  const navigate = useNavigate();

  const [paymentType, setPaymentType] = useState("cash");
  const [gcashNumber, setGcashNumber] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadPaymentMethods() {
    const storedClient = JSON.parse(localStorage.getItem("client") || "null");

    if (!storedClient?.client_id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          client_id: storedClient.client_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentMethods(data.payment_methods || []);
      } else {
        setError(data.message || "Unable to load payment methods.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the database.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPaymentMethod() {
    const storedClient = JSON.parse(localStorage.getItem("client") || "null");

    if (!storedClient?.client_id) {
      setError("Please log in first.");
      return;
    }

    setMessage("");
    setError("");

    if (paymentType === "gcash") {
      const cleanedNumber = gcashNumber.replace(/\D/g, "");

      if (cleanedNumber.length !== 11) {
        setError("Please enter a valid 11-digit GCash mobile number.");
        return;
      }
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          client_id: storedClient.client_id,
          payment_type: paymentType,
          gcash_number: paymentType === "gcash" ? gcashNumber : "",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Unable to add payment method.");
        return;
      }

      setMessage("Payment method added successfully.");

      setGcashNumber("");
      setPaymentType("cash");

      loadPaymentMethods();
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the database.");
    }
  }

  async function handleRemovePaymentMethod(paymentId) {
    const storedClient = JSON.parse(localStorage.getItem("client") || "null");

    if (!storedClient?.client_id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this payment method?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove",
          client_id: storedClient.client_id,
          payment_id: paymentId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Unable to remove payment method.");
        return;
      }

      setMessage("Payment method removed successfully.");

      loadPaymentMethods();
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the database.");
    }
  }

  function handleLogout() {
    sessionStorage.clear();
    localStorage.removeItem("client");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/");
  }

  return (
    <main className="payment-page">
      <header className="payment-header">
        <Link to="/home" className="payment-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="payment-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="payment-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/">Home</Link> / <strong>Payment Methods</strong>
        </p>
      </section>

      <section className="payment-layout">
        <aside className="payment-menu" aria-label="Account menu">
          <Link to="/profile">Personal Information</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/address">Address</Link>

          <Link className="active" to="/payment-methods">
            Payment Methods
          </Link>

          <Link to="/password-manager">Password Manager</Link>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </aside>

        <div className="payment-panel">
          <p className="payment-eyebrow">Secure checkout</p>

          <h2>Payment Methods</h2>

          <p className="payment-intro">
            Manage the payment methods you use when sending a beautiful
            arrangement.
          </p>

          {message && <p className="payment-success">{message}</p>}

          {error && <p className="payment-error">{error}</p>}

          <div className="saved-methods">
            {loading ? (
              <p>Loading payment methods...</p>
            ) : paymentMethods.length === 0 ? (
              <p>No saved payment methods yet.</p>
            ) : (
              paymentMethods.map((method) => (
                <div className="saved-card" key={method.payment_id}>
                  <div>
                    <strong>
                      {method.payment_type === "cash" ? "Cash" : "GCash"}
                    </strong>

                    <span>
                      {method.payment_type === "gcash"
                        ? `Mobile number ending in ${method.gcash_last_four}`
                        : "Pay with cash upon delivery"}
                    </span>
                  </div>

                  {Number(method.is_default) === 1 && (
                    <span className="default-label">Default</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemovePaymentMethod(method.payment_id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            className="payment-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleAddPaymentMethod();
            }}
          >
            <h3>Add a payment method</h3>

            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment-method"
                  value="cash"
                  checked={paymentType === "cash"}
                  onChange={() => {
                    setPaymentType("cash");
                    setError("");
                  }}
                />
                Cash
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment-method"
                  value="gcash"
                  checked={paymentType === "gcash"}
                  onChange={() => {
                    setPaymentType("gcash");
                    setError("");
                  }}
                />
                GCash
              </label>
            </div>

            {paymentType === "cash" ? (
              <div className="payment-cash-info">
                <strong>Cash on Delivery</strong>
                <br />
                <span>
                  Pay for your order in cash when your bouquet is delivered.
                </span>
              </div>
            ) : (
              <label>
                GCash Mobile Number*
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="09XX XXX XXXX"
                  value={gcashNumber}
                  onChange={(event) => setGcashNumber(event.target.value)}
                />
              </label>
            )}

            <button type="submit">Add Payment Method</button>
          </form>
        </div>
      </section>

      <div className="payment-contact">
        <Contact />
      </div>
    </main>
  );
}

export default PaymentMethods;

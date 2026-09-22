import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Contact from "../LandingPage/Contact";
import "./password-manager.css";

function PasswordManager() {
  const navigate = useNavigate();

  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  useEffect(() => {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      return;
    }

    const client = JSON.parse(storedClient);

    if (client.firebase_uid || client.google_id) {
      setIsGoogleAccount(true);
    }
  }, []);

  async function handleUpdatePassword() {
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      setMessage("You are not logged in.");
      return;
    }

    const client = JSON.parse(storedClient);

    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/update_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: client.client_id,
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setMessage("");
        setShowSuccessModal(true);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Password update error:", error);
      setMessage("Unable to connect to the server.");
    }
  }

  return (
    <main className="password-page">
      <header className="password-header">
        <Link to="/" className="password-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="password-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="password-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/">Home</Link> / <strong>Password Manager</strong>
        </p>
      </section>

      <section className="password-layout">
        <aside className="password-menu" aria-label="Account menu">
          <Link to="/profile">Personal Information</Link>

          <Link to="/orders">My Orders</Link>

          <Link to="/address">Address</Link>

          <Link to="/payment-methods">Payment Methods</Link>

          <Link className="active" to="/password-manager">
            Password Manager
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </aside>

        <div className="password-panel">
          <p className="password-eyebrow">Account security</p>

          <h2>Password Manager</h2>

          <p className="password-intro">
            Choose a strong password to help keep your BloomBox account safe.
          </p>

          {isGoogleAccount ? (
            <p className="password-hint">
              Your account uses Google sign-in. Password management is not
              available for Google accounts.
            </p>
          ) : (
            <form
              className="password-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleUpdatePassword();
              }}
            >
              <label>
                Current Password*
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>

              <label>
                New Password*
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>

              <label>
                Confirm New Password*
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              <p className="password-hint">
                Use at least 8 characters with a mix of letters, numbers, and
                symbols.
              </p>

              {message && <p className="password-error">{message}</p>}

              <button type="submit">Update Password</button>
            </form>
          )}
        </div>
      </section>

      <div className="password-contact">
        <Contact />
      </div>

      {showSuccessModal && (
        <div className="password-modal-overlay">
          <div className="password-success-modal">
            <h2>Password Updated</h2>

            <p>Your password has been updated successfully.</p>

            <button type="button" onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default PasswordManager;

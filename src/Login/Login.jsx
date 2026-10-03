import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showTemporaryPasswordModal, setShowTemporaryPasswordModal] =
    useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [loginType, setLoginType] = useState("user");

  // Show Password
  function handleShowPassword(event) {
    setShowPassword(event.target.checked);
  }

  // Email and Password Login
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setForgotMessage("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));

    // Admin Login
    if (loginType === "user" && email === "admin@gmail.com") {
      if (password === "admin123") {
        navigate("/admin");
      } else {
        setError("Invalid email or password.");
      }

      return;
    }

    try {
      const loginUrl =
        loginType === "rider"
          ? "http://localhost/bbf_shippingdb/delivery_rider_login.php"
          : "http://localhost/bbf_clientdb/login.php";

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseText = await response.text();

      console.log("Login PHP response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid JSON returned by login PHP:", responseText);

        setError("The server returned an invalid response.");

        return;
      }

      if (data.success) {
        if (loginType === "rider") {
          localStorage.setItem("rider", JSON.stringify(data.rider));

          navigate("/delivery-rider");
        } else {
          localStorage.setItem("client", JSON.stringify(data.client));

          navigate("/home");
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError("Unable to connect to the server.");
    }
  }

  // Open Forgot Password Modal
  function openForgotPasswordModal() {
    setError("");
    setForgotMessage("");
    setForgotEmail("");
    setShowForgotModal(true);
  }

  // Close Forgot Password Modal
  function closeForgotPasswordModal() {
    if (forgotLoading) {
      return;
    }

    setShowForgotModal(false);
    setForgotEmail("");
  }

  // Forgot Password
  async function handleForgotPassword(event) {
    event.preventDefault();

    setError("");
    setForgotMessage("");

    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotMessage("Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const forgotPasswordUrl =
        loginType === "rider"
          ? "http://localhost/bbf_shippingdb/delivery_rider_forgot_password.php"
          : "http://localhost/bbf_clientdb/forgot_password.php";

      const response = await fetch(forgotPasswordUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
        }),
      });

      const responseText = await response.text();

      console.log("Forgot password PHP response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Invalid JSON returned by forgot password PHP:",
          responseText,
        );

        setForgotMessage("The server returned an invalid response.");
        return;
      }

      if (!response.ok || !data.success) {
        setForgotMessage(data.message || "Unable to reset the password.");

        return;
      }

      setForgotMessage(
        data.message || "Your temporary password has been generated.",
      );

      setTemporaryPassword(data.temporary_password || "");

      setShowForgotModal(false);
      setShowTemporaryPasswordModal(true);
    } catch (error) {
      console.error("Forgot password error:", error);

      setForgotMessage("Unable to connect to the server.");
    } finally {
      setForgotLoading(false);
    }
  }

  // Google Login
  async function handleGoogleLogin() {
    setError("");
    setForgotMessage("");

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const googleProvider = user.providerData.find(
        (provider) => provider.providerId === "google.com",
      );

      const googleId = googleProvider ? googleProvider.uid : "";

      const googleLoginUrl =
        loginType === "rider"
          ? "http://localhost/bbf_shippingdb/delivery_rider_google_login.php"
          : "http://localhost/bbf_clientdb/google_login.php";

      const response = await fetch(googleLoginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          google_id: googleId,
          name: user.displayName,
          email: user.email,
          pfp: user.photoURL,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (loginType === "rider") {
          localStorage.setItem("rider", JSON.stringify(data.rider));

          navigate("/delivery-rider");
        } else {
          localStorage.setItem("client", JSON.stringify(data.client));

          if (user.email === "admin@gmail.com") {
            navigate("/admin");
          } else {
            navigate("/home");
          }
        }
      } else {
        setError(data.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google login error:", error);

      setError("Google login failed. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-heading">
          <h1>BloomBox Florals</h1>

          <p>Welcome back! Log in to your account.</p>

          <div className="login-type-switch">
            <button
              type="button"
              className={
                loginType === "user"
                  ? "login-type-button active"
                  : "login-type-button"
              }
              onClick={() => {
                setLoginType("user");
                setError("");
                setForgotMessage("");
              }}
            >
              <i className="bi bi-person"></i>
              User
            </button>

            <button
              type="button"
              className={
                loginType === "rider"
                  ? "login-type-button active"
                  : "login-type-button"
              }
              onClick={() => {
                setLoginType("rider");
                setError("");
                setForgotMessage("");
              }}
            >
              <i className="bi bi-bicycle"></i>
              Delivery Rider
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email address</label>

            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={handleShowPassword}
              />
              Show Password
            </label>

            <button
              type="button"
              className="forgot-password-button"
              onClick={openForgotPasswordModal}
              disabled={forgotLoading}
            >
              {forgotLoading ? "Processing..." : "Forgot password?"}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          {forgotMessage && <p className="login-success">{forgotMessage}</p>}

          <button type="submit" className="login-submit">
            Log in
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-login"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        <p className="login-signup">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="forgot-modal-overlay">
          <div className="forgot-modal">
            <button
              type="button"
              className="forgot-modal-close"
              onClick={closeForgotPasswordModal}
              disabled={forgotLoading}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="forgot-modal-icon">
              <i className="bi bi-key"></i>
            </div>

            <p className="forgot-modal-eyebrow">PASSWORD RESET</p>

            <h2>Forgot Password?</h2>

            <p className="forgot-modal-message">
              Enter the email address you used to create your BloomBox Florals
              account.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="forgot-modal-field">
                <label htmlFor="forgot-email">Email address</label>

                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={forgotLoading}
                  autoFocus
                  required
                />
              </div>

              {forgotMessage && (
                <p className="forgot-modal-error">{forgotMessage}</p>
              )}

              <div className="forgot-modal-actions">
                <button
                  type="button"
                  className="forgot-modal-cancel"
                  onClick={closeForgotPasswordModal}
                  disabled={forgotLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="forgot-modal-submit"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <span className="forgot-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {showTemporaryPasswordModal && (
        <div className="forgot-modal-overlay">
          <div className="forgot-modal temporary-password-modal">
            <div className="forgot-modal-icon success">
              <i className="bi bi-check-lg"></i>
            </div>

            <p className="forgot-modal-eyebrow">PASSWORD RESET SUCCESSFUL</p>

            <h2>Your Temporary Password</h2>

            <p className="forgot-modal-message">
              Your temporary password has been generated. Use it to log in to
              your BloomBox Florals account.
            </p>

            <div className="temporary-password-box">
              <span>{temporaryPassword}</span>
            </div>

            <p className="temporary-password-note">
              Please save this password before closing this window.
            </p>

            <button
              type="button"
              className="forgot-modal-submit"
              onClick={() => {
                setShowTemporaryPasswordModal(false);
                setTemporaryPassword("");
              }}
            >
              Continue to Login
              <i className="bi bi-check-circle"></i>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;

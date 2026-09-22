import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  // Email and Password Login
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));

    // Admin Login
    if (email === "admin@gmail.com") {
      if (password === "admin123") {
        navigate("/admin");
      } else {
        setError("Invalid email or password.");
      }

      return;
    }

    // Delivery Rider Login
    if (email === "deliveryrider@gmail.com") {
      if (password === "rider123") {
        navigate("/delivery-rider");
      } else {
        setError("Invalid email or password.");
      }

      return;
    }

    try {
      const response = await fetch("http://localhost/bbf_clientdb/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("client", JSON.stringify(data.client));

        if (email === "admin@gmail.com") {
          navigate("/admin");
        } else if (email === "deliveryrider@gmail.com") {
          navigate("/delivery-rider");
        } else {
          navigate("/home");
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    }
  }

  // Google Login
  async function handleGoogleLogin() {
    setError("");

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

      const response = await fetch(
        "http://localhost/bbf_clientdb/google_login.php",
        {
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
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("client", JSON.stringify(data.client));

        if (user.email === "admin@gmail.com") {
          navigate("/admin");
        } else if (user.email === "deliveryrider@gmail.com") {
          navigate("/delivery-rider");
        } else {
          navigate("/home");
        }
      } else {
        setError(data.message);
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
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" name="remember" />
              Remember me
            </label>

            <a href="#forgot-password">Forgot password?</a>
          </div>

          {error && <p className="login-error">{error}</p>}

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
    </main>
  );
}

export default Login;
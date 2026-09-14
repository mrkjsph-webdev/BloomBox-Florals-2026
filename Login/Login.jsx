
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

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

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (user.email === "admin@gmail.com") {
        navigate("/admin");
      } else if (user.email === "deliveryrider@gmail.com") {
        navigate("/delivery-rider");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error(error);

      setError("Invalid email or password.");
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

    console.log("Logged in:", user.email);

    if (user.email === "admin@gmail.com") {
      navigate("/admin");
    } else if (user.email === "deliveryrider@gmail.com") {
      navigate("/delivery-rider");
    } else {
      navigate("/home");
    }

  } catch (error) {
    console.error(error);
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
            <label htmlFor="login-email">
              Email address
            </label>

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
            <label htmlFor="login-password">
              Password
            </label>

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

            <a href="#forgot-password">
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
          >
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
          Don&apos;t have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>

      </div>
    </main>
  );
}

export default Login;

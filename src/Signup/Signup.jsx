import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import "./signup.css";

function Signup() {
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email and Password Signup
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;

    setPasswordsMatch(password === confirmPassword);

    if (password !== confirmPassword) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/signup.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        form.reset();
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Unable to connect to the server.");
    }
  }

  // Google Signup
  async function handleGoogleSignup() {
    setError("");

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const googleProvider = user.providerData.find(
        (provider) => provider.providerId === "google.com"
      );

      const googleId = googleProvider
        ? googleProvider.uid
        : "";

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
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "client",
          JSON.stringify(data.client)
        );

        navigate("/home");
      } else {
        setError(data.message);
      }

    } catch (error) {
      console.error("Google signup error:", error);
      setError("Google signup failed. Please try again.");
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">
        <div className="signup-heading">
          <h1>BloomBox Florals</h1>
          <p>Create your account and start blooming.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="signup-field">
            <label htmlFor="signup-name">
              Full name
            </label>

            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-email">
              Email address
            </label>

            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signup-confirm-password">
              Confirm password
            </label>

            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              minLength="8"
              required
              onChange={() => setPasswordsMatch(true)}
            />

            {!passwordsMatch && (
              <p className="signup-error">
                Passwords do not match.
              </p>
            )}
          </div>

          {error && (
            <p className="signup-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="signup-submit"
          >
            Create account
          </button>
        </form>

        <div className="signup-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-signup"
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </button>

        <p className="signup-login">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
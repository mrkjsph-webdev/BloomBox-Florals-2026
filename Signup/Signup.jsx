import { useState } from "react";
import { Link } from "react-router-dom";
import "./signup.css";

function Signup() {
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;

    setPasswordsMatch(password === confirmPassword);
    if (password !== confirmPassword) {
      return;
    }

    form.reset();
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
            <label htmlFor="signup-name">Full name</label>
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
            <label htmlFor="signup-email">Email address</label>
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
            <label htmlFor="signup-password">Password</label>
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
            <label htmlFor="signup-confirm-password">Confirm password</label>
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
              <p className="signup-error">Passwords do not match.</p>
            )}
          </div>

          <button type="submit" className="signup-submit">
            Create account
          </button>
        </form>

        <p className="signup-login">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;

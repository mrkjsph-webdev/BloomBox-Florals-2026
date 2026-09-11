import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    navigate(String(email).trim().toLowerCase() === "admin@gmail.com" ? "/admin" : "/home");
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

        <button type="submit" className="login-submit">
           Log in
        </button>
       </form>

       <p className="login-signup">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
       </p>
     </div>
    </main>
  );
}

export default Login;

import "./Login.css"; 

function Login() {
  return (
    <div className="Login">
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        
        <div className="text-center mb-4 mt-4">
          <h3 className="fw-bold">BloomBox Florals</h3>
          <p className="text-muted">
            Welcome back! Please login to your account.
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <a href="#" className="text-decoration-none">
            Forgot Password?
          </a>
        </div>

        <button className="btn btn-danger w-100 mb-3">
          Login
        </button>

        <p className="text-center mb-0">
          Don't have an account?{" "}
          <a href="#" className="text-decoration-none fw-semibold">
            Sign Up
          </a>
        </p>

      </div>
    </div>
    </div>
  );
}

export default Login;


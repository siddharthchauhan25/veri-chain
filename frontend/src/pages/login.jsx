import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      if (!data.user) {
        setMessage("Login failed. User data was not received.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "verichain_user",
        JSON.stringify(data.user)
      );

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to Veri Chain backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          V
        </div>

        <h1>Veri Chain</h1>

        <p className="auth-subtitle">
          Secure Identity & Digital Document Verification
        </p>

        <div className="security-label">
          ✓ Blockchain Secured
        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label>Password</label>

          <div className="password-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>

          </div>

          {message && (
            <div className="auth-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>

        </form>

        <p className="switch-auth">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
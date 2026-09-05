import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setSuccess(false);
  };

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) {
      return {
        label: "",
        score: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        score,
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        score,
      };
    }

    return {
      label: "Strong",
      score,
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (name.length < 2) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/register`,
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

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed."
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);

    } catch (error) {
      console.error("Registration error:", error);

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

        <h1>Join Veri Chain</h1>

        <p className="auth-subtitle">
          Create your secure digital identity
        </p>

        <div className="security-label">
          ✓ Your identity. Your control.
        </div>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />

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
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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

          {form.password && (
            <div className="password-strength">

              <div className="strength-bar">

                <div
                  className={`strength-progress strength-${passwordStrength.score}`}
                ></div>

              </div>

              <span>
                Password strength:{" "}
                <strong>
                  {passwordStrength.label}
                </strong>
              </span>

            </div>
          )}

          <label>Confirm Password</label>

          <div className="password-wrapper">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {message && (
            <div
              className={
                success
                  ? "auth-success"
                  : "auth-error"
              }
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="switch-auth">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Leaf,
} from "lucide-react";

import "./Login.css";

const API_URL = "https://heriva-backend.onrender.com/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userRole", data.role);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "VILLAGE_PARTNER") {
        navigate("/partner/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Decorative background */}
      <div className="login-decoration login-decoration-left">
        ❧
      </div>

      <div className="login-decoration login-decoration-right">
        ❧
      </div>

      {/* Login Card */}
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">

          <div className="login-logo-icon">
            ♧
          </div>

          <h1>Made By Her</h1>

          <p>
            Rural Hands. Brighter Tomorrows.
          </p>

        </div>

        {/* Heading */}
        <div className="login-heading">

          <h2>Welcome Back</h2>

          <p>
            Login to continue your journey with Made By Her.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <label className="login-label">
            Email
          </label>

          <div className="login-input-wrapper">

            <UserRound
              size={17}
              className="login-input-icon"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="login-input"
            />

          </div>

          {/* Password */}
          <label className="login-label password-label">
            Password
          </label>

          <div className="login-input-wrapper">

            <Lock
              size={17}
              className="login-input-icon"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="login-input"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>

          </div>

          {/* Forgot password */}
          <div className="forgot-wrapper">

            <button
              type="button"
              className="forgot-password"
            >
              Forgot Password?
            </button>

          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="login-submit"
          >

            {loading
              ? "Logging in..."
              : "Login"}

            {!loading && (
              <ArrowRight size={17} />
            )}

          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">

          <span></span>

          <p>OR</p>

          <span></span>

        </div>

        {/* Signup */}
        <p className="login-signup">

          Don't have an account?

          <Link to="/signup">
            Create Account
          </Link>

        </p>

        {/* Bottom trust */}
        <div className="login-trust">

          <Leaf size={14} />

          <span>
            Handmade • Rural • Real Change
          </span>

        </div>

      </div>

    </div>
  );
}
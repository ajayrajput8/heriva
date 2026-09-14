import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  MapPin,
  Package,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_BASE = "https://heriva-backend.onrender.com/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Invalid admin email or password."
        );
      }

      /*
       * Backend returns:
       * {
       *   userId,
       *   fullName,
       *   email,
       *   role,
       *   token
       * }
       */

      if (!data.token) {
        throw new Error("Login successful, but no authentication token was received.");
      }

      /*
       * IMPORTANT:
       * Only allow ADMIN users into the admin dashboard.
       */

      if (String(data.role).toUpperCase() !== "ADMIN") {
        throw new Error(
          "This account does not have administrator access."
        );
      }

      /*
       * Remember Me:
       *
       * checked    -> localStorage
       * unchecked  -> sessionStorage
       */

      const storage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

      storage.setItem("token", data.token);
      storage.setItem("userRole", data.role);
      storage.setItem("userId", data.userId);
      storage.setItem("userEmail", data.email);
      storage.setItem("userName", data.fullName || "Admin");

      /*
       * Also remove old token from the other storage
       * so there aren't two competing login sessions.
       */

      const otherStorage = rememberMe
        ? window.sessionStorage
        : window.localStorage;

      otherStorage.removeItem("token");
      otherStorage.removeItem("userRole");
      otherStorage.removeItem("userId");
      otherStorage.removeItem("userEmail");
      otherStorage.removeItem("userName");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackToWebsite = () => {
    navigate("/");
  };

  return (
    <div className="admin-login-page">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <section className="admin-login-left">

        {/* Background image */}

        <div className="admin-login-image" />

        {/* Gradient overlay */}

        <div className="admin-login-image-overlay" />


        {/* ===============================================
            BRAND
        =============================================== */}

        <div className="admin-left-brand">

          <div className="admin-brand-logo">
            <span className="logo-leaf logo-leaf-1" />
            <span className="logo-leaf logo-leaf-2" />
            <span className="logo-leaf logo-leaf-3" />
            <span className="logo-stem" />
          </div>

          <div>
            <div className="admin-brand-name">
              Made By Her
            </div>

            <div className="admin-brand-tagline">
              Rural Hands. Brighter Tomorrows.
            </div>
          </div>

        </div>


        {/* ===============================================
            LEFT CONTENT
        =============================================== */}

        <div className="admin-left-content">

          {/* Quote */}

          <div className="admin-left-quote">
            <span>
              “Stronger
            </span>

            <span>
              Women
            </span>

            <span>
              Stronger
            </span>

            <span>
              Communities”
            </span>

            <Heart
              size={36}
              strokeWidth={1.5}
              className="quote-heart"
            />
          </div>


          {/* Main heading */}

          <h1>
            Handmade
            <br />

            <span>
              Stories.
            </span>

            <br />

            <strong>
              Bigger Impact.
            </strong>
          </h1>


          <h2>
            Admin Portal
          </h2>

          <p className="admin-left-description">
            Manage. Support. Scale.
            <br />
            For a brighter tomorrow.
          </p>


          {/* ===============================================
              STATS
          =============================================== */}

          <div className="admin-stats">

            <div className="admin-stat">

              <div className="admin-stat-icon">
                <Users size={25} />
              </div>

              <strong>
                1000+
              </strong>

              <span>
                Women
                <br />
                Empowered
              </span>

            </div>


            <div className="admin-stat-divider" />


            <div className="admin-stat">

              <div className="admin-stat-icon">
                <MapPin size={25} />
              </div>

              <strong>
                50+
              </strong>

              <span>
                Villages
                <br />
                Onboarded
              </span>

            </div>


            <div className="admin-stat-divider" />


            <div className="admin-stat">

              <div className="admin-stat-icon">
                <Package size={25} />
              </div>

              <strong>
                5000+
              </strong>

              <span>
                Handmade
                <br />
                Products
              </span>

            </div>

          </div>

        </div>


        {/* ===============================================
            BOTTOM QUOTE
        =============================================== */}

        <div className="admin-bottom-quote">

          <div className="admin-bottom-decoration">
            ♡
          </div>

          <div>
            <span>
              Real People
            </span>

            <br />

            <span>
              Real Change
            </span>
          </div>

          <Heart
            size={30}
            strokeWidth={1.5}
          />

        </div>


        {/* ===============================================
            IMAGE CAPTION
        =============================================== */}

        <div className="admin-image-caption">

          <div>
            “Empowered Women
            <br />
            Brighter Tomorrows.”
          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <section className="admin-login-right">

        {/* Back to website */}

        <button
          type="button"
          className="back-to-website"
          onClick={goBackToWebsite}
        >
          <ArrowLeft size={19} />
          <span>
            Back to Website
          </span>
        </button>


        {/* ===============================================
            LOGIN CARD
        =============================================== */}

        <div className="admin-login-card">

          {/* Logo */}

          <div className="admin-card-brand">

            <div className="admin-card-logo">
              <span className="card-logo-leaf card-logo-leaf-1" />
              <span className="card-logo-leaf card-logo-leaf-2" />
              <span className="card-logo-leaf card-logo-leaf-3" />
              <span className="card-logo-stem" />
            </div>

            <div>

              <div className="admin-card-brand-name">
                Made By Her
              </div>

              <div className="admin-card-brand-tagline">
                Rural Hands. Brighter Tomorrows.
              </div>

            </div>

          </div>


          {/* Login title */}

          <div className="admin-login-title-area">

            <div className="admin-title-line" />

            <span>
              ADMIN LOGIN
            </span>

            <div className="admin-title-line" />

          </div>


          <h1>
            Welcome Back
          </h1>

          <p className="admin-login-subtitle">
            Sign in to access the Made By Her Admin Dashboard.
          </p>


          {/* ===============================================
              LOGIN FORM
          =============================================== */}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            {/* Error */}

            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}


            {/* EMAIL */}

            <div className="admin-input-group">

              <div className="admin-input-icon">
                <Mail size={23} />
              </div>

              <div className="admin-input-content">

                <label htmlFor="admin-email">
                  Admin Email
                </label>

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="admin-input-group">

              <div className="admin-input-icon">
                <Lock size={23} />
              </div>

              <div className="admin-input-content">

                <label htmlFor="admin-password">
                  Password
                </label>

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

              </div>

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={21} />
                ) : (
                  <Eye size={21} />
                )}
              </button>

            </div>


            {/* REMEMBER / FORGOT */}

            <div className="admin-form-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                <span className="custom-checkbox">
                  {rememberMe && "✓"}
                </span>

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  alert(
                    "Please contact the system administrator to reset your password."
                  );
                }}
              >
                Forgot password?
              </button>

            </div>


            {/* SIGN IN */}

            <button
              type="submit"
              className="admin-signin-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="admin-spinner" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={21} />
                </>
              )}

            </button>

          </form>


          {/* ===============================================
              OR DIVIDER
          =============================================== */}

          <div className="admin-or">

            <div />

            <span>
              OR
            </span>

            <div />

          </div>


          {/* ===============================================
              SECURITY MESSAGE
          =============================================== */}

          <div className="admin-security-box">

            <div className="security-icon">

              <ShieldCheck
                size={28}
              />

            </div>

            <div>

              <strong>
                Authorized Access Only
              </strong>

              <p>
                This is a restricted admin area.
                Please do not share your login credentials.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
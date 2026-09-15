import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Leaf,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

import "./Signup.css";

const API_URL = "https://heriva-backend.onrender.com/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      // Save JWT
      localStorage.setItem("token", data.token);
      
      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // Redirect according to role
      if (data.role === "VILLAGE_PARTNER") {
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
    <div className="signup-page">

      {/* Decorative background */}
      <div className="signup-decoration signup-decoration-left">
        ❧
      </div>

      <div className="signup-decoration signup-decoration-right">
        ❧
      </div>

      {/* Signup Card */}
      <div className="signup-card">

        {/* Logo */}
        <div className="signup-logo">

          <div className="signup-logo-icon">
            ♧
          </div>

          <h1>Made By Her</h1>

          <p>
            Rural Hands. Brighter Tomorrows.
          </p>

        </div>


        {/* Heading */}
        <div className="signup-heading">

          <h2>Create Your Account</h2>

          <p>
            Join our community and support rural women.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <label className="signup-label">
            Full Name
          </label>

          <div className="signup-input-wrapper">

            <UserRound
              size={17}
              className="signup-input-icon"
            />

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="signup-input"
            />

          </div>


          {/* Email */}
          <label className="signup-label signup-field-label">
            Email
          </label>

          <div className="signup-input-wrapper">

            <Mail
              size={17}
              className="signup-input-icon"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="signup-input"
            />

          </div>


          {/* Phone */}
          <label className="signup-label signup-field-label">
            Phone Number
          </label>

          <div className="signup-input-wrapper">

            <Phone
              size={17}
              className="signup-input-icon"
            />

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              className="signup-input"
            />

          </div>


          {/* Password */}
          <label className="signup-label signup-field-label">
            Password
          </label>

          <div className="signup-input-wrapper">

            <Lock
              size={17}
              className="signup-input-icon"
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
              placeholder="Create a password"
              required
              className="signup-input"
            />

            <button
              type="button"
              className="signup-password-toggle"
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


          {/* Account Type */}
          <label className="signup-label signup-account-label">
            Choose Account Type
          </label>


          <div className="signup-role-selection">

            {/* Customer */}
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  role: "CUSTOMER",
                })
              }
              className={`signup-role-card ${
                form.role === "CUSTOMER"
                  ? "signup-role-selected"
                  : ""
              }`}
            >

              <div className="signup-role-title">

                <div className="signup-role-icon signup-customer-icon">
                  <ShoppingBag size={16} />
                </div>

                <strong>
                  Customer
                </strong>

              </div>

              <p>
                Shop beautiful handmade products
                created by rural women.
              </p>

            </button>


            {/* Village Partner */}
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  role: "VILLAGE_PARTNER",
                })
              }
              className={`signup-role-card ${
                form.role === "VILLAGE_PARTNER"
                  ? "signup-role-selected"
                  : ""
              }`}
            >

              <div className="signup-role-title">

                <div className="signup-role-icon signup-partner-icon">
                  <UsersRound size={16} />
                </div>

                <strong>
                  Village Partner
                </strong>

              </div>

              <p>
                Help rural women sell their products
                online and create impact.
              </p>

            </button>

          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="signup-submit"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && (
              <ArrowRight size={17} />
            )}

          </button>

        </form>


        {/* Login */}
        <p className="signup-login">

          Already have an account?

          <Link to="/login">
            Login
          </Link>

        </p>


        {/* Trust */}
        <div className="signup-trust">

          <Leaf size={14} />

          <span>
            Handmade • Rural • Real Change
          </span>

        </div>

      </div>

    </div>
  );
}
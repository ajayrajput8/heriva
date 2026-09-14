import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  UsersRound,
  UploadCloud,
  Heart,
  BarChart3,
  CalendarDays,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./VillagePartnerRegister.css";

const API_URL = "https://heriva-backend.onrender.com/api";

export default function VillagePartnerRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Personal details
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    state: "",
    district: "",
    city: "",
    pincode: "",

    // Village details
    village: "",
    villagePopulation: "",
    womenCount: "",
    womenDetails: "",

    // Motivation
    motivation: "",
    experience: "",
    skills: "",

    // Documents
    aadhaar: "",
    aadhaarFile: null,
    profilePhoto: null,

    // Login
    password: "",
    confirmPassword: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================
  // NEXT STEP
  // ==========================================

  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (
        !form.fullName ||
        !form.gender ||
        !form.dateOfBirth ||
        !form.phone ||
        !form.email ||
        !form.address ||
        !form.state ||
        !form.district ||
        !form.city ||
        !form.pincode
      ) {
        setError("Please fill all required fields.");
        return;
      }
    }

    if (step === 2) {
      if (!form.village || !form.womenCount) {
        setError("Please fill the required village details.");
        return;
      }
    }

    if (step === 3) {
      if (!form.motivation) {
        setError("Please tell us why you want to become a Village Partner.");
        return;
      }
    }

    if (step === 4) {
      if (!form.aadhaar) {
        setError("Please enter your Aadhaar last 4 digits.");
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  const previousStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // ==========================================
  // SUBMIT REGISTRATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "VILLAGE_PARTNER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      // Save login information
      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // Go to partner dashboard
      navigate("/partner-dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP TITLES
  // ==========================================

  const steps = [
    "Personal Details",
    "Village Details",
    "Motivation",
    "Documents",
    "Review & Submit",
  ];

  return (
    <div className="partner-register-page">

      {/* ======================================
          LEFT SIDE
      ====================================== */}

      <section className="partner-register-left">

        <div className="partner-left-content">

          <span className="partner-eyebrow">
            BECOME A VILLAGE PARTNER
          </span>

          <h1>
            Be the Change
            <br />
            in Your <em>Village.</em>
          </h1>

          <p>
            Join Made By Her as a Village Partner and help
            rural women showcase their talent to the world.
            Together, we can create real opportunities.
          </p>


          {/* BENEFITS */}

          <div className="partner-benefits">

            <div className="partner-benefit">

              <span>
                <UsersRound size={23} />
              </span>

              <p>
                Support 5+ Women
                <br />
                Artisans in Your Village
              </p>

            </div>


            <div className="partner-benefit">

              <span>
                <UploadCloud size={23} />
              </span>

              <p>
                Help Upload & Manage
                <br />
                Their Products
              </p>

            </div>


            <div className="partner-benefit">

              <span>
                <BarChart3 size={23} />
              </span>

              <p>
                Earn & Grow Together
              </p>

            </div>


            <div className="partner-benefit">

              <span>
                <Heart size={23} />
              </span>

              <p>
                Be a Part of a
                <br />
                Bigger Movement
              </p>

            </div>

          </div>


          <div className="partner-quote">
            “Stronger
            <br />
            Villages,
            <br />
            Brighter
            <br />
            Tomorrows.”
            <span>♡</span>
          </div>

        </div>


        {/* IMAGE */}

        {/*<div className="partner-register-image">

          <img
            src="/assets/partners-reference.jpg"
            alt="Village Partner"
          />

          <div className="impact-badge">
            <strong>
              Real People.
            </strong>

            <strong>
              Real <em>Impact.</em>
            </strong>
          </div>

        </div>*/}

      </section>


      {/* ======================================
          RIGHT SIDE
      ====================================== */}

      <section className="partner-register-right">

        <div className="registration-card">

          <div className="registration-header">

            <h2>
              Village Partner Registration
            </h2>

            <p>
              Fill in your details to become a Village Partner.
              We'll verify your information and get back to you soon.
            </p>

          </div>


          {/* ==================================
              PROGRESS
          ================================== */}

          <div className="registration-progress">

            {steps.map((title, index) => {

              const number = index + 1;

              return (
                <div
                  className={`progress-step ${
                    step >= number ? "completed" : ""
                  } ${
                    step === number ? "current" : ""
                  }`}
                  key={title}
                >

                  <div className="progress-circle">

                    {step > number ? (
                      <Check size={15} />
                    ) : (
                      number
                    )}

                  </div>

                  <span>
                    {title}
                  </span>

                </div>
              );
            })}

          </div>


          {/* ERROR */}

          {error && (
            <div className="registration-error">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            {/* ==================================
                STEP 1
            ================================== */}

            {step === 1 && (
              <div className="registration-step">

                <h3>
                  Personal Details
                </h3>


                <div className="form-grid">

                  {/* NAME */}

                  <div className="form-field">
                    <label>
                      Full Name <b>*</b>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) =>
                        updateField(
                          "fullName",
                          e.target.value
                        )
                      }
                    />
                  </div>


                  {/* GENDER */}

                  <div className="form-field">

                    <label>
                      Gender <b>*</b>
                    </label>

                    <div className="gender-options">

                      {["Male", "Female", "Other"].map(
                        (gender) => (

                          <label
                            className="radio-option"
                            key={gender}
                          >

                            <input
                              type="radio"
                              name="gender"
                              value={gender}
                              checked={
                                form.gender === gender
                              }
                              onChange={(e) =>
                                updateField(
                                  "gender",
                                  e.target.value
                                )
                              }
                            />

                            <span>
                              {gender}
                            </span>

                          </label>
                        )
                      )}

                    </div>

                  </div>


                  {/* DOB */}

                  <div className="form-field">

                    <label>
                      Date of Birth <b>*</b>
                    </label>

                    <div className="input-icon">

                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) =>
                          updateField(
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                      />

                      <CalendarDays size={17} />

                    </div>

                  </div>


                  {/* PHONE */}

                  <div className="form-field">

                    <label>
                      Phone Number <b>*</b>
                    </label>

                    <div className="phone-input">

                      <span>
                        +91
                      </span>

                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={(e) =>
                          updateField(
                            "phone",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* EMAIL */}

                  <div className="form-field">

                    <label>
                      Email Address <b>*</b>
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* ALTERNATE PHONE */}

                  <div className="form-field">

                    <label>
                      Alternate Phone Number
                      <small> (Optional)</small>
                    </label>

                    <div className="phone-input">

                      <span>
                        +91
                      </span>

                      <input
                        type="tel"
                        placeholder="Enter alternate number"
                        value={form.alternatePhone}
                        onChange={(e) =>
                          updateField(
                            "alternatePhone",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* ADDRESS */}

                  <div className="form-field full-width">

                    <label>
                      Address <b>*</b>
                    </label>

                    <textarea
                      placeholder="House No., Street, Area"
                      value={form.address}
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* STATE */}

                  <div className="form-field">

                    <label>
                      State <b>*</b>
                    </label>

                    <select
                      value={form.state}
                      onChange={(e) =>
                        updateField(
                          "state",
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select State
                      </option>

                      <option value="Rajasthan">
                        Rajasthan
                      </option>

                      <option value="Uttar Pradesh">
                        Uttar Pradesh
                      </option>

                      <option value="Bihar">
                        Bihar
                      </option>

                      <option value="Madhya Pradesh">
                        Madhya Pradesh
                      </option>

                      <option value="Odisha">
                        Odisha
                      </option>

                    </select>

                  </div>


                  {/* DISTRICT */}

                  <div className="form-field">

                    <label>
                      District <b>*</b>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter district"
                      value={form.district}
                      onChange={(e) =>
                        updateField(
                          "district",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* CITY */}

                  <div className="form-field">

                    <label>
                      City/Town <b>*</b>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your city/town"
                      value={form.city}
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* PINCODE */}

                  <div className="form-field">

                    <label>
                      Pincode <b>*</b>
                    </label>

                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter pincode"
                      value={form.pincode}
                      onChange={(e) =>
                        updateField(
                          "pincode",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>
            )}


            {/* ==================================
                STEP 2
            ================================== */}

            {step === 2 && (
              <div className="registration-step">

                <h3>
                  Village Details
                </h3>

                <p className="step-description">
                  Tell us about the village and the women
                  artisans you would like to support.
                </p>


                <div className="form-grid">

                  <div className="form-field full-width">

                    <label>
                      Village Name <b>*</b>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter village name"
                      value={form.village}
                      onChange={(e) =>
                        updateField(
                          "village",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Approx. Village Population
                    </label>

                    <input
                      type="number"
                      placeholder="Enter population"
                      value={form.villagePopulation}
                      onChange={(e) =>
                        updateField(
                          "villagePopulation",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Women Artisans You Know <b>*</b>
                    </label>

                    <input
                      type="number"
                      placeholder="Number of women"
                      value={form.womenCount}
                      onChange={(e) =>
                        updateField(
                          "womenCount",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="form-field full-width">

                    <label>
                      Tell Us About Them
                    </label>

                    <textarea
                      placeholder="What products do they make? What skills do they have?"
                      value={form.womenDetails}
                      onChange={(e) =>
                        updateField(
                          "womenDetails",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>
            )}


            {/* ==================================
                STEP 3
            ================================== */}

            {step === 3 && (
              <div className="registration-step">

                <h3>
                  Motivation
                </h3>

                <p className="step-description">
                  Help us understand why you want to become
                  a Village Partner.
                </p>


                <div className="form-field">

                  <label>
                    Why do you want to become a Village Partner?
                    <b>*</b>
                  </label>

                  <textarea
                    className="large-textarea"
                    placeholder="Tell us about your motivation..."
                    value={form.motivation}
                    onChange={(e) =>
                      updateField(
                        "motivation",
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="form-field">

                  <label>
                    Previous Experience
                  </label>

                  <textarea
                    placeholder="Any experience in business, social work, digital work, etc."
                    value={form.experience}
                    onChange={(e) =>
                      updateField(
                        "experience",
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="form-field">

                  <label>
                    Your Skills
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Digital Marketing, Photography, Sales"
                    value={form.skills}
                    onChange={(e) =>
                      updateField(
                        "skills",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}


            {/* ==================================
                STEP 4
            ================================== */}

            {step === 4 && (
              <div className="registration-step">

                <h3>
                  Documents
                </h3>

                <p className="step-description">
                  Upload the required documents for verification.
                </p>


                <div className="form-field">

                  <label>
                    Aadhaar Last 4 Digits <b>*</b>
                  </label>

                  <input
                    type="text"
                    maxLength="4"
                    placeholder="XXXX"
                    value={form.aadhaar}
                    onChange={(e) =>
                      updateField(
                        "aadhaar",
                        e.target.value
                      )
                    }
                  />

                  <small className="field-note">
                    For security, we only store the last
                    4 digits.
                  </small>

                </div>


                <div className="upload-grid">

                  <label className="upload-box">

                    <UploadCloud size={27} />

                    <strong>
                      Upload Aadhaar
                    </strong>

                    <span>
                      PDF, JPG or PNG
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        updateField(
                          "aadhaarFile",
                          e.target.files[0]
                        )
                      }
                    />

                    {form.aadhaarFile && (
                      <small>
                        {form.aadhaarFile.name}
                      </small>
                    )}

                  </label>


                  <label className="upload-box">

                    <UsersRound size={27} />

                    <strong>
                      Profile Photo
                    </strong>

                    <span>
                      JPG or PNG
                    </span>

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) =>
                        updateField(
                          "profilePhoto",
                          e.target.files[0]
                        )
                      }
                    />

                    {form.profilePhoto && (
                      <small>
                        {form.profilePhoto.name}
                      </small>
                    )}

                  </label>

                </div>


                <div className="form-grid password-section">

                  <div className="form-field">

                    <label>
                      Create Password <b>*</b>
                    </label>

                    <input
                      type="password"
                      placeholder="Create password"
                      value={form.password}
                      onChange={(e) =>
                        updateField(
                          "password",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Confirm Password <b>*</b>
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        updateField(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>
            )}


            {/* ==================================
                STEP 5
            ================================== */}

            {step === 5 && (
              <div className="registration-step">

                <h3>
                  Review & Submit
                </h3>

                <p className="step-description">
                  Please review your information before
                  submitting your application.
                </p>


                <div className="review-section">

                  <div className="review-block">

                    <h4>
                      Personal Details
                    </h4>

                    <div>
                      <span>Name</span>
                      <b>{form.fullName}</b>
                    </div>

                    <div>
                      <span>Gender</span>
                      <b>{form.gender}</b>
                    </div>

                    <div>
                      <span>Phone</span>
                      <b>+91 {form.phone}</b>
                    </div>

                    <div>
                      <span>Email</span>
                      <b>{form.email}</b>
                    </div>

                  </div>


                  <div className="review-block">

                    <h4>
                      Location
                    </h4>

                    <div>
                      <span>Village</span>
                      <b>{form.village}</b>
                    </div>

                    <div>
                      <span>District</span>
                      <b>{form.district}</b>
                    </div>

                    <div>
                      <span>State</span>
                      <b>{form.state}</b>
                    </div>

                    <div>
                      <span>Pincode</span>
                      <b>{form.pincode}</b>
                    </div>

                  </div>


                  <div className="review-block">

                    <h4>
                      Village Information
                    </h4>

                    <div>
                      <span>Women Artisans</span>
                      <b>{form.womenCount}</b>
                    </div>

                    <div>
                      <span>Skills</span>
                      <b>{form.skills || "—"}</b>
                    </div>

                  </div>

                </div>


                <label className="terms-checkbox">

                  <input
                    type="checkbox"
                    required
                  />

                  <span>
                    I confirm that the information provided
                    by me is correct and I agree to the Made
                    By Her Village Partner terms.
                  </span>

                </label>

              </div>
            )}


            {/* ==================================
                BUTTONS
            ================================== */}

            <div className="registration-actions">

              {step > 1 && (
                <button
                  type="button"
                  className="back-btn"
                  onClick={previousStep}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>
              )}


              {step < 5 ? (

                <button
                  type="button"
                  className="next-btn"
                  onClick={nextStep}
                >
                  Next: {steps[step]}
                  <ArrowRight size={17} />
                </button>

              ) : (

                <button
                  type="submit"
                  className="next-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Application"}

                  {!loading && (
                    <ArrowRight size={17} />
                  )}
                </button>

              )}

            </div>

          </form>

        </div>

      </section>

    </div>
  );
}
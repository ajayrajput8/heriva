import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  HandHeart,
  UsersRound,
  WalletCards,
} from "lucide-react";

export default function VillagePartners() {
  const navigate = useNavigate();
  return (
    <div className="standard-page">

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="partner-hero">

        <div>
          <span className="eyebrow">
            VILLAGE PARTNERS
          </span>

          <h1>
            Be the Change
            <br />
            In Your <em>Village.</em>
          </h1>

          <p>
            Join as a Village Partner and help rural women
            access the internet, tell their stories, and sell
            their products.
          </p>

          <button className="primary-btn" onClick={() => navigate("/village-partner/register")}>
            Become a Village Partner
            <ArrowRight size={18} />
          </button>
        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}

      <section className="section">

        <h2>
          How It Works
        </h2>

        <div className="steps">

          {[
            [
              "1",
              "Apply",
              "Fill a simple application form",
            ],
            [
              "2",
              "Onboarding",
              "Get trained & resources",
            ],
            [
              "3",
              "Collaborate",
              "Work with 5 rural women*",
            ],
            [
              "4",
              "Make an Impact",
              "Help them sell online",
            ],
          ].map(([number, title, description]) => (

            <div key={number}>

              <b>
                {number}
              </b>

              <h3>
                {title}
              </h3>

              <p>
                {description}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          WHY JOIN
      ========================= */}

      <section className="partner-why">

        <div className="section">

          <h2>
            Why Join?
          </h2>

          <div className="why-grid">

            {[
              [BriefcaseBusiness, "Be the Change"],
              [HandHeart, "Skill Development"],
              [WalletCards, "Earn Incentives"],
              [UsersRound, "Build Your Network"],
            ].map(([Icon, title]) => (

              <div key={title}>

                <Icon />

                <span>
                  {title}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================
          DASHBOARD PREVIEW
      ========================= */}

      <section className="dashboard-preview section">

        <img
          src="/assets/vp-banner.png"
          alt="Partner dashboard preview"
        />

        <div>

          <h2>
            Together for Stronger Villages.
          </h2>

          <ul>
            <li>
              Easy product management
            </li>

            <li>
              Track orders & earnings
            </li>

            <li>
              Get support from our team
            </li>

            <li>
              Be part of a larger movement
            </li>
          </ul>

          <button className="primary-btn" onClick={() => navigate("/village-partner/register")}>
            Apply Now
            <ArrowRight size={17} />
          </button>

        </div>

      </section>

    </div>
  );
}
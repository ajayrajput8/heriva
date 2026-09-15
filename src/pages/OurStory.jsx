import React from "react";
import {
  Heart,
  Leaf,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export default function OurStory() {
  return (
    <div className="standard-page">

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="story-hero">

        <div>
          <span className="eyebrow">
            OUR STORY
          </span>

          <h1>
            A Movement
            <br />
            Born from <em>Belief.</em>
          </h1>

          <p>
            Heriva is more than a marketplace. It is a
            movement to create opportunities for rural women,
            preserve India's rich craft heritage, and build a
            more equitable future.
          </p>
        </div>

      </section>


      {/* =========================
          OUR JOURNEY
      ========================= */}

      <section className="section journey">

        <h2>
          Our Vision
        </h2>

        <div className="timeline">

          {[
            ["2025", "An idea to create change"],
            ["2026", "First 5 villages onboarded"],
            ["2027", "500+ women empowered"],
            ["2028", "A growing movement"],
          ].map(([year, description]) => (

            <div key={year}>

              <b>
                {year}
              </b>

              <span>
                {description}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          WHAT WE DO
      ========================= */}

      <section className="section what-we-do">

        <h2>
          What We Do
        </h2>

        <div className="values">

          {[
            [UsersRound, "Empower", "Rural Women"],
            [Leaf, "Preserve", "Traditional Crafts"],
            [Heart, "Create", "Market Access"],
            [
              ShieldCheck,
              "Build",
              "Sustainable Livelihoods",
            ],
          ].map(([Icon, title, description]) => (

            <div key={title}>

              <Icon />

              <b>
                {title}
              </b>

              <span>
                {description}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          STORY BAND
      ========================= */}

      <section className="story-band">

        <img
          src="/assets/women-im.png"
          alt="Women together"
        />

        <div>

          <b>
            Handmade Today.
          </b>

          <strong>
            Brighter Tomorrows.
          </strong>

          <button>
            Join Our Journey →
          </button>

        </div>

      </section>

    </div>
  );
}
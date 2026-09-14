import React from "react";
import {
  ArrowRight,
  Heart,
  MapPin,
  UsersRound,
} from "lucide-react";

export default function Impact() {
  return (
    <div className="standard-page">

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="impact-hero">

        <div>
          <span className="eyebrow">
            OUR IMPACT
          </span>

          <h1>
            Real People.
            <br />
            <em>Real Change.</em>
          </h1>

          <p>
            Every purchase creates a ripple effect —
            empowering women, strengthening families
            and building stronger villages.
          </p>
        </div>

      </section>


      {/* =========================
          IMPACT STATS
      ========================= */}

      <section className="section big-stats">

        {[
          [
            UsersRound,
            "80+",
            "Rural Women Empowered",
          ],
          [
            MapPin,
            "40",
            "Villages Onboarded",
          ],
          [
            Heart,
            "200+",
            "Handmade Products Sold",
          ],
          [
            "₹",
            "₹50+ Thousand",
            "Earned by Rural Women",
          ],
        ].map(([Icon, number, title]) => (

          <div key={title}>

            {typeof Icon === "string" ? (
              <b className="rupee">
                {Icon}
              </b>
            ) : (
              <Icon />
            )}

            <strong>
              {number}
            </strong>

            <span>
              {title}
            </span>

          </div>

        ))}

      </section>


      {/* =========================
          VILLAGE PRESENCE
      ========================= */}

      <section className="section presence">

        <div>

          <h2>
            Our Village Presence
          </h2>

          <p>
            We are building a growing network of women
            and young digital partners across India.
          </p>

          <ul>

            <li>
              Rajasthan (12 villages)
            </li>

            <li>
              Uttar Pradesh (8 villages)
            </li>

            <li>
              Bihar (5 villages)
            </li>

            <li>
              Madhya Pradesh (7 villages)
            </li>

            <li>
              Odisha (4 villages)
            </li>

          </ul>

        </div>

        <img
          src="/assets/impact1.png"
          alt="Real stories"
        />

      </section>


      {/* =========================
          IMPACT QUOTE
      ========================= */}

      <section className="impact-quote">

        “When you choose handmade,
        <br />
        you choose a better tomorrow.”

        <button onClick={() => window.location.href = "/shop"}>
          Shop Now
          <ArrowRight size={17} />
        </button>

      </section>

    </div>
  );
}
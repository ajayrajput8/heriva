import React, { useEffect, useState } from "react";
import { ArrowRight, Heart, Leaf, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/products";
import ProductCard from "../components/ProductCard";

const API = "http://localhost:8080/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProducts() {
    try {
      setLoadingFeatured(true);
      setFeaturedError("");

      const response = await fetch(
        `${API}/products/featured`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load featured products."
        );
      }

      const data = await response.json();

      const products = Array.isArray(data)
        ? data
        : data?.content || [];

      setFeatured(products.slice(0, 6));

    } catch (error) {
      console.error(
        "Featured products error:",
        error
      );

      setFeaturedError(
        "Unable to load featured products."
      );

      setFeatured([]);

    } finally {
      setLoadingFeatured(false);
    }
  }

  return (
    <div className="home">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="home-hero">

        <div className="hero-copy">

          <div className="eyebrow">
            HANDMADE &nbsp; • &nbsp; RURAL &nbsp; • &nbsp; REAL CHANGE
          </div>

          <h1>
            More Than
            <br />
            Products,
            <br />
            <span>Brighter Futures.</span>
          </h1>

          <p>
            Beautiful handmade products by rural women,
            <br />
            for a stronger, more independent tomorrow.
          </p>

          <Link
            className="primary-btn"
            to="/shop"
          >
            Shop Now
            <ArrowRight size={19} />
          </Link>

          <div className="hero-trust">

            <span>
              <Leaf />
              100% Handmade
            </span>

            <span>
              <Heart />
              Supports Rural Women
            </span>

            <span>
              <UsersRound />
              Directly from Villages
            </span>

          </div>

        </div>

        <div className="hero-photo">

          <img
            src="/assets/hero1.png"
            alt="Rural artisan woman making a basket"
          />

        </div>

      </section>


      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section className="section categories-section">

        <div className="section-heading">

          <h2>
            Shop by Category
          </h2>

          <Link to="/shop">
            View All Categories
            <ArrowRight size={18} />
          </Link>

        </div>

        <div className="categories">

          {categories.map(([name, img]) => (

            <Link
              className="category"
              to="/shop"
              key={name}
            >

              <span>
                <img
                  src={img}
                  alt=""
                />
              </span>

              <strong>
                {name}
              </strong>

            </Link>

          ))}

          <Link
            className="category all-category"
            to="/shop"
          >

            <span className="all-grid">
              ▦
            </span>

            <strong>
              All Products
            </strong>

          </Link>

        </div>

      </section>


      {/* =====================================================
          FEATURED PRODUCTS
          ===================================================== */}

      <section className="section featured-section">

        <div className="section-heading">

          <h2>
            Featured Products
          </h2>

          <div className="tabs">

            <button className="selected">
              All
            </button>

            <button>
              Bestsellers
            </button>

            <button>
              New Arrivals
            </button>

            <button>
              Under ₹500
            </button>

          </div>

          <Link to="/shop">
            View All
            <ArrowRight size={18} />
          </Link>

        </div>


        {/* ===================================================
            LOADING
            =================================================== */}

        {loadingFeatured && (

          <div className="featured-loading">

            <div className="featured-spinner"></div>

            <span>
              Loading featured products...
            </span>

          </div>

        )}


        {/* ===================================================
            ERROR
            =================================================== */}

        {!loadingFeatured &&
          featuredError && (

          <div className="featured-error">

            <p>
              {featuredError}
            </p>

            <button
              onClick={fetchFeaturedProducts}
            >
              Try Again
            </button>

          </div>

        )}


        {/* ===================================================
            PRODUCTS
            =================================================== */}

        {!loadingFeatured &&
          !featuredError &&
          featured.length > 0 && (

          <div className="product-grid six">

            {featured.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}

          </div>

        )}


        {/* ===================================================
            NO FEATURED PRODUCTS
            =================================================== */}

        {!loadingFeatured &&
          !featuredError &&
          featured.length === 0 && (

          <div className="featured-empty">

            <h3>
              No featured products yet
            </h3>

            <p>
              Check back soon for products
              from our rural women artisans.
            </p>

            <Link
              className="primary-btn small"
              to="/shop"
            >
              Explore Shop
              <ArrowRight size={17} />
            </Link>

          </div>

        )}

      </section>


      {/* =====================================================
          IMPACT
          ===================================================== */}

      <section className="impact-strip">

        <div className="impact-photo">

          <img
            src="/assets/women-im-1.png"
            alt="Women artisans together"
          />

        </div>

        <div className="impact-message">

          <div className="quote">
            “Now I earn, learn and
            <br />
            dream again.”
            <small>
              — Suman, Village Partner
            </small>
          </div>

          <div className="impact-stats">

            <div>
              <b>50+</b>
              <span>
                Rural Women
                <br />
                Empowered
              </span>
            </div>

            <div>
              <b>5</b>
              <span>
                Villages
                <br />
                Onboarded
              </span>
            </div>

            <div>
              <b>1000+</b>
              <span>
                Handmade Products
                <br />
                Sold
              </span>
            </div>

          </div>

          <Link
            className="primary-btn small"
            to="/our-story"
          >
            Our Story
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </div>
  );
}
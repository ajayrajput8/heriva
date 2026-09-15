import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";

const API_BASE = "https://heriva-backend.onrender.com/api";

export default function Shop() {
  const [params] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState(
    params.get("search") || ""
  );

  const [maxPrice, setMaxPrice] = useState(5000);
  const [village, setVillage] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* =========================================================
     PREVENT BACKGROUND SCROLL WHEN FILTER DRAWER IS OPEN
     ========================================================= */

  useEffect(() => {
    document.body.classList.toggle(
      "filters-open",
      filtersOpen
    );

    return () => {
      document.body.classList.remove("filters-open");
    };
  }, [filtersOpen]);

  /* =========================================================
     LOAD PRODUCTS + CATEGORIES
     ========================================================= */

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /* =========================================================
     FETCH PRODUCTS
     ========================================================= */

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/products`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load products."
        );
      }

      const data = await response.json();

      const allProducts = Array.isArray(data)
        ? data
        : data.content || [];

      setProducts(allProducts);
    } catch (err) {
      console.error(
        "Products loading error:",
        err
      );

      setProducts([]);

      setError(
        "Unable to load products right now."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     FETCH CATEGORIES
     ========================================================= */

  async function loadCategories() {
    try {
      const response = await fetch(
        `${API_BASE}/categories`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.content || [];

      setCategories(list);
    } catch (err) {
      console.error(
        "Categories loading error:",
        err
      );
    }
  }

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */

  const filtered = useMemo(() => {
    let data = [...products];

    /* SEARCH */

    const query = search
      .trim()
      .toLowerCase();

    if (query) {
      data = data.filter((product) => {
        const values = [
          product?.name,
          product?.description,
          product?.category?.name,
          product?.woman?.name,
          product?.woman?.village,
          product?.woman?.district,
        ];

        return values
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      });
    }

    /* CATEGORY */

    if (category) {
      data = data.filter(
        (product) =>
          String(
            product?.category?.id ??
              product?.categoryId ??
              ""
          ) === String(category)
      );
    }

    /* PRICE */

    data = data.filter(
      (product) =>
        Number(product?.price || 0) <=
        Number(maxPrice)
    );

    /* VILLAGE */

    if (village) {
      const villageQuery =
        village.toLowerCase();

      data = data.filter((product) => {
        const productVillage =
          product?.woman?.village || "";

        return String(productVillage)
          .toLowerCase()
          .includes(villageQuery);
      });
    }

    /* SORT */

    if (sort === "low") {
      data.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    } else if (sort === "high") {
      data.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    } else if (sort === "name") {
      data.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    } else {
      /*
       * Newest first
       */

      data.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ).getTime() -
          new Date(
            a.createdAt || 0
          ).getTime()
      );
    }

    return data;
  }, [
    products,
    category,
    search,
    sort,
    maxPrice,
    village,
  ]);

  /* =========================================================
     RESET FILTERS
     ========================================================= */

  function resetFilters() {
    setCategory("");
    setMaxPrice(5000);
    setVillage("");
    setSearch("");
    setSort("newest");
    setFiltersOpen(false);
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="shop-page">

      {/* =====================================================
          TOP
          ===================================================== */}

      <PageTop
        title={
          <>
            Handmade Products
            <br />
            With A{" "}
            <em>
              Brighter Purpose.
            </em>
          </>
        }
        text="Explore unique, high-quality handmade products by rural women across India."
      />

      {/* =====================================================
          SHOP
          ===================================================== */}

      <div className="shop-layout section">

        {/* ===================================================
            FILTER SIDEBAR / MOBILE FILTER DRAWER
            =================================================== */}

        <aside className={`filters ${ filtersOpen ? "mobile-open" : "" }`} >

          <div className="filter-title">

            <div className="filter-heading">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </div>

            <button
              type="button"
              className="filter-close"
              onClick={() =>
                setFiltersOpen(false)
              }
              aria-label="Close filters"
            >
              ×
            </button>

          </div>

          {/* =================================================
              CATEGORIES
              ================================================= */}

          <h4>
            Categories
          </h4>

          <label>
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() =>
                setCategory("")
              }
            />

            All Products
          </label>

          {categories.map(
            (item) => {
              /*
               * Backend category:
               * {
               *   id,
               *   name,
               *   ...
               * }
               */

              return (
                <label
                  key={item.id}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={
                      String(category) ===
                      String(item.id)
                    }
                    onChange={() =>
                      setCategory(
                        String(item.id)
                      )
                    }
                  />

                  {item.name}
                </label>
              );
            }
          )}

          {/* =================================================
              PRICE
              ================================================= */}

          <h4>
            Price Range
          </h4>

          <div className="range">
            <span>
              ₹0
            </span>

            <span>
              ₹{Number(
                maxPrice
              ).toLocaleString("en-IN")}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                Number(e.target.value)
              )
            }
          />

          {/* =================================================
              MATERIALS
              ================================================= */}


          {/* =================================================
              VILLAGES
              ================================================= */}

          <h4>
            Villages
          </h4>

          <select
            value={village}
            onChange={(e) =>
              setVillage(
                e.target.value
              )
            }
          >

            <option value="">
              All Villages
            </option>

            {[
              ...new Set(
                products
                  .map(
                    (product) =>
                      product?.woman?.village
                  )
                  .filter(Boolean)
              ),
            ].map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

          {/* =================================================
              RESET
              ================================================= */}

          <button
            type="button"
            className="reset-filters"
            onClick={resetFilters}
          >
            Reset Filters
          </button>

        </aside>

        {/* ===================================================
            MOBILE BACKDROP
            =================================================== */}

        {filtersOpen && (
          <button
            type="button"
            className="filter-backdrop"
            onClick={() =>
              setFiltersOpen(false)
            }
            aria-label="Close filters"
          />
        )}

        {/* ===================================================
            RESULTS
            =================================================== */}

        <section className="shop-results">

          {/* =================================================
              SEARCH
              ================================================= */}

          <div className="shop-search">

            <Search size={18} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search handmade products..."
            />

          </div>

          {/* =================================================
              RESULTS BAR
              ================================================= */}

          <div className="results-bar">

            <span>
              All Products{" "}

              <b>
                ({filtered.length})
              </b>
            </span>

            <div className="results-actions">

              {/* MOBILE FILTER BUTTON */}

              <button
                type="button"
                className="mobile-filter-btn"
                onClick={() =>
                  setFiltersOpen(true)
                }
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>

              {/* SORT */}

              <label>
                Sort by:

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value
                    )
                  }
                >

                  <option value="newest">
                    Newest First
                  </option>

                  <option value="low">
                    Price: Low to High
                  </option>

                  <option value="high">
                    Price: High to Low
                  </option>

                  <option value="name">
                    Name
                  </option>

                </select>

              </label>

            </div>

          </div>

          {/* =================================================
              LOADING
              ================================================= */}

          {loading && (

            <div className="shop-loading">
              Loading handmade products...
            </div>

          )}

          {/* =================================================
              ERROR
              ================================================= */}

          {!loading && error && (

            <div className="shop-error">

              {error}

              <button
                type="button"
                onClick={loadProducts}
              >
                Try Again
              </button>

            </div>

          )}

          {/* =================================================
              EMPTY
              ================================================= */}

          {!loading &&
            !error &&
            filtered.length === 0 && (

              <div className="shop-empty">

                <h3>
                  No products found
                </h3>

                <p>
                  Try changing your filters
                  or search for another product.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                >
                  View All Products
                </button>

              </div>

            )}

          {/* =================================================
              PRODUCTS
              ================================================= */}

          {!loading &&
            !error &&
            filtered.length > 0 && (

              <div className="product-grid three">

                {filtered.map(
                  (product) => (

                    <ProductCard
                      key={product.id}
                      product={product}
                    />

                  )
                )}

              </div>

            )}

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   PAGE TOP
   ========================================================= */

function PageTop({
  title,
  text,
}) {
  return (
    <section className="shop-top">

      <div>

        <span className="eyebrow">
          HANDMADE • RURAL • REAL CHANGE
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {text}
        </p>

      </div>

      {/* Image intentionally disabled
      <img
        src="/assets/shop-reference.jpg"
        alt=""
      />
      */}

    </section>
  );
}
import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Search,
  UserRound,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    user = null;
  }

  const isLoggedIn = Boolean(token);

  // ==========================================
  // VILLAGE PARTNER LINK
  // ==========================================

  const villagePartnerPath =
    token && user?.role === "VILLAGE_PARTNER"
      ? "/partner/dashboard"
      : "/village-partners";

  // ==========================================
  // NAVIGATION
  // ==========================================

  const nav = [
    ["/", "Home"],
    ["/shop", "Shop"],
    ["/our-women", "Our Women"],
    ["/our-story", "Our Story"],
    [villagePartnerPath, "Village Partners"],
    ["/impact", "Impact"],
  ];

  // ==========================================
  // LOAD CART COUNT
  // ==========================================

  async function loadCartCount() {
    const currentToken =
      localStorage.getItem("token");

    // Nobody logged in
    if (!currentToken) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/cart`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        setCartCount(0);
        return;
      }

      const data = await response.json();

      /*
        Handles common backend formats:

        {
          items: [...]
        }

        OR

        {
          cartItems: [...]
        }

        OR

        [...]
      */

      const items =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.cartItems)
          ? data.cartItems
          : [];

      /*
        Count TOTAL QUANTITY, not just number of
        different products.

        Example:

        Product A -> quantity 2
        Product B -> quantity 3

        Badge = 5
      */

      const totalQuantity = items.reduce(
        (total, item) =>
          total +
          Number(
            item?.quantity ??
              item?.cartQuantity ??
              0
          ),
        0
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.error(
        "Cart count loading error:",
        error
      );

      setCartCount(0);
    }
  }

  // ==========================================
  // LOAD CART WHEN HEADER MOUNTS
  // AND WHEN ROUTE CHANGES
  // ==========================================

  useEffect(() => {
    loadCartCount();
  }, [location.pathname]);

  // ==========================================
  // LISTEN FOR CART UPDATES
  // ==========================================

  useEffect(() => {
    const handleCartUpdated = () => {
      loadCartCount();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );
    };
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const search = (e) => {
    e.preventDefault();

    navigate(
      `/shop${
        query
          ? `?search=${encodeURIComponent(query)}`
          : ""
      }`
    );

    setOpen(false);
  };

  // ==========================================
  // CART CLICK
  // ==========================================

  const handleCartClick = (e) => {
    e.preventDefault();

    // Not logged in -> Login
    if (!isLoggedIn) {
      setOpen(false);
      navigate("/login");
      return;
    }

    // Logged in -> Cart
    setOpen(false);
    navigate("/cart");
  };

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* ==================================
            MOBILE MENU
        ================================== */}

        <button
          type="button"
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

        {/* ==================================
            BRAND
        ================================== */}

        <Link
          to="/"
          className="brand"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            ♧
          </span>

          <span>
            <strong>
              Kaarika
            </strong>

            <small>
              Rural Hands. Brighter Tomorrows.
            </small>
          </span>
        </Link>

        {/* ==================================
            NAVIGATION
        ================================== */}

        <nav
          className={`main-nav ${
            open ? "open" : ""
          }`}
        >
          {nav.map(([to, label]) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ==================================
            HEADER ACTIONS
        ================================== */}

        <div className="header-actions">

          {/* SEARCH */}

          <form
            className="search"
            onSubmit={search}
          >
            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Ask us anything..."
            />

            <button
              type="submit"
              aria-label="search"
            >
              <Search size={19} />
            </button>
          </form>

          {/* ACCOUNT */}

          <Link
            className="icon-btn"
            to={
              token
                ? "/account"
                : "/login"
            }
            onClick={() => setOpen(false)}
          >
            <UserRound size={22} />
          </Link>

          {/* CART */}

          <button
            type="button"
            className="cart-btn"
            onClick={handleCartClick}
            aria-label={
              isLoggedIn
                ? "cart"
                : "login to access cart"
            }
          >
            <ShoppingCart size={23} />

            {isLoggedIn && cartCount > 0 && (
              <span>
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
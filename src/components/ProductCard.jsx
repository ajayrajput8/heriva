import React from "react";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [quantity, setQuantity] = React.useState(0);
  const [wishlisted, setWishlisted] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  const image =
    product.mainImageUrl ||
    product.imageUrls?.[0];

  // --------------------------------------------------
  // LOAD CART + WISHLIST
  // --------------------------------------------------

  React.useEffect(() => {
    const token = getToken();

    if (!token) {
      setQuantity(0);
      setWishlisted(false);
      return;
    }

    const loadUserData = async () => {
      try {
        // ---------------- CART ----------------

        const cartResponse = await fetch(
          `${API_BASE}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cartResponse.ok) {
          const cart = await cartResponse.json();

          const cartItem = cart.find(
            item =>
              Number(item.product?.id) ===
              Number(product.id)
          );

          setQuantity(
            cartItem
              ? Number(cartItem.quantity)
              : 0
          );
        }

        // ---------------- WISHLIST ----------------

        const wishlistResponse = await fetch(
          `${API_BASE}/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (wishlistResponse.ok) {
          const wishlist =
            await wishlistResponse.json();

          const exists = wishlist.some(
            item =>
              Number(item.product?.id) ===
              Number(product.id)
          );

          setWishlisted(exists);
        }
      } catch (error) {
        console.error(
          "Failed to load cart/wishlist:",
          error
        );
      }
    };

    loadUserData();
  }, [product.id]);

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

    const toggleWishlist = async e => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();

    // Not logged in → login
    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: location.pathname,
        },
      });

      return;
    }

    try {
      setWishlistLoading(true);

      const response = await fetch(
        `${API_BASE}/wishlist/toggle/${product.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Wishlist request failed: ${response.status}`
        );
      }

      // Backend successfully toggled wishlist
      setWishlisted(prev => !prev);

    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Could not update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const addToCart = async e => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();

    // Not logged in → login
    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: location.pathname,
        },
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/cart/items?productId=${product.id}&quantity=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to add product to cart"
        );
      }

      const cartItem = await response.json();

      setQuantity(
        Number(cartItem.quantity)
      );
    } catch (error) {
      console.error(error);
      alert("Could not add product to cart.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CHANGE CART QUANTITY
  // --------------------------------------------------

  const changeQuantity = async (
    change,
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();

    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: location.pathname,
        },
      });

      return;
    }

    const newQuantity =
      quantity + change;

    try {
      setLoading(true);

      // ---------------- REMOVE ----------------

      if (newQuantity <= 0) {
        const cartResponse = await fetch(
          `${API_BASE}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cartResponse.ok) {
          throw new Error(
            "Could not load cart"
          );
        }

        const cart =
          await cartResponse.json();

        const cartItem = cart.find(
          item =>
            Number(item.product?.id) ===
            Number(product.id)
        );

        if (cartItem) {
          const deleteResponse =
            await fetch(
              `${API_BASE}/cart/items/${cartItem.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          if (!deleteResponse.ok) {
            throw new Error(
              "Could not remove product"
            );
          }
        }

        setQuantity(0);
        return;
      }

      // ---------------- UPDATE ----------------

      const cartResponse = await fetch(
        `${API_BASE}/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!cartResponse.ok) {
        throw new Error(
          "Could not load cart"
        );
      }

      const cart =
        await cartResponse.json();

      const cartItem = cart.find(
        item =>
          Number(item.product?.id) ===
          Number(product.id)
      );

      if (!cartItem) {
        return;
      }

      const response = await fetch(
        `${API_BASE}/cart/items/${cartItem.id}?quantity=${newQuantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not update quantity"
        );
      }

      const updatedItem =
        await response.json();

      setQuantity(
        Number(updatedItem.quantity)
      );
    } catch (error) {
      console.error(error);
      alert("Could not update cart.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <article className="product-card">

      {/* PRODUCT IMAGE */}
      <Link
        to={`/product/${product.id}`}
        className="product-image-wrap"
      >
        <img
          src={image}
          alt={product.name}
        />

        {/* WISHLIST HEART */}
        <button
          type="button"
          className={`heart ${
            wishlisted
              ? "heart-active"
              : ""
          }`}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={
              wishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className="product-card-body">

        <Link
          to={`/product/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <strong className="price">
          ₹ {product.price}
        </strong>

        {/* CART BUTTON */}
        {quantity === 0 ? (
          <button
            className="add-btn"
            onClick={addToCart}
            disabled={loading}
          >
            <ShoppingCart size={15} />

            {loading
              ? "Adding..."
              : "Add to Cart"}
          </button>
        ) : (
          <div className="cart-quantity-control">

            <button
              type="button"
              className="quantity-btn"
              onClick={e =>
                changeQuantity(-1, e)
              }
              disabled={loading}
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>

            <span className="quantity-number">
              {quantity}
            </span>

            <button
              type="button"
              className="quantity-btn"
              onClick={e =>
                changeQuantity(1, e)
              }
              disabled={loading}
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>

          </div>
        )}

      </div>
    </article>
  );
}
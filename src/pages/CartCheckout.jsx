import React from "react";
import {
  Lock,
  Minus,
  Plus,
  MapPin,
  Trash2,
  ShieldCheck,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view your cart.");
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export default function CartCheckout() {
  const navigate = useNavigate();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState(null);
  const [removingId, setRemovingId] = React.useState(null);
  const [error, setError] = React.useState("");

  /*
   * =========================================================
   * LOAD REAL CART
   * =========================================================
   */

  React.useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/cart");

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Cart loading error:", err);

      setError(
        err.message || "Unable to load your cart."
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * CHANGE QUANTITY
   * =========================================================
   */

  async function changeQuantity(item, delta) {
    const currentQuantity = Number(item.quantity || 1);

    const newQuantity = Math.max(
      1,
      currentQuantity + delta
    );

    if (newQuantity === currentQuantity) {
      return;
    }

    setUpdatingId(item.id);
    setError("");

    try {
      const updated = await apiRequest(
        `/cart/items/${item.id}?quantity=${newQuantity}`,
        {
          method: "PUT",
        }
      );

      setItems((current) =>
        current.map((cartItem) =>
          cartItem.id === item.id
            ? updated
            : cartItem
        )
      );
    } catch (err) {
      console.error("Quantity update error:", err);

      setError(
        err.message ||
          "Unable to update cart quantity."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * =========================================================
   * REMOVE ITEM
   * =========================================================
   */

  async function removeItem(item) {
    setRemovingId(item.id);
    setError("");

    try {
      await apiRequest(
        `/cart/items/${item.id}`,
        {
          method: "DELETE",
        }
      );

      setItems((current) =>
        current.filter(
          (cartItem) =>
            cartItem.id !== item.id
        )
      );
    } catch (err) {
      console.error("Remove cart item error:", err);

      setError(
        err.message ||
          "Unable to remove this item."
      );
    } finally {
      setRemovingId(null);
    }
  }

  /*
   * =========================================================
   * CLEAR CART
   * =========================================================
   */

  async function clearCart() {
    if (!items.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) return;

    setError("");

    try {
      /*
       * Backend currently has no dedicated
       * DELETE /api/cart endpoint.
       *
       * So remove each item through the existing
       * DELETE /api/cart/items/{itemId} API.
       */

      await Promise.all(
        items.map((item) =>
          apiRequest(
            `/cart/items/${item.id}`,
            {
              method: "DELETE",
            }
          )
        )
      );

      setItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);

      /*
       * Reload so UI represents backend state.
       */
      await loadCart();

      setError(
        err.message ||
          "Unable to clear the cart."
      );
    }
  }

  /*
   * =========================================================
   * TOTALS
   * =========================================================
   */

  const subtotal = items.reduce(
    (sum, item) => {
      const price = Number(
        item.product?.price || 0
      );

      const quantity = Number(
        item.quantity || 0
      );

      return sum + price * quantity;
    },
    0
  );

  /*
   * Your current backend OrderService uses:
   *
   * shippingFee = 0
   * totalAmount = subtotal
   *
   * So the cart should match the backend.
   *
   * Later we can add a real shipping calculator.
   */

  const shipping = 0;
  const total = subtotal + shipping;

  const totalQuantity = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  function formatPrice(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="checkout section">
        <div className="checkout-main">
          <div className="cart-loading">
            <Loader2
              size={28}
              className="cart-spinner"
            />
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * EMPTY CART
   * =========================================================
   */

  if (!items.length) {
    return (
      <div className="checkout section">
        <div className="checkout-main">
          <div className="checkout-empty">
            <ShoppingBag size={46} />

            <h1>Your Cart is Empty</h1>

            <p>
              Add some beautiful handmade products
              created by our women artisans.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/shop")
              }
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * CART
   * =========================================================
   */

  return (
    <div className="checkout section">

      {/* ================================================
          MAIN CART
      ================================================= */}

      <div className="checkout-main">

        <div className="checkout-title">
          <div>
            <h1>Your Cart</h1>

            <span>
              ({totalQuantity}{" "}
              {totalQuantity === 1
                ? "item"
                : "items"})
            </span>
          </div>

          <button
            onClick={clearCart}
            disabled={!!removingId}
          >
            Clear Cart
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        {/* ============================================
            CART ITEMS
        ============================================ */}

        <div className="cart-items">

          {items.map((item) => {
            const product = item.product;

            const price = Number(
              product?.price || 0
            );

            const quantity = Number(
              item.quantity || 1
            );

            const image =
              product?.mainImageUrl ||
              product?.imageUrls?.[0] ||
              "/assets/partners-reference.jpg";

            const womanName =
              product?.woman?.name ||
              "Women Artisan";

            return (
              <div
                className="cart-row"
                key={item.id}
              >

                {/* IMAGE */}

                <img
                  src={image}
                  alt={product?.name || "Product"}
                />

                {/* PRODUCT INFO */}

                <div className="cart-item-info">

                  <h3>
                    {product?.name ||
                      "Handmade Product"}
                  </h3>

                  <p>
                    By {womanName}
                  </p>

                  <strong>
                    ₹ {formatPrice(price)}
                  </strong>

                </div>

                {/* QUANTITY */}

                <div className="cart-qty">

                  <button
                    type="button"
                    disabled={
                      updatingId === item.id ||
                      quantity <= 1
                    }
                    onClick={() =>
                      changeQuantity(
                        item,
                        -1
                      )
                    }
                  >
                    <Minus size={14} />
                  </button>

                  <b>
                    {updatingId === item.id
                      ? "..."
                      : quantity}
                  </b>

                  <button
                    type="button"
                    disabled={
                      updatingId === item.id
                    }
                    onClick={() =>
                      changeQuantity(
                        item,
                        1
                      )
                    }
                  >
                    <Plus size={14} />
                  </button>

                </div>

                {/* LINE TOTAL */}

                <strong className="cart-line-total">
                  ₹{" "}
                  {formatPrice(
                    price * quantity
                  )}
                </strong>

                {/* DELETE */}

                <button
                  type="button"
                  className="trash"
                  disabled={
                    removingId === item.id
                  }
                  onClick={() =>
                    removeItem(item)
                  }
                >
                  {removingId === item.id ? (
                    <Loader2
                      size={17}
                      className="cart-spinner"
                    />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>

              </div>
            );
          })}

        </div>

        {/* NOTE */}

        <div className="checkout-note">
          <b>Add a note (optional)</b>

          <textarea
            placeholder="Gift messages, special instructions..."
          />
        </div>

      </div>

      {/* ================================================
          SUMMARY
      ================================================= */}

      <aside className="order-summary">

        <h2>Order Summary</h2>

        <div>
          <span>Subtotal</span>

          <b>
            ₹ {formatPrice(subtotal)}
          </b>
        </div>

        <div>
          <span>Shipping</span>

          <b>
            {shipping === 0
              ? "FREE"
              : `₹ ${formatPrice(shipping)}`}
          </b>
        </div>

        <hr />

        <div className="total">
          <span>Total</span>

          <strong>
            ₹ {formatPrice(total)}
          </strong>
        </div>

        {/* CHECKOUT */}

        <button
          className="primary-btn checkout-btn"
          onClick={() =>
            navigate("/checkout")
          }
        >
          Proceed to Checkout →
        </button>

        <p>
          <Lock size={14} />
          Secure Payments
          <br />
          <small>
            100% Safe & Encrypted
          </small>
        </p>

        <p>
          <ShieldCheck size={14} />
          Easy Returns
          <br />
          <small>
            Hassle free returns
          </small>
        </p>

        <p>
          <span className="heart-icon">
            ♡
          </span>
          Supports Rural Women
          <br />
          <small>
            Your purchase creates impact
          </small>
        </p>

      </aside>

    </div>
  );
}
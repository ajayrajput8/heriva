import React from "react";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  ChevronDown,
  Truck,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import ProductCard from "../components/ProductCard";
import "./ProductDetails.css";

const API_BASE = "http://localhost:8080/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);

  // Quantity selected by user
  const [qty, setQty] = React.useState(1);

  // Quantity already present in cart
  const [cartQty, setCartQty] = React.useState(0);

  const [cartItemId, setCartItemId] = React.useState(null);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [cartLoading, setCartLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  /*
   * ==============================
   * LOAD PRODUCT
   * ==============================
   */

  React.useEffect(() => {
    loadProduct();
    loadRelatedProducts();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/products/${id}`
      );

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      setProduct(data);

      // If user is logged in,
      // find this product inside cart and wishlist.
      await Promise.all([
        loadCartQuantity(data.id),
        loadWishlistStatus(data.id),
      ]);

    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to load product"
      );
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==============================
   * LOAD CART QUANTITY
   * ==============================
   */

  async function loadCartQuantity(productId) {
    const token = getToken();

    if (!token) {
      setCartQty(0);
      setCartItemId(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const cart = await response.json();

      const cartItem = cart.find(
        item =>
          Number(item.product?.id) ===
          Number(productId)
      );

      if (cartItem) {
        setCartQty(Number(cartItem.quantity));
        setCartItemId(cartItem.id);

        // Keep local selector synchronized
        setQty(Number(cartItem.quantity));
      } else {
        setCartQty(0);
        setCartItemId(null);
      }

    } catch (err) {
      console.error(
        "Cart loading error:",
        err
      );
    }
  }

  /*
   * ==============================
   * LOAD WISHLIST STATUS
   * ==============================
   */

  async function loadWishlistStatus(productId) {
    const token = getToken();

    if (!token) {
      setIsWishlisted(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/wishlist`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If wishlist endpoint is unavailable or
      // user is unauthorized, simply keep it unselected.
      if (!response.ok) {
        setIsWishlisted(false);
        return;
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.items)
        ? data.items
        : [];

      const exists = items.some((item) => {
        const wishlistProduct =
          item?.product || item;

        return (
          Number(wishlistProduct?.id) ===
          Number(productId)
        );
      });

      setIsWishlisted(exists);
    } catch (err) {
      console.error(
        "Wishlist status loading error:",
        err
      );

      setIsWishlisted(false);
    }
  }


  /*
   * ==============================
   * TOGGLE WISHLIST
   * ==============================
   */

  async function toggleWishlist() {
    if (!requireLogin()) return;

    if (!product || wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await fetch(
        `${API_BASE}/wishlist/toggle/${product.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Could not update wishlist."
        );
      }

      /*
       * Backend may return:
       * - boolean
       * - { wishlisted: true }
       * - { added: true }
       * - { removed: true }
       *
       * Handle all common responses.
       */

      let nextState;

      if (typeof data === "boolean") {
        nextState = data;
      } else if (
        typeof data?.wishlisted === "boolean"
      ) {
        nextState = data.wishlisted;
      } else if (
        typeof data?.added === "boolean"
      ) {
        nextState = data.added;
      } else if (
        typeof data?.removed === "boolean"
      ) {
        nextState = !data.removed;
      } else {
        // If backend only returns a message,
        // assume the toggle succeeded.
        nextState = !isWishlisted;
      }

      setIsWishlisted(nextState);

      // Let Header / Account / other components
      // know that wishlist data changed.
      window.dispatchEvent(
        new Event("wishlistUpdated")
      );

    } catch (err) {
      console.error(
        "Wishlist update error:",
        err
      );

      alert(
        err.message ||
        "Could not update wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  }


  /*
   * ==============================
   * RELATED PRODUCTS
   * ==============================
   */

  async function loadRelatedProducts() {
    try {
      const response = await fetch(
        `${API_BASE}/products?size=100&page=0`
      );

      if (!response.ok) return;

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.content || [];

      const related = list
        .filter(
          p =>
            String(p.id) !== String(id) &&
            String(p.status || "").toUpperCase() ===
              "PUBLISHED"
        )
        .slice(0, 4);

      setRelatedProducts(related);

    } catch (err) {
      console.error(
        "Related products error:",
        err
      );
    }
  }

  /*
   * ==============================
   * PRODUCT IMAGE
   * ==============================
   */

  function getProductImage(product) {
    return (
      product?.mainImageUrl ||
      product?.imageUrls?.[0] ||
      "/assets/partners-reference.jpg"
    );
  }

  /*
   * ==============================
   * LOGIN CHECK
   * ==============================
   */

  function requireLogin() {
    const token = getToken();

    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: `/product/${id}`,
        },
      });

      return false;
    }

    return true;
  }

  /*
   * ==============================
   * ADD TO CART
   * ==============================
   */

  async function addToCart() {
    if (!requireLogin()) return;

    if (!product || product.stockQuantity <= 0) {
      return;
    }

    try {
      setCartLoading(true);

      /*
       * If product is already in cart,
       * add the selected quantity to it.
       *
       * Example:
       * Cart = 2
       * Selected = 3
       * New cart quantity = 5
       */

      if (cartItemId && cartQty > 0) {

        const newQuantity = Math.min(
          cartQty + qty,
          Number(product.stockQuantity)
        );

        const response = await fetch(
          `${API_BASE}/cart/items/${cartItemId}?quantity=${newQuantity}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not update cart"
          );
        }

        const updatedItem =
          await response.json();

        setCartQty(
          Number(updatedItem.quantity)
        );

        setQty(
          Number(updatedItem.quantity)
        );

      } else {

        /*
         * Product is not in cart yet.
         */

        const response = await fetch(
          `${API_BASE}/cart/items?productId=${product.id}&quantity=${qty}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not add product to cart"
          );
        }

        const cartItem =
          await response.json();

        setCartItemId(cartItem.id);

        setCartQty(
          Number(cartItem.quantity)
        );

        setQty(
          Number(cartItem.quantity)
        );
      }

    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Could not add product to cart."
      );
    } finally {
      setCartLoading(false);
    }
  }

  /*
   * ==============================
   * INCREASE QUANTITY
   * ==============================
   */

async function increaseQuantity() {
  if (!requireLogin()) return;

  const token = getToken();

  if (!token || !product) return;

  const currentQuantity = Number(
    cartItemId && cartQty > 0 ? cartQty : qty
  );

  const newQuantity = currentQuantity + 1;

  if (newQuantity > Number(product.stockQuantity)) {
    return;
  }

  try {
    setCartLoading(true);

    /*
     * PRODUCT NOT IN CART
     *
     * If user clicks + for the first time,
     * immediately create the cart item.
     */
    if (!cartItemId) {
      const response = await fetch(
        `${API_BASE}/cart/items?productId=${product.id}&quantity=${newQuantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not add product to cart"
        );
      }

      const cartItem = await response.json();

      setCartItemId(cartItem.id);
      setCartQty(Number(cartItem.quantity));
      setQty(Number(cartItem.quantity));

      return;
    }

    /*
     * PRODUCT ALREADY IN CART
     *
     * Increase the actual backend quantity.
     */
    const response = await fetch(
      `${API_BASE}/cart/items/${cartItemId}?quantity=${newQuantity}`,
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

    const updatedItem = await response.json();

    setCartQty(Number(updatedItem.quantity));
    setQty(Number(updatedItem.quantity));

  } catch (err) {
    console.error(err);

    alert(
      err.message ||
        "Could not update cart."
    );
  } finally {
    setCartLoading(false);
  }
}

  /*
   * ==============================
   * DECREASE QUANTITY
   * ==============================
   */

  async function decreaseQuantity() {
    if (!requireLogin()) return;

    const token = getToken();

    if (!token) return;

    const currentQuantity =
      Number(cartQty || qty || 1);

    const newQuantity =
      currentQuantity - 1;

    /*
     * Don't allow zero from the
     * product page.
     *
     * User can remove the item
     * from the cart itself.
     */
    if (newQuantity < 1) {
      return;
    }

    /*
     * Product isn't in cart yet.
     * Change local quantity only.
     */
    if (!cartItemId) {
      setQty(newQuantity);
      return;
    }

    try {
      setCartLoading(true);

      const response = await fetch(
        `${API_BASE}/cart/items/${cartItemId}?quantity=${newQuantity}`,
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

      setCartQty(
        Number(updatedItem.quantity)
      );

      setQty(
        Number(updatedItem.quantity)
      );

    } catch (err) {
      console.error(err);
      alert("Could not update quantity.");
    } finally {
      setCartLoading(false);
    }
  }

  /*
   * ==============================
   * BUY NOW
   * ==============================
   */

  async function buyNow() {
    if (!requireLogin()) return;

    if (!product || product.stockQuantity <= 0) {
      return;
    }

    try {
      setCartLoading(true);

      /*
       * Buy Now should make sure
       * the selected quantity exists
       * in the cart.
       */

      if (cartItemId && cartQty > 0) {

        const response = await fetch(
          `${API_BASE}/cart/items/${cartItemId}?quantity=${qty}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not update cart"
          );
        }

      } else {

        const response = await fetch(
          `${API_BASE}/cart/items?productId=${product.id}&quantity=${qty}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not add product to cart"
          );
        }

        const cartItem =
          await response.json();

        setCartItemId(cartItem.id);
        setCartQty(
          Number(cartItem.quantity)
        );
      }

      /*
       * Go to real cart.
       */
      navigate("/cart");

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Could not process Buy Now."
      );

    } finally {
      setCartLoading(false);
    }
  }

  /*
   * ==============================
   * LOADING
   * ==============================
   */

  if (loading) {
    return (
      <div className="detail-page section">
        <div className="product-loading">
          Loading product...
        </div>
      </div>
    );
  }

  /*
   * ==============================
   * ERROR
   * ==============================
   */

  if (error || !product) {
    return (
      <div className="detail-page section">
        <div className="product-error">
          <h2>Product not found</h2>

          <p>
            {error ||
              "This product does not exist."}
          </p>

          <Link to="/shop">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ==============================
   * PRODUCT DATA
   * ==============================
   */

  const image = getProductImage(product);

  const maker =
    product.woman?.name ||
    "Woman Artisan";

  const village =
    product.woman?.village ||
    product.woman?.district ||
    "Rural India";

  const stock =
    Number(product.stockQuantity || 0);

  const category =
    product.category?.name ||
    "Handmade";

  /*
   * Quantity displayed by counter
   */
  const displayedQty =
    cartItemId && cartQty > 0
      ? cartQty
      : qty;

  return (
    <div className="detail-page section">

      {/* ==============================
          BREADCRUMBS
      ============================== */}

      <div className="breadcrumbs">

        <Link to="/">
          Home
        </Link>

        &nbsp; › &nbsp;

        <Link to="/shop">
          Shop
        </Link>

        &nbsp; › &nbsp;

        {product.name}

      </div>

      {/* ==============================
          MAIN PRODUCT
      ============================== */}

      <div className="detail-main">

        {/* IMAGE GALLERY */}

        <div className="gallery">

          <div className="main-image">

            <img
              src={image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  "/assets/partners-reference.jpg";
              }}
            />

            <button
              className={`heart ${
                isWishlisted ? "active" : ""
              }`}
              type="button"
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              aria-pressed={isWishlisted}
              disabled={wishlistLoading}
              onClick={toggleWishlist}
            >
              <Heart
                size={19}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          </div>

          {/* THUMBNAILS */}

          <div className="thumbs">

            {[
              product.mainImageUrl,
              ...(product.imageUrls || []),
            ]
              .filter(Boolean)
              .map((imageUrl, index) => (
                <img
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  alt={`${product.name} ${
                    index + 1
                  }`}
                  onError={(e) => {
                    e.currentTarget.src =
                      "/assets/partners-reference.jpg";
                  }}
                />
              ))}

          </div>

        </div>

        {/* ==============================
            PRODUCT INFORMATION
        ============================== */}

        <div className="detail-info">

          <span className="tag">
            100% Handmade
          </span>

          <h1>
            {product.name}
          </h1>

          <p className="maker">
            By <b>{maker}</b>
            &nbsp; | &nbsp;
            {village}
          </p>

          {/* RATING */}

          <div className="rating">

            <Star
              size={15}
              fill="currentColor"
            />

            4.8 (20 reviews)

          </div>

          {/* PRICE */}

          <div className="detail-price">
            ₹{" "}
            {Number(
              product.price || 0
            ).toLocaleString("en-IN")}
          </div>

          {/* STOCK */}

          <div className="detail-stock">

            {stock > 0 ? (
              <>
                <span className="stock-dot"></span>

                {stock} available
              </>
            ) : (
              <span className="out-stock">
                Out of stock
              </span>
            )}

          </div>

          {/* DESCRIPTION */}

          <p className="detail-desc">

            {product.description ||
              "A beautiful handmade product crafted with care by a rural woman artisan."}

          </p>

          {/* FEATURES */}

          <div className="feature-lines">

            <span>
              <Leaf size={17} />
              100% Handmade
            </span>

            <span>
              <Truck size={17} />
              Eco-friendly Materials
            </span>

            <span>
              <Heart size={17} />
              Supports Rural Women
            </span>

            <span>
              <ShieldCheck size={17} />
              Quality Checked
            </span>

          </div>

          {/* ==============================
              QUANTITY
          ============================== */}

          {stock > 0 && (
            <div className="qty">

              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={cartLoading}
              >
                <Minus size={15} />
              </button>

              <b>
                {displayedQty}
              </b>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  cartLoading ||
                  displayedQty >= stock
                }
              >
                <Plus size={15} />
              </button>

            </div>
          )}

          {/* ==============================
              ACTIONS
          ============================== */}

          <div className="detail-actions">

            <button
              className="add-wide"
              type="button"
              disabled={
                stock === 0 ||
                cartLoading
              }
              onClick={addToCart}
            >
              {cartLoading
                ? "Updating..."
                : cartQty > 0
                ? `Add ${qty} More to Cart`
                : "Add to Cart"}
            </button>

            <button
              className="buy-wide"
              type="button"
              disabled={
                stock === 0 ||
                cartLoading
              }
              onClick={buyNow}
            >
              {cartLoading
                ? "Please wait..."
                : "Buy Now"}
            </button>

          </div>

          {/* WISHLIST / SHARE */}

          <div className="under-actions">

            <button
              type="button"
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={
                isWishlisted
                  ? "wishlist-action active"
                  : "wishlist-action"
              }
              aria-pressed={isWishlisted}
            >

              <Heart
                size={16}
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />

              {wishlistLoading
                ? "Updating..."
                : isWishlisted
                ? "Remove from Wishlist"
                : "Add to Wishlist"}

            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  window.location.href
                );
              }}
            >

              <Share2 size={16} />

              Share

            </button>

          </div>

        </div>

      </div>

      {/* ==============================
          LOWER SECTION
      ============================== */}

      <div className="detail-lower">

        <div className="accordions">

          <div className="accordion">

            <b>Description</b>

            <ChevronDown size={18} />

            <p>
              {product.description ||
                "This handmade product is crafted with care by a rural woman artisan."}
            </p>

          </div>

          <div className="accordion">

            <b>
              Product Details
            </b>

            <ChevronDown size={18} />

            <p>
              Category: {category}
              <br />
              Artisan: {maker}
              <br />
              Village: {village}
              <br />
              Weight:{" "}
              {product.weightKg
                ? `${product.weightKg} kg`
                : "Not specified"}
            </p>

          </div>

          <div className="accordion">

            <b>
              Care Instructions
            </b>

            <ChevronDown size={18} />

            <p>
              Handle with care and follow
              the recommended care
              instructions for this handmade
              product.
            </p>

          </div>

          <div className="accordion">

            <b>
              Shipping & Returns
            </b>

            <ChevronDown size={18} />

            <p>
              Shipping and return information
              will be provided during checkout.
            </p>

          </div>

        </div>

        {/* MAKER */}

        <aside className="maker-card">

          <h3>
            Meet the Maker
          </h3>

          <img
            src={
              product.woman?.photoUrl ||
              "/assets/women-reference.jpg"
            }
            alt={maker}
            onError={(e) => {
              e.currentTarget.src =
                "/assets/women-reference.jpg";
            }}
          />

          <h4>
            {maker}
          </h4>

          <p>
            {village}
          </p>

          <p>
            “I want my work to reach more
            people and help my family grow
            with confidence.”
          </p>

          <Link to="/our-women">
            View More Products →
          </Link>

        </aside>

      </div>

      {/* ==============================
          RELATED PRODUCTS
      ============================== */}

      {relatedProducts.length > 0 && (
        <section className="related">

          <h2>
            You May Also Like
          </h2>

          <div className="product-grid four">

            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}

          </div>

        </section>
      )}

    </div>
  );
}
import React from "react";
import {
  MapPin,
  Plus,
  Check,
  Lock,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import "./Checkout.css";
const API_BASE = "https://heriva-backend.onrender.com/api";

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
    throw new Error(
      "Please login before checkout."
    );
  }

  const response = await fetch(
    `${API_BASE}${url}`,
    {
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = React.useState([]);
  const [addresses, setAddresses] =
    React.useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    React.useState(null);

  const [paymentMethod, setPaymentMethod] =
    React.useState("COD");

  const [loading, setLoading] =
    React.useState(true);

  const [placingOrder, setPlacingOrder] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const [showAddressForm, setShowAddressForm] =
    React.useState(false);

  const [addressForm, setAddressForm] =
    React.useState({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      defaultAddress: false,
    });

  /*
   * =========================================================
   * LOAD CART + ADDRESSES
   * =========================================================
   */

  React.useEffect(() => {
    loadCheckoutData();
  }, []);

  async function loadCheckoutData() {
    setLoading(true);
    setError("");

    try {
      const [cartData, addressData] =
        await Promise.all([
          apiRequest("/cart"),
          apiRequest("/addresses"),
        ]);

      const cartList = Array.isArray(cartData)
        ? cartData
        : [];

      const addressList =
        Array.isArray(addressData)
          ? addressData
          : [];

      setCart(cartList);
      setAddresses(addressList);

      /*
       * Automatically select default address.
       * Otherwise select first address.
       */

      const defaultAddress =
        addressList.find(
          (address) =>
            address.defaultAddress
        );

      if (defaultAddress) {
        setSelectedAddressId(
          defaultAddress.id
        );
      } else if (addressList.length) {
        setSelectedAddressId(
          addressList[0].id
        );
      }

    } catch (err) {
      console.error(
        "Checkout loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * ADD ADDRESS
   * =========================================================
   */

  function handleAddressChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setAddressForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function addAddress(e) {
    e.preventDefault();

    setError("");

    try {
      const savedAddress =
        await apiRequest(
          "/addresses",
          {
            method: "POST",
            body: JSON.stringify(
              addressForm
            ),
          }
        );

      setAddresses((current) => [
        ...current,
        savedAddress,
      ]);

      setSelectedAddressId(
        savedAddress.id
      );

      setShowAddressForm(false);

      setAddressForm({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        defaultAddress: false,
      });

    } catch (err) {
      console.error(
        "Address creation error:",
        err
      );

      setError(
        err.message ||
          "Unable to save address."
      );
    }
  }

  /*
   * =========================================================
   * TOTALS
   * =========================================================
   */

  const subtotal = cart.reduce(
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
   * Current backend uses zero shipping.
   */

  const shipping = 0;

  const total =
    subtotal + shipping;

  function formatPrice(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  /*
   * =========================================================
   * PLACE ORDER
   * =========================================================
   */

  async function placeOrder() {
    setError("");

    if (!cart.length) {
      setError(
        "Your cart is empty."
      );
      return;
    }

    if (!selectedAddressId) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      /*
       * This matches your Spring Boot:
       *
       * CreateOrderRequest(
       *   addressId,
       *   items,
       *   paymentMethod
       * )
       */

      const payload = {
        addressId:
          Number(selectedAddressId),

        items: cart.map((item) => ({
          productId:
            Number(item.product?.id),

          quantity:
            Number(item.quantity),
        })),

        paymentMethod,
      };

      console.log(
        "Creating order:",
        payload
      );

      const order =
        await apiRequest(
          "/orders",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

      /*
       * Backend automatically clears
       * the customer's cart after order.
       */

      /*
       * Go to order confirmation/details.
       */

      if (order?.id) {
        navigate(
          `/orders/${order.id}`,
          {
            replace: true,
            state: {
              orderPlaced: true,
            },
          }
        );
      } else {
        navigate("/orders", {
          replace: true,
        });
      }

    } catch (err) {
      console.error(
        "Place order error:",
        err
      );

      setError(
        err.message ||
          "Unable to place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="checkout-page">

        <div className="checkout-loading">

          <Loader2
            size={30}
            className="cart-spinner"
          />

          <p>
            Preparing checkout...
          </p>

        </div>

      </main>
    );
  }

  /*
   * =========================================================
   * EMPTY CART
   * =========================================================
   */

  if (!cart.length) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some handmade products
            before checking out.
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

      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="checkout-header">

          <button
            className="back-checkout"
            onClick={() =>
              navigate("/cart")
            }
          >
            <ArrowLeft size={17} />
            Back to Cart
          </button>

          <div>
            <span>
              MADE BY HER
            </span>

            <h1>
              Checkout
            </h1>

            <p>
              Complete your order
              securely.
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="checkout-error">
            {error}
          </div>
        )}

        <div className="checkout-layout">

          {/* ========================================
              LEFT
          ======================================== */}

          <section className="checkout-left">

            {/* DELIVERY ADDRESS */}

            <div className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <MapPin size={19} />

                  <div>
                    <h2>
                      Delivery Address
                    </h2>

                    <p>
                      Where should we
                      deliver your order?
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowAddressForm(
                      (current) =>
                        !current
                    )
                  }
                >
                  <Plus size={15} />
                  Add Address
                </button>

              </div>

              {/* ADDRESS FORM */}

              {showAddressForm && (
                <form
                  className="address-form"
                  onSubmit={
                    addAddress
                  }
                >

                  <div className="address-grid">

                    <input
                      name="fullName"
                      placeholder="Full Name"
                      value={
                        addressForm.fullName
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                    <input
                      name="phone"
                      placeholder="Phone Number"
                      value={
                        addressForm.phone
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                    <input
                      className="full"
                      name="addressLine1"
                      placeholder="Address Line 1"
                      value={
                        addressForm.addressLine1
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                    <input
                      className="full"
                      name="addressLine2"
                      placeholder="Address Line 2 (optional)"
                      value={
                        addressForm.addressLine2
                      }
                      onChange={
                        handleAddressChange
                      }
                    />

                    <input
                      name="city"
                      placeholder="City"
                      value={
                        addressForm.city
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                    <input
                      name="state"
                      placeholder="State"
                      value={
                        addressForm.state
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                    <input
                      name="pincode"
                      placeholder="Pincode"
                      value={
                        addressForm.pincode
                      }
                      onChange={
                        handleAddressChange
                      }
                      required
                    />

                  </div>

                  <label className="default-address">

                    <input
                      type="checkbox"
                      name="defaultAddress"
                      checked={
                        addressForm.defaultAddress
                      }
                      onChange={
                        handleAddressChange
                      }
                    />

                    Make this my default
                    address

                  </label>

                  <div className="address-form-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressForm(
                          false
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button type="submit">
                      Save Address
                    </button>

                  </div>

                </form>
              )}

              {/* EXISTING ADDRESSES */}

              <div className="address-list">

                {!addresses.length ? (
                  <div className="no-address">
                    <MapPin size={28} />

                    <p>
                      You don't have a
                      saved address yet.
                    </p>

                    <button
                      onClick={() =>
                        setShowAddressForm(
                          true
                        )
                      }
                    >
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  addresses.map(
                    (address) => {

                      const selected =
                        Number(
                          selectedAddressId
                        ) ===
                        Number(
                          address.id
                        );

                      return (
                        <button
                          type="button"
                          key={
                            address.id
                          }
                          className={`address-option ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedAddressId(
                              address.id
                            )
                          }
                        >

                          <div className="address-radio">

                            {selected && (
                              <Check
                                size={13}
                              />
                            )}

                          </div>

                          <div className="address-content">

                            <strong>
                              {
                                address.fullName
                              }
                            </strong>

                            <span>
                              {
                                address.phone
                              }
                            </span>

                            <p>
                              {
                                address.addressLine1
                              }

                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}

                              <br />

                              {
                                address.city
                              }
                              ,{" "}
                              {
                                address.state
                              }{" "}
                              -{" "}
                              {
                                address.pincode
                              }
                            </p>

                          </div>

                          {address.defaultAddress && (
                            <small>
                              DEFAULT
                            </small>
                          )}

                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* PAYMENT */}

            <div className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <Lock size={19} />

                  <div>
                    <h2>
                      Payment Method
                    </h2>

                    <p>
                      Choose how you'd
                      like to pay.
                    </p>
                  </div>
                </div>

              </div>

              <div className="payment-options">

                <label
                  className={`payment-option ${
                    paymentMethod === "COD"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={
                      paymentMethod ===
                      "COD"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your
                      order arrives.
                    </span>
                  </div>

                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "ONLINE"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={
                      paymentMethod ===
                      "ONLINE"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      Payment gateway
                      integration can be
                      connected here.
                    </span>
                  </div>

                </label>

              </div>

            </div>

          </section>

          {/* ========================================
              RIGHT — ORDER SUMMARY
          ======================================== */}

          <aside className="checkout-summary">

            <h2>
              Your Order
            </h2>

            <div className="checkout-products">

              {cart.map((item) => {

                const product =
                  item.product;

                const price =
                  Number(
                    product?.price || 0
                  );

                return (
                  <div
                    className="checkout-product"
                    key={item.id}
                  >

                    <img
                      src={
                        product?.mainImageUrl ||
                        product?.imageUrls?.[0] ||
                        "/assets/partners-reference.jpg"
                      }
                      alt={
                        product?.name ||
                        "Product"
                      }
                    />

                    <div>

                      <strong>
                        {
                          product?.name
                        }
                      </strong>

                      <span>
                        Qty:{" "}
                        {
                          item.quantity
                        }
                      </span>

                    </div>

                    <b>
                      ₹{" "}
                      {formatPrice(
                        price *
                          Number(
                            item.quantity
                          )
                      )}
                    </b>

                  </div>
                );
              })}

            </div>

            <hr />

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <b>
                ₹{" "}
                {formatPrice(
                  subtotal
                )}
              </b>
            </div>

            <div className="summary-row">
              <span>
                Shipping
              </span>

              <b>
                FREE
              </b>
            </div>

            <hr />

            <div className="checkout-total">
              <span>
                Total
              </span>

              <strong>
                ₹{" "}
                {formatPrice(
                  total
                )}
              </strong>
            </div>

            <button
              className="place-order-btn"
              disabled={
                placingOrder ||
                !selectedAddressId
              }
              onClick={
                placeOrder
              }
            >

              {placingOrder ? (
                <>
                  <Loader2
                    size={17}
                    className="cart-spinner"
                  />

                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <span>→</span>
                </>
              )}

            </button>

            {!selectedAddressId && (
              <p className="checkout-hint">
                Please select a delivery
                address first.
              </p>
            )}

            <div className="checkout-trust">

              <p>
                <Lock size={15} />
                Secure Checkout
              </p>

              <p>
                <ShieldCheck size={15} />
                Your purchase supports
                rural women artisans.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}
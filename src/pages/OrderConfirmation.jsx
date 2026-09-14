import React from "react";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";
const API_BASE = "http://localhost:8080/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/orders/my/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load order");
        }

        const data = await response.json();

        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your order details.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <div className="confirmation-spinner"></div>
        <p>Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-error">
        <h2>Something went wrong</h2>
        <p>{error || "Order not found."}</p>

        <Link
          to="/"
          className="confirmation-primary-btn"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="order-confirmation-page">

      {/* SUCCESS SECTION */}
      <section className="confirmation-success">

        <div className="success-icon">
          <CheckCircle2 size={58} />
        </div>

        <h1>Order Placed Successfully!</h1>

        <p>
          Thank you for shopping with Made by Her.
        </p>

        <span className="order-number">
          Order #{order.orderNumber || order.id}
        </span>

      </section>

      <div className="confirmation-container">

        {/* MAIN CONTENT */}
        <main className="confirmation-main">

          {/* ORDER STATUS */}
          <section className="confirmation-card">

            <div className="card-heading">
              <Package size={21} />

              <div>
                <h2>Order Details</h2>
                <p>
                  Your order has been received and is being
                  prepared.
                </p>
              </div>
            </div>

            <div className="order-status-line">

              <div className="status-step active">
                <span>1</span>
                <p>Order Placed</p>
              </div>

              <div className="status-line"></div>

              <div className="status-step">
                <span>2</span>
                <p>Processing</p>
              </div>

              <div className="status-line"></div>

              <div className="status-step">
                <span>3</span>
                <p>Shipped</p>
              </div>

              <div className="status-line"></div>

              <div className="status-step">
                <span>4</span>
                <p>Delivered</p>
              </div>

            </div>

          </section>

          {/* PRODUCTS */}
          <section className="confirmation-card">

            <div className="card-heading">
              <ShoppingBag size={21} />

              <div>
                <h2>Items Ordered</h2>
                <p>
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <div className="confirmation-products">

              {items.map((item) => {

                const product = item.product;

                const image =
                  product?.mainImageUrl ||
                  product?.imageUrls?.[0];

                const quantity = Number(
                  item.quantity || 0
                );

                const price = Number(
                  item.price ||
                  product?.price ||
                  0
                );

                return (
                  <div
                    className="confirmation-product"
                    key={item.id}
                  >

                    <div className="confirmation-product-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product?.name || "Product"}
                        />
                      ) : (
                        <ShoppingBag size={25} />
                      )}
                    </div>

                    <div className="confirmation-product-info">

                      <h3>
                        {product?.name || "Product"}
                      </h3>

                      <p>
                        Quantity: {quantity}
                      </p>

                    </div>

                    <strong>
                      ₹ {(price * quantity).toLocaleString("en-IN")}
                    </strong>

                  </div>
                );
              })}

            </div>

          </section>

          {/* DELIVERY ADDRESS */}
          {order.address && (
            <section className="confirmation-card">

              <div className="card-heading">
                <MapPin size={21} />

                <div>
                  <h2>Delivery Address</h2>
                  <p>Your order will be delivered here</p>
                </div>
              </div>

              <div className="delivery-address">

                <strong>
                  {order.address.fullName}
                </strong>

                <p>
                  {order.address.addressLine1}
                  {order.address.addressLine2
                    ? `, ${order.address.addressLine2}`
                    : ""}
                </p>

                <p>
                  {order.address.city},{" "}
                  {order.address.state} -{" "}
                  {order.address.pincode}
                </p>

                <p>
                  Phone: {order.address.phone}
                </p>

              </div>

            </section>
          )}

          {/* PAYMENT */}
          <section className="confirmation-card">

            <div className="card-heading">
              <CreditCard size={21} />

              <div>
                <h2>Payment</h2>
                <p>Your selected payment method</p>
              </div>
            </div>

            <div className="payment-details">

              <span>Payment Method</span>

              <strong>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod || "Online Payment"}
              </strong>

            </div>

            <div className="payment-details">

              <span>Payment Status</span>

              <strong className="payment-status">
                {order.paymentStatus || "PENDING"}
              </strong>

            </div>

          </section>

        </main>

        {/* SUMMARY */}
        <aside className="confirmation-sidebar">

          <section className="confirmation-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>
                ₹{" "}
                {Number(
                  order.subtotal || order.totalAmount || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>

              <strong>
                {Number(order.shippingFee || 0) === 0
                  ? "FREE"
                  : `₹ ${Number(
                      order.shippingFee
                    ).toLocaleString("en-IN")}`}
              </strong>
            </div>

            <hr />

            <div className="summary-total">

              <span>Total</span>

              <strong>
                ₹{" "}
                {Number(
                  order.totalAmount || 0
                ).toLocaleString("en-IN")}
              </strong>

            </div>

          </section>

          {/* BUTTONS */}
          <div className="confirmation-actions">

            <Link
              to="/"
              className="confirmation-primary-btn"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/orders"
              className="confirmation-secondary-btn"
            >
              View My Orders
            </Link>

          </div>

          {/* IMPACT MESSAGE */}
          <div className="impact-message">

            <Heart size={21} />

            <div>
              <strong>
                Your purchase creates impact
              </strong>

              <p>
                Every order supports rural women
                artisans and helps their handmade
                work reach more customers.
              </p>
            </div>

          </div>

        </aside>

      </div>
    </div>
  );
}
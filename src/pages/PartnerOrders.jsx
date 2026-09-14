import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  UsersRound,
  Tag,
  ShoppingBag,
  BarChart3,
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  IndianRupee,
  RefreshCw,
  MapPin,
  UserRound,
  CreditCard,
  Menu,
} from "lucide-react";
import "./VillagePartnerDashboard.css";
import "./PartnerOrders.css";

const API = "https://heriva-backend.onrender.com/api";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {
      // Ignore invalid JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getOrdersFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function getItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function getOrderNumber(order) {
  return order?.orderNumber || (order?.id ? `#MBH${order.id}` : "Order");
}

function getCustomerName(order) {
  return (
    order?.customer?.fullName ||
    order?.customer?.name ||
    order?.address?.fullName ||
    "Customer"
  );
}

function getStatus(order) {
  return String(order?.status || "PLACED").toUpperCase();
}

function getStatusLabel(status) {
  return String(status || "PLACED").replaceAll("_", " ");
}

function getStatusClass(status) {
  const value = String(status).toLowerCase();
  if (value.includes("deliver")) return "delivered";
  if (value.includes("ship")) return "shipped";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("return")) return "returned";
  if (value.includes("confirm") || value.includes("process")) return "processing";
  return "placed";
}

function getDate(order) {
  return order?.createdAt || order?.orderDate || order?.updatedAt;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getProductImage(product) {
  return (
    product?.mainImageUrl ||
    product?.imageUrl ||
    product?.image ||
    product?.imageUrls?.[0] ||
    "/assets/partners-reference.jpg"
  );
}

function getItemPrice(item) {
  return Number(
    item?.unitPrice ?? item?.price ?? item?.product?.price ?? 0
  );
}

function getItemTotal(item) {
  if (item?.lineTotal != null) return Number(item.lineTotal);
  return Number(item?.quantity || 0) * getItemPrice(item);
}

function getPartnerIdFromItem(item) {
  return (
    item?.woman?.partner?.id ||
    item?.product?.woman?.partner?.id ||
    item?.product?.partner?.id ||
    item?.partner?.id ||
    null
  );
}

function getPartnerItems(order, partnerId) {
  const items = getItems(order);
  if (!partnerId) return items;

  const matched = items.filter((item) => {
    const itemPartnerId = getPartnerIdFromItem(item);
    return itemPartnerId == null || Number(itemPartnerId) === Number(partnerId);
  });

  return matched.length ? matched : items;
}

function getPartnerAmount(order, partnerId) {
  const items = getPartnerItems(order, partnerId);
  if (!items.length) return Number(order?.totalAmount || order?.total || 0);
  return items.reduce((sum, item) => sum + getItemTotal(item), 0);
}

export default function PartnerOrders() {
  const [orders, setOrders] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  const pageSize = 8;

  const loadOrders = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [partnerData, ordersData] = await Promise.all([
        apiRequest("/partner/me"),
        apiRequest("/orders/partner"),
      ]);

      setPartner(partnerData);
      setOrders(getOrdersFromResponse(ordersData));
    } catch (err) {
      console.error("Partner Orders Error:", err);
      setError(err?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const stats = useMemo(() => {
    let processing = 0;
    let shipped = 0;
    let delivered = 0;
    let placed = 0;

    orders.forEach((order) => {
      const status = getStatus(order);
      if (status === "PLACED") placed += 1;
      else if (status.includes("PROCESS") || status.includes("CONFIRM")) processing += 1;
      else if (status.includes("SHIP")) shipped += 1;
      else if (status.includes("DELIVER")) delivered += 1;
    });

    return {
      total: orders.length,
      toProcess: placed + processing,
      shipped,
      delivered,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const status = getStatus(order);
        const orderNumber = getOrderNumber(order).toLowerCase();
        const customer = getCustomerName(order).toLowerCase();
        const address = String(
          order?.address?.city || order?.address?.state || ""
        ).toLowerCase();

        const matchesSearch =
          !query ||
          orderNumber.includes(query) ||
          customer.includes(query) ||
          address.includes(query);

        const matchesStatus =
          statusFilter === "ALL" || status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(getDate(b) || 0) - new Date(getDate(a) || 0));
  }, [orders, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const openOrder = (order) => setSelectedOrder(order);
  const closeOrder = () => setSelectedOrder(null);

  if (loading) {
    return (
      <div className="partner-dashboard partner-orders-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />
          <h3>Loading your orders...</h3>
          <p>Fetching orders containing your products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-dashboard partner-orders-page">
      {/* =========================================================
          MOBILE PARTNER MENU
          SAME SIDEBAR SYSTEM AS DASHBOARD
          ========================================================= */}

      <div className="mobile-dashboard-bar">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open partner menu"
          aria-expanded={mobileSidebarOpen}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="mobile-sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="mobile-dashboard-sidebar">
            <div className="mobile-sidebar-header">
              <div>
                <span>MADE BY HER</span>
                <strong>Village Partner</strong>
              </div>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close partner menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav>
              <NavLink
                to="/partner/dashboard"
                end
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Home size={19} />
                Dashboard
              </NavLink>

              <NavLink
                to="/partner/women"
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <UsersRound size={19} />
                Manage Women
              </NavLink>

              <NavLink
                to="/partner/products"
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Tag size={19} />
                Products
              </NavLink>

              <NavLink
                to="/partner/orders"
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <ShoppingBag size={19} />
                Orders
              </NavLink>

              <NavLink
                to="/partner/earnings"
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <BarChart3 size={19} />
                Earnings
              </NavLink>
            </nav>

            <div className="mobile-sidebar-quote">
              <span>“Stronger Villages,</span>
              <span>Brighter Tomorrows”</span>
            </div>
          </aside>
        </>
      )}

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav>
            <NavLink
              to="/partner/dashboard"
              className={({ isActive }) => (isActive ? "dashboard-nav-active" : "")}
            >
              <Home size={19} />
              Dashboard
            </NavLink>

            <NavLink
              to="/partner/women"
              className={({ isActive }) => (isActive ? "dashboard-nav-active" : "")}
            >
              <UsersRound size={19} />
              Manage Women
            </NavLink>

            <NavLink
              to="/partner/products"
              className={({ isActive }) => (isActive ? "dashboard-nav-active" : "")}
            >
              <Tag size={19} />
              Products
            </NavLink>

            <NavLink
              to="/partner/orders"
              className={({ isActive }) => (isActive ? "dashboard-nav-active" : "")}
            >
              <ShoppingBag size={19} />
              Orders
            </NavLink>

            <NavLink
              to="/partner/earnings"
              className={({ isActive }) => (isActive ? "dashboard-nav-active" : "")}
            >
              <BarChart3 size={19} />
              Earnings
            </NavLink>
          </nav>

          <div className="sidebar-quote">
            <span>"Stronger</span>
            <span>Villages,</span>
            <span>Brighter</span>
            <span>Tomorrows"</span>
            <b>♡</b>
          </div>
        </aside>

        <main className="dashboard-main partner-orders-main">
          {error && (
            <div className="dashboard-error partner-orders-error">
              <div>
                <strong>Unable to load orders</strong>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => loadOrders(true)}>
                Try Again
              </button>
            </div>
          )}

          <section className="dashboard-welcome partner-orders-welcome">
            <div className="welcome-content">
              <span className="welcome-eyebrow">VILLAGE PARTNER</span>
              <h1>
                Manage your
                <br />
                <em>Orders.</em>
              </h1>
              <p>
                Track customer orders and stay on top of every sale made through
                the women you support.
              </p>
              <div className="welcome-quote">
                “Every order creates opportunity.
                <br />
                Every sale creates impact.”
              </div>
            </div>
          </section>

          <div className="dashboard-refresh-row partner-orders-refresh">
            <span>
              {partner?.fullName || partner?.user?.fullName
                ? `Orders for ${partner?.fullName || partner?.user?.fullName}`
                : "Live data from your account"}
            </span>
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? "refresh-spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <section className="partner-stat-grid partner-orders-stat-grid">
            <div className="partner-stat-card">
              <div className="stat-icon">
                <ShoppingBag size={24} />
              </div>
              <div>
                <strong>{stats.total}</strong>
                <span>Total Orders</span>
                <small>Orders containing your products</small>
              </div>
            </div>

            <div className="partner-stat-card">
              <div className="stat-icon">
                <Clock3 size={24} />
              </div>
              <div>
                <strong>{stats.toProcess}</strong>
                <span>To Process</span>
                <small>New or processing orders</small>
              </div>
            </div>

            <div className="partner-stat-card">
              <div className="stat-icon">
                <Truck size={24} />
              </div>
              <div>
                <strong>{stats.shipped}</strong>
                <span>Shipped</span>
                <small>Orders on the way</small>
              </div>
            </div>

            <div className="partner-stat-card earnings-card">
              <div className="stat-icon green">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <strong>{stats.delivered}</strong>
                <span>Delivered</span>
                <small>Successfully completed</small>
              </div>
            </div>
          </section>

          <section className="dashboard-two-column partner-orders-content">
            <div className="dashboard-left-column">
              <div className="dashboard-card partner-orders-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h2>Customer Orders</h2>
                    <span className="partner-orders-heading-note">
                      {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} found
                    </span>
                  </div>
                </div>

                <div className="partner-orders-toolbar">
                  <div className="partner-orders-search">
                    <Search size={17} />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search order number or customer..."
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>

                {visibleOrders.length === 0 ? (
                  <div className="dashboard-empty partner-orders-empty">
                    <ShoppingBag size={34} />
                    <strong>No orders found</strong>
                    <span>
                      {orders.length
                        ? "Try changing your search or status filter."
                        : "New orders containing your products will appear here."}
                    </span>
                    {(search || statusFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("ALL");
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="partner-orders-list">
                    {visibleOrders.map((order) => {
                      const items = getPartnerItems(order, partner?.id);
                      const firstProduct = items[0]?.product;
                      const itemCount = items.reduce(
                        (sum, item) => sum + Number(item?.quantity || 0),
                        0
                      );
                      const status = getStatus(order);

                      return (
                        <article className="partner-order-row" key={order?.id || getOrderNumber(order)}>
                          <div className="partner-order-product-image">
                            <img
                              src={getProductImage(firstProduct)}
                              alt={firstProduct?.name || "Order product"}
                              onError={(event) => {
                                event.currentTarget.src = "/assets/partners-reference.jpg";
                              }}
                            />
                            {items.length > 1 && (
                              <span>+{items.length - 1}</span>
                            )}
                          </div>

                          <div className="partner-order-main-info">
                            <b>{getOrderNumber(order)}</b>
                            <span>{getCustomerName(order)}</span>
                            <small>
                              {itemCount} item{itemCount === 1 ? "" : "s"} · {formatDate(getDate(order))}
                            </small>
                          </div>

                          <div className="partner-order-product-name">
                            <span>{firstProduct?.name || (items.length > 1 ? `${items.length} products` : "Order")}</span>
                            <small>
                              {firstProduct?.woman?.name || items[0]?.woman?.name || "Your artisan product"}
                            </small>
                          </div>

                          <div className="partner-order-amount">
                            <strong>{money(getPartnerAmount(order, partner?.id))}</strong>
                            <small>{order?.paymentStatus || order?.paymentMethod || "Order"}</small>
                          </div>

                          <div className="partner-order-status-cell">
                            <span className={`order-status ${getStatusClass(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                            <button
                              type="button"
                              className="partner-order-view"
                              onClick={() => openOrder(order)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {visibleOrders.length > 0 && (
                  <div className="partner-orders-pagination">
                    <span>
                      Showing {(safePage - 1) * pageSize + 1}–
                      {Math.min(safePage * pageSize, filteredOrders.length)} of {filteredOrders.length}
                    </span>

                    <div>
                      <button
                        type="button"
                        disabled={safePage === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <b>{safePage}</b>
                      <span>of {totalPages}</span>
                      <button
                        type="button"
                        disabled={safePage === totalPages}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        aria-label="Next page"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-right-column">
              <div className="dashboard-card partner-orders-side-card">
                <div className="dashboard-card-heading">
                  <h2>Order Status</h2>
                </div>

                <div className="order-status-guide">
                  <div>
                    <span className="guide-dot placed" />
                    <div><b>Placed</b><small>New customer order</small></div>
                    <strong>{stats.toProcess}</strong>
                  </div>
                  <div>
                    <span className="guide-dot shipped" />
                    <div><b>Shipped</b><small>On the way to customer</small></div>
                    <strong>{stats.shipped}</strong>
                  </div>
                  <div>
                    <span className="guide-dot delivered" />
                    <div><b>Delivered</b><small>Successfully completed</small></div>
                    <strong>{stats.delivered}</strong>
                  </div>
                </div>
              </div>

              <div className="dashboard-card quick-actions partner-order-actions">
                <h2>Order Support</h2>
                <div className="order-support-message">
                  <Package size={24} />
                  <p>
                    Keep customer details and order information ready when coordinating packing and delivery.
                  </p>
                </div>
                <NavLink to="/partner/earnings">
                  <IndianRupee size={18} />
                  View Earnings
                </NavLink>
                <NavLink to="/partner/products">
                  <Tag size={18} />
                  Manage Products
                </NavLink>
              </div>

              <div className="dashboard-card partner-orders-impact">
                <div className="dashboard-card-heading">
                  <h2>🌿 Your Impact</h2>
                </div>
                <div className="partner-orders-impact-number">{stats.delivered}</div>
                <p>orders successfully delivered for your women's products.</p>
                <div className="partner-orders-impact-line">
                  <CheckCircle2 size={16} />
                  Every delivered order supports rural livelihoods.
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="dashboard-footer">
        <span>© {new Date().getFullYear()} Made By Her. All rights reserved.</span>
        <div>
          <span>Handmade</span>
          <i>|</i>
          <span>Rural</span>
          <i>|</i>
          <span>Real Change</span>
        </div>
      </footer>

      {selectedOrder && (
        <div className="partner-order-modal-overlay" onMouseDown={closeOrder}>
          <div className="partner-order-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="partner-order-modal-header">
              <div>
                <span>VILLAGE PARTNER · ORDER</span>
                <h2>{getOrderNumber(selectedOrder)}</h2>
                <small>{formatDateTime(getDate(selectedOrder))}</small>
              </div>
              <button type="button" onClick={closeOrder} aria-label="Close order details">
                <X size={19} />
              </button>
            </div>

            <div className="partner-order-modal-status-row">
              <span className={`order-status ${getStatusClass(getStatus(selectedOrder))}`}>
                {getStatusLabel(getStatus(selectedOrder))}
              </span>
              <strong>{money(getPartnerAmount(selectedOrder, partner?.id))}</strong>
            </div>

            <div className="partner-order-modal-grid">
              <section className="partner-order-detail-section">
                <div className="partner-order-detail-heading">
                  <UserRound size={16} />
                  <h3>Customer</h3>
                </div>
                <p><b>{getCustomerName(selectedOrder)}</b></p>
                {selectedOrder?.customer?.email && <p>{selectedOrder.customer.email}</p>}
                {selectedOrder?.customer?.phone && <p>{selectedOrder.customer.phone}</p>}
              </section>

              <section className="partner-order-detail-section">
                <div className="partner-order-detail-heading">
                  <CreditCard size={16} />
                  <h3>Payment</h3>
                </div>
                <p><b>{selectedOrder?.paymentMethod || "—"}</b></p>
                <p>{selectedOrder?.paymentStatus || "Payment status unavailable"}</p>
              </section>
            </div>

            <section className="partner-order-detail-section partner-order-items-section">
              <div className="partner-order-detail-heading">
                <Package size={16} />
                <h3>Products in this order</h3>
              </div>

              <div className="partner-order-items">
                {getPartnerItems(selectedOrder, partner?.id).map((item, index) => {
                  const product = item?.product;
                  const quantity = Number(item?.quantity || 0);
                  return (
                    <div className="partner-order-item" key={item?.id || `${product?.id}-${index}`}>
                      <div className="partner-order-item-image">
                        <img
                          src={getProductImage(product)}
                          alt={product?.name || "Product"}
                          onError={(event) => {
                            event.currentTarget.src = "/assets/partners-reference.jpg";
                          }}
                        />
                      </div>
                      <div className="partner-order-item-info">
                        <b>{product?.name || item?.productName || "Product"}</b>
                        <span>
                          {product?.woman?.name || item?.woman?.name || "Woman artisan"} · Qty {quantity}
                        </span>
                      </div>
                      <strong>{money(getItemTotal(item))}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="partner-order-address-box">
              <div className="partner-order-detail-heading">
                <MapPin size={16} />
                <h3>Delivery Address</h3>
              </div>
              <p>
                {selectedOrder?.address?.fullName || getCustomerName(selectedOrder)}
                {selectedOrder?.address?.phone ? ` · ${selectedOrder.address.phone}` : ""}
              </p>
              <p>
                {[
                  selectedOrder?.address?.addressLine1,
                  selectedOrder?.address?.addressLine2,
                  selectedOrder?.address?.city,
                  selectedOrder?.address?.state,
                  selectedOrder?.address?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Delivery address details unavailable."}
              </p>
            </section>

            <div className="partner-order-modal-total">
              <span>Partner order value</span>
              <strong>{money(getPartnerAmount(selectedOrder, partner?.id))}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

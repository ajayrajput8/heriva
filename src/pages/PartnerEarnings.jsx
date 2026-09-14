import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Home,
  UsersRound,
  Tag,
  ShoppingBag,
  BarChart3,
  IndianRupee,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Heart,
  Menu,
  X,
} from "lucide-react";

import "./VillagePartnerDashboard.css";
import "./PartnerEarnings.css";

const API = "https://heriva-backend.onrender.com/api";
const PARTNER_SHARE = 0.10; // fallback until backend ledger values are authoritative
const PAGE_SIZE = 8;

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function apiRequest(endpoint) {
  const token = getToken();
  const response = await fetch(`${API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore invalid JSON
    }
    throw new Error(message);
  }

  return response.json();
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
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

function formatStatus(status) {
  return String(status || "PLACED").replaceAll("_", " ");
}

function statusClass(status) {
  return String(status || "PLACED")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

function getOrdersFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function getItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function getItemSales(item) {
  if (item?.lineTotal != null) return Number(item.lineTotal || 0);
  return (
    Number(item?.quantity || 0) *
    Number(item?.unitPrice ?? item?.price ?? item?.product?.price ?? 0)
  );
}

function getOrderSales(order) {
  return getItems(order).reduce((sum, item) => sum + getItemSales(item), 0);
}

function getOrderEarnings(order) {
  const explicit = getItems(order).reduce(
    (sum, item) => sum + Number(item?.partnerCommission || 0),
    0
  );

  if (explicit > 0) return explicit;
  return getOrderSales(order) * PARTNER_SHARE;
}

function getOrderNumber(order) {
  return order?.orderNumber || (order?.id ? `#MBH${order.id}` : "Order");
}

export default function PartnerEarnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState("ALL");
  const [page, setPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      if (!getToken()) throw new Error("Please log in as a Village Partner.");

      const data = await apiRequest("/orders/partner");
      console.log("Partner earnings data:", data);
      setOrders(getOrdersFromResponse(data));
    } catch (err) {
      console.error("Partner earnings error:", err);
      setError(err?.message || "Could not load earnings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (range === "ALL") return orders;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(range));

    return orders.filter((order) => {
      const created = new Date(order?.createdAt || order?.orderDate || "");
      return !Number.isNaN(created.getTime()) && created >= cutoff;
    });
  }, [orders, range]);

  useEffect(() => {
    setPage(1);
  }, [range]);

  const metrics = useMemo(() => {
    const sales = filteredOrders.reduce((sum, order) => sum + getOrderSales(order), 0);
    const earnings = filteredOrders.reduce((sum, order) => sum + getOrderEarnings(order), 0);

    const delivered = filteredOrders.filter((order) =>
      String(order?.status || "").toUpperCase().includes("DELIVER")
    ).length;

    const pending = filteredOrders.filter((order) => {
      const status = String(order?.status || "").toUpperCase();
      return !status.includes("DELIVER") && !status.includes("CANCEL");
    }).length;

    return {
      sales,
      earnings,
      delivered,
      pending,
      orders: filteredOrders.length,
    };
  }, [filteredOrders]);

  const monthly = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString("en-IN", { month: "short" }),
        amount: 0,
      });
    }

    orders.forEach((order) => {
      const date = new Date(order?.createdAt || order?.orderDate || "");
      if (Number.isNaN(date.getTime())) return;

      const target = months.find(
        (month) =>
          month.key === `${date.getFullYear()}-${date.getMonth()}`
      );

      if (target) target.amount += getOrderEarnings(order);
    });

    return months;
  }, [orders]);

  const maxMonthly = Math.max(...monthly.map((item) => item.amount), 1);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const topMonth = useMemo(
    () => monthly.reduce((best, current) => (current.amount > best.amount ? current : best), monthly[0] || { label: "—", amount: 0 }),
    [monthly]
  );

  function downloadCSV() {
    const rows = [
      ["Order", "Date", "Sales", "Partner Earnings", "Status"],
      ...filteredOrders.map((order) => [
        getOrderNumber(order),
        formatDate(order?.createdAt || order?.orderDate),
        getOrderSales(order).toFixed(2),
        getOrderEarnings(order).toFixed(2),
        formatStatus(order?.status),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "made-by-her-earnings.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="partner-dashboard partner-earnings-page">
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
              <NavLink to="/partner" end onClick={() => setMobileSidebarOpen(false)} className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
                <Home size={19} /> Dashboard
              </NavLink>
              <NavLink to="/partner/women" onClick={() => setMobileSidebarOpen(false)} className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
                <UsersRound size={19} /> Manage Women
              </NavLink>
              <NavLink to="/partner/products" onClick={() => setMobileSidebarOpen(false)} className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
                <Tag size={19} /> Products
              </NavLink>
              <NavLink to="/partner/orders" onClick={() => setMobileSidebarOpen(false)} className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
                <ShoppingBag size={19} /> Orders
              </NavLink>
              <NavLink to="/partner/earnings" onClick={() => setMobileSidebarOpen(false)} className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
                <BarChart3 size={19} /> Earnings
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
            <NavLink to="/partner" end className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
              <Home size={19} />
              Dashboard
            </NavLink>
            <NavLink to="/partner/women" className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
              <UsersRound size={19} />
              Manage Women
            </NavLink>
            <NavLink to="/partner/products" className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
              <Tag size={19} />
              Products
            </NavLink>
            <NavLink to="/partner/orders" className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
              <ShoppingBag size={19} />
              Orders
            </NavLink>
            <NavLink to="/partner/earnings" className={({isActive}) => isActive ? "dashboard-nav-active" : ""}>
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

        <main className="dashboard-main">
          {error && (
            <div className="dashboard-error earnings-error">
              <div>
                <strong>Unable to load earnings</strong>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => loadOrders(true)}>
                Try Again
              </button>
            </div>
          )}

          <section className="dashboard-welcome earnings-welcome">
            <div className="welcome-content">
              <span className="welcome-eyebrow">VILLAGE PARTNER · FINANCE</span>
              <h1>
                Your Earnings
                <br />
                <em>Making Every Sale Matter.</em>
              </h1>
              <p>
                Track the sales generated through the women you support and see
                how your partner earnings are growing over time.
              </p>
              <div className="welcome-quote">
                “Her work creates value. Your support helps it reach the world.”
              </div>
            </div>
          </section>

          <div className="dashboard-refresh-row">
            <span>Live earnings data from your account</span>
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? "refresh-spinning" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <section className="partner-stat-grid">
            <div className="partner-stat-card earnings-stat-primary">
              <div className="stat-icon green">
                <Wallet size={24} />
              </div>
              <div>
                <strong>{formatCurrency(metrics.earnings)}</strong>
                <span>Total Earnings</span>
                <small>Partner commission</small>
              </div>
            </div>

            <div className="partner-stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <strong>{formatCurrency(metrics.sales)}</strong>
                <span>Sales Generated</span>
                <small>From your partner orders</small>
              </div>
            </div>

            <div className="partner-stat-card">
              <div className="stat-icon">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <strong>{metrics.delivered}</strong>
                <span>Completed Orders</span>
                <small>Delivered successfully</small>
              </div>
            </div>

            <div className="partner-stat-card">
              <div className="stat-icon">
                <Clock3 size={24} />
              </div>
              <div>
                <strong>{metrics.pending}</strong>
                <span>Pending Orders</span>
                <small>Still in progress</small>
              </div>
            </div>
          </section>

          <section className="dashboard-two-column earnings-dashboard-grid">
            <div className="dashboard-left-column">
              <div className="dashboard-card earnings-overview-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h2>Earnings Overview</h2>
                    <span className="earnings-card-subtitle">Last 6 months</span>
                  </div>
                  <button type="button" className="earnings-export" onClick={downloadCSV}>
                    <Download size={14} />
                    Export
                  </button>
                </div>

                <div className="full-earnings-chart">
                  {monthly.map((month) => (
                    <div className="earnings-column" key={month.key}>
                      <span className="earnings-value">
                        {month.amount ? formatCurrency(month.amount) : "₹0"}
                      </span>
                      <div className="earnings-track">
                        <div
                          className="earnings-bar"
                          style={{ height: `${month.amount ? Math.max(9, (month.amount / maxMonthly) * 100) : 4}%` }}
                        />
                      </div>
                      <small>{month.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card earnings-transactions-card">
                <div className="dashboard-card-heading">
                  <div>
                    <h2>Recent Earnings</h2>
                    <span className="earnings-card-subtitle">Transactions from your partner orders</span>
                  </div>
                  <select value={range} onChange={(event) => setRange(event.target.value)}>
                    <option value="ALL">All Time</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="180">Last 6 Months</option>
                  </select>
                </div>

                <div className="earnings-table-wrapper">
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>ORDER</th>
                        <th>DATE</th>
                        <th>SALES</th>
                        <th>YOUR EARNING</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="earnings-table-message">Loading earnings...</td>
                        </tr>
                      ) : visibleOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="earnings-table-message">
                            No earning transactions found.
                          </td>
                        </tr>
                      ) : (
                        visibleOrders.map((order) => (
                          <tr key={order?.id || order?.orderNumber}>
                            <td><b>{getOrderNumber(order)}</b></td>
                            <td>{formatDate(order?.createdAt || order?.orderDate)}</td>
                            <td>{formatCurrency(getOrderSales(order))}</td>
                            <td className="earning-value">{formatCurrency(getOrderEarnings(order))}</td>
                            <td>
                              <span className={`status earning-status ${statusClass(order?.status)}`}>
                                {formatStatus(order?.status)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="earnings-table-footer">
                  <span>Showing {visibleOrders.length} of {filteredOrders.length} transactions</span>
                  <div className="earnings-pagination">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button type="button" className="page-active">{safePage}</button>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-right-column">
              <div className="dashboard-card partner-share-card">
                <div className="dashboard-card-heading">
                  <h2>Partner Earnings</h2>
                  <span className="dashboard-live-label">Live</span>
                </div>

                <div className="partner-earning-highlight">
                  <div className="stat-icon green">
                    <IndianRupee size={22} />
                  </div>
                  <div>
                    <strong>{formatCurrency(metrics.earnings)}</strong>
                    <span>Your current earnings</span>
                  </div>
                </div>

                <div className="partner-earning-total">
                  <span>Generated Sales</span>
                  <strong>{formatCurrency(metrics.sales)}</strong>
                  <small>{metrics.orders} partner order{metrics.orders === 1 ? "" : "s"} in the selected period</small>
                </div>

                <div className="earning-note">
                  <ArrowRight size={14} />
                  <span>
                    Earnings use the backend partner commission when available;
                    the current 10% share is only a fallback for older order data.
                  </span>
                </div>
              </div>

              <div className="dashboard-card impact-card earnings-impact-card">
                <div className="dashboard-card-heading">
                  <h2>🌿 Your Impact</h2>
                </div>

                <div className="impact-items">
                  <div>
                    <span><Wallet size={21} /></span>
                    <div>
                      <strong>{formatCurrency(metrics.earnings)}</strong>
                      <small>Partner income created</small>
                    </div>
                  </div>

                  <div>
                    <span><Package size={21} /></span>
                    <div>
                      <strong>{metrics.orders}</strong>
                      <small>Orders supported</small>
                    </div>
                  </div>

                  <div>
                    <span><CheckCircle2 size={21} /></span>
                    <div>
                      <strong>{metrics.delivered}</strong>
                      <small>Completed orders</small>
                    </div>
                  </div>

                  <div>
                    <span><Heart size={21} /></span>
                    <div>
                      <strong>{topMonth?.amount ? formatCurrency(topMonth.amount) : "₹0"}</strong>
                      <small>Best month · {topMonth?.label || "—"}</small>
                    </div>
                  </div>
                </div>

                <div className="impact-message">
                  “Small Steps.
                  <br />
                  Big Changes.”
                  <Heart size={22} />
                </div>
              </div>

              <div className="dashboard-card quick-actions">
                <h2>Quick Actions</h2>
                <Link to="/partner/orders" className="quick-primary">
                  <ShoppingBag size={19} />
                  View Orders
                </Link>
                <Link to="/partner/products">
                  <Package size={19} />
                  Manage Products
                </Link>
                <button type="button" onClick={downloadCSV}>
                  <Download size={19} />
                  Export Earnings
                </button>
                <Link to="/partner/women">
                  <UsersRound size={19} />
                  View Women Partners
                </Link>
              </div>

              <div className="dashboard-card earnings-summary-card">
                <div className="dashboard-card-heading">
                  <h2>At a Glance</h2>
                </div>
                <div className="earnings-summary-row">
                  <span>Sales Generated</span>
                  <strong>{formatCurrency(metrics.sales)}</strong>
                </div>
                <div className="earnings-summary-row">
                  <span>Your Earnings</span>
                  <strong>{formatCurrency(metrics.earnings)}</strong>
                </div>
                <div className="earnings-summary-row">
                  <span>Completed Orders</span>
                  <strong>{metrics.delivered}</strong>
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
    </div>
  );
}

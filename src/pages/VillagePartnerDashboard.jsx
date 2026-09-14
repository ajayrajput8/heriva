import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  UsersRound,
  Tag,
  ShoppingBag,
  BarChart3,
  Plus,
  ArrowRight,
  Package,
  Heart,
  IndianRupee,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

import "./VillagePartnerDashboard.css";

const API = "http://localhost:8080/api";


// ============================================================
// HELPERS
// ============================================================

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}


async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Ignore invalid JSON
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


function formatCurrency(value) {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}


function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function formatRelativeDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateValue);
}


function isPartnerPending(partner) {
  const status = String(
    partner?.status ||
      partner?.partnerStatus ||
      partner?.approvalStatus ||
      ""
  )
    .trim()
    .toUpperCase();

  return (
    status === "PENDING" ||
    status === "PENDING_APPROVAL" ||
    status === "PENDING APPROVAL" ||
    status.includes("PENDING")
  );
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


function getProductsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}


function getWomenFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}


function getOrdersFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}


function getOrderItems(order) {
  return Array.isArray(order?.items)
    ? order.items
    : [];
}


function getOrderNumber(order) {
  return (
    order?.orderNumber ||
    (order?.id
      ? `#MBH${order.id}`
      : "Order")
  );
}


function getOrderTotal(order) {
  return Number(
    order?.totalAmount ||
      order?.total ||
      order?.subtotal ||
      0
  );
}


function getOrderStatus(order) {
  return String(
    order?.status || "PLACED"
  ).replaceAll("_", " ");
}


// ============================================================
// COMPONENT
// ============================================================

export default function VillagePartnerDashboard() {

  const location = useLocation();
  const dashboardActive =
    location.pathname === "/partner" ||
    location.pathname === "/partner/dashboard";

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);


  const [partner, setPartner] = useState(null);
  const [women, setWomen] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);


  // ==========================================================
  // FETCH PARTNER DATA
  // ==========================================================

  async function fetchDashboardData(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // ========================================================
      // 1. LOAD THE PARTNER FIRST
      // ========================================================

      const partnerData = await apiRequest("/partner/me");

      setPartner(partnerData);

      // ========================================================
      // 2. CHECK ADMIN APPROVAL
      // ========================================================

      const pending = isPartnerPending(partnerData);

      // ========================================================
      // 3. IF PENDING, DO NOT LOAD DASHBOARD SECTIONS
      // ========================================================

      if (pending) {
        setWomen([]);
        setProducts([]);
        setOrders([]);
        return;
      }

      // ========================================================
      // 4. PARTNER IS APPROVED -> LOAD DASHBOARD DATA
      // ========================================================

      const [
        womenData,
        productsData,
        ordersData,
      ] = await Promise.all([
        apiRequest("/partner/women"),

        apiRequest(
          "/products?page=0&size=100"
        ),

        apiRequest("/orders/partner"),
      ]);

      setWomen(
        getWomenFromResponse(womenData)
      );

      setProducts(
        getProductsFromResponse(productsData)
      );

      setOrders(
        getOrdersFromResponse(ordersData)
      );

    } catch (err) {
      console.error(
        "Village Partner Dashboard Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    fetchDashboardData();
  }, []);


  // ==========================================================
  // USER
  // ==========================================================

  const userName =
    storedUser?.fullName ||
    partner?.user?.fullName ||
    partner?.fullName ||
    "Village Partner";


  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();


  // ==========================================================
  // PARTNER PRODUCTS
  // ==========================================================

  const partnerProducts = useMemo(() => {

    if (!products.length) {
      return [];
    }

    const partnerId =
      partner?.id;

    if (!partnerId) {

      /*
       * If /api/products does not expose the partner
       * relationship, use the products returned by the
       * partner's women.
       */

      const womanIds = new Set(
        women.map((woman) =>
          Number(woman?.id)
        )
      );

      const filtered = products.filter(
        (product) =>
          womanIds.has(
            Number(
              product?.woman?.id ||
              product?.womanId
            )
          )
      );

      return filtered.length
        ? filtered
        : products;
    }


    return products.filter((product) => {

      const productPartnerId =
        product?.woman?.partner?.id ||
        product?.partner?.id ||
        product?.partnerId;

      return (
        Number(productPartnerId) ===
        Number(partnerId)
      );
    });

  }, [products, women, partner]);


  // ==========================================================
  // REAL STATISTICS
  // ==========================================================

  const totalWomen =
    women.length;


  const totalProducts =
    partnerProducts.length;


  const totalOrders =
    orders.length;


  // ==========================================================
  // REAL PARTNER EARNINGS
  // ==========================================================

  const totalEarnings = useMemo(() => {

    let total = 0;

    orders.forEach((order) => {

      getOrderItems(order).forEach((item) => {

        const partnerId =
          item?.woman?.partner?.id ||
          item?.product?.woman?.partner?.id;

        /*
         * If partner relation is present, only count
         * this partner's item.
         */

        if (
          partner?.id &&
          partnerId &&
          Number(partnerId) !==
            Number(partner.id)
        ) {
          return;
        }

        total += Number(
          item?.partnerCommission || 0
        );

      });

    });

    return total;

  }, [orders, partner]);


  // ==========================================================
  // TOTAL SALES
  // ==========================================================

  const totalSales = useMemo(() => {

    let total = 0;

    orders.forEach((order) => {

      getOrderItems(order).forEach((item) => {

        const partnerId =
          item?.woman?.partner?.id ||
          item?.product?.woman?.partner?.id;

        if (
          partner?.id &&
          partnerId &&
          Number(partnerId) !==
            Number(partner.id)
        ) {
          return;
        }

        total += Number(
          item?.lineTotal || 0
        );

      });

    });

    return total;

  }, [orders, partner]);


  // ==========================================================
  // UNIQUE CUSTOMERS
  // ==========================================================

  const uniqueCustomers = useMemo(() => {

    const ids = new Set();

    orders.forEach((order) => {

      const customerId =
        order?.customer?.id ||
        order?.customerId;

      if (customerId) {
        ids.add(String(customerId));
      }

    });

    return ids.size;

  }, [orders]);


  // ==========================================================
  // VILLAGES
  // ==========================================================

  const villageCount = useMemo(() => {

    const villages = new Set();

    women.forEach((woman) => {

      const village =
        woman?.village ||
        woman?.address?.village;

      if (village) {
        villages.add(
          String(village).toLowerCase()
        );
      }

    });

    if (
      villages.size === 0 &&
      partner?.village
    ) {
      villages.add(
        partner.village
      );
    }

    return villages.size;

  }, [women, partner]);


  // ==========================================================
  // PRODUCT PERFORMANCE
  // ==========================================================

  const productPerformance = useMemo(() => {

    const salesMap = new Map();

    orders.forEach((order) => {

      getOrderItems(order).forEach((item) => {

        const product =
          item?.product;

        const productId =
          product?.id ||
          item?.productId;

        if (!productId) {
          return;
        }

        const partnerId =
          item?.woman?.partner?.id ||
          product?.woman?.partner?.id;

        if (
          partner?.id &&
          partnerId &&
          Number(partnerId) !==
            Number(partner.id)
        ) {
          return;
        }

        const existing =
          salesMap.get(
            String(productId)
          ) || {
            quantity: 0,
            revenue: 0,
          };

        existing.quantity +=
          Number(item?.quantity || 0);

        existing.revenue +=
          Number(item?.lineTotal || 0);

        salesMap.set(
          String(productId),
          existing
        );

      });

    });


    return [...partnerProducts]
      .map((product) => {

        const sales =
          salesMap.get(
            String(product.id)
          ) || {
            quantity: 0,
            revenue: 0,
          };

        return {
          ...product,
          sold: sales.quantity,
          revenue: sales.revenue,
        };

      })
      .sort(
        (a, b) =>
          Number(b.sold) -
          Number(a.sold)
      )
      .slice(0, 4);

  }, [partnerProducts, orders, partner]);


  // ==========================================================
  // EARNINGS CHART
  // ==========================================================

  const earningsChart = useMemo(() => {

    const months = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {

      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        month: date.toLocaleString(
          "en-IN",
          { month: "short" }
        ),
        year: date.getFullYear(),
        monthNumber: date.getMonth(),
        amount: 0,
      });

    }


    orders.forEach((order) => {

      const date = new Date(
        order?.createdAt ||
        order?.orderDate
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const month = months.find(
        (item) =>
          item.year ===
            date.getFullYear() &&
          item.monthNumber ===
            date.getMonth()
      );

      if (!month) {
        return;
      }


      getOrderItems(order).forEach(
        (item) => {

          const partnerId =
            item?.woman?.partner?.id ||
            item?.product?.woman?.partner?.id;

          if (
            partner?.id &&
            partnerId &&
            Number(partnerId) !==
              Number(partner.id)
          ) {
            return;
          }

          month.amount += Number(
            item?.partnerCommission || 0
          );

        }
      );

    });


    const maximum = Math.max(
      ...months.map(
        (month) => month.amount
      ),
      1
    );


    return months.map((month) => ({
      ...month,
      height:
        month.amount === 0
          ? 0
          : Math.max(
              8,
              (month.amount /
                maximum) *
                100
            ),
    }));

  }, [orders, partner]);


  // ==========================================================
  // RECENT ORDERS
  // ==========================================================

  const recentOrders =
    useMemo(() => {

      return [...orders]
        .sort((a, b) => {

          const dateA =
            new Date(
              a?.createdAt ||
                a?.orderDate ||
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ||
                b?.orderDate ||
                0
            ).getTime();

          return dateB - dateA;

        })
        .slice(0, 5);

    }, [orders]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="partner-dashboard">

        <div className="dashboard-loading">

          <div className="dashboard-loading-spinner" />

          <h3>
            Loading your dashboard...
          </h3>

          <p>
            Checking your Village Partner
            application status.
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // PENDING APPROVAL SCREEN
  // ==========================================================
  // Name remains visible, but the partner dashboard sections
  // are hidden until an admin approves the application.
  // ==========================================================

  if (isPartnerPending(partner)) {

    return (
      <div className="partner-dashboard">

        <div className="dashboard-layout">

          {/* ====================================================
              PENDING SIDEBAR
          ==================================================== */}

          <aside className="dashboard-sidebar">

            <nav>

              <NavLink
                to="/partner"
                end
                className={dashboardActive ? "dashboard-nav-active" : ""}
              >
                <Home size={19} />
                Dashboard
              </NavLink>

            </nav>

            <div className="sidebar-quote">

              <span>
                "Stronger
              </span>

              <span>
                Villages,
              </span>

              <span>
                Brighter
              </span>

              <span>
                Tomorrows"
              </span>

              <b>
                ♡
              </b>

            </div>

          </aside>

          {/* ====================================================
              PENDING MAIN CONTENT
          ==================================================== */}

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
                  <strong>Village Partner</strong>

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
                    to="/partner"
                    end
                    className={dashboardActive ? "dashboard-nav-active" : ""}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <Home size={19} />
                    Dashboard
                  </NavLink>
                </nav>
              </aside>
            </>
          )}

          <main className="dashboard-main">

            <section className="dashboard-welcome">

              <div className="welcome-content">

                <span className="welcome-eyebrow">
                  VILLAGE PARTNER
                </span>

                <h1>
                  Welcome back,
                  <br />

                  <em>
                    {userName}!
                  </em>
                </h1>

                <p>
                  Thank you for registering as a Village Partner.
                  Your application is currently under review by
                  our admin team.
                </p>

              </div>

            </section>

            {/* ==================================================
                PENDING CARD
            ================================================== */}

            <section className="partner-pending-card">

              <div className="partner-pending-content">

                <div className="partner-pending-icon">
                  ⏳
                </div>

                <span className="partner-pending-label">
                  APPLICATION STATUS
                </span>

                <h2>
                  Your request is pending
                </h2>

                <p>
                  Your Village Partner registration has been
                  submitted successfully and is waiting for
                  admin approval.
                </p>

                <p>
                  Once your request is approved, you will be able
                  to manage women artisans, products, orders and
                  earnings from your dashboard.
                </p>

                <div className="partner-pending-status">
                  Pending Approval
                </div>

              </div>

            </section>

          </main>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="dashboard-footer">

          <span>
            © {new Date().getFullYear()} Made By Her.
            All rights reserved.
          </span>

          <div>

            <span>
              Handmade
            </span>

            <i>
              |
            </i>

            <span>
              Rural
            </span>

            <i>
              |
            </i>

            <span>
              Real Change
            </span>

          </div>

        </footer>

      </div>
    );
  }


  return (
    <div className="partner-dashboard">


      {/* ======================================================
          LAYOUT
      ====================================================== */}

      <div className="dashboard-layout">


        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="dashboard-sidebar">

          <nav>

            <NavLink
              to="/partner"
              end
              className={dashboardActive ? "dashboard-nav-active" : ""}
            >
              <Home size={19} />
              Dashboard
            </NavLink>


            <NavLink
              to="/partner/women"
              className={({ isActive }) =>
                isActive ? "dashboard-nav-active" : ""
              }
            >
              <UsersRound size={19} />
              Manage Women
            </NavLink>


            <NavLink
              to="/partner/products"
              className={({ isActive }) =>
                isActive ? "dashboard-nav-active" : ""
              }
            >
              <Tag size={19} />
              Products
            </NavLink>


            <NavLink
              to="/partner/orders"
              className={({ isActive }) =>
                isActive ? "dashboard-nav-active" : ""
              }
            >
              <ShoppingBag size={19} />
              Orders
            </NavLink>


            <NavLink
              to="/partner/earnings"
              className={({ isActive }) =>
                isActive ? "dashboard-nav-active" : ""
              }
            >
              <BarChart3 size={19} />
              Earnings
            </NavLink>

          </nav>


          <div className="sidebar-quote">

            <span>
              "Stronger
            </span>

            <span>
              Villages,
            </span>

            <span>
              Brighter
            </span>

            <span>
              Tomorrows"
            </span>

            <b>
              ♡
            </b>

          </div>

        </aside>


        {/* ====================================================
            MAIN
        ==================================================== */}

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
                  to="/partner"
                  end
                  className={dashboardActive ? "dashboard-nav-active" : ""}
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

        <main className="dashboard-main">


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="dashboard-error">

              <div>

                <strong>
                  Unable to refresh dashboard
                </strong>

                <span>
                  {error}
                </span>

              </div>

              <button
                type="button"
                onClick={() =>
                  fetchDashboardData(true)
                }
              >
                Try Again
              </button>

            </div>

          )}


          {/* ==================================================
              WELCOME
          ================================================== */}

          <section className="dashboard-welcome">

            <div className="welcome-content">

              <span className="welcome-eyebrow">
                VILLAGE PARTNER
              </span>

              <h1>
                Welcome back,
                <br />

                <em>
                  {userName}!
                </em>
              </h1>

              <p>
                Thank you for being a Village Partner.
                Together we are creating real opportunities
                for rural women.
              </p>

              <div className="welcome-quote">
                “Empowered Women. Stronger Communities.
                <br />
                Brighter Tomorrows.”
              </div>

            </div>

          </section>


          {/* ==================================================
              REFRESH
          ================================================== */}

          <div className="dashboard-refresh-row">

            <span>
              Live data from your account
            </span>

            <button
              type="button"
              onClick={() =>
                fetchDashboardData(true)
              }
              disabled={refreshing}
            >

              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "refresh-spinning"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>


          {/* ==================================================
              REAL STAT CARDS
          ================================================== */}

          <section className="partner-stat-grid">


            {/* WOMEN */}

            <div className="partner-stat-card">

              <div className="stat-icon">
                <UsersRound size={24} />
              </div>

              <div>

                <strong>
                  {totalWomen}
                </strong>

                <span>
                  Women Onboarded
                </span>

                <small>
                  Currently managed
                </small>

              </div>

            </div>


            {/* PRODUCTS */}

            <div className="partner-stat-card">

              <div className="stat-icon">
                <Package size={24} />
              </div>

              <div>

                <strong>
                  {totalProducts}
                </strong>

                <span>
                  Products Listed
                </span>

                <small>
                  Your women's products
                </small>

              </div>

            </div>


            {/* ORDERS */}

            <div className="partner-stat-card">

              <div className="stat-icon">
                <ShoppingBag size={24} />
              </div>

              <div>

                <strong>
                  {totalOrders}
                </strong>

                <span>
                  Total Orders
                </span>

                <small>
                  Orders containing your products
                </small>

              </div>

            </div>


            {/* EARNINGS */}

            <div className="partner-stat-card earnings-card">

              <div className="stat-icon green">
                <IndianRupee size={24} />
              </div>

              <div>

                <strong>
                  {formatCurrency(
                    totalEarnings
                  )}
                </strong>

                <span>
                  Total Earnings
                </span>

                <small>
                  Partner commission
                </small>

              </div>

            </div>

          </section>


          {/* ==================================================
              TWO COLUMN
          ================================================== */}

          <section className="dashboard-two-column">


            {/* =================================================
                LEFT
            ================================================= */}

            <div className="dashboard-left-column">


              {/* ===============================================
                  YOUR WOMEN
              =============================================== */}

              <div className="dashboard-card">

                <div className="dashboard-card-heading">

                  <h2>
                    Your Women
                  </h2>

                  <Link to="/partner/women">

                    View All

                    <ArrowRight size={15} />

                  </Link>

                </div>


                {women.length === 0 ? (

                  <div className="dashboard-empty">

                    <UsersRound size={30} />

                    <strong>
                      No women onboarded yet
                    </strong>

                    <span>
                      Start by onboarding your first woman.
                    </span>

                    <Link to="/partner/women">
                      Onboard Woman
                    </Link>

                  </div>

                ) : (

                  <div className="women-mini-grid">

                    {women
                      .slice(0, 5)
                      .map((woman) => {

                        const name =
                          woman?.name ||
                          woman?.fullName ||
                          "Woman Artisan";

                        const skill =
                          woman?.skill ||
                          woman?.craft ||
                          woman?.category ||
                          "Handmade Artisan";

                        const image =
                          woman?.imageUrl ||
                          woman?.photoUrl ||
                          woman?.image ||
                          "/assets/women-impact.jpg";

                        return (

                          <div
                            className="woman-mini"
                            key={woman?.id || name}
                          >

                            <div className="woman-mini-image">

                              <img
                                src={image}
                                alt={name}
                                onError={(event) => {
                                  event.currentTarget.src =
                                    "/assets/women-impact.jpg";
                                }}
                              />

                              <span />

                            </div>

                            <b>
                              {name}
                            </b>

                            <small>
                              {skill}
                            </small>

                          </div>

                        );

                      })}

                  </div>

                )}

              </div>


              {/* ===============================================
                  PRODUCT PERFORMANCE
              =============================================== */}

              <div className="dashboard-card">

                <div className="dashboard-card-heading">

                  <h2>
                    Product Performance
                  </h2>

                  <Link to="/partner/products">

                    View All

                    <ArrowRight size={15} />

                  </Link>

                </div>


                {productPerformance.length === 0 ? (

                  <div className="dashboard-empty">

                    <Package size={30} />

                    <strong>
                      No product sales yet
                    </strong>

                    <span>
                      Product performance will appear
                      here after your products receive orders.
                    </span>

                  </div>

                ) : (

                  <div className="performance-grid">

                    {productPerformance.map(
                      (product) => (

                        <div
                          className="performance-product"
                          key={product.id}
                        >

                          <div className="performance-image">

                            <img
                              src={getProductImage(product)}
                              alt={product?.name || "Product"}
                              onError={(event) => {
                                event.currentTarget.src =
                                  "/assets/partners-reference.jpg";
                              }}
                            />

                          </div>

                          <span>
                            {product?.name ||
                              "Unnamed Product"}
                          </span>

                          <div>

                            <b>
                              {formatCurrency(
                                product?.price
                              )}
                            </b>

                            <small>
                              {product.sold} sold
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* ===============================================
                  EARNINGS
              =============================================== */}

              <div className="dashboard-card earnings-overview">

                <div className="dashboard-card-heading">

                  <h2>
                    Earnings Overview
                  </h2>

                  <span className="dashboard-live-label">
                    Live
                  </span>

                </div>


                <div className="earnings-content">


                  <div className="chart">

                    {earningsChart.map(
                      (item) => (

                        <div
                          className="chart-column"
                          key={`${item.month}-${item.year}`}
                        >

                          <div
                            className="chart-bar"
                            style={{
                              height:
                                `${item.height}%`,
                            }}
                            title={`${item.month}: ${formatCurrency(item.amount)}`}
                          />

                          <span>
                            {item.month}
                          </span>

                        </div>

                      )
                    )}

                  </div>


                  <div className="earnings-total">

                    <span>
                      Partner Earnings
                    </span>

                    <strong>
                      {formatCurrency(
                        totalEarnings
                      )}
                    </strong>

                    <small>
                      From {formatCurrency(totalSales)}
                      {" "}in product sales
                    </small>

                    <Link to="/partner/earnings">

                      View Detailed Report

                      <ArrowRight size={14} />

                    </Link>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="dashboard-right-column">


              {/* ===============================================
                  IMPACT
              =============================================== */}

              <div className="dashboard-card impact-card">

                <div className="dashboard-card-heading">

                  <h2>
                    🌿 Your Impact
                  </h2>

                </div>


                <div className="impact-items">


                  <div>

                    <span>
                      <UsersRound size={21} />
                    </span>

                    <div>

                      <strong>
                        {totalWomen}
                      </strong>

                      <small>
                        Women Empowered
                      </small>

                    </div>

                  </div>


                  <div>

                    <span>
                      <Package size={21} />
                    </span>

                    <div>

                      <strong>
                        {totalProducts}
                      </strong>

                      <small>
                        Handmade Products
                      </small>

                    </div>

                  </div>


                  <div>

                    <span>
                      <Heart size={21} />
                    </span>

                    <div>

                      <strong>
                        {uniqueCustomers}
                      </strong>

                      <small>
                        Customers Reached
                      </small>

                    </div>

                  </div>


                  <div>

                    <span>
                      <UsersRound size={21} />
                    </span>

                    <div>

                      <strong>
                        {villageCount}
                      </strong>

                      <small>
                        Villages Connected
                      </small>

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


              {/* ===============================================
                  QUICK ACTIONS
              =============================================== */}

              <div className="dashboard-card quick-actions">

                <h2>
                  Quick Actions
                </h2>


                <Link
                  to="/partner/products"
                  className="quick-primary"
                >

                  <Plus size={19} />

                  Add New Product

                </Link>


                <Link to="/partner/women">

                  <UsersRound size={19} />

                  Onboard a New Woman

                </Link>


                <Link to="/partner/orders">

                  <ShoppingBag size={19} />

                  View Orders

                </Link>


                <Link to="/partner/earnings">

                  <BarChart3 size={19} />

                  View Earnings

                </Link>

              </div>


              {/* ===============================================
                  RECENT ORDERS
              =============================================== */}

              <div className="dashboard-card recent-orders">

                <div className="dashboard-card-heading">

                  <h2>
                    Recent Orders
                  </h2>

                  <Link to="/partner/orders">

                    View All

                    <ArrowRight size={14} />

                  </Link>

                </div>


                {recentOrders.length === 0 ? (

                  <div className="dashboard-empty">

                    <ShoppingBag size={30} />

                    <strong>
                      No orders yet
                    </strong>

                    <span>
                      New orders containing your products
                      will appear here.
                    </span>

                  </div>

                ) : (

                  recentOrders.map(
                    (order) => {

                      const items =
                        getOrderItems(order);

                      const firstItem =
                        items[0];

                      const product =
                        firstItem?.product;

                      const productName =
                        product?.name ||
                        firstItem?.productName ||
                        (
                          items.length > 1
                            ? `${items.length} products`
                            : "Order"
                        );

                      const image =
                        getProductImage(
                          product
                        );

                      const status =
                        getOrderStatus(
                          order
                        );

                      return (

                        <div
                          className="recent-order"
                          key={
                            order?.id ||
                            order?.orderNumber
                          }
                        >

                          <div className="recent-order-image">

                            <img
                              src={image}
                              alt={productName}
                              onError={(event) => {
                                event.currentTarget.src =
                                  "/assets/partners-reference.jpg";
                              }}
                            />

                          </div>


                          <div className="recent-order-info">

                            <b>
                              {getOrderNumber(order)}
                            </b>

                            <span>
                              {productName}
                            </span>

                          </div>


                          <strong>
                            {formatCurrency(
                              getOrderTotal(order)
                            )}
                          </strong>


                          <div className="recent-order-status">

                            <span
                              className={
                                `status ${status
                                  .toLowerCase()
                                  .replaceAll(" ", "-")}`
                              }
                            >
                              {status}
                            </span>

                            <small>
                              {formatRelativeDate(
                                order?.createdAt ||
                                  order?.orderDate
                              )}
                            </small>

                          </div>

                        </div>

                      );

                    }
                  )

                )}

              </div>

            </div>

          </section>

        </main>

      </div>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="dashboard-footer">

        <span>
          © {new Date().getFullYear()} Made By Her.
          All rights reserved.
        </span>

        <div>

          <span>
            Handmade
          </span>

          <i>
            |
          </i>

          <span>
            Rural
          </span>

          <i>
            |
          </i>

          <span>
            Real Change
          </span>

        </div>

      </footer>

    </div>
  );
}
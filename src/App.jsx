import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import OurWomen from "./pages/OurWomen";
import OurStory from "./pages/OurStory";
import VillagePartners from "./pages/VillagePartners";
import Impact from "./pages/Impact";
import CartCheckout from "./pages/CartCheckout";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VillagePartnerRegister from "./pages/VillagePartnerRegister";
import VillagePartnerDashboard from "./pages/VillagePartnerDashboard";
import ManageWomen from "./pages/ManageWomen";
import PartnerProducts from "./pages/PartnerProducts";
import PartnerOrders from "./pages/PartnerOrders";
import PartnerEarnings from "./pages/PartnerEarnings";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminWomen from "./admin/AdminWomen";
import AdminVillagePartners from "./admin/AdminVillagePartners";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminCategories from "./admin/AdminCategories";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

const API_URL = "https://heriva-backend.onrender.com/api";


/* =========================================================
   GET LOGIN TOKEN
========================================================= */

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}


/* =========================================================
   GET USER ROLE
========================================================= */

function getUserRole() {
  return (
    localStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole") ||
    ""
  );
}


/* =========================================================
   ADMIN PROTECTED ROUTE
========================================================= */

function AdminProtectedRoute() {
  const token = getToken();
  const userRole = getUserRole();

  const isAdmin =
    !!token &&
    String(userRole).toUpperCase() === "ADMIN";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}


/* =========================================================
   PENDING / APPROVED PARTNER DASHBOARD ROUTE

   Rules:

   CUSTOMER + PENDING     -> dashboard allowed
   VILLAGE_PARTNER        -> dashboard allowed
   CUSTOMER + no request  -> blocked
   CUSTOMER + rejected    -> blocked
   ADMIN                   -> blocked
========================================================= */

function PartnerDashboardProtectedRoute() {
  const token = getToken();
  const userRole = getUserRole();

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    const checkPartnerStatus = async () => {
      if (!token) {
        if (mounted) {
          setStatus("unauthorized");
        }
        return;
      }

      /*
       * Already approved partner
       */
      if (
        String(userRole).toUpperCase() ===
        "VILLAGE_PARTNER"
      ) {
        if (mounted) {
          setStatus("approved");
        }
        return;
      }

      /*
       * Normal customer.
       * Check whether they have submitted a
       * Village Partner application.
       */
      try {
        const response = await fetch(
          `${API_URL}/partner/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (mounted) {
            setStatus("unauthorized");
          }
          return;
        }

        const partner = await response.json();

        const partnerStatus = String(
          partner?.status ||
          partner?.partnerStatus ||
          partner?.approvalStatus ||
          ""
        ).toUpperCase();

        /*
         * Pending application
         */
        if (
          partnerStatus === "PENDING" ||
          partnerStatus === "PENDING_APPROVAL" ||
          partnerStatus === "PENDING_APPROVALS"
        ) {
          if (mounted) {
            setStatus("pending");
          }
          return;
        }

        /*
         * Approved application
         */
        if (
          partnerStatus === "APPROVED" ||
          partnerStatus === "ACTIVE"
        ) {
          if (mounted) {
            setStatus("approved");
          }
          return;
        }

        /*
         * Rejected / no application
         */
        if (mounted) {
          setStatus("unauthorized");
        }
      } catch (error) {
        console.error(
          "Unable to check partner status:",
          error
        );

        if (mounted) {
          setStatus("unauthorized");
        }
      }
    };

    checkPartnerStatus();

    return () => {
      mounted = false;
    };
  }, [token, userRole]);

  /*
   * Prevent redirect before API check completes.
   */
  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "#6f665f",
        }}
      >
        Checking your partner application...
      </div>
    );
  }

  if (
    status !== "pending" &&
    status !== "approved"
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}


/* =========================================================
   APPROVED PARTNER ONLY

   Rules:

   VILLAGE_PARTNER -> allowed
   PENDING CUSTOMER -> blocked
   NORMAL CUSTOMER -> blocked
========================================================= */

function ApprovedPartnerProtectedRoute() {
  const token = getToken();
  const userRole = getUserRole();

  const isApprovedPartner =
    !!token &&
    String(userRole).toUpperCase() ===
      "VILLAGE_PARTNER";

  if (!isApprovedPartner) {
    return <Navigate to="/partner/dashboard" replace />;
  }

  return <Outlet />;
}


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <div className="app">
      <Header />

      <main>
        <Routes>

          {/* =================================================
              PUBLIC ROUTES
          ================================================= */}

          <Route path="/" element={<Home />} />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/our-women"
            element={<OurWomen />}
          />

          <Route
            path="/our-story"
            element={<OurStory />}
          />

          <Route
            path="/village-partners"
            element={<VillagePartners />}
          />

          <Route
            path="/impact"
            element={<Impact />}
          />

          <Route
            path="/cart"
            element={<CartCheckout />}
          />

          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/orders"
            element={<Account />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/village-partner/register"
            element={<VillagePartnerRegister />}
          />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders/:id"
            element={<OrderConfirmation />}
          />


          {/* =================================================
              PARTNER DASHBOARD

              Pending user can enter ONLY dashboard.
          ================================================= */}

          <Route
            element={
              <PartnerDashboardProtectedRoute />
            }
          >
            <Route
              path="/partner"
              element={
                <Navigate
                  to="/partner/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/partner/dashboard"
              element={
                <VillagePartnerDashboard />
              }
            />
          </Route>


          {/* =================================================
              APPROVED PARTNER ONLY

              Pending users cannot access these.
          ================================================= */}

          <Route
            element={
              <ApprovedPartnerProtectedRoute />
            }
          >

            <Route
              path="/partner/women"
              element={<ManageWomen />}
            />

            <Route
              path="/partner/products"
              element={<PartnerProducts />}
            />

            <Route
              path="/partner/orders"
              element={<PartnerOrders />}
            />

            <Route
              path="/partner/earnings"
              element={<PartnerEarnings />}
            />

          </Route>


          {/* =================================================
              ADMIN ROUTES
          ================================================= */}

          <Route element={<AdminProtectedRoute />}>
            <Route
              path="/admin"
              element={<AdminLayout />}
            >

              <Route
                index
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="dashboard"
                element={<AdminDashboard />}
              />

              <Route
                path="women"
                element={<AdminWomen />}
              />

              <Route
                path="partners"
                element={<AdminVillagePartners />}
              />

              <Route
                path="products"
                element={<AdminProducts />}
              />

              <Route
                path="orders"
                element={<AdminOrders />}
              />

              <Route
                path="customers"
                element={<AdminCustomers />}
              />

              <Route
                path="categories"
                element={<AdminCategories />}
              />

            </Route>
          </Route>


          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}
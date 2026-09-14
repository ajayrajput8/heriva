import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import PartnerOrders from "./pages/PartnerOrders";
import PartnerEarnings from "./pages/PartnerEarnings";

function AdminProtectedRoute() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const userRole =
    localStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole");

  const isAdmin =
    !!token &&
    String(userRole).toUpperCase() === "ADMIN";

  console.log("AdminProtectedRoute: token =", token);
  console.log("AdminProtectedRoute: userRole =", userRole);
  console.log("AdminProtectedRoute: isAdmin =", isAdmin);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function VillagePartnerProtectedRoute() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const userRole =
    localStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole");

  const isVillagePartner =
    !!token &&
    String(userRole).toUpperCase() === "VILLAGE_PARTNER";

  console.log(
    "VillagePartnerProtectedRoute: token =",
    token
  );

  console.log(
    "VillagePartnerProtectedRoute: userRole =",
    userRole
  );

  console.log(
    "VillagePartnerProtectedRoute: isVillagePartner =",
    isVillagePartner
  );

  if (!isVillagePartner) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/our-women" element={<OurWomen />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/village-partners" element={<VillagePartners />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/cart" element={<CartCheckout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/village-partner/register" element={<VillagePartnerRegister />}/>
          <Route path="/admin/login" element={<AdminLogin />}/>
          <Route path="/checkout" element={<Checkout />}/>
          <Route path="/orders/:id" element={<OrderConfirmation />}/>
          <Route path="/partner" element={<VillagePartnerProtectedRoute />}>
          
            {/* /partner */}
            <Route
              index
              element={
                <Navigate
                  to="/partner/dashboard"
                  replace
                />
              }
            />

            {/* /partner/dashboard */}
            <Route
              path="dashboard"
              element={<VillagePartnerDashboard />}
            />

            {/* /partner/women */}
            <Route
              path="women"
              element={<ManageWomen />}
            />

            {/* Future pages */}
            <Route
              path="products"
              element={<PartnerProducts />}
            />

            <Route
              path="orders"
              element={<PartnerOrders />}
            />

            <Route
              path="earnings"
              element={<PartnerEarnings />}
            />

            {/*<Route
              path="training"
              element={<PartnerTraining />}
            />

            <Route
              path="community"
              element={<PartnerCommunity />}
            />

            <Route
              path="messages"
              element={<PartnerMessages />}
            />

            <Route
              path="reports"
              element={<PartnerReports />}
            />

            <Route
              path="profile"
              element={<PartnerProfile />}
            />

            <Route
              path="settings"
              element={<PartnerSettings />}
            />*/}


          </Route>
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
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

              {/*<Route
                path="training"
                element={<AdminTraining />}
              />

              <Route
                path="content"
                element={<AdminContent />}
              />

              <Route
                path="reports"
                element={<AdminReports />}
              />

              <Route
                path="settings"
                element={<AdminSettings />}
              />*/}
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
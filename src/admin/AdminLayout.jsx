import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  UsersRound,
  Tag,
  Package,
  HeartHandshake,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import "./AdminLayout.css";

const nav = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Women", path: "/admin/women", icon: UserRound },
  { label: "Village Partners", path: "/admin/partners", icon: UsersRound },
  { label: "Products", path: "/admin/products", icon: Tag },
  { label: "Orders", path: "/admin/orders", icon: Package },
  { label: "Customers", path: "/admin/customers", icon: UsersRound },
  { label: "Categories", path: "/admin/categories", icon: HeartHandshake },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const name =
    localStorage.getItem("userName") ||
    sessionStorage.getItem("userName") ||
    "Admin";

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      {/*<header className="admin-header">
        <div className="admin-logo" onClick={() => navigate("/")}>
          <div className="admin-logo-mark">♧</div>
          <div>
            <strong>Made By Her</strong>
            <small>Rural Hands. Brighter Tomorrows.</small>
          </div>
        </div>

        <div className="admin-global-search">
          <Search size={18} />
          <input
            placeholder="Search women, products, orders, villages..."
          />
        </div>

        <div className="admin-header-actions">
          <button className="notification-button">
            <Bell size={21} />
            <span>3</span>
          </button>

          <div className="admin-profile">
            <div className="admin-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{name}</strong>
              <small>Super Admin</small>
            </div>

            <ChevronDown size={17} />
          </div>
        </div>
      </header>*/}

      <aside className="admin-sidebar">
        <nav>
          {nav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-quote">
          “Empowered Women.
          <br />
          Stronger Communities.
          <br />
          Brighter Tomorrows.”
        </div>

        <button className="admin-logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
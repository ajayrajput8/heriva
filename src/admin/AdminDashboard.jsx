import React, { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Package,
  ShoppingCart,
  IndianRupee,
  ArrowUp,
  Plus,
  Tag,
  ClipboardList,
  FileText,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "./adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [dashboardData, productData, orderData] =
        await Promise.all([
          adminApi.dashboard(),
          adminApi.products(),
          adminApi.orders(),
        ]);

      setDashboard(dashboardData);

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData?.content || []
      );

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : orderData?.content || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  const stats = [
    {
      label: "Total Women",
      value: dashboard?.totalWomen ?? 0,
      icon: Users,
    },
    {
      label: "Village Partners",
      value: dashboard?.totalPartners ?? 0,
      icon: MapPin,
    },
    {
      label: "Products",
      value: dashboard?.totalProducts ?? products.length,
      icon: Package,
    },
    {
      label: "Total Orders",
      value: dashboard?.totalOrders ?? orders.length,
      icon: ShoppingCart,
    },
    {
      label: "Total Revenue",
      value: `₹ ${Number(
        dashboard?.totalRevenue ?? 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="admin-page">

      <section className="admin-dashboard-hero">
        <div>
          <h1>
            Welcome Back,
            <strong> Admin!</strong>
          </h1>

          <p>
            Together we create sustainable livelihoods
            <br />
            and stronger communities.
          </p>

          <div className="admin-handwritten">
            “Real People. Real Change.”
          </div>
        </div>

        {/*<img
          src="/assets/admin-dashboard-women.jpg"
          alt="Women artisans"
        />*/}
      </section>

      <section className="admin-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="admin-stat-card" key={label}>
            <div className="admin-stat-card-icon">
              <Icon size={27} />
            </div>

            <div>
              <strong>{value}</strong>
              <span>{label}</span>

              <small>
                <ArrowUp size={12} />
                Live platform data
              </small>
            </div>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-revenue-panel">
          <div className="admin-panel-header">
            <h2>Orders & Revenue</h2>
            <select>
              <option>Last 6 Months</option>
            </select>
          </div>

          <div className="admin-chart-placeholder">
            <div className="chart-bars">
              {[35, 48, 57, 65, 78, 92].map((height, index) => (
                <div key={index}>
                  <span style={{ height: `${height}%` }} />
                  <small>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Impact Overview</h2>
          </div>

          <div className="impact-grid">
            <ImpactCard
              icon={Users}
              value={dashboard?.totalWomen ?? 0}
              label="Women Empowered"
            />

            <ImpactCard
              icon={MapPin}
              value={dashboard?.totalVillages ?? 0}
              label="Villages Reached"
            />

            <ImpactCard
              icon={Heart}
              value={dashboard?.livesImpacted ?? 0}
              label="Lives Impacted"
            />

            <ImpactCard
              icon={Package}
              value={products.length}
              label="Products"
            />
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent Orders</h2>

            <button onClick={() => navigate("/admin/orders")}>
              View All
            </button>
          </div>

          <div className="admin-simple-list">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="admin-list-row">
                <div>
                  <strong>
                    #{order.orderNumber || order.id}
                  </strong>

                  <span>
                    {order.customer?.fullName || "Customer"}
                  </span>
                </div>

                <strong>
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}

            {!orders.length && (
              <div className="admin-empty">No orders yet.</div>
            )}
          </div>
        </section>
      </div>

      <section className="admin-panel admin-products-panel">
        <div className="admin-panel-header">
          <h2>Products</h2>

          <button onClick={() => navigate("/admin/products")}>
            View All
          </button>
        </div>

        <div className="admin-dashboard-products">
          {products.slice(0, 5).map((product) => {
            const image =
              product.mainImageUrl ||
              product.imageUrls?.[0] ||
              "/assets/partners-reference.jpg";

            return (
              <article key={product.id}>
                <img src={image} alt={product.name} />

                <strong>{product.name}</strong>

                <span>
                  ₹ {product.price}
                </span>

                <small>
                  Stock: {product.stockQuantity ?? 0}
                </small>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="admin-quick-actions">
        <h2>Quick Actions</h2>

        <QuickButton
          icon={Plus}
          text="Add New Woman"
          onClick={() => navigate("/admin/women")}
        />

        <QuickButton
          icon={MapPin}
          text="Village Partners"
          onClick={() => navigate("/admin/partners")}
        />

        <QuickButton
          icon={Tag}
          text="Manage Products"
          onClick={() => navigate("/admin/products")}
        />

        <QuickButton
          icon={ClipboardList}
          text="View Orders"
          onClick={() => navigate("/admin/orders")}
        />

        <QuickButton
          icon={FileText}
          text="Generate Reports"
          onClick={() => navigate("/admin/reports")}
        />
      </aside>
    </div>
  );
}

function ImpactCard({ icon: Icon, value, label }) {
  return (
    <div className="impact-card">
      <Icon size={25} />

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function QuickButton({ icon: Icon, text, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <Icon size={20} />
      {text}
    </button>
  );
}
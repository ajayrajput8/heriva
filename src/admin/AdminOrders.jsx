import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";
import { adminApi } from "./adminApi";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await adminApi.orders();

      setOrders(
        Array.isArray(data)
          ? data
          : data?.content || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      await load();
    } catch (error) {
      alert(error.message);
    }
  };

  const filtered = orders.filter((order) =>
    [
      order.orderNumber,
      order.customer?.fullName,
      order.customer?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-section-page">
      <div className="admin-page-heading">
        <div>
          <span>FULFILMENT</span>
          <h1>Orders</h1>
          <p>
            Track customer orders, payments and delivery
            progress.
          </p>
        </div>
      </div>

      <div className="admin-summary-row">
        <Summary
          icon={ShoppingBag}
          value={orders.length}
          label="Total Orders"
        />

        <Summary
          icon={Clock}
          value={
            orders.filter((o) => o.status === "PENDING").length
          }
          label="Pending"
        />

        <Summary
          icon={Truck}
          value={
            orders.filter((o) => o.status === "SHIPPED").length
          }
          label="Shipped"
        />

        <Summary
          icon={CheckCircle}
          value={
            orders.filter((o) => o.status === "DELIVERED").length
          }
          label="Delivered"
        />
      </div>

      <section className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <Search size={17} />

            <input
              placeholder="Search order or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>
                        #{order.orderNumber || order.id}
                      </strong>
                    </td>

                    <td>
                      {order.customer?.fullName || "Customer"}
                    </td>

                    <td>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-status approved">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <select
                        className="admin-status-select"
                        value={order.status}
                        onChange={(e) =>
                          changeStatus(
                            order.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ icon: Icon, value, label }) {
  return (
    <article className="admin-summary-card">
      <div><Icon size={24} /></div>
      <section>
        <strong>{value}</strong>
        <span>{label}</span>
      </section>
    </article>
  );
}
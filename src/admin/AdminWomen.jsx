import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  UserRound,
  Package,
  Eye,
} from "lucide-react";
import { getAdminToken } from "./adminApi";

const API = "http://localhost:8080/api";

export default function AdminWomen() {
  const [women, setWomen] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWomen();
  }, []);

  const loadWomen = async () => {
    try {
      const response = await fetch(`${API}/admin/women`, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not load women");
      }

      const data = await response.json();

      setWomen(
        Array.isArray(data) ? data : data.content || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return women.filter((woman) =>
      [
        woman.name,
        woman.village,
        woman.district,
        woman.state,
        woman.skills,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q)
        )
    );
  }, [women, search]);

  return (
    <div className="admin-section-page">
      <PageHeading
        eyebrow="COMMUNITY"
        title="Women"
        description="Manage and support the women behind Made By Her."
      >
      </PageHeading>

      <div className="admin-summary-row">
        <Summary
          icon={UserRound}
          value={women.length}
          label="Total Women"
        />

        <Summary
          icon={MapPin}
          value={
            new Set(women.map((w) => w.village).filter(Boolean)).size
          }
          label="Villages"
        />

        <Summary
          icon={Package}
          value={women.reduce(
            (sum, woman) => sum + (woman.productCount || 0),
            0
          )}
          label="Products Created"
        />
      </div>

      <section className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search women, village or skill..."
            />
          </div>

          <select>
            <option>All States</option>
            <option>Rajasthan</option>
            <option>Uttar Pradesh</option>
            <option>Bihar</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">Loading women...</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Woman</th>
                  <th>Location</th>
                  <th>Skills</th>
                  <th>Partner</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filtered.map((woman) => (
                  <tr key={woman.id}>
                    <td>
                      <div className="admin-person">
                        <img
                          src={
                            woman.photoUrl ||
                            "/assets/women-reference.jpg"
                          }
                          alt={woman.name}
                        />

                        <div>
                          <strong>{woman.name}</strong>
                          <small>{woman.phone || "No phone"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {[
                        woman.village,
                        woman.district,
                        woman.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </td>

                    <td>{woman.skills || "—"}</td>

                    <td>
                      {woman.partner?.user?.fullName ||
                        woman.partner?.name ||
                        "—"}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${
                          woman.active ? "approved" : "inactive"
                        }`}
                      >
                        {woman.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button className="admin-icon-button">
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <div className="admin-empty">
                No women found.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="admin-page-heading">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div>{children}</div>
    </div>
  );
}

function Summary({ icon: Icon, value, label }) {
  return (
    <article className="admin-summary-card">
      <div>
        <Icon size={24} />
      </div>

      <section>
        <strong>{value}</strong>
        <span>{label}</span>
      </section>
    </article>
  );
}
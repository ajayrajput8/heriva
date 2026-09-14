import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "./adminApi";

const ROLE_LABELS = {
  CUSTOMER: "Customer",
  VILLAGE_PARTNER: "Village Partner",
  ADMIN: "Admin",
};

function formatRole(role) {
  return ROLE_LABELS[String(role || "").toUpperCase()] || role || "Unknown";
}

function formatDate(date) {
  if (!date) return "—";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.user?.fullName ||
    "Unnamed User"
  );
}

function getEmail(user) {
  return user?.email || user?.user?.email || "—";
}

function getPhone(user) {
  return user?.phone || user?.phoneNumber || user?.user?.phone || "—";
}

function getRole(user) {
  return String(
    user?.role ||
      user?.user?.role ||
      ""
  ).toUpperCase();
}

function getStatus(user) {
  if (user?.active === false || user?.enabled === false) {
    return "INACTIVE";
  }

  return "ACTIVE";
}

function getPartnerStatus(user) {
  return (
    user?.partnerStatus ||
    user?.status ||
    user?.partner?.status ||
    "—"
  );
}

function getVillage(user) {
  return (
    user?.village ||
    user?.partner?.village ||
    user?.villagePartner?.village ||
    "—"
  );
}

function getDistrict(user) {
  return (
    user?.district ||
    user?.partner?.district ||
    user?.villagePartner?.district ||
    "—"
  );
}

function getWomenCount(user) {
  if (Array.isArray(user?.women)) {
    return user.women.length;
  }

  if (Array.isArray(user?.partner?.women)) {
    return user.partner.women.length;
  }

  if (Array.isArray(user?.villagePartner?.women)) {
    return user.villagePartner.women.length;
  }

  return user?.womenCount ?? user?.partner?.womenCount ?? 0;
}

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await adminApi.users();

      const list = Array.isArray(data)
        ? data
        : data?.content || [];

      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getEmail(user).toLowerCase();
      const phone = getPhone(user).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const role = getRole(user);

      const matchesRole =
        roleFilter === "ALL" ||
        role === roleFilter;

      const status = getStatus(user);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;

  const customers = users.filter(
    (user) => getRole(user) === "CUSTOMER"
  ).length;

  const villagePartners = users.filter(
    (user) => getRole(user) === "VILLAGE_PARTNER"
  ).length;

  const activeUsers = users.filter(
    (user) => getStatus(user) === "ACTIVE"
  ).length;

  return (
    <div className="admin-page">

      {/* PAGE HEADER */}
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            PEOPLE
          </span>

          <h1>Customers & Users</h1>

          <p>
            Manage customers and Village Partners
            registered on Made by Her.
          </p>
        </div>

        <button
          className="admin-secondary-button"
          onClick={loadUsers}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="admin-summary-grid">

        <div className="admin-summary-card">
          <div className="admin-summary-card-label">
            TOTAL USERS
          </div>

          <div className="admin-summary-card-value">
            {totalUsers}
          </div>

          <div className="admin-summary-card-note">
            All registered accounts
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-summary-card-label">
            CUSTOMERS
          </div>

          <div className="admin-summary-card-value">
            {customers}
          </div>

          <div className="admin-summary-card-note">
            Shopping customers
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-summary-card-label">
            VILLAGE PARTNERS
          </div>

          <div className="admin-summary-card-value">
            {villagePartners}
          </div>

          <div className="admin-summary-card-note">
            Digital partners
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-summary-card-label">
            ACTIVE USERS
          </div>

          <div className="admin-summary-card-value">
            {activeUsers}
          </div>

          <div className="admin-summary-card-note">
            Currently active
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="admin-filter-bar">

        <div className="admin-search-wrapper">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="admin-filter-select"
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="VILLAGE_PARTNER">
            Village Partners
          </option>
          <option value="ADMIN">Admins</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="admin-filter-select"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="admin-table-wrapper">

        {loading ? (
          <div className="admin-loading">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              ◌
            </div>

            <h3>No users found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <table className="admin-table">

            <thead>
              <tr>
                <th>USER</th>
                <th>CONTACT</th>
                <th>ROLE</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>JOINED</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {

                const role = getRole(user);
                const status = getStatus(user);

                return (
                  <tr key={user.id}>

                    {/* USER */}
                    <td>
                      <div className="admin-user-cell">

                        <div className="admin-user-avatar">
                          {getUserName(user)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="admin-user-name">
                            {getUserName(user)}
                          </div>

                          <div className="admin-user-id">
                            ID #{user.id ?? "—"}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* CONTACT */}
                    <td>
                      <div className="admin-contact-cell">
                        <div>
                          {getEmail(user)}
                        </div>

                        <small>
                          {getPhone(user)}
                        </small>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td>

                      <span
                        className={`admin-role-badge ${
                          role === "VILLAGE_PARTNER"
                            ? "partner"
                            : role === "CUSTOMER"
                            ? "customer"
                            : "admin"
                        }`}
                      >
                        {formatRole(role)}
                      </span>

                      {role === "VILLAGE_PARTNER" && (
                        <div className="admin-partner-subtext">
                          {getPartnerStatus(user)}
                        </div>
                      )}

                    </td>

                    {/* LOCATION */}
                    <td>

                      {role === "VILLAGE_PARTNER" ? (
                        <div className="admin-location-cell">
                          <strong>
                            {getVillage(user)}
                          </strong>

                          <small>
                            {getDistrict(user)}
                          </small>
                        </div>
                      ) : (
                        <span className="admin-muted">
                          —
                        </span>
                      )}

                    </td>

                    {/* STATUS */}
                    <td>

                      <span
                        className={`admin-status ${
                          status === "ACTIVE"
                            ? "approved"
                            : "rejected"
                        }`}
                      >
                        <span className="admin-status-dot" />
                        {status}
                      </span>

                    </td>

                    {/* JOINED */}
                    <td>
                      {formatDate(
                        user.createdAt ||
                        user.createdDate ||
                        user.joinedAt
                      )}
                    </td>

                    {/* ACTION */}
                    <td>

                      <div className="admin-row-actions">

                        <button
                          className="admin-icon-button"
                          title="View user"
                          onClick={() =>
                            setSelectedUser(user)
                          }
                        >
                          👁
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        )}

      </div>

      {/* RESULT COUNT */}
      {!loading && (
        <div className="admin-result-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-product-modal admin-user-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="admin-modal-header">

              <div>
                <span className="admin-eyebrow">
                  USER DETAILS
                </span>

                <h2>
                  {getUserName(selectedUser)}
                </h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                ×
              </button>

            </div>

            <div className="admin-user-detail-content">

              <div className="admin-user-detail-avatar">
                {getUserName(selectedUser)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="admin-detail-grid">

                <div className="admin-detail-item">
                  <span>Name</span>
                  <strong>
                    {getUserName(selectedUser)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>User ID</span>
                  <strong>
                    #{selectedUser.id ?? "—"}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Email</span>
                  <strong>
                    {getEmail(selectedUser)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Phone</span>
                  <strong>
                    {getPhone(selectedUser)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Role</span>
                  <strong>
                    {formatRole(
                      getRole(selectedUser)
                    )}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Status</span>
                  <strong>
                    {getStatus(selectedUser)}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <span>Joined</span>
                  <strong>
                    {formatDate(
                      selectedUser.createdAt ||
                      selectedUser.createdDate ||
                      selectedUser.joinedAt
                    )}
                  </strong>
                </div>

                {getRole(selectedUser) ===
                  "VILLAGE_PARTNER" && (
                  <>
                    <div className="admin-detail-item">
                      <span>Partner Status</span>
                      <strong>
                        {getPartnerStatus(
                          selectedUser
                        )}
                      </strong>
                    </div>

                    <div className="admin-detail-item">
                      <span>Village</span>
                      <strong>
                        {getVillage(selectedUser)}
                      </strong>
                    </div>

                    <div className="admin-detail-item">
                      <span>District</span>
                      <strong>
                        {getDistrict(selectedUser)}
                      </strong>
                    </div>

                    <div className="admin-detail-item">
                      <span>Women Managed</span>
                      <strong>
                        {getWomenCount(
                          selectedUser
                        )} / 5
                      </strong>
                    </div>
                  </>
                )}

              </div>

            </div>

            <div className="admin-product-modal-actions">

              <button
                className="admin-secondary-button"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
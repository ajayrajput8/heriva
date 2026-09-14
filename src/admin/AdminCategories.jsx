import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "./adminApi";

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryStatus(category) {
  return category?.active === false ? "INACTIVE" : "ACTIVE";
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await adminApi.categories();

      const list = Array.isArray(data)
        ? data
        : data?.content || [];

      setCategories(list);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      imageUrl: "",
      active: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);

    setForm({
      name: category?.name || "",
      description: category?.description || "",
      imageUrl: category?.imageUrl || "",
      active: category?.active !== false,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      imageUrl: "",
      active: true,
    });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        active: form.active,
      };

      if (editingCategory) {
        await adminApi.updateCategory(
          editingCategory.id,
          payload
        );

        setSuccess("Category updated successfully.");
      } else {
        await adminApi.createCategory(payload);

        setSuccess("Category created successfully.");
      }

      await loadCategories();

      setTimeout(() => {
        setShowModal(false);
        setEditingCategory(null);

        setForm({
          name: "",
          description: "",
          imageUrl: "",
          active: true,
        });

        setSuccess("");
      }, 500);

    } catch (err) {
      console.error("Category save failed:", err);

      setError(
        err.message || "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category) {
    const currentlyActive = category?.active !== false;

    const action = currentlyActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await adminApi.updateCategory(
        category.id,
        {
          name: category.name,
          description: category.description || "",
          imageUrl: category.imageUrl || "",
          active: !currentlyActive,
        }
      );

      setSuccess(
        currentlyActive
          ? "Category deactivated."
          : "Category activated."
      );

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Category status update failed:",
        err
      );

      setError(
        err.message ||
          "Unable to update category status."
      );
    }
  }

  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await adminApi.deleteCategory(category.id);

      setSuccess("Category deactivated successfully.");

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Category deactivation failed:",
        err
      );

      setError(
        err.message ||
          "Unable to deactivate category."
      );
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      const name =
        String(category?.name || "").toLowerCase();

      const description =
        String(
          category?.description || ""
        ).toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter(
    (category) => category?.active !== false
  ).length;

  const inactiveCount = categories.filter(
    (category) => category?.active === false
  ).length;

  return (
    <div className="admin-page admin-categories-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-page-heading">

        <div>
          <span className="admin-eyebrow">
            CATALOG
          </span>

          <h1>Categories</h1>

          <p>
            Manage the product categories available
            across Made by Her.
          </p>
        </div>

        <div className="admin-category-header-actions">

          <button
            type="button"
            className="admin-secondary-button"
            onClick={loadCategories}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openAddModal}
          >
            + Add Category
          </button>

        </div>

      </div>


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (
        <div className="admin-category-success">
          {success}
        </div>
      )}


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && !showModal && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="admin-category-summary">

        <div className="admin-category-summary-card">

          <div className="admin-category-summary-icon">
            ◈
          </div>

          <div>
            <span>Total Categories</span>
            <strong>{categories.length}</strong>
          </div>

        </div>


        <div className="admin-category-summary-card">

          <div className="admin-category-summary-icon active">
            ✓
          </div>

          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>

        </div>


        <div className="admin-category-summary-card">

          <div className="admin-category-summary-icon inactive">
            —
          </div>

          <div>
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH
          ===================================================== */}

      <div className="admin-category-toolbar">

        <div className="admin-category-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <span className="admin-category-result-count">
          {filteredCategories.length} categories
        </span>

      </div>


      {/* =====================================================
          CATEGORY TABLE
          ===================================================== */}

      <div className="admin-table-wrapper admin-category-table-wrapper">

        {loading ? (
          <div className="admin-loading">
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="admin-empty">

            <div className="admin-empty-icon">
              ◈
            </div>

            <h3>
              {search
                ? "No categories found"
                : "No categories yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Create your first product category."}
            </p>

            {!search && (
              <button
                type="button"
                className="admin-primary-button"
                onClick={openAddModal}
              >
                + Add Category
              </button>
            )}

          </div>
        ) : (
          <table className="admin-table">

            <thead>
              <tr>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {filteredCategories.map((category) => {

                const active =
                  category?.active !== false;

                return (
                  <tr key={category.id}>

                    {/* CATEGORY */}

                    <td>

                      <div className="admin-category-name-cell">

                        {category?.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="admin-category-image"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="admin-category-placeholder">
                            {String(
                              category?.name || "?"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>

                          <strong>
                            {category?.name || "Unnamed"}
                          </strong>

                          <small>
                            ID #{category?.id ?? "—"}
                          </small>

                        </div>

                      </div>

                    </td>


                    {/* DESCRIPTION */}

                    <td>

                      <div className="admin-category-description">

                        {category?.description ? (
                          category.description
                        ) : (
                          <span className="admin-muted">
                            No description
                          </span>
                        )}

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`admin-status ${
                          active
                            ? "approved"
                            : "rejected"
                        }`}
                      >
                        <span className="admin-status-dot" />

                        {getCategoryStatus(category)}

                      </span>

                    </td>


                    {/* CREATED */}

                    <td>
                      {formatDate(
                        category?.createdAt
                      )}
                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="admin-row-actions">

                        <button
                          type="button"
                          className="admin-category-action edit"
                          onClick={() =>
                            openEditModal(category)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={`admin-category-action ${
                            active
                              ? "deactivate"
                              : "activate"
                          }`}
                          onClick={() =>
                            toggleCategory(category)
                          }
                        >
                          {active
                            ? "Deactivate"
                            : "Activate"}
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


      {/* =====================================================
          ADD / EDIT MODAL
          ===================================================== */}

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="admin-category-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="admin-modal-header">

              <div>

                <span className="admin-eyebrow">
                  {editingCategory
                    ? "EDIT CATEGORY"
                    : "NEW CATEGORY"}
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="admin-category-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}


              {/* NAME */}

              <div className="admin-form-group">

                <label htmlFor="category-name">
                  Category Name
                  <span>*</span>
                </label>

                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Handicrafts"
                  maxLength={100}
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="admin-form-group">

                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what kind of products belong in this category..."
                  rows={4}
                  maxLength={500}
                />

                <small>
                  {form.description.length}/500
                </small>

              </div>


              {/* IMAGE */}

              <div className="admin-form-group">

                <label htmlFor="category-image">
                  Category Image URL
                </label>

                <input
                  id="category-image"
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />

                <small>
                  Add a public image URL for the category.
                </small>

              </div>


              {/* IMAGE PREVIEW */}

              {form.imageUrl && (
                <div className="admin-category-preview">

                  <img
                    src={form.imageUrl}
                    alt="Category preview"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>
              )}


              {/* ACTIVE */}

              <label className="admin-category-active-toggle">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />

                <span className="admin-category-toggle-box">
                  ✓
                </span>

                <span>
                  <strong>
                    Active category
                  </strong>

                  <small>
                    Customers can see this category
                    when it is active.
                  </small>
                </span>

              </label>


              {/* ACTIONS */}

              <div className="admin-category-form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Save Changes"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Bell,
  Search,
  ChevronDown,
  Home,
  UsersRound,
  Tag,
  ShoppingBag,
  BarChart3,
  BookOpen,
  MessageSquare,
  PieChart,
  UserRound,
  Settings,
  Plus,
  Heart,
  Package,
  CheckCircle2,
  PauseCircle,
  Pencil,
  Trash2,
  X,
  Menu,
  Upload,
} from "lucide-react";

import "./PartnerProducts.css";
import "./VillagePartnerDashboard.css";


/* =========================================================
   API
   ========================================================= */

const API_BASE = "http://localhost:8080/api";


/* =========================================================
   VILLAGE PARTNER NAVIGATION
   ========================================================= */

const partnerNavItems = [
  {
    label: "Dashboard",
    path: "/partner/dashboard",
    icon: Home,
  },
  {
    label: "Manage Women",
    path: "/partner/women",
    icon: UsersRound,
  },
  {
    label: "Products",
    path: "/partner/products",
    icon: Tag,
  },
  {
    label: "Orders",
    path: "/partner/orders",
    icon: ShoppingBag,
  },
  {
    label: "Earnings",
    path: "/partner/earnings",
    icon: BarChart3,
  },
  {
    label: "Training & Resources",
    path: "/partner/training",
    icon: BookOpen,
  },
  {
    label: "Community Support",
    path: "/partner/community",
    icon: UsersRound,
  },
  {
    label: "Messages",
    path: "/partner/messages",
    icon: MessageSquare,
  },
  {
    label: "Reports",
    path: "/partner/reports",
    icon: PieChart,
  },
  {
    label: "Profile",
    path: "/partner/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    path: "/partner/settings",
    icon: Settings,
  },
];


/* =========================================================
   EMPTY FORM
   ========================================================= */

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  womanId: "",
  mainImageUrl: "",
  weightKg: "",
  featured: false,
};


/* =========================================================
   TOKEN
   ========================================================= */

function getToken() {
  return localStorage.getItem("token") || "";
}


/* =========================================================
   STATUS
   ========================================================= */

function getDisplayStatus(product) {
  const stock = Number(product?.stockQuantity ?? 0);

  if (stock === 0) {
    return "OUT_OF_STOCK";
  }

  if (stock <= 10) {
    return "LOW_STOCK";
  }

  return product?.status || "ACTIVE";
}


/* =========================================================
   STATUS LABEL
   ========================================================= */

function getStatusLabel(status) {
  switch (status) {
    case "ACTIVE":
      return "Published";

    case "LOW_STOCK":
      return "Low Stock";

    case "OUT_OF_STOCK":
      return "Out of Stock";

    case "DRAFT":
      return "Draft";

    default:
      return status;
  }
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function PartnerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [women, setWomen] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [womanFilter, setWomanFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);


  /* =======================================================
     USER
     ======================================================= */

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName =
    user?.fullName || "Village Partner";

  const userInitial =
    userName.charAt(0).toUpperCase();


  /* =======================================================
     LOAD DATA
     ======================================================= */

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadWomen();
  }, []);


  /* =======================================================
     LOAD PRODUCTS
     ======================================================= */

  async function loadProducts() {
  setLoading(true);
  setError("");

  try {
    const token = getToken();

    if (!token) {
      throw new Error("You are not logged in. Please login again.");
    }

    const response = await fetch(
      `${API_BASE}/products/partner`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "Products API failed:",
        response.status,
        data
      );

      throw new Error(
        data?.message ||
        data?.error ||
        `Unable to load products. Server returned ${response.status}`
      );
    }

    const list = Array.isArray(data)
      ? data
      : data.content || [];

    setProducts(list);
  } catch (err) {
    console.error("Product loading error:", err);

    setProducts([]);
    setError(
      err.message ||
      "Products could not be loaded from the backend."
    );
  } finally {
    setLoading(false);
  }
}


  /* =======================================================
     LOAD CATEGORIES
     ======================================================= */

  async function loadCategories() {
    try {
      const response = await fetch(
        `${API_BASE}/categories`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setCategories(
        Array.isArray(data)
          ? data
          : data.content || []
      );
    } catch (err) {
      console.error("Category loading error:", err);
    }
  }


  /* =======================================================
     LOAD WOMEN
     ======================================================= */

  async function loadWomen() {
    try {
      const response = await fetch(
        `${API_BASE}/partner/women`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setWomen(
        Array.isArray(data)
          ? data
          : data.content || []
      );
    } catch (err) {
      console.error("Women loading error:", err);
    }
  }


  /* =======================================================
     FILTER + SORT
     ======================================================= */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    const query = search.trim().toLowerCase();


    /* SEARCH */

    if (query) {
      list = list.filter((product) => {
        const searchableValues = [
          product?.name,
          product?.description,
          product?.woman?.name,
          product?.category?.name,
        ];

        return searchableValues
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      });
    }


    /* CATEGORY */

    if (categoryFilter !== "ALL") {
      list = list.filter(
        (product) =>
          String(
            product?.category?.id ??
              product?.categoryId ??
              ""
          ) === String(categoryFilter)
      );
    }


    /* STATUS */

    if (statusFilter !== "ALL") {
      list = list.filter(
        (product) =>
          getDisplayStatus(product) ===
          statusFilter
      );
    }


    /* WOMAN */

    if (womanFilter !== "ALL") {
      list = list.filter(
        (product) =>
          String(
            product?.woman?.id ??
              product?.womanId ??
              ""
          ) === String(womanFilter)
      );
    }


    /* SORT */

    if (sortBy === "PRICE_LOW") {
      list.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    else if (sortBy === "PRICE_HIGH") {
      list.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    else if (sortBy === "NAME") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    womanFilter,
    sortBy,
  ]);


  /* =======================================================
     STATS
     ======================================================= */

  const stats = useMemo(() => {
    const total = products.length;

    const active = products.filter(
      (product) =>
        getDisplayStatus(product) === "ACTIVE"
    ).length;

    const drafts = products.filter(
      (product) =>
        product?.status === "DRAFT"
    ).length;

    const outOfStock = products.filter(
      (product) =>
        Number(product?.stockQuantity || 0) === 0
    ).length;

    return {
      total,
      active,
      drafts,
      outOfStock,
    };
  }, [products]);


  /* =======================================================
     CLOUDINARY PRODUCT IMAGE UPLOAD
     ======================================================= */

  async function uploadProductImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Image size must be less than 5 MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setSaveError("");

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const uploadData = new FormData();

      uploadData.append("file", file);

      // Replace with the unsigned upload preset created in Cloudinary.
      uploadData.append(
        "upload_preset",
        "made_by_her"
      );

      // Product images are kept in their own Cloudinary folder.
      uploadData.append(
        "folder",
        "made-by-her/products"
      );

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dz59agoyk/image/upload",
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Unable to upload product image."
        );
      }

      // Save Cloudinary's secure URL into the product form.
      setForm((current) => ({
        ...current,
        mainImageUrl: data.secure_url || "",
      }));

      setImagePreview(data.secure_url || previewUrl);
    } catch (err) {
      console.error("Product image upload error:", err);

      setSaveError(
        err.message || "Product image upload failed."
      );

      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  }


  /* =======================================================
     CREATE PRODUCT
     ======================================================= */

  function openCreateModal() {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
    });

    setImagePreview("");

    setSaveError("");
    setShowModal(true);
  }


  /* =======================================================
     EDIT PRODUCT
     ======================================================= */

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      name: product?.name || "",

      description:
        product?.description || "",

      price:
        product?.price ?? "",

      stockQuantity:
        product?.stockQuantity ?? "",

      categoryId:
        product?.category?.id ??
        product?.categoryId ??
        "",

      womanId:
        product?.woman?.id ??
        product?.womanId ??
        "",

      mainImageUrl:
        product?.mainImageUrl || "",

      weightKg:
        product?.weightKg ?? "",

      featured:
        Boolean(product?.featured),
    });

    setImagePreview(product?.mainImageUrl || "");

    setSaveError("");
    setShowModal(true);
  }


  /* =======================================================
     FORM CHANGE
     ======================================================= */

  function handleFormChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }


  /* =======================================================
     SAVE PRODUCT
     ======================================================= */

  async function handleSaveProduct(event) {
    event.preventDefault();

    setSaveError("");

    if (uploadingImage) {
      setSaveError("Please wait for the image to finish uploading.");
      return;
    }

    if (!form.name.trim()) {
      setSaveError(
        "Please enter a product name."
      );
      return;
    }

    if (!form.price) {
      setSaveError(
        "Please enter the product price."
      );
      return;
    }

    if (
      form.stockQuantity === "" ||
      form.stockQuantity === null
    ) {
      setSaveError(
        "Please enter the stock quantity."
      );
      return;
    }

    if (!form.categoryId) {
      setSaveError(
        "Please select a category."
      );
      return;
    }

    if (!form.womanId) {
      setSaveError(
        "Please select the woman artisan."
      );
      return;
    }


    /* Backend ProductRequest */

    const payload = {
      name: form.name.trim(),

      description:
        form.description.trim(),

      price: Number(form.price),

      stockQuantity:
        Number(form.stockQuantity),

      categoryId:
        Number(form.categoryId),

      womanId:
        Number(form.womanId),

      mainImageUrl:
        form.mainImageUrl.trim(),

      imageUrls: [],

      weightKg:
        form.weightKg !== ""
          ? Number(form.weightKg)
          : null,

      featured:
        Boolean(form.featured),
    };


    setSaving(true);

    try {
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id}`
        : `${API_BASE}/products`;

      const response = await fetch(url, {
        method: editingProduct
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${getToken()}`,
        },

        body: JSON.stringify(payload),
      });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to save product."
        );
      }

      setShowModal(false);

      setEditingProduct(null);

      setForm({
        ...emptyForm,
      });

      await loadProducts();

    } catch (err) {
      console.error(err);

      setSaveError(
        err.message ||
          "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     DELETE PRODUCT
     ======================================================= */

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product?.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/products/${product.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to delete product."
        );
      }

      await loadProducts();

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to delete product."
      );
    }
  }


  /* =======================================================
     IMAGE
     ======================================================= */

  function getProductImage(product) {
    return (
      product?.mainImageUrl ||
      product?.imageUrls?.[0] ||
      "/assets/partners-reference.jpg"
    );
  }


  /* =======================================================
     RESET FILTERS
     ======================================================= */

  function resetFilters() {
    setSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setWomanFilter("ALL");
    setSortBy("NEWEST");
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="partner-dashboard partner-products-page">


      {/* =====================================================
          VILLAGE PARTNER HEADER
          SAME HEADER STRUCTURE AS MANAGE WOMEN
          ===================================================== */}

      {/*<header className="manage-header">

        <Link
          to="/partner/dashboard"
          className="manage-brand"
        >
          <div className="manage-brand-mark">
            ♧
          </div>

          <div>
            <strong>
              Made By Her
            </strong>

            <small>
              Rural Hands. Brighter Tomorrows.
            </small>
          </div>
        </Link>


        <div className="manage-header-right">

          <div className="manage-header-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search women, products, skills..."
            />

          </div>


          <button
            type="button"
            className="manage-notification"
          >
            <Bell size={21} />

            <span>
              3
            </span>
          </button>


          <div className="manage-profile">

            <div className="manage-avatar">
              {userInitial}
            </div>

            <div>
              <b>
                {userName}
              </b>

              <small>
                Village Partner
              </small>

              <small>
                {user?.village ||
                  user?.district ||
                  "Bamanwas, Rajasthan"}
              </small>
            </div>

            <ChevronDown size={16} />

          </div>

        </div>

      </header>*/}


      {/* =====================================================
          DASHBOARD
          ===================================================== */}

      {/* =========================================================
          MOBILE PARTNER MENU
          SAME SIDEBAR SYSTEM AS DASHBOARD
          ========================================================= */}

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
                to="/partner/dashboard"
                end
                className={({ isActive }) =>
                  isActive ? "dashboard-nav-active" : ""
                }
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

      <div className="dashboard-layout">

        {/* ===================================================
            DESKTOP SIDEBAR
            EXACT SAME SIDEBAR AS VILLAGE PARTNER DASHBOARD
            =================================================== */}

        <aside className="dashboard-sidebar">
          <nav>
            <NavLink
              to="/partner/dashboard"
              end
              className={({ isActive }) =>
                isActive ? "dashboard-nav-active" : ""
              }
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
            <span>"Stronger</span>
            <span>Villages,</span>
            <span>Brighter</span>
            <span>Tomorrows"</span>
            <b>♡</b>
          </div>
        </aside>

        {/* ===================================================
            MAIN
            =================================================== */}

        <main className="dashboard-main manage-women-main">


          {/* =================================================
              HERO
              ================================================= */}

          <section className="manage-hero">


            <div>

              <span>
                VILLAGE PARTNER
              </span>

              <h1>
                Products
              </h1>

              <p>
                Add, manage and showcase handmade
                products created by the women in your village.
              </p>

            </div>


            {/* HERO MESSAGE */}

            <div className="manage-hero-message">

              Handmade
              <br />

              <em>
                Real Impact
              </em>

              <span>
                ♡
              </span>

            </div>


            {/* HERO IMAGE */}


            {/* ADD PRODUCT */}

            <button
              type="button"
              className="add-woman-btn products-add-btn"
              onClick={openCreateModal}
            >

              <Plus size={18} />

              Add New Product

            </button>

          </section>


          {/* =================================================
              PRODUCT CONTENT
              ================================================= */}

          <section className="products-content">


            {/* =================================================
                CENTER
                ================================================= */}

            <div className="products-center">


              {/* ===============================================
                  STAT CARDS
                  =============================================== */}

              <div className="product-stats">

                <StatCard
                  icon={
                    <Package size={27} />
                  }
                  value={stats.total}
                  label="Total Products"
                  note="Products listed"
                  tone="rose"
                />

                <StatCard
                  icon={
                    <CheckCircle2 size={27} />
                  }
                  value={stats.active}
                  label="Active Products"
                  note="Currently published"
                  tone="green"
                />

                <StatCard
                  icon={
                    <PauseCircle size={27} />
                  }
                  value={stats.drafts}
                  label="Drafts"
                  note="Not published yet"
                  tone="peach"
                />

                <StatCard
                  icon={
                    <Package size={27} />
                  }
                  value={stats.outOfStock}
                  label="Out of Stock"
                  note="Needs attention"
                  tone="peach"
                />

              </div>


              {/* ===============================================
                  FILTERS
                  =============================================== */}

              <div className="product-filters">


                {/* SEARCH */}

                <div className="product-search-box">

                  <Search size={18} />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search products by name, category, or artisan..."
                  />

                </div>


                {/* CATEGORY */}

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                >

                  <option value="ALL">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>


                {/* STATUS */}

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >

                  <option value="ALL">
                    All Status
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="LOW_STOCK">
                    Low Stock
                  </option>

                  <option value="OUT_OF_STOCK">
                    Out of Stock
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>

                </select>


                {/* WOMAN */}

                <select
                  value={womanFilter}
                  onChange={(e) =>
                    setWomanFilter(e.target.value)
                  }
                >

                  <option value="ALL">
                    All Women
                  </option>

                  {women.map((woman) => (
                    <option
                      key={woman.id}
                      value={woman.id}
                    >
                      {woman.name}
                    </option>
                  ))}

                </select>


                {/* SORT */}

                <div className="sort-wrapper">

                  <span>
                    Sort By
                  </span>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                  >

                    <option value="NEWEST">
                      Newest First
                    </option>

                    <option value="PRICE_LOW">
                      Price: Low to High
                    </option>

                    <option value="PRICE_HIGH">
                      Price: High to Low
                    </option>

                    <option value="NAME">
                      Name
                    </option>

                  </select>

                </div>

              </div>


              {/* ===============================================
                  ERROR
                  =============================================== */}

              {error && (
                <div className="products-info">
                  {error}
                </div>
              )}


              {/* ===============================================
                  LOADING
                  =============================================== */}

              {loading ? (

                <div className="products-loading">
                  Loading products...
                </div>

              ) : filteredProducts.length === 0 ? (

                /* =============================================
                   EMPTY
                   ============================================= */

                <div className="products-empty">

                  <Package size={42} />

                  <h3>
                    No products found
                  </h3>

                  <p>
                    There are no products matching
                    your current filters.
                  </p>


                  {(search ||
                    categoryFilter !== "ALL" ||
                    statusFilter !== "ALL" ||
                    womanFilter !== "ALL") && (

                    <button
                      type="button"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>

                  )}

                  {!search &&
                    categoryFilter === "ALL" &&
                    statusFilter === "ALL" &&
                    womanFilter === "ALL" && (

                      <button
                        type="button"
                        onClick={openCreateModal}
                      >
                        <Plus size={17} />
                        Add New Product
                      </button>

                    )}

                </div>

              ) : (

                /* =============================================
                   PRODUCTS
                   ============================================= */

                <div className="product-grid">

                  {filteredProducts.map(
                    (product) => (

                      <ProductCard
                        key={product.id}
                        product={product}
                        image={getProductImage(product)}
                        onEdit={() =>
                          openEditModal(product)
                        }
                        onDelete={() =>
                          handleDelete(product)
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                RIGHT PANEL
                ================================================= */}

            <aside className="products-right-panel">


              {/* =================================================
                  CATEGORIES
                  ================================================= */}

              <div className="side-card">

                <div className="side-card-heading">

                  <h2>
                    Categories
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setCategoryFilter("ALL")
                    }
                  >
                    Manage
                  </button>

                </div>


                <div className="category-list">

                  {categories.length > 0 ? (

                    categories
                      .slice(0, 7)
                      .map((category) => (

                        <button
                          type="button"
                          key={category.id}
                          onClick={() =>
                            setCategoryFilter(
                              String(category.id)
                            )
                          }
                        >

                          <span className="category-icon">
                            <Tag size={17} />
                          </span>

                          <span>
                            {category.name}
                          </span>

                          <b>
                            ›
                          </b>

                        </button>

                      ))

                  ) : (

                    <div className="category-list-empty">
                      No categories available.
                    </div>

                  )}

                </div>

              </div>


              {/* =================================================
                  PRODUCT TIPS
                  ================================================= */}

              <div className="side-card tips-card">

                <div className="tips-title">

                  <span>
                    ♧
                  </span>

                  <h2>
                    Product Tips
                  </h2>

                </div>


                <Tip text="Use clear, natural photos" />

                <Tip text="Add meaningful descriptions" />

                <Tip text="Mention the woman artisan" />

                <Tip text="Keep prices fair and competitive" />

                <Tip text="Highlight the story behind the product" />

              </div>


              {/* =================================================
                  STORY CARD
                  ================================================= */}

              <div className="side-story-card">

                <div className="story-image">

                  <img
                    src="/assets/village_partner1.png"
                    alt="Woman artisan"
                  />

                </div>


                <div className="story-content">

                  <span>
                    Every Product
                  </span>

                  <strong>
                    Tells a Story
                  </strong>

                  <button
                    type="button"
                    onClick={openCreateModal}
                  >
                    Add a Product
                    <span>
                      →
                    </span>
                  </button>

                </div>

              </div>

            </aside>

          </section>

        </main>

      </div>


      {/* =======================================================
          FOOTER
          ======================================================= */}

      <footer className="products-footer">

        <span>
          © 2024 Made By Her. All rights reserved.
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


      {/* =======================================================
          PRODUCT MODAL
          ======================================================= */}

      {showModal && (

        <div
          className="product-modal-overlay"
          onMouseDown={() =>
            setShowModal(false)
          }
        >

          <div
            className="product-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >


            {/* ================================================
                MODAL HEADER
                ================================================ */}

            <div className="product-modal-header">

              <div>

                <span>
                  VILLAGE PARTNER
                </span>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* ================================================
                FORM
                ================================================ */}

            <form
              onSubmit={handleSaveProduct}
            >

              <div className="modal-form-grid">


                {/* PRODUCT NAME */}

                <label>

                  Product Name

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Hand Embroidered Tote Bag"
                    required
                  />

                </label>


                {/* PRICE */}

                <label>

                  Price

                  <input
                    name="price"
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="499"
                    required
                  />

                </label>


                {/* STOCK */}

                <label>

                  Stock Quantity

                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={handleFormChange}
                    placeholder="25"
                    required
                  />

                </label>


                {/* WEIGHT */}

                <label>

                  Weight (kg)

                  <input
                    name="weightKg"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weightKg}
                    onChange={handleFormChange}
                    placeholder="0.50"
                  />

                </label>


                {/* CATEGORY */}

                <label>

                  Category

                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleFormChange}
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (

                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>

                      )
                    )}

                  </select>

                </label>


                {/* WOMAN */}

                <label>

                  Woman Artisan

                  <select
                    name="womanId"
                    value={form.womanId}
                    onChange={handleFormChange}
                    required
                  >

                    <option value="">
                      Select woman
                    </option>

                    {women.map(
                      (woman) => (

                        <option
                          key={woman.id}
                          value={woman.id}
                        >
                          {woman.name}
                        </option>

                      )
                    )}

                  </select>

                </label>


                {/* IMAGE */}

                <label className="full-field product-photo-field">

                  Product Photo

                  <div className="product-image-upload-box">

                    <input
                      id="product-photo-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          uploadProductImage(file);
                        }

                        // Allow selecting the same image again.
                        event.target.value = "";
                      }}
                    />

                    <label
                      htmlFor="product-photo-upload"
                      className="product-image-upload-button"
                    >
                      <Upload size={14} />

                      <span>
                        {uploadingImage ? "Uploading..." : imagePreview ? "Change Photo" : "Choose Photo"}
                      </span>

                    </label>

                    <span className="product-image-upload-help">
                      JPG, PNG or WEBP • Maximum 5 MB
                    </span>

                    {(imagePreview || form.mainImageUrl) && (
                      <div className="product-image-preview">

                        <img
                          src={imagePreview || form.mainImageUrl}
                          alt="Product preview"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        <div className="product-image-preview-info">

                          <strong>
                            {uploadingImage
                              ? "Uploading image..."
                              : "Image selected"}
                          </strong>

                          <button
                            type="button"
                            className="product-remove-image-btn"
                            onClick={() => {
                              setImagePreview("");
                              setForm((current) => ({
                                ...current,
                                mainImageUrl: "",
                              }));
                            }}
                            disabled={uploadingImage}
                          >
                            <X size={14} />
                            Remove
                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                </label>


                {/* DESCRIPTION */}

                <label className="full-field">

                  Description

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Tell the story behind this handmade product..."
                    rows="4"
                  />

                </label>


                {/* FEATURED */}

                <label className="featured-checkbox">

                  <input
                    name="featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={handleFormChange}
                  />

                  <span>
                    Feature this product on the marketplace
                  </span>

                </label>

              </div>


              {/* ==============================================
                  ERROR
                  ============================================== */}

              {saveError && (

                <div className="modal-error">
                  {saveError}
                </div>

              )}


              {/* ==============================================
                  ACTIONS
                  ============================================== */}

              <div className="product-modal-actions">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="modal-save"
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  value,
  label,
  note,
  tone,
}) {
  return (
    <div
      className={`product-stat-card ${tone}`}
    >

      <div className="product-stat-icon">
        {icon}
      </div>

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

        {note && (
          <small>
            {note}
          </small>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   TIP
   ========================================================= */

function Tip({ text }) {
  return (
    <div className="tip-row">

      <CheckCircle2 size={19} />

      <span>
        {text}
      </span>

    </div>
  );
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  image,
  onEdit,
  onDelete,
}) {
  const status =
    getDisplayStatus(product);

  const statusText =
    getStatusLabel(status);

  const stock =
    Number(product?.stockQuantity || 0);

  const womanName =
    product?.woman?.name ||
    "Woman Artisan";

  const womanVillage =
    product?.woman?.village ||
    product?.woman?.district ||
    "Village Partner";


  return (
    <article className="product-card">


      {/* =====================================================
          IMAGE
          ===================================================== */}

      <div className="product-image-wrap">

        <img
          src={image}
          alt={product?.name || "Product"}
          onError={(event) => {
            event.currentTarget.src =
              "/assets/partners-reference.jpg";
          }}
        />


        {/* HEART */}

        <button
          type="button"
          className="product-heart"
          aria-label="Favourite product"
        >
          <Heart size={17} />
        </button>


        {/* STATUS */}

        <span
          className={`product-status ${status.toLowerCase()}`}
        >
          {statusText}
        </span>

      </div>


      {/* =====================================================
          BODY
          ===================================================== */}

      <div className="product-card-body">

        <h3>
          {product?.name}
        </h3>


        {/* PRICE */}

        <div className="product-price-row">

          <strong>
            ₹{" "}
            {Number(
              product?.price || 0
            ).toLocaleString("en-IN")}
          </strong>

          <span
            className={
              stock === 0
                ? "stock-red"
                : "stock-green"
            }
          >
            Stock: {stock}
          </span>

        </div>


        {/* ARTISAN */}

        <div className="product-artisan">

          <div className="artisan-avatar">

            {product?.woman?.photoUrl ? (

              <img
                src={product.woman.photoUrl}
                alt={womanName}
              />

            ) : (

              womanName
                .charAt(0)
                .toUpperCase()

            )}

          </div>


          <div>

            <b>
              {womanName}
            </b>

            <small>
              {womanVillage}
            </small>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="product-card-actions">

          <button
            type="button"
            onClick={onEdit}
          >

            <Pencil size={14} />

            Edit

          </button>


          <button
            type="button"
            className="more-button"
            onClick={onDelete}
            title="Delete product"
          >

            <Trash2 size={16} />

          </button>

        </div>

      </div>

    </article>
  );
}
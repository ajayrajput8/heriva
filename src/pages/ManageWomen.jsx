import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Search,
  Bell,
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
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  CalendarDays,
  UserRoundCheck,
  X,
  ArrowRight,
  Menu,
} from "lucide-react";

import "../pages/VillagePartnerDashboard.css";
import "./ManageWomen.css";

const API_URL = "https://heriva-backend.onrender.com/api";

export default function ManageWomen() {
  const [women, setWomen] = useState([]);
  const [selectedWoman, setSelectedWoman] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [skillFilter, setSkillFilter] = useState("ALL");
  const [villageFilter, setVillageFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingWoman, setEditingWoman] = useState(null);

  // Mobile Village Partner sidebar.
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    photoUrl: "",
    story: "",
    skills: "",
    active: true,
  });


  // ==================================================
  // TOKEN
  // ==================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };


  const uploadImageToCloudinary = async (file) => {
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append(
        "upload_preset",
        "made_by_her"
      );

      // Optional folder
      uploadData.append(
        "folder",
        "made-by-her/women"
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
          data?.error?.message || "Unable to upload image."
        );
      }

      // Save Cloudinary URL into form
      updateForm("photoUrl", data.secure_url);

      setImagePreview(data.secure_url);
    } catch (err) {
      setError(err.message || "Image upload failed.");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };


  // ==================================================
  // FETCH WOMEN
  // ==================================================

  const fetchWomen = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login as a Village Partner.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/partner/women`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load women."
        );
      }

      setWomen(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        setSelectedWoman(data[0]);
      } else {
        setSelectedWoman(null);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchWomen();
  }, []);


  // ==================================================
  // UNIQUE SKILLS
  // ==================================================

  const skills = useMemo(() => {
    const allSkills = women.flatMap((woman) => {
      if (!woman.skills) {
        return [];
      }

      if (Array.isArray(woman.skills)) {
        return woman.skills;
      }

      return woman.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    });

    return [...new Set(allSkills)];
  }, [women]);


  // ==================================================
  // VILLAGES
  // ==================================================

  const villages = useMemo(() => {
    return [
      ...new Set(
        women
          .map((woman) => woman.village)
          .filter(Boolean)
      ),
    ];
  }, [women]);


  // ==================================================
  // NORMALIZE SKILLS
  // ==================================================

  const getSkills = (woman) => {
    if (!woman?.skills) {
      return [];
    }

    if (Array.isArray(woman.skills)) {
      return woman.skills;
    }

    return woman.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };


  // ==================================================
  // FILTER WOMEN
  // ==================================================

  const filteredWomen = useMemo(() => {
    return women.filter((woman) => {
      const womanSkills = getSkills(woman);

      const matchesSearch =
        !search ||
        woman.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        woman.phone
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        womanSkills.some((skill) =>
          skill
            .toLowerCase()
            .includes(search.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && woman.active) ||
        (statusFilter === "INACTIVE" && !woman.active);

      const matchesSkill =
        skillFilter === "ALL" ||
        womanSkills.includes(skillFilter);

      const matchesVillage =
        villageFilter === "ALL" ||
        woman.village === villageFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSkill &&
        matchesVillage
      );
    });
  }, [
    women,
    search,
    statusFilter,
    skillFilter,
    villageFilter,
  ]);


  // ==================================================
  // STATS
  // ==================================================

  const totalWomen = women.length;

  const activeWomen = women.filter(
    (woman) => woman.active
  ).length;

  const inactiveWomen = women.filter(
    (woman) => !woman.active
  ).length;


  // ==================================================
  // OPEN ADD MODAL
  // ==================================================

  const openAddModal = () => {
    setEditingWoman(null);

    setForm({
      name: "",
      phone: "",
      village: "",
      district: "",
      state: "",
      photoUrl: "",
      story: "",
      skills: "",
      active: true,
    });

    setImagePreview("");

    setShowModal(true);
    setError("");
  };


  // ==================================================
  // OPEN EDIT MODAL
  // ==================================================

  const openEditModal = (woman) => {
    setEditingWoman(woman);

    setForm({
      name: woman.name || "",
      phone: woman.phone || "",
      village: woman.village || "",
      district: woman.district || "",
      state: woman.state || "",
      photoUrl: woman.photoUrl || "",
      story: woman.story || "",
      skills: Array.isArray(woman.skills)
        ? woman.skills.join(", ")
        : woman.skills || "",
      active:
        woman.active !== undefined
          ? woman.active
          : true,
    });

    setImagePreview(woman.photoUrl || "");

    setShowModal(true);
    setError("");
  };


  // ==================================================
  // FORM CHANGE
  // ==================================================

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  // ==================================================
  // SAVE WOMAN
  // ==================================================

  const saveWoman = async (event) => {
    event.preventDefault();

    if (uploadingImage) {
      setError("Please wait for the image to finish uploading.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter the woman's name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter the phone number.");
      return;
    }

    if (!form.village.trim()) {
      setError("Please enter the village.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingWoman);

      const url = isEditing
        ? `${API_URL}/partner/women/${editingWoman.id}`
        : `${API_URL}/partner/women`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const body = {
        name: form.name,
        phone: form.phone,
        village: form.village,
        district: form.district,
        state: form.state,
        photoUrl: form.photoUrl,
        story: form.story,
        skills: form.skills,
        active: form.active,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save woman."
        );
      }

      setShowModal(false);

      await fetchWomen();

      if (data?.id) {
        setSelectedWoman(data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // DELETE WOMAN
  // ==================================================

  const deleteWoman = async (woman) => {
    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${woman.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/partner/women/${woman.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(
          data.message ||
            "Unable to delete woman."
        );
      }

      if (selectedWoman?.id === woman.id) {
        setSelectedWoman(null);
      }

      await fetchWomen();

    } catch (err) {
      setError(err.message);
    }
  };


  // ==================================================
  // RESET FILTERS
  // ==================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSkillFilter("ALL");
    setVillageFilter("ALL");
  };


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==================================================
  // USER
  // ==================================================

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    user = {};
  }


  return (
    <div className="partner-dashboard manage-women-page">

      {/* ==================================================
          HEADER
      ================================================== */}

     {/*} <header className="partner-dashboard-header">

        {/* LOGO */}
        {/*<div className="dashboard-brand">

            <div className="dashboard-logo">
            ♡
            </div>

            <div>
            <strong>
                Made By Her
            </strong>

            <small>
                Rural Hands. Brighter Tomorrows.
            </small>
            </div>

        </div>


        {/* HEADER RIGHT */}
        {/*<div className="dashboard-header-actions">

            <div className="dashboard-search">

            <Search size={17} />

            <input
                type="text"
                placeholder="Search products, women, orders..."
            />

            </div>


            <button className="notification-btn">

            <Bell size={20} />

            <span>
                3
            </span>

            </button>


            <div className="dashboard-profile">

            <div className="dashboard-avatar">
                {user?.fullName
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </div>

            <div>

                <b>
                {user?.fullName || "Village Partner"}
                </b>

                <small>
                Village Partner
                </small>

            </div>

            <ChevronDown size={16} />

            </div>

        </div>

        </header>*/}

      {/* ==================================================
          BODY
      ================================================== */}

      <div className="dashboard-layout manage-layout">

          <aside className="dashboard-sidebar manage-sidebar">

            <nav>

                <NavLink
                  to="/partner/dashboard"
                  end
                  className={({ isActive }) =>
                    isActive ? "dashboard-nav-active manage-active" : ""
                  }
                >
                  <Home size={19} />
                  Dashboard
                </NavLink>


                <NavLink
                  to="/partner/women"
                  className={({ isActive }) =>
                    isActive ? "dashboard-nav-active manage-active" : ""
                  }
                >
                  <UsersRound size={19} />
                  Manage Women
                </NavLink>


                <NavLink
                  to="/partner/products"
                  className={({ isActive }) =>
                    isActive ? "dashboard-nav-active manage-active" : ""
                  }
                >
                  <Tag size={19} />
                  Products
                </NavLink>


                <NavLink
                  to="/partner/orders"
                  className={({ isActive }) =>
                    isActive ? "dashboard-nav-active manage-active" : ""
                  }
                >
                  <ShoppingBag size={19} />
                  Orders
                </NavLink>


                <NavLink
                  to="/partner/earnings"
                  className={({ isActive }) =>
                    isActive ? "dashboard-nav-active manage-active" : ""
                  }
                >
                  <BarChart3 size={19} />
                  Earnings
                </NavLink>


                {/*<a href="#">
                <BookOpen size={19} />
                Training & Resources
                </a>


                <a href="#">
                <UsersRound size={19} />
                Community Support
                </a>


                <a href="#">

                <MessageSquare size={19} />

                Messages

                <span className="nav-notification">
                    2
                </span>

                </a>


                <a href="#">
                <PieChart size={19} />
                Reports
                </a>


                <a href="#">
                <UserRound size={19} />
                Profile
                </a>


                <a href="#">
                <Settings size={19} />
                Settings
                </a>*/}

            </nav>


            <div className="manage-sidebar-quote">

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
            MOBILE VILLAGE PARTNER MENU
            Uses the exact same structure/classes as the dashboard
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
                  className={({ isActive }) =>
                    isActive
                      ? "dashboard-nav-active"
                      : ""
                  }
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Home size={19} />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/partner/women"
                  className={({ isActive }) =>
                    isActive
                      ? "dashboard-nav-active"
                      : ""
                  }
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <UsersRound size={19} />
                  Manage Women
                </NavLink>

                <NavLink
                  to="/partner/products"
                  className={({ isActive }) =>
                    isActive
                      ? "dashboard-nav-active"
                      : ""
                  }
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Tag size={19} />
                  Products
                </NavLink>

                <NavLink
                  to="/partner/orders"
                  className={({ isActive }) =>
                    isActive
                      ? "dashboard-nav-active"
                      : ""
                  }
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <ShoppingBag size={19} />
                  Orders
                </NavLink>

                <NavLink
                  to="/partner/earnings"
                  className={({ isActive }) =>
                    isActive
                      ? "dashboard-nav-active"
                      : ""
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



        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="dashboard-main manage-main manage-women-main">


          {/* ==================================================
              PAGE HERO
          ================================================== */}

          <section className="manage-hero">

            <div>

              <span>
                VILLAGE PARTNER
              </span>

              <h1>
                Manage Women
              </h1>

              <p>
                Onboard, support and empower rural women
                artisans in your village.
              </p>

            </div>


            <div className="manage-hero-message">
              Real Women
              <br />
              <em>Real Change</em>
              <span>
                ♡
              </span>
            </div>


            


            <button
              className="add-woman-btn"
              onClick={openAddModal}
              disabled={women.length >= 5}
              title={
                women.length >= 5
                  ? "You can manage maximum 5 women"
                  : "Add a new woman"
              }
            >
              <Plus size={18} />
              Add New Woman
            </button>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="manage-error">
              <span>
                {error}
              </span>

              <button
                onClick={() => setError("")}
              >
                <X size={15} />
              </button>
            </div>
          )}


          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <section className="women-stat-grid">

            <div className="women-stat-card">

              <div className="women-stat-icon red">
                <UsersRound size={26} />
              </div>

              <div>
                <strong>
                  {totalWomen}
                </strong>

                <span>
                  Total Women
                </span>

                <small>
                  Maximum 5 women
                </small>
              </div>

            </div>


            <div className="women-stat-card">

              <div className="women-stat-icon orange">
                <UserRoundCheck size={26} />
              </div>

              <div>
                <strong>
                  {totalWomen}
                </strong>

                <span>
                  New This Month
                </span>

                <small>
                  Your current onboarded women
                </small>
              </div>

            </div>


            <div className="women-stat-card">

              <div className="women-stat-icon green">
                <UserRoundCheck size={26} />
              </div>

              <div>
                <strong>
                  {activeWomen}
                </strong>

                <span>
                  Active Women
                </span>

                <small>
                  Currently active
                </small>
              </div>

            </div>


            <div className="women-stat-card">

              <div className="women-stat-icon yellow">
                <UsersRound size={26} />
              </div>

              <div>
                <strong>
                  {inactiveWomen}
                </strong>

                <span>
                  Inactive Women
                </span>

                <small>
                  Need attention
                </small>
              </div>

            </div>

          </section>


          {/* ==================================================
              TABLE + PROFILE
          ================================================== */}

          <section className="manage-content-grid">


            {/* ==============================================
                TABLE
            ============================================== */}

            <div className="women-table-card">

              {/* FILTERS */}

              <div className="women-filters">

                <div className="women-search">

                  <Search size={17} />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search by name, skill, phone number..."
                  />

                </div>


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

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>


                <select
                  value={skillFilter}
                  onChange={(e) =>
                    setSkillFilter(e.target.value)
                  }
                >

                  <option value="ALL">
                    All Skills
                  </option>

                  {skills.map((skill) => (
                    <option
                      value={skill}
                      key={skill}
                    >
                      {skill}
                    </option>
                  ))}

                </select>


                <select
                  value={villageFilter}
                  onChange={(e) =>
                    setVillageFilter(e.target.value)
                  }
                >

                  <option value="ALL">
                    All Villages
                  </option>

                  {villages.map((village) => (
                    <option
                      value={village}
                      key={village}
                    >
                      {village}
                    </option>
                  ))}

                </select>


                <button
                  className="reset-filters"
                  onClick={resetFilters}
                >
                  ↻ Reset
                </button>

              </div>


              {/* TABLE */}

              <div className="women-table-wrapper">

                <table className="women-table">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Name
                      </th>

                      <th>
                        Photo
                      </th>

                      <th>
                        Skills
                      </th>

                      <th>
                        Village
                      </th>

                      <th>
                        Products
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Joined On
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {loading ? (

                      <tr>
                        <td
                          colSpan="9"
                          className="table-message"
                        >
                          Loading women...
                        </td>
                      </tr>

                    ) : filteredWomen.length === 0 ? (

                      <tr>
                        <td
                          colSpan="9"
                          className="table-message"
                        >
                          No women found.
                        </td>
                      </tr>

                    ) : (

                      filteredWomen.map(
                        (woman, index) => (

                          <tr
                            key={woman.id}
                            className={
                              selectedWoman?.id === woman.id
                                ? "selected-row"
                                : ""
                            }
                            onClick={() =>
                              setSelectedWoman(woman)
                            }
                          >

                            <td>
                              {index + 1}
                            </td>


                            <td>

                              <div className="woman-name">

                                <b>
                                  {woman.name}
                                </b>

                                <small>
                                  {woman.phone || "—"}
                                </small>

                              </div>

                            </td>


                            <td>

                              <div className="woman-table-photo">

                                <img
                                  src={
                                    woman.photoUrl ||
                                    "/assets/women-impact.jpg"
                                  }
                                  alt={woman.name}
                                />

                              </div>

                            </td>


                            <td>

                              <div className="skill-tags">

                                {getSkills(woman)
                                  .slice(0, 2)
                                  .map((skill) => (

                                    <span
                                      key={skill}
                                    >
                                      {skill}
                                    </span>

                                  ))}

                              </div>

                            </td>


                            <td>
                              {woman.village || "—"}
                            </td>


                            <td>
                              {woman.productCount || 0}
                            </td>


                            <td>

                              <span
                                className={`woman-status ${
                                  woman.active
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {woman.active
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </td>


                            <td>
                              {formatDate(
                                woman.createdAt
                              )}
                            </td>


                            <td>

                              <div className="row-actions">

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(woman);
                                  }}
                                  title="Edit"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWoman(woman);
                                  }}
                                  title="Delete"
                                  className="delete-action"
                                >
                                  <Trash2 size={15} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWoman(woman);
                                  }}
                                  title="More"
                                >
                                  <MoreHorizontal size={16} />
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>


              {/* FOOTER */}

              <div className="table-footer">

                <span>
                  Showing {filteredWomen.length} of{" "}
                  {women.length} women
                </span>

                <div className="pagination">

                  <button disabled>
                    ←
                  </button>

                  <button className="page-active">
                    1
                  </button>

                  <button>
                    →
                  </button>

                </div>

              </div>

            </div>


            {/* ==============================================
                PROFILE PANEL
            ============================================== */}

            <aside className="woman-profile-card">

              {selectedWoman ? (

                <>

                  <div className="profile-image">

                    <img
                      src={
                        selectedWoman.photoUrl ||
                        "/assets/women-impact.jpg"
                      }
                      alt={selectedWoman.name}
                    />

                    <span
                      className={
                        selectedWoman.active
                          ? "profile-active"
                          : "profile-inactive"
                      }
                    >
                      {selectedWoman.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>


                  <div className="profile-header">

                    <div>

                      <h2>
                        {selectedWoman.name}
                      </h2>

                      <button
                        onClick={() =>
                          openEditModal(selectedWoman)
                        }
                      >
                        Edit
                        <Pencil size={13} />
                      </button>

                    </div>

                  </div>


                  <div className="profile-details">

                    <div>
                      <Phone size={17} />

                      <span>
                        {selectedWoman.phone || "—"}
                      </span>
                    </div>


                    <div>
                      <MapPin size={17} />

                      <span>
                        {selectedWoman.village
                          ? `${selectedWoman.village}${
                              selectedWoman.state
                                ? `, ${selectedWoman.state}`
                                : ""
                            }`
                          : "—"}
                      </span>
                    </div>


                    <div>
                      <CalendarDays size={17} />

                      <span>
                        Joined on{" "}
                        {formatDate(
                          selectedWoman.createdAt
                        )}
                      </span>
                    </div>


                    <div>
                      <UserRoundCheck size={17} />

                      <span>
                        Member of Self Help Group
                      </span>
                    </div>

                  </div>


                  {selectedWoman.story && (
                    <div className="profile-story">
                      “{selectedWoman.story}”
                    </div>
                  )}


                  {/* SKILLS */}

                  <div className="profile-section">

                    <h3>
                      Skills
                    </h3>

                    <div className="profile-skills">

                      {getSkills(selectedWoman).map(
                        (skill) => (

                          <span key={skill}>
                            {skill}
                          </span>

                        )
                      )}

                    </div>

                  </div>


                  {/* PRODUCTS */}

                  {/*<div className="profile-section">

                    <div className="profile-section-heading">

                      <h3>
                        Products (
                        {selectedWoman.productCount || 0}
                        )
                      </h3>

                      <a href="/shop">
                        View All
                        <ArrowRight size={14} />
                      </a>

                    </div>


                    <div className="profile-products">

                      <div>
                        <img
                          src="/assets/partners-reference.jpg"
                          alt=""
                        />
                      </div>

                      <div>
                        <img
                          src="/assets/women-impact.jpg"
                          alt=""
                        />
                      </div>

                      <div>
                        <img
                          src="/assets/partners-reference.jpg"
                          alt=""
                        />
                      </div>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  {/*<div className="profile-actions">

                    <button className="message-btn">
                      <MessageSquare size={16} />
                      Send Message
                    </button>

                    <button className="profile-btn">
                      View Full Profile
                      <ArrowRight size={16} />
                    </button>

                  </div>*/}

                </>

              ) : (

                <div className="empty-profile">

                  <UsersRound size={40} />

                  <h3>
                    Select a Woman
                  </h3>

                  <p>
                    Select a woman from the list to
                    view her profile.
                  </p>

                </div>

              )}

            </aside>

          </section>

        </main>

      </div>


      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (

        <div
          className="woman-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="woman-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>

                <span>
                  VILLAGE PARTNER
                </span>

                <h2>
                  {editingWoman
                    ? "Edit Woman"
                    : "Add New Woman"}
                </h2>

              </div>

              <button
                onClick={() => setShowModal(false)}
              >
                <X size={19} />
              </button>

            </div>


            <form onSubmit={saveWoman}>

              <div className="modal-form-grid">

                <div className="modal-field">

                  <label>
                    Full Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      updateForm(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Enter woman's full name"
                  />

                </div>


                <div className="modal-field">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      updateForm(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />

                </div>


                <div className="modal-field">

                  <label>
                    Village *
                  </label>

                  <input
                    value={form.village}
                    onChange={(e) =>
                      updateForm(
                        "village",
                        e.target.value
                      )
                    }
                    placeholder="Enter village"
                  />

                </div>


                <div className="modal-field">

                  <label>
                    District
                  </label>

                  <input
                    value={form.district}
                    onChange={(e) =>
                      updateForm(
                        "district",
                        e.target.value
                      )
                    }
                    placeholder="Enter district"
                  />

                </div>


                <div className="modal-field">

                  <label>
                    State
                  </label>

                  <input
                    value={form.state}
                    onChange={(e) =>
                      updateForm(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="Enter state"
                  />

                </div>


                <div className="modal-field">

                  <label>
                    Skills
                  </label>

                  <input
                    value={form.skills}
                    onChange={(e) =>
                      updateForm(
                        "skills",
                        e.target.value
                      )
                    }
                    placeholder="Embroidery, Hand Stitching"
                  />

                </div>


                <div className="modal-field full">
                  <label>
                    Woman's Photo
                  </label>

                  <div className="image-upload-box">

                    <input
                      id="woman-photo-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          uploadImageToCloudinary(file);
                        }

                        // Allow selecting the same image again
                        e.target.value = "";
                      }}
                    />

                    <label
                      htmlFor="woman-photo-upload"
                      className="image-upload-button"
                    >
                      {uploadingImage
                        ? "Uploading..."
                        : "Choose Photo"}
                    </label>

                    <span className="image-upload-help">
                      JPG, PNG or WEBP • Maximum 5 MB
                    </span>

                    {imagePreview && (
                      <div className="image-preview">
                        <img
                          src={imagePreview}
                          alt="Selected woman"
                        />

                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setImagePreview("");
                            updateForm("photoUrl", "");
                          }}
                        >
                          <X size={15} />
                          Remove
                        </button>
                      </div>
                    )}

                    {!imagePreview && form.photoUrl && (
                      <div className="image-preview">
                        <img
                          src={form.photoUrl}
                          alt="Current woman"
                        />

                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setImagePreview("");
                            updateForm("photoUrl", "");
                          }}
                        >
                          <X size={15} />
                          Remove
                        </button>
                      </div>
                    )}

                  </div>
                </div>


                <div className="modal-field full">

                  <label>
                    Story
                  </label>

                  <textarea
                    value={form.story}
                    onChange={(e) =>
                      updateForm(
                        "story",
                        e.target.value
                      )
                    }
                    placeholder="Tell us about this woman and her craft..."
                  />

                </div>


                <label className="active-checkbox">

                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      updateForm(
                        "active",
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Woman is currently active
                  </span>

                </label>

              </div>


              <div className="modal-actions">

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
                    : editingWoman
                    ? "Save Changes"
                    : "Add Woman"}

                  {!saving && (
                    <ArrowRight size={16} />
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
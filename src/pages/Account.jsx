import React, { useEffect, useState } from "react";

import {
  UserRound,
  Package,
  Heart,
  MapPin,
  LogOut,
  Pencil,
  X,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Account.css";

const API_URL = "http://localhost:8080/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

export default function Account() {
  const navigate = useNavigate();

  // =====================================
  // STATE
  // =====================================

  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);

  const [addresses, setAddresses] = useState([]);

  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedTab, setSelectedTab] =
    useState("ALL");

  // =====================================
  // ORDER MODAL
  // =====================================

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // =====================================
  // PROFILE MODAL
  // =====================================

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState({
      fullName: "",
      phone: "",
    });

  const [savingProfile, setSavingProfile] =
    useState(false);

  // =====================================
  // ADDRESS MODAL
  // =====================================

  const [showAddressModal, setShowAddressModal] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState(null);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      defaultAddress: false,
    });

  // =====================================
  // LOAD ACCOUNT
  // =====================================

  useEffect(() => {
    loadAccountData();
  }, []);

  async function loadAccountData() {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    // ---------------------------------
    // USER
    // ---------------------------------

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser =
          JSON.parse(savedUser);

        setUser(parsedUser);

        setProfileForm({
          fullName:
            parsedUser.fullName || "",
          phone:
            parsedUser.phone || "",
        });
      } catch (err) {
        console.error(
          "Invalid user data:",
          err
        );

        logout();
        return;
      }
    }

    // ---------------------------------
    // ORDERS
    // ---------------------------------

    try {
      const response = await fetch(
        `${API_URL}/orders/my`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (response.ok) {
        const data =
          await response.json();

        setOrders(
          Array.isArray(data)
            ? data
            : []
        );
      }
    } catch (err) {
      console.error(
        "Orders error:",
        err
      );
    }

    // ---------------------------------
    // ADDRESSES
    // ---------------------------------

    try {
      const response = await fetch(
        `${API_URL}/addresses`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (response.ok) {
        const data =
          await response.json();

        setAddresses(
          Array.isArray(data)
            ? data
            : []
        );
      }
    } catch (err) {
      console.error(
        "Addresses error:",
        err
      );
    }

    // ---------------------------------
    // WISHLIST
    // ---------------------------------

    try {
      const response = await fetch(
        `${API_URL}/wishlist`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logout();
        return;
      }

      if (response.ok) {
        const data =
          await response.json();

        setWishlist(
          Array.isArray(data)
            ? data
            : []
        );
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err
      );
    }

    setLoading(false);
  }

  // =====================================
  // LOGOUT
  // =====================================

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);

    navigate("/");
  }

  // =====================================
  // PROFILE
  // =====================================

  function openProfileEditor() {
    setProfileForm({
      fullName:
        user?.fullName || "",
      phone:
        user?.phone || "",
    });

    setShowProfileModal(true);
  }

  function handleProfileChange(e) {
    const {
      name,
      value,
    } = e.target;

    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveProfile(e) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!profileForm.fullName.trim()) {
      alert("Please enter your name.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch(
        `${API_URL}/auth/profile`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName:
              profileForm.fullName.trim(),

            phone:
              profileForm.phone.trim(),
          }),
        }
      );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Could not update profile"
        );
      }

      const updatedUser =
        await response.json();

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setShowProfileModal(false);

      alert(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Could not update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // =====================================
  // ADD ADDRESS
  // =====================================

  function openAddAddress() {
    setEditingAddress(null);

    setAddressForm({
      fullName:
        user?.fullName || "",

      phone:
        user?.phone || "",

      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      defaultAddress: false,
    });

    setShowAddressModal(true);
  }

  // =====================================
  // EDIT ADDRESS
  // =====================================

  function openEditAddress(address) {
    setEditingAddress(address);

    setAddressForm({
      fullName:
        address.fullName || "",

      phone:
        address.phone || "",

      addressLine1:
        address.addressLine1 || "",

      addressLine2:
        address.addressLine2 || "",

      city:
        address.city || "",

      state:
        address.state || "",

      pincode:
        address.pincode || "",

      defaultAddress:
        Boolean(address.defaultAddress),
    });

    setShowAddressModal(true);
  }

  // =====================================
  // ADDRESS INPUT
  // =====================================

  function handleAddressChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setAddressForm(prev => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  // =====================================
  // SAVE / UPDATE ADDRESS
  // =====================================

  async function saveAddress(e) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    // Basic validation
    if (!addressForm.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!addressForm.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!addressForm.addressLine1.trim()) {
      alert("Please enter your address.");
      return;
    }

    if (!addressForm.city.trim()) {
      alert("Please enter your city.");
      return;
    }

    if (!addressForm.state.trim()) {
      alert("Please enter your state.");
      return;
    }

    if (
      !/^\d{6}$/.test(
        addressForm.pincode.trim()
      )
    ) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setSavingAddress(true);

      const url = editingAddress
        ? `${API_URL}/addresses/${editingAddress.id}`
        : `${API_URL}/addresses`;

      const response = await fetch(url, {
        method: editingAddress
          ? "PUT"
          : "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          fullName:
            addressForm.fullName.trim(),

          phone:
            addressForm.phone.trim(),

          addressLine1:
            addressForm.addressLine1.trim(),

          addressLine2:
            addressForm.addressLine2.trim(),

          city:
            addressForm.city.trim(),

          state:
            addressForm.state.trim(),

          pincode:
            addressForm.pincode.trim(),

          defaultAddress:
            addressForm.defaultAddress,
        }),
      });

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Could not save address."
        );
      }

      const savedAddress =
        await response.json();

      // ---------------------------------
      // UPDATE EXISTING
      // ---------------------------------

      if (editingAddress) {
        setAddresses(prev =>
          prev.map(address =>
            address.id ===
            savedAddress.id
              ? savedAddress
              : address
          )
        );
      }

      // ---------------------------------
      // ADD NEW
      // ---------------------------------

      else {
        setAddresses(prev => [
          ...prev,
          savedAddress,
        ]);
      }

      setShowAddressModal(false);
      setEditingAddress(null);

      setAddressForm({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        defaultAddress: false,
      });

    } catch (err) {
      console.error(
        "Address save error:",
        err
      );

      alert(
        err.message ||
          "Could not save address."
      );
    } finally {
      setSavingAddress(false);
    }
  }

  // =====================================
  // ORDER FILTER
  // =====================================

  const filteredOrders =
    orders.filter(order => {
      const status =
        String(
          order.status || ""
        ).toUpperCase();

      if (
        selectedTab === "ALL"
      ) {
        return true;
      }

      if (
        selectedTab === "PROCESSING"
      ) {
        return [
          "PLACED",
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
        ].includes(status);
      }

      if (
        selectedTab === "SHIPPED"
      ) {
        return status === "SHIPPED";
      }

      if (
        selectedTab === "DELIVERED"
      ) {
        return status === "DELIVERED";
      }

      if (
        selectedTab === "CANCELLED"
      ) {
        return [
          "CANCELLED",
          "FAILED",
        ].includes(status);
      }

      return true;
    });

  // =====================================
  // DATE
  // =====================================

  function formatDate(date) {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================
  // ORDER
  // =====================================

  function openOrder(order) {
    setSelectedOrder(order);
  }

  function closeOrder() {
    setSelectedOrder(null);
  }

  // =====================================
  // USER
  // =====================================

  const userName =
    user?.fullName ||
    "User";

  const userEmail =
    user?.email || "";

  const userInitial =
    userName
      ? userName
          .charAt(0)
          .toUpperCase()
      : "U";

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="account section">
        <div className="account-loading">
          <p>
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="account section">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="account-sidebar">

        {/* USER */}

        <div className="account-user">

          <div className="avatar">
            {userInitial}
          </div>

          <div>

            <b>
              {userName}
            </b>

            <span>
              {userEmail}
            </span>

            <button
              type="button"
              className="edit-profile-link"
              onClick={
                openProfileEditor
              }
            >
              <Pencil size={13} />
              Edit Profile
            </button>

          </div>

        </div>

        {/* ORDERS */}

        <button
          type="button"
          className="account-menu active"
          onClick={() =>
            setSelectedTab("ALL")
          }
        >
          <Package size={16} />
          My Orders
        </button>

        {/* VILLAGE PARTNER */}

        {user?.role ===
          "VILLAGE_PARTNER" && (
          <Link to="/partner/dashboard">
            <UserRound size={16} />
            Village Partner Dashboard
          </Link>
        )}

        {/* LOGOUT */}

        <button
          type="button"
          className="account-logout"
          onClick={logout}
        >
          <LogOut size={16} />
          Logout
        </button>

      </aside>

      {/* =================================
          MAIN
      ================================= */}

      <section className="account-content">

        <div className="account-head">

          <div>

            <h1>
              My Orders
            </h1>

            <p>
              Track and manage your recent
              orders.
            </p>

          </div>

          {/* TABS */}

          <div className="order-tabs">

            {[
              ["ALL", "All Orders"],
              [
                "PROCESSING",
                "Processing",
              ],
              [
                "SHIPPED",
                "Shipped",
              ],
              [
                "DELIVERED",
                "Delivered",
              ],
              [
                "CANCELLED",
                "Cancelled",
              ],
            ].map(
              ([value, label]) => (

                <button
                  key={value}
                  className={
                    selectedTab === value
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedTab(value)
                  }
                >
                  {label}
                </button>

              )
            )}

          </div>

        </div>

        {/* =================================
            ORDERS
        ================================= */}

        {filteredOrders.length === 0 ? (

          <div className="empty-orders">

            <Package size={40} />

            <h3>
              {orders.length === 0
                ? "No orders yet"
                : "No orders in this category"}
            </h3>

            <p>
              {orders.length === 0
                ? "Your orders will appear here once you make a purchase."
                : "Try selecting another order category."}
            </p>

            {orders.length === 0 && (
              <Link to="/shop">
                Start Shopping
              </Link>
            )}

          </div>

        ) : (

          filteredOrders.map(
            order => (

              <div
                className="order-card"
                key={order.id}
              >

                <div className="order-card-info">

                  <small>
                    ORDER #
                    {order.orderNumber ||
                      `MBH${order.id}`}
                  </small>

                  <h3>
                    {order.items?.length ||
                      0}{" "}
                    {order.items?.length === 1
                      ? "Item"
                      : "Items"}
                  </h3>

                  <span>
                    ₹{" "}
                    {Number(
                      order.totalAmount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="order-status">

                  <b>
                    {order.status}
                  </b>

                  <span>
                    {formatDate(
                      order.createdAt
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openOrder(order)
                    }
                  >
                    View Details
                  </button>

                </div>

              </div>

            )
          )

        )}

        {/* =================================
            SAVED ADDRESSES
        ================================= */}

        <div className="saved-addresses">

          <div className="saved-head">

            <h2>
              Saved Addresses
            </h2>

            <button
              type="button"
              className="add-address-btn"
              onClick={
                openAddAddress
              }
            >
              + Add New
            </button>

          </div>

          <div className="address-grid">

            {addresses.length === 0 ? (

              <div className="empty-address">

                <MapPin size={30} />

                <p>
                  You don't have any
                  saved addresses yet.
                </p>

                <button
                  type="button"
                  onClick={
                    openAddAddress
                  }
                />
                  

              </div>

            ) : (

              addresses
                .slice(0, 2)
                .map(address => (

                  <div
                    key={address.id}
                    className="address-card"
                  >

                    <b>
                      ⌂{" "}
                      {address.defaultAddress
                        ? "Home"
                        : "Address"}
                    </b>

                    <button
                      type="button"
                      className="address-edit"
                      onClick={() =>
                        openEditAddress(
                          address
                        )
                      }
                      title="Edit address"
                    >
                      <Pencil size={14} />
                    </button>

                    <p>

                      {address.fullName}

                      <br />

                      {address.addressLine1}

                      {address.addressLine2 && (
                        <>
                          <br />
                          {address.addressLine2}
                        </>
                      )}

                      <br />

                      {address.city},{" "}
                      {address.state}

                      <br />

                      {address.pincode}

                      <br />

                      {address.phone}

                    </p>

                  </div>

                ))

            )}

          </div>

        </div>

        {/* =================================
            WISHLIST
        ================================= */}

        <div className="wishlist-mini">

          <div className="saved-head">

            <h2>
              My Wishlist (
              {wishlist.length}
              )
            </h2>

            <Link to="/wishlist">
              View All
            </Link>

          </div>

          {wishlist.length === 0 ? (

            <div className="empty-wishlist">

              <Heart size={30} />

              <p>
                Your wishlist is empty.
              </p>

              <Link to="/shop">
                Explore Products
              </Link>

            </div>

          ) : (

            <div className="product-grid four">

              {wishlist
                .slice(0, 4)
                .map(item => {

                  const product =
                    item.product ||
                    item;

                  return (

                    <div
                      key={
                        item.id ||
                        product.id
                      }
                      className="mini-product"
                    >

                      <Link
                        to={`/product/${product.id}`}
                      >

                        <img
                          src={
                            product.mainImageUrl ||
                            product.image ||
                            "/placeholder.jpg"
                          }
                          alt={
                            product.name ||
                            "Product"
                          }
                        />

                      </Link>

                      <b>
                        {product.name}
                      </b>

                      <span>
                        ₹{" "}
                        {Number(
                          product.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <Link
                        to={`/product/${product.id}`}
                        className="mini-product-btn"
                      >
                        View Product
                      </Link>

                    </div>

                  );
                })}

            </div>

          )}

        </div>

      </section>

      {/* =================================
          ORDER DETAIL POPUP
      ================================= */}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeOrder}
          formatDate={formatDate}
        />
      )}

      {/* =================================
          EDIT PROFILE POPUP
      ================================= */}

      {showProfileModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowProfileModal(false)
          }
        >

          <div
            className="profile-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowProfileModal(false)
              }
            >
              <X size={20} />
            </button>

            <div className="profile-modal-icon">
              <UserRound size={25} />
            </div>

            <h2>
              Edit Profile
            </h2>

            <p>
              Update your personal
              information.
            </p>

            <form
              onSubmit={saveProfile}
            >

              <label>
                Full Name
              </label>

              <input
                name="fullName"
                value={
                  profileForm.fullName
                }
                onChange={
                  handleProfileChange
                }
                placeholder="Your full name"
                required
              />

              <label>
                Email
              </label>

              <input
                value={
                  user?.email || ""
                }
                disabled
              />

              <label>
                Phone
              </label>

              <input
                name="phone"
                value={
                  profileForm.phone
                }
                onChange={
                  handleProfileChange
                }
                placeholder="Your phone number"
              />

              <div className="profile-modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowProfileModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={
                    savingProfile
                  }
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          ADD / EDIT ADDRESS POPUP
      ================================= */}

      {showAddressModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddressModal(false)
          }
        >

          <div
            className="address-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowAddressModal(false)
              }
            >
              <X size={20} />
            </button>

            <div className="profile-modal-icon">
              <MapPin size={25} />
            </div>

            <h2>
              {editingAddress
                ? "Edit Address"
                : "Add New Address"}
            </h2>

            <p>
              {editingAddress
                ? "Update your saved address."
                : "Add a new delivery address."}
            </p>

            <form
              onSubmit={saveAddress}
            >

              <label>
                Full Name
              </label>

              <input
                name="fullName"
                value={
                  addressForm.fullName
                }
                onChange={
                  handleAddressChange
                }
                placeholder="Your full name"
                required
              />

              <label>
                Phone Number
              </label>

              <input
                name="phone"
                value={
                  addressForm.phone
                }
                onChange={
                  handleAddressChange
                }
                placeholder="Your phone number"
                required
              />

              <label>
                Address Line 1
              </label>

              <input
                name="addressLine1"
                value={
                  addressForm.addressLine1
                }
                onChange={
                  handleAddressChange
                }
                placeholder="House no., street, area"
                required
              />

              <label>
                Address Line 2
              </label>

              <input
                name="addressLine2"
                value={
                  addressForm.addressLine2
                }
                onChange={
                  handleAddressChange
                }
                placeholder="Landmark, apartment, etc."
              />

              <div className="address-form-row">

                <div>

                  <label>
                    City
                  </label>

                  <input
                    name="city"
                    value={
                      addressForm.city
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="City"
                    required
                  />

                </div>

                <div>

                  <label>
                    State
                  </label>

                  <input
                    name="state"
                    value={
                      addressForm.state
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="State"
                    required
                  />

                </div>

              </div>

              <label>
                Pincode
              </label>

              <input
                name="pincode"
                value={
                  addressForm.pincode
                }
                onChange={
                  handleAddressChange
                }
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
                required
              />

              <label className="default-address-check">

                <input
                  type="checkbox"
                  name="defaultAddress"
                  checked={
                    addressForm.defaultAddress
                  }
                  onChange={
                    handleAddressChange
                  }
                />

                <span>
                  Set as default address
                </span>

              </label>

              <div className="address-modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowAddressModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={
                    savingAddress
                  }
                >
                  {savingAddress
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =====================================
   ORDER DETAIL MODAL
===================================== */

function OrderDetailModal({
  order,
  onClose,
  formatDate,
}) {
  const items =
    order.items || [];

  const address =
    order.address;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="order-detail-modal"
        onClick={e =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="order-modal-header">

          <div>

            <span>
              ORDER #
              {order.orderNumber ||
                `MBH${order.id}`}
            </span>

            <h2>
              Order Details
            </h2>

            <p>
              Placed on{" "}
              {formatDate(
                order.createdAt
              )}
            </p>

          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        {/* STATUS */}

        <div className="order-modal-status">

          <div className="status-icon">

            {String(
              order.status || ""
            ).toUpperCase() ===
            "DELIVERED" ? (
              <CheckCircle2
                size={23}
              />
            ) : (
              <Truck size={23} />
            )}

          </div>

          <div>

            <strong>
              {order.status}
            </strong>

            <span>
              {String(
                order.status || ""
              ).toUpperCase() ===
              "DELIVERED"
                ? "Your order has been delivered."
                : "Your order is being processed."}
            </span>

          </div>

        </div>

        {/* ITEMS */}

        <div className="order-modal-section">

          <h3>
            <ShoppingBag
              size={18}
            />
            Items Ordered
          </h3>

          {items.length === 0 ? (

            <p className="no-order-items">
              Order item details unavailable.
            </p>

          ) : (

            items.map(item => {

              const product =
                item.product;

              const image =
                product?.mainImageUrl ||
                product?.imageUrls?.[0] ||
                "/placeholder.jpg";

              const quantity =
                Number(
                  item.quantity || 0
                );

              const price =
                Number(
                  item.price ??
                    product?.price ??
                    0
                );

              return (

                <div
                  className="order-modal-item"
                  key={item.id}
                >

                  <img
                    src={image}
                    alt={
                      product?.name ||
                      "Product"
                    }
                  />

                  <div>

                    <strong>
                      {product?.name ||
                        "Product"}
                    </strong>

                    <span>
                      Quantity:{" "}
                      {quantity}
                    </span>

                  </div>

                  <b>
                    ₹{" "}
                    {(
                      price *
                      quantity
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </b>

                </div>

              );
            })

          )}

        </div>

        {/* ADDRESS */}

        {address && (

          <div className="order-modal-section">

            <h3>
              <MapPin
                size={18}
              />
              Delivery Address
            </h3>

            <div className="modal-address">

              <strong>
                {address.fullName}
              </strong>

              <p>
                {address.addressLine1}

                {address.addressLine2
                  ? `, ${address.addressLine2}`
                  : ""}

                <br />

                {address.city},{" "}
                {address.state} -{" "}
                {address.pincode}

                <br />

                Phone:{" "}
                {address.phone}
              </p>

            </div>

          </div>

        )}

        {/* PAYMENT */}

        <div className="order-modal-section">

          <h3>
            <CreditCard
              size={18}
            />
            Payment
          </h3>

          <div className="modal-payment-row">

            <span>
              Payment Method
            </span>

            <strong>
              {order.paymentMethod ===
              "COD"
                ? "Cash on Delivery"
                : order.paymentMethod ||
                  "Online Payment"}
            </strong>

          </div>

          <div className="modal-payment-row">

            <span>
              Payment Status
            </span>

            <strong>
              {order.paymentStatus ||
                "PENDING"}
            </strong>

          </div>

        </div>

        {/* TOTAL */}

        <div className="order-modal-total">

          <span>
            Total Amount
          </span>

          <strong>
            ₹{" "}
            {Number(
              order.totalAmount || 0
            ).toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>

        <button
          type="button"
          className="modal-done-btn"
          onClick={onClose}
        >
          Done
        </button>

      </div>

    </div>
  );
}
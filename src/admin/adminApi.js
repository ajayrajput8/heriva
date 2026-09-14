const API = "https://heriva-backend.onrender.com/api";


// =========================================================
// AUTH TOKEN
// =========================================================

export function getAdminToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}


// =========================================================
// COMMON REQUEST FUNCTION
// =========================================================

async function request(url, options = {}) {

  const token = getAdminToken();

  const response = await fetch(`${API}${url}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),

      ...(options.headers || {}),
    },
  });


  // Unauthorized
  if (response.status === 401 || response.status === 403) {

    throw new Error(
      "You are not authorized to perform this action."
    );
  }


  // Other errors
  if (!response.ok) {

    let message = "Request failed.";

    try {

      const data = await response.json();

      message = data.message || message;

      console.log("Error response:", data);

    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }


  // No content
  if (response.status === 204) {
    return null;
  }


  return response.json();
}


// =========================================================
// ADMIN API
// =========================================================

export const adminApi = {


  // =======================================================
  // DASHBOARD
  // =======================================================

  dashboard: () =>
    request("/admin/dashboard"),

  categories: () => request("/categories"),

  createCategory: (data) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (id, data) =>
    request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id) =>
    request(`/admin/categories/${id}`, {
      method: "DELETE",
    }),

  // =======================================================
  // VILLAGE PARTNERS
  // =======================================================

  pendingPartners: () =>
    request("/admin/partners/pending"),


  activePartners: () =>
    request("/admin/partners/active"),

  users: () => request("/admin/users"),

  approvePartner: (id, approve) =>
    request(
      `/admin/partners/${id}/approve?approve=${approve}`,
      {
        method: "PATCH",
      }
    ),


  // =======================================================
  // WOMEN
  // =======================================================

  women: () =>
    request("/admin/women"),


  woman: (id) =>
    request(`/admin/women/${id}`),


  partnerWomen: (partnerId) =>
    request(`/admin/partners/${partnerId}/women`),


  // =======================================================
  // PRODUCTS
  // =======================================================

  // All products
  products: (page = 0, size = 20) =>
    request(
      `/admin/products?page=${page}&size=${size}`
    ),


  // Pending approval products
  pendingProducts: (page = 0, size = 20) =>
    request(
      `/admin/products/pending?page=${page}&size=${size}`
    ),


  // Published products
  publishedProducts: (page = 0, size = 20) =>
    request(
      `/admin/products/published?page=${page}&size=${size}`
    ),


  // Approve / Reject product
  approveProduct: (id, approve) =>
    request(
      `/admin/products/${id}/approve?approve=${approve}`,
      {
        method: "PATCH",
      }
    ),


  // Hide / Show product
  toggleProductVisibility: (id, visible) =>
    request(
      `/admin/products/${id}/visibility?visible=${visible}`,
      {
        method: "PATCH",
      }
    ),


  // =======================================================
  // CUSTOMER-FACING PRODUCTS
  // =======================================================

  productsForShop: () =>
    request("/products?size=100&page=0"),


  // =======================================================
  // ORDERS
  // =======================================================

  orders: () =>
    request("/orders/admin"),


  updateOrderStatus: (id, status) =>
    request(
      `/orders/${id}/status?status=${status}`,
      {
        method: "PATCH",
      }
    ),


  // =======================================================
  // CATEGORIES
  // =======================================================

  categories: () =>
    request("/categories"),


  createCategory: (data) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  updateCategory: (id, data) =>
    request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),


  deleteCategory: (id) =>
    request(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
};
// Made By Her backend integration.
// Current Spring Boot backend runs on http://localhost:8080.
// Replace the functions below with your exact auth/token flow as the UI is connected.

export const API_BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  products: () => request("/products"),
  product: (id) => request(`/products/${id}`),
  categories: () => request("/categories"),
  cart: () => request("/cart"),
  addCart: (productId, quantity=1) => request(`/cart/items?productId=${productId}&quantity=${quantity}`, { method:"POST" }),
  wishlist: () => request("/wishlist"),
  orders: () => request("/orders/my"),
  addresses: () => request("/addresses"),
  partnerMe: () => request("/partner/me"),
  partnerWomen: () => request("/partner/women"),
  updatePartnerProfile: (data) => request("/partner/profile", { method:"PUT", body: JSON.stringify(data) })
};
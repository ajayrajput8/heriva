import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  CheckCircle,
  Clock,
  Eye,
  Check,
  X,
  EyeOff,
  Store,
  XCircle,
  User,
  IndianRupee,
  Boxes,
} from "lucide-react";

import { adminApi } from "./adminApi";


export default function AdminProducts() {

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [activeTab, setActiveTab] = useState("pending");


  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const load = async () => {

    try {

      setLoading(true);

      const data = await adminApi.products();

      /*
       * Spring Boot Page<Product> response:
       *
       * {
       *   content: [],
       *   totalElements: 10,
       *   totalPages: 1,
       *   number: 0,
       *   size: 20
       * }
       *
       * Handle both Page and normal array just in case.
       */

      setProducts(
        Array.isArray(data)
          ? data
          : data?.content || []
      );

    } catch (error) {

      console.error(
        "Failed to load products:",
        error
      );

      alert(
        error.message ||
        "Unable to load products."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    load();

  }, []);


  // =========================================================
  // APPROVE / REJECT
  // =========================================================

  const moderate = async (id, approve) => {

    try {

      await adminApi.approveProduct(
        id,
        approve
      );

      await load();

      setSelectedProduct(null);

    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Unable to update product."
      );
    }
  };


  // =========================================================
  // HIDE / SHOW PRODUCT
  // =========================================================

  const toggleVisibility = async (product) => {

    try {

      const status =
        String(product.status || "")
          .toUpperCase();

      /*
       * PUBLISHED = currently visible
       * HIDDEN = currently hidden
       */

      const visible =
        status === "HIDDEN";

      await adminApi.toggleProductVisibility(
        product.id,
        visible
      );

      await load();

      setSelectedProduct(null);

    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Unable to change product visibility."
      );
    }
  };


  // =========================================================
  // SEARCH
  // =========================================================

  const filtered = useMemo(() => {

    const query =
      search
        .trim()
        .toLowerCase();

    if (!query) {

      return products;
    }

    return products.filter((product) => {

      const text = [

        product.name,

        product.description,

        product.woman?.name,

        product.woman?.user?.fullName,

        product.category?.name,

        product.status,

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  }, [products, search]);


  // =========================================================
  // COUNTS
  // =========================================================

  const pendingProducts =
    products.filter(
      (product) =>
        String(product.status)
          .toUpperCase() ===
        "PENDING_APPROVAL"
    );


  const publishedProducts =
    products.filter(
      (product) =>
        String(product.status)
          .toUpperCase() ===
        "PUBLISHED"
    );


  const hiddenProducts =
    products.filter(
      (product) =>
        String(product.status)
          .toUpperCase() ===
        "HIDDEN"
    );


  const rejectedProducts =
    products.filter(
      (product) =>
        String(product.status)
          .toUpperCase() ===
        "REJECTED"
    );


  // =========================================================
  // TAB DATA
  // =========================================================

  let displayedProducts = filtered;


  if (activeTab === "pending") {

    displayedProducts =
      filtered.filter(
        (product) =>
          String(product.status)
            .toUpperCase() ===
          "PENDING_APPROVAL"
      );
  }


  if (activeTab === "active") {

    displayedProducts =
      filtered.filter(
        (product) =>
          String(product.status)
            .toUpperCase() ===
          "PUBLISHED"
      );
  }


  if (activeTab === "hidden") {

    displayedProducts =
      filtered.filter(
        (product) =>
          String(product.status)
            .toUpperCase() ===
          "HIDDEN"
      );
  }


  if (activeTab === "rejected") {

    displayedProducts =
      filtered.filter(
        (product) =>
          String(product.status)
            .toUpperCase() ===
          "REJECTED"
      );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="admin-section-page">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <span>
            MARKETPLACE
          </span>

          <h1>
            Products
          </h1>

          <p>
            Review, approve and control products
            listed by rural women.
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="admin-summary-row">


        <Summary
          icon={Package}
          value={products.length}
          label="Total Products"
        />


        <Summary
          icon={Clock}
          value={pendingProducts.length}
          label="Pending Review"
        />


        <Summary
          icon={CheckCircle}
          value={publishedProducts.length}
          label="Live in Shop"
        />


        <Summary
          icon={EyeOff}
          value={hiddenProducts.length}
          label="Hidden Products"
        />

      </div>


      {/* =====================================================
          PRODUCT TABLE
          ===================================================== */}

      <section className="admin-table-card">


        {/* ===================================================
            TOOLBAR
            =================================================== */}

        <div className="admin-table-toolbar">

          <div className="admin-table-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search product, woman or category..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>


        {/* ===================================================
            TABS
            =================================================== */}

        <div className="admin-product-tabs">


          {/* PENDING */}

          <button
            className={
              activeTab === "pending"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("pending")
            }
          >

            <Clock size={15} />

            Pending

            <span>
              {pendingProducts.length}
            </span>

          </button>


          {/* LIVE */}

          <button
            className={
              activeTab === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("active")
            }
          >

            <Store size={15} />

            Live in Shop

            <span>
              {publishedProducts.length}
            </span>

          </button>


          {/* HIDDEN */}

          <button
            className={
              activeTab === "hidden"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("hidden")
            }
          >

            <EyeOff size={15} />

            Hidden

            <span>
              {hiddenProducts.length}
            </span>

          </button>


          {/* REJECTED */}

          <button
            className={
              activeTab === "rejected"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("rejected")
            }
          >

            <XCircle size={15} />

            Rejected

            <span>
              {rejectedProducts.length}
            </span>

          </button>

        </div>


        {/* ===================================================
            TABLE
            =================================================== */}

        {loading ? (

          <div className="admin-loading">

            Loading products...

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">


              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    Woman
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>


                {displayedProducts.map(
                  (product) => {

                    const image =
                      product.mainImageUrl ||
                      product.imageUrls?.[0] ||
                      "/assets/partners-reference.jpg";


                    const status =
                      String(
                        product.status || ""
                      ).toUpperCase();


                    return (

                      <tr
                        key={product.id}
                      >


                        {/* PRODUCT */}

                        <td>

                          <div className="admin-product-cell">

                            <img
                              src={image}
                              alt={
                                product.name
                              }
                            />

                            <div>

                              <strong>
                                {product.name}
                              </strong>

                              <small>
                                Product #
                                {product.id}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* WOMAN */}

                        <td>

                          {product.woman?.name ||
                            product.woman?.user?.fullName ||
                            "—"}

                        </td>


                        {/* CATEGORY */}

                        <td>

                          {product.category?.name ||
                            "—"}

                        </td>


                        {/* PRICE */}

                        <td>

                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>


                        {/* STOCK */}

                        <td>

                          {product.stockQuantity ??
                            0}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              `admin-status ${getStatusClass(
                                status
                              )}`
                            }
                          >

                            {formatStatus(
                              status
                            )}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="admin-row-actions">


                            {/* VIEW */}

                            <button
                              type="button"
                              className="admin-icon-button"
                              title="View product"
                              onClick={() =>
                                setSelectedProduct(
                                  product
                                )
                              }
                            >

                              <Eye size={16} />

                            </button>


                            {/* PENDING */}

                            {status ===
                              "PENDING_APPROVAL" && (

                              <>

                                <button
                                  type="button"
                                  className="approve-button compact"
                                  title="Approve product"
                                  onClick={() =>
                                    moderate(
                                      product.id,
                                      true
                                    )
                                  }
                                >

                                  <Check
                                    size={16}
                                  />

                                </button>


                                <button
                                  type="button"
                                  className="reject-button"
                                  title="Reject product"
                                  onClick={() =>
                                    moderate(
                                      product.id,
                                      false
                                    )
                                  }
                                >

                                  <X
                                    size={16}
                                  />

                                </button>

                              </>

                            )}


                            {/* PUBLISHED */}

                            {status ===
                              "PUBLISHED" && (

                              <button
                                type="button"
                                className="hide-product-button"
                                title="Hide from shop"
                                onClick={() =>
                                  toggleVisibility(
                                    product
                                  )
                                }
                              >

                                <EyeOff
                                  size={15}
                                />

                                Hide

                              </button>

                            )}


                            {/* HIDDEN */}

                            {status ===
                              "HIDDEN" && (

                              <button
                                type="button"
                                className="show-product-button"
                                title="Show in shop"
                                onClick={() =>
                                  toggleVisibility(
                                    product
                                  )
                                }
                              >

                                <Store
                                  size={15}
                                />

                                Show

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>


            {/* EMPTY */}

            {!displayedProducts.length && (

              <div className="admin-empty">

                {search
                  ? "No products match your search."
                  : getEmptyMessage(
                      activeTab
                    )}

              </div>

            )}

          </div>

        )}

      </section>


      {/* =====================================================
          PRODUCT DETAILS MODAL
          ===================================================== */}

      {selectedProduct && (

        <ProductDetailsModal

          product={selectedProduct}

          onClose={() =>
            setSelectedProduct(null)
          }

          onModerate={moderate}

          onToggleVisibility={
            toggleVisibility
          }

        />

      )}

    </div>
  );
}


// =============================================================
// PRODUCT DETAILS MODAL
// =============================================================

function ProductDetailsModal({
  product,
  onClose,
  onModerate,
  onToggleVisibility,
}) {

  const image =
    product.mainImageUrl ||
    product.imageUrls?.[0] ||
    "/assets/partners-reference.jpg";


  const status =
    String(
      product.status || ""
    ).toUpperCase();


  return (

    <div
      className="admin-modal-overlay"
      onClick={onClose}
    >


      <div
        className="admin-product-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >


        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="admin-modal-header">

          <div>

            <span>
              PRODUCT DETAILS
            </span>

            <h2>
              {product.name}
            </h2>

          </div>


          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
          >

            <X size={20} />

          </button>

        </div>


        {/* ===================================================
            CONTENT
            =================================================== */}

        <div className="admin-product-detail-content">


          {/* IMAGE */}

          <div className="admin-product-detail-image">

            <img
              src={image}
              alt={product.name}
            />

          </div>


          {/* INFORMATION */}

          <div className="admin-product-detail-info">


            {/* STATUS */}

            <div className="admin-detail-status-row">

              <span
                className={
                  `admin-status ${getStatusClass(
                    status
                  )}`
                }
              >

                {formatStatus(status)}

              </span>


              {status === "PUBLISHED" && (

                <span className="admin-live-label">

                  <Store size={14} />

                  Visible in shop

                </span>

              )}

            </div>


            {/* DETAILS */}

            <div className="admin-detail-grid">


              <Detail
                icon={IndianRupee}
                label="Price"
                value={`₹${Number(
                  product.price || 0
                ).toLocaleString("en-IN")}`}
              />


              <Detail
                icon={Boxes}
                label="Stock"
                value={
                  product.stockQuantity ??
                  0
                }
              />


              <Detail
                icon={Package}
                label="Category"
                value={
                  product.category?.name ||
                  "—"
                }
              />


              <Detail
                icon={User}
                label="Made By"
                value={
                  product.woman?.name ||
                  product.woman?.user?.fullName ||
                  "—"
                }
              />

            </div>


            {/* DESCRIPTION */}

            <div className="admin-product-description">

              <h3>
                Description
              </h3>

              <p>
                {product.description ||
                  "No description provided."}
              </p>

            </div>


            {/* WEIGHT */}

            {product.weightKg != null && (

              <div className="admin-detail-extra">

                <strong>
                  Weight
                </strong>

                <span>
                  {product.weightKg} kg
                </span>

              </div>

            )}


            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="admin-product-modal-actions">


              {/* PENDING */}

              {status ===
                "PENDING_APPROVAL" && (

                <>

                  <button
                    type="button"
                    className="modal-approve-button"
                    onClick={() =>
                      onModerate(
                        product.id,
                        true
                      )
                    }
                  >

                    <Check size={17} />

                    Approve Product

                  </button>


                  <button
                    type="button"
                    className="modal-reject-button"
                    onClick={() =>
                      onModerate(
                        product.id,
                        false
                      )
                    }
                  >

                    <X size={17} />

                    Reject

                  </button>

                </>

              )}


              {/* PUBLISHED */}

              {status === "PUBLISHED" && (

                <button
                  type="button"
                  className="modal-hide-button"
                  onClick={() =>
                    onToggleVisibility(
                      product
                    )
                  }
                >

                  <EyeOff size={17} />

                  Stop Showing in Shop

                </button>

              )}


              {/* HIDDEN */}

              {status === "HIDDEN" && (

                <button
                  type="button"
                  className="modal-show-button"
                  onClick={() =>
                    onToggleVisibility(
                      product
                    )
                  }
                >

                  <Store size={17} />

                  Show in Shop Again

                </button>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}


// =============================================================
// DETAIL COMPONENT
// =============================================================

function Detail({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="admin-detail-item">

      <div>

        <Icon size={15} />

      </div>


      <section>

        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>

      </section>

    </div>

  );
}


// =============================================================
// SUMMARY COMPONENT
// =============================================================

function Summary({
  icon: Icon,
  value,
  label,
}) {

  return (

    <article className="admin-summary-card">

      <div>

        <Icon size={24} />

      </div>


      <section>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </section>

    </article>

  );
}


// =============================================================
// STATUS CLASS
// =============================================================

function getStatusClass(status) {

  switch (status) {

    case "PUBLISHED":
      return "active";

    case "PENDING_APPROVAL":
      return "pending";

    case "REJECTED":
      return "rejected";

    case "HIDDEN":
      return "inactive";

    case "OUT_OF_STOCK":
      return "inactive";

    case "DRAFT":
      return "inactive";

    case "ARCHIVED":
      return "inactive";

    default:
      return "inactive";
  }
}


// =============================================================
// STATUS DISPLAY TEXT
// =============================================================

function formatStatus(status) {

  switch (status) {

    case "PENDING_APPROVAL":
      return "PENDING REVIEW";

    case "PUBLISHED":
      return "LIVE";

    case "HIDDEN":
      return "HIDDEN";

    case "REJECTED":
      return "REJECTED";

    case "OUT_OF_STOCK":
      return "OUT OF STOCK";

    case "DRAFT":
      return "DRAFT";

    case "ARCHIVED":
      return "ARCHIVED";

    default:
      return status || "UNKNOWN";
  }
}


// =============================================================
// EMPTY MESSAGE
// =============================================================

function getEmptyMessage(tab) {

  switch (tab) {

    case "pending":
      return "No pending products.";

    case "active":
      return "No products are currently live in the shop.";

    case "hidden":
      return "No hidden products.";

    case "rejected":
      return "No rejected products.";

    default:
      return "No products found.";
  }
}
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Heart,
  X,
  MapPin,
  Package,
} from "lucide-react";

const API_BASE = "https://heriva-backend.onrender.com/api";

export default function OurWomen() {
  const [women, setWomen] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedState, setSelectedState] =
    useState("All Women");

  const [selectedWoman, setSelectedWoman] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD WOMEN + PRODUCTS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [womenResponse, productsResponse] =
          await Promise.all([
            fetch(`${API_BASE}/women`),
            fetch(`${API_BASE}/products`),
          ]);

        // ======================================================
        // WOMEN
        // ======================================================

        if (!womenResponse.ok) {
          throw new Error(
            "Failed to load women."
          );
        }

        const womenData =
          await womenResponse.json();

        const womenList =
          Array.isArray(womenData)
            ? womenData
            : Array.isArray(
                womenData?.content
              )
            ? womenData.content
            : Array.isArray(
                womenData?.women
              )
            ? womenData.women
            : [];

        // ======================================================
        // PRODUCTS
        // ======================================================

        let productsList = [];

        if (productsResponse.ok) {
          const productsData =
            await productsResponse.json();

          productsList =
            Array.isArray(productsData)
              ? productsData
              : Array.isArray(
                  productsData?.content
                )
              ? productsData.content
              : Array.isArray(
                  productsData?.products
                )
              ? productsData.products
              : [];
        }

        console.log(
          "Women loaded:",
          womenList
        );

        console.log(
          "Products loaded:",
          productsList
        );

        if (!cancelled) {
          setWomen(womenList);
          setProducts(productsList);
        }
      } catch (err) {
        console.error(
          "Our Women loading error:",
          err
        );

        if (!cancelled) {
          setWomen([]);
          setProducts([]);

          setError(
            err?.message ||
              "Unable to load women right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // STATES
  // ==========================================================

  const states = useMemo(() => {
    const uniqueStates = [
      ...new Set(
        women
          .map(
            (woman) =>
              woman?.state ||
              woman?.address?.state
          )
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(
        String(b)
      )
    );

    return [
      "All Women",
      ...uniqueStates,
    ];
  }, [women]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredWomen = useMemo(() => {
    if (
      selectedState ===
      "All Women"
    ) {
      return women;
    }

    return women.filter((woman) => {
      const state =
        woman?.state ||
        woman?.address?.state ||
        "";

      return (
        String(state).toLowerCase() ===
        String(
          selectedState
        ).toLowerCase()
      );
    });
  }, [
    women,
    selectedState,
  ]);

  // ==========================================================
  // OPEN WOMAN
  // ==========================================================

  function openWoman(woman) {
    setSelectedWoman(woman);

    document.body.style.overflow =
      "hidden";
  }

  // ==========================================================
  // CLOSE WOMAN
  // ==========================================================

  function closeWoman() {
    setSelectedWoman(null);

    document.body.style.overflow =
      "";
  }

  // ==========================================================
  // ESC TO CLOSE
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        selectedWoman
      ) {
        closeWoman();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [selectedWoman]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  function getWomanImage(woman) {
    return (
      woman?.photoUrl ||
      woman?.imageUrl ||
      woman?.image ||
      "/assets/women-reference.jpg"
    );
  }

  function getWomanName(woman) {
    return (
      woman?.name ||
      woman?.fullName ||
      "Woman Artisan"
    );
  }

  function getWomanState(woman) {
    return (
      woman?.state ||
      woman?.address?.state ||
      ""
    );
  }

  function getWomanVillage(woman) {
    return (
      woman?.village ||
      woman?.address?.village ||
      ""
    );
  }

  function getWomanDistrict(woman) {
    return (
      woman?.district ||
      woman?.address?.district ||
      ""
    );
  }

  function getWomanSkills(woman) {
    return (
      woman?.skills ||
      woman?.skill ||
      woman?.craft ||
      woman?.category ||
      ""
    );
  }

  function getWomanStory(woman) {
    return (
      woman?.story ||
      woman?.bio ||
      woman?.description ||
      woman?.about ||
      woman?.journey ||
      ""
    );
  }

  // ==========================================================
  // GET PRODUCT COUNT FOR WOMAN
  // ==========================================================

  function getWomanProductCount(woman) {
    if (!woman) {
      return 0;
    }

    // --------------------------------------------------------
    // First use count directly from woman API if available
    // --------------------------------------------------------

    const directCount =
      woman?.productCount ??
      woman?.productsCount ??
      woman?.totalProducts;

    if (
      directCount !== undefined &&
      directCount !== null &&
      directCount !== ""
    ) {
      return Number(directCount) || 0;
    }

    // --------------------------------------------------------
    // If woman contains products array
    // --------------------------------------------------------

    if (
      Array.isArray(woman?.products)
    ) {
      return woman.products.length;
    }

    // --------------------------------------------------------
    // Otherwise count products from /api/products
    // --------------------------------------------------------

    const womanId = woman?.id;

    const womanName = String(
      getWomanName(woman)
    )
      .trim()
      .toLowerCase();

    const count = products.filter(
      (product) => {

        // ==============================================
        // PRODUCT -> WOMAN OBJECT
        // ==============================================

        const productWoman =
          product?.woman;

        if (productWoman) {
          // Match by woman ID
          if (
            womanId !== undefined &&
            productWoman?.id !== undefined &&
            String(
              productWoman.id
            ) === String(womanId)
          ) {
            return true;
          }

          // Match by woman name
          if (
            productWoman?.name &&
            String(
              productWoman.name
            )
              .trim()
              .toLowerCase() ===
              womanName
          ) {
            return true;
          }
        }

        // ==============================================
        // PRODUCT -> WOMAN ID
        // ==============================================

        const productWomanId =
          product?.womanId ??
          product?.artisanId ??
          product?.createdBy;

        if (
          womanId !== undefined &&
          productWomanId !== undefined &&
          String(productWomanId) ===
            String(womanId)
        ) {
          return true;
        }

        return false;
      }
    ).length;

    return count;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="standard-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="women-hero">

        <div>

          <span className="eyebrow">
            OUR WOMEN
          </span>

          <h1>
            Extraordinary
            <br />
            <em>
              Everyday Heroes.
            </em>
          </h1>

          <p>
            Meet the inspiring women who
            create with courage, preserve
            traditional skills and build
            better lives for their families.
          </p>

        </div>

      </section>

      {/* =====================================================
          WOMEN SECTION
      ===================================================== */}

      <section className="section">

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="filter-pills">

          {states.map((state) => (

            <button
              key={state}
              type="button"
              className={
                selectedState === state
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setSelectedState(state)
              }
            >
              {state}
            </button>

          ))}

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="women-loading">
            Loading our women...
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="women-error">
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredWomen.length === 0 && (

            <div className="women-empty">
              No women found.
            </div>

          )}

        {/* =================================================
            WOMEN GRID
        ================================================= */}

        {!loading &&
          !error &&
          filteredWomen.length > 0 && (

            <div className="women-grid">

              {filteredWomen.map((woman) => {

                const image =
                  getWomanImage(woman);

                const name =
                  getWomanName(woman);

                const village =
                  getWomanVillage(woman);

                const district =
                  getWomanDistrict(woman);

                const state =
                  getWomanState(woman);

                const skills =
                  getWomanSkills(woman);

                const productCount =
                  getWomanProductCount(
                    woman
                  );

                return (
                  <article
                    className="woman-card"
                    key={
                      woman?.id ||
                      name
                    }
                    onClick={() =>
                      openWoman(woman)
                    }
                  >

                    {/* IMAGE */}

                    <div className="woman-img">

                      <img
                        src={image}
                        alt={name}
                        onError={(event) => {
                          event.currentTarget.src =
                            "/assets/def-women.png";
                        }}
                      />

                      <div className="woman-view-overlay">
                        <span>
                          View Story
                          <ArrowRight
                            size={15}
                          />
                        </span>
                      </div>

                    </div>

                    {/* NAME */}

                    <h3>
                      {name}
                    </h3>

                    {/* LOCATION */}

                    <p>
                      {[
                        village,
                        district,
                        state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {/* SKILLS */}

                    {skills && (
                      <span>
                        {skills}
                      </span>
                    )}

                    {/* PRODUCT COUNT */}

                    <small>
                      {productCount}{" "}
                      {productCount === 1
                        ? "Product"
                        : "Products"}
                    </small>

                    {/* BUTTON */}

                    <button
                      type="button"
                      className="woman-story-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        openWoman(woman);
                      }}
                    >
                      View Story
                      <ArrowRight
                        size={15}
                      />
                    </button>

                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* =====================================================
          QUOTE
      ===================================================== */}

      <section className="women-quote">

        “When women support women,
        <br />
        incredible things happen.”

        <Heart size={18} />

      </section>

      {/* =====================================================
          WOMAN DETAIL MODAL
      ===================================================== */}

      {selectedWoman && (

        <div
          className="woman-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Story of ${getWomanName(
            selectedWoman
          )}`}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeWoman();
            }
          }}
        >

          <div className="woman-modal">

            {/* CLOSE */}

            <button
              type="button"
              className="woman-modal-close"
              onClick={closeWoman}
              aria-label="Close"
            >
              <X size={21} />
            </button>

            {/* IMAGE */}

            <div className="woman-modal-image">

              <img
                src={getWomanImage(
                  selectedWoman
                )}
                alt={getWomanName(
                  selectedWoman
                )}
                onError={(event) => {
                  event.currentTarget.src =
                    "/assets/def-women.png";
                }}
              />

            </div>

            {/* CONTENT */}

            <div className="woman-modal-content">

              <span className="eyebrow">
                WOMAN ARTISAN
              </span>

              <h2>
                {getWomanName(
                  selectedWoman
                )}
              </h2>

              {/* LOCATION */}

              {(getWomanVillage(
                selectedWoman
              ) ||
                getWomanDistrict(
                  selectedWoman
                ) ||
                getWomanState(
                  selectedWoman
                )) && (

                <div className="woman-modal-location">

                  <MapPin size={17} />

                  <span>
                    {[
                      getWomanVillage(
                        selectedWoman
                      ),
                      getWomanDistrict(
                        selectedWoman
                      ),
                      getWomanState(
                        selectedWoman
                      ),
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>

                </div>

              )}

              {/* SKILLS */}

              {getWomanSkills(
                selectedWoman
              ) && (

                <div className="woman-detail-block">

                  <h4>
                    Craft & Skills
                  </h4>

                  <p>
                    {getWomanSkills(
                      selectedWoman
                    )}
                  </p>

                </div>

              )}

              {/* STORY */}

              <div className="woman-detail-block">

                <h4>
                  Her Story
                </h4>

                {getWomanStory(
                  selectedWoman
                ) ? (

                  <p className="woman-story-text">
                    {getWomanStory(
                      selectedWoman
                    )}
                  </p>

                ) : (

                  <p className="woman-story-text empty">
                    Her story will be shared
                    here soon.
                  </p>

                )}

              </div>

              {/* PRODUCTS */}

              <div className="woman-modal-meta">

                <div>

                  <Package size={18} />

                  <span>

                    <strong>
                      {getWomanProductCount(
                        selectedWoman
                      )}
                    </strong>

                    <small>
                      Products
                    </small>

                  </span>

                </div>

                {getWomanSkills(
                  selectedWoman
                ) && (

                  <div>

                    <Heart size={18} />

                    <span>

                      <strong>
                        Handmade
                      </strong>

                      <small>
                        With care
                      </small>

                    </span>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
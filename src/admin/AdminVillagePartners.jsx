import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Check,
  X,
  Users,
  Clock,
  UserCheck,
  UserRoundCheck,
} from "lucide-react";
import { adminApi } from "./adminApi";

export default function AdminVillagePartners() {
  const [pendingPartners, setPendingPartners] = useState([]);
  const [activePartners, setActivePartners] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD PARTNERS
     ========================================================= */

  const loadPartners = async () => {
    try {
      setLoading(true);

      const [pendingData, activeData] = await Promise.all([
        adminApi.pendingPartners(),
        adminApi.activePartners(),
      ]);

      setPendingPartners(
        Array.isArray(pendingData)
          ? pendingData
          : pendingData?.content || []
      );

      setActivePartners(
        Array.isArray(activeData)
          ? activeData
          : activeData?.content || []
      );
    } catch (error) {
      console.error("Failed to load partners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  /* =========================================================
     APPROVE / REJECT
     ========================================================= */

  const approve = async (id, approved) => {
    try {
      await adminApi.approvePartner(id, approved);
      await loadPartners();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  /* =========================================================
     SEARCH FILTER
     ========================================================= */

  const filterPartners = (list) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((partner) => {
      const text = [
        partner.user?.fullName,
        partner.user?.email,
        partner.village,
        partner.district,
        partner.state,
        partner.pincode,
        partner.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  };

  const filteredPending = filterPartners(pendingPartners);
  const filteredActive = filterPartners(activePartners);

  return (
    <div className="admin-section-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-page-heading">

        <div>

          <span>OUR NETWORK</span>

          <h1>Village Partners</h1>

          <p>
            Review, approve and manage the youth supporting
            rural women.
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <div className="admin-summary-row">

        <Summary
          icon={UserRoundCheck}
          value={activePartners.length}
          label="Active Partners"
        />

        <Summary
          icon={Clock}
          value={pendingPartners.length}
          label="Pending Applications"
        />

        <Summary
          icon={Users}
          value={
            activePartners.length +
            pendingPartners.length
          }
          label="Total Partners"
        />

        <Summary
          icon={UserCheck}
          value="5"
          label="Women / Partner Limit"
        />

      </div>


      {/* =====================================================
          MAIN CARD
          ===================================================== */}

      <section className="admin-table-card">

        {/* ===================================================
            SEARCH
            =================================================== */}

        <div className="admin-table-toolbar">

          <div className="admin-table-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search partner or village..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>


        {loading ? (

          /* =================================================
             LOADING
             ================================================= */

          <div className="admin-loading">
            Loading partners...
          </div>

        ) : (

          <>

            {/* =================================================
                ACTIVE PARTNERS
                ================================================= */}

            <div className="admin-partner-section">

              <div className="admin-section-title">

                <div>

                  <h2>
                    Active Partners
                  </h2>

                  <p>
                    Approved Village Partners currently
                    working with Made By Her.
                  </p>

                </div>

                <span className="admin-count-badge">
                  {filteredActive.length}
                </span>

              </div>


              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Partner
                      </th>

                      <th>
                        Village
                      </th>

                      <th>
                        District
                      </th>

                      <th>
                        State
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredActive.map((partner) => (

                      <tr key={partner.id}>

                        {/* PARTNER */}

                        <td>

                          <div className="admin-person no-image">

                            <div className="admin-person-placeholder">

                              {(partner.user?.fullName || "P")
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {partner.user?.fullName ||
                                  "Village Partner"}
                              </strong>

                              <small>
                                {partner.user?.email ||
                                  "No email available"}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* VILLAGE */}

                        <td>

                          <span className="admin-location-cell">

                            <MapPin size={14} />

                            {partner.village || "—"}

                          </span>

                        </td>


                        {/* DISTRICT */}

                        <td>
                          {partner.district || "—"}
                        </td>


                        {/* STATE */}

                        <td>
                          {partner.state || "—"}
                        </td>


                        {/* STATUS */}

                        <td>

                          <span className="admin-status active">
                            APPROVED
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {!filteredActive.length && (

                  <div className="admin-empty">

                    {search
                      ? "No active partners match your search."
                      : "No active partners found."}

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                PENDING APPLICATIONS
                ================================================= */}

            <div className="admin-partner-section">

              <div className="admin-section-title">

                <div>

                  <h2>
                    Pending Applications
                  </h2>

                  <p>
                    Review Village Partner applications
                    waiting for approval.
                  </p>

                </div>

                <span className="admin-count-badge">
                  {filteredPending.length}
                </span>

              </div>


              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Partner
                      </th>

                      <th>
                        Village
                      </th>

                      <th>
                        District
                      </th>

                      <th>
                        State
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredPending.map((partner) => (

                      <tr key={partner.id}>

                        {/* PARTNER */}

                        <td>

                          <div className="admin-person no-image">

                            <div className="admin-person-placeholder">

                              {(partner.user?.fullName || "P")
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {partner.user?.fullName ||
                                  "Village Partner"}
                              </strong>

                              <small>
                                {partner.user?.email ||
                                  "No email available"}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* VILLAGE */}

                        <td>

                          <span className="admin-location-cell">

                            <MapPin size={14} />

                            {partner.village || "—"}

                          </span>

                        </td>


                        {/* DISTRICT */}

                        <td>
                          {partner.district || "—"}
                        </td>


                        {/* STATE */}

                        <td>
                          {partner.state || "—"}
                        </td>


                        {/* STATUS */}

                        <td>

                          <span className="admin-status pending">

                            {partner.status ||
                              "PENDING"}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="admin-row-actions">

                            <button
                              type="button"
                              className="approve-button"
                              onClick={() =>
                                approve(
                                  partner.id,
                                  true
                                )
                              }
                              title="Approve partner"
                            >

                              <Check size={15} />

                              <span>
                                Approve
                              </span>

                            </button>


                            <button
                              type="button"
                              className="reject-button"
                              onClick={() =>
                                approve(
                                  partner.id,
                                  false
                                )
                              }
                              title="Reject application"
                            >

                              <X size={16} />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {!filteredPending.length && (

                  <div className="admin-empty">

                    {search
                      ? "No pending applications match your search."
                      : "No pending applications."}

                  </div>

                )}

              </div>

            </div>

          </>

        )}

      </section>

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

function Summary({
  icon: Icon,
  value,
  label,
}) {

  return (

    <article className="admin-summary-card">

      <div className="admin-summary-icon">

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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("verichain_user") || "{}"
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (!user.id) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/documents/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalDocuments = documents.length;

  const blockchainDocuments = documents.filter(
    (doc) => doc.tx_hash
  ).length;

  const verifiedDocuments = documents.filter(
    (doc) => doc.status === "VERIFIED"
  ).length;

  const pendingDocuments = documents.filter(
    (doc) =>
      !doc.tx_hash ||
      doc.status === "Pending" ||
      doc.status === "PENDING"
  ).length;

  const verificationRate =
    totalDocuments > 0
      ? Math.round(
          (verifiedDocuments / totalDocuments) * 100
        )
      : 0;

  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 5);

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-welcome">

        <div>
          <p className="dashboard-eyebrow">
            VERI CHAIN
          </p>

          <h1>
            Welcome back{user.name ? `, ${user.name}` : ""}
          </h1>

          <p className="dashboard-description">
            Manage, verify and securely store your
            digital documents on blockchain.
          </p>
        </div>

        <button
          className="dashboard-upload-btn"
          onClick={() => navigate("/documents")}
        >
          + Upload Document
        </button>

      </div>


      {/* STATS */}

      <div className="dashboard-stats">

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            📄
          </div>

          <div>
            <span>Total Documents</span>

            <strong>
              {loading ? "..." : totalDocuments}
            </strong>

            <small>
              Documents uploaded
            </small>
          </div>

        </div>


        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon">
            ⛓
          </div>

          <div>
            <span>Blockchain Secured</span>

            <strong>
              {loading
                ? "..."
                : blockchainDocuments}
            </strong>

            <small>
              Immutable records
            </small>
          </div>

        </div>


        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon verified-icon">
            ✓
          </div>

          <div>
            <span>Verified</span>

            <strong className="verified-number">
              {loading
                ? "..."
                : verifiedDocuments}
            </strong>

            <small>
              Successfully verified
            </small>
          </div>

        </div>


        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon pending-icon">
            !
          </div>

          <div>
            <span>Pending</span>

            <strong className="pending-number">
              {loading
                ? "..."
                : pendingDocuments}
            </strong>

            <small>
              Awaiting verification
            </small>
          </div>

        </div>

      </div>


      {/* MAIN GRID */}

      <div className="dashboard-main-grid">

        {/* RECENT DOCUMENTS */}

        <div className="card dashboard-documents-card">

          <div className="dashboard-section-header">

            <div>
              <h2>
                Recent Documents
              </h2>

              <p>
                Your latest blockchain-secured documents.
              </p>
            </div>

            <button
              className="dashboard-view-all"
              onClick={() =>
                navigate("/documents")
              }
            >
              View All →
            </button>

          </div>


          {loading ? (

            <div className="dashboard-empty">
              Loading documents...
            </div>

          ) : recentDocuments.length === 0 ? (

            <div className="dashboard-empty">

              <div className="dashboard-empty-icon">
                📄
              </div>

              <h3>
                No documents yet
              </h3>

              <p>
                Upload your first document to
                secure it on the blockchain.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  navigate("/documents")
                }
              >
                Upload Document
              </button>

            </div>

          ) : (

            <div className="dashboard-document-list">

              {recentDocuments.map((doc) => (

                <div
                  className="dashboard-document-row"
                  key={doc.id}
                >

                  <div className="dashboard-file-icon">
                    📄
                  </div>


                  <div className="dashboard-document-info">

                    <strong>
                      {doc.filename ||
                        "Document"}
                    </strong>

                    <span>
                      ID: {doc.document_id}
                    </span>

                  </div>


                  <div
                    className={
                      doc.status === "VERIFIED"
                        ? "dashboard-status verified"
                        : "dashboard-status pending"
                    }
                  >
                    {doc.status === "VERIFIED"
                      ? "✓ Verified"
                      : doc.status || "Pending"}
                  </div>


                  <div className="dashboard-document-date">

                    {doc.created_at
                      ? new Date(
                          doc.created_at
                        ).toLocaleDateString()
                      : "N/A"}

                  </div>


                  <button
                    className="dashboard-details-btn"
                    onClick={() =>
                      navigate(
                        `/documents/${doc.id}`
                      )
                    }
                  >
                    →
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* SECURITY OVERVIEW */}

        <div className="card dashboard-security-card">

          <div className="security-card-header">

            <div className="security-big-icon">
              🔐
            </div>

            <div>
              <h2>
                Security Overview
              </h2>

              <p>
                Your document security status.
              </p>
            </div>

          </div>


          <div className="security-score">

            <div className="security-score-circle">

              <strong>
                {loading ? "..." : verificationRate}%
              </strong>

              <span>
                Verified
              </span>

            </div>

          </div>


          <div className="security-items">

            <div>
              <span>
                Blockchain Records
              </span>

              <strong>
                {loading
                  ? "..."
                  : blockchainDocuments}
              </strong>
            </div>


            <div>
              <span>
                Verified Documents
              </span>

              <strong>
                {loading
                  ? "..."
                  : verifiedDocuments}
              </strong>
            </div>


            <div>
              <span>
                Pending Documents
              </span>

              <strong>
                {loading
                  ? "..."
                  : pendingDocuments}
              </strong>
            </div>

          </div>


          <button
            className="security-action"
            onClick={() =>
              navigate("/blockchain")
            }
          >
            View Blockchain Records →
          </button>

        </div>

      </div>


      {/* QUICK ACTIONS */}

      <div className="card dashboard-quick-card">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Quick Actions
            </h2>

            <p>
              Access your most used Veri Chain features.
            </p>
          </div>

        </div>


        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/documents")
            }
          >
            <span>📄</span>

            <div>
              <strong>
                My Documents
              </strong>

              <small>
                Manage your documents
              </small>
            </div>
          </button>


          <button
            onClick={() =>
              navigate("/verify")
            }
          >
            <span>🔍</span>

            <div>
              <strong>
                Verify Document
              </strong>

              <small>
                Check blockchain authenticity
              </small>
            </div>
          </button>


          <button
            onClick={() =>
              navigate("/qr-verify")
            }
          >
            <span>📷</span>

            <div>
              <strong>
                QR Verification
              </strong>

              <small>
                Scan document QR code
              </small>
            </div>
          </button>


          <button
            onClick={() =>
              navigate("/activity")
            }
          >
            <span>🕒</span>

            <div>
              <strong>
                Activity History
              </strong>

              <small>
                View recent activity
              </small>
            </div>
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
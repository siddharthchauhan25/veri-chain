import { useEffect, useState } from "react";

function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    verifiedDocuments: 0,
    registeredDocuments: 0,
  });

  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [userMessage, setUserMessage] = useState("");
  const [userError, setUserError] = useState("");

  // Verification states
  const [documentId, setDocumentId] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  // Search
  const [userSearch, setUserSearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  const loadStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/stats"
      );

      const data = await response.json();

      if (response.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/users"
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Users error:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/documents"
      );

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Documents error:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadDocuments();
  }, []);

  // --------------------------------------------------
  // ROLE UPDATE
  // --------------------------------------------------

  const updateRole = async (userId, newRole) => {
    setUserMessage("");
    setUserError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUserError(
          data.message || "Failed to update user role."
        );
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? { ...user, role: newRole }
            : user
        )
      );

      setUserMessage("User role updated successfully.");

      // If current user changed their own role,
      // update local session too.
      try {
        const currentSession =
          localStorage.getItem("verichain_user");

        if (currentSession) {
          const currentUser = JSON.parse(currentSession);

          if (Number(currentUser.id) === Number(userId)) {
            currentUser.role = newRole;
            localStorage.setItem(
              "verichain_user",
              JSON.stringify(currentUser)
            );
          }
        }
      } catch (error) {
        console.error("Session update error:", error);
      }
    } catch (error) {
      console.error("Role update error:", error);
      setUserError("Unable to connect to Veri Chain backend.");
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setUserMessage("");
    setUserError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUserError(
          data.message || "Failed to delete user."
        );
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== userId
        )
      );

      setUserMessage("User deleted successfully.");

      loadStats();
      loadDocuments();
    } catch (error) {
      console.error("Delete user error:", error);
      setUserError("Unable to connect to Veri Chain backend.");
    }
  };

  // --------------------------------------------------
  // DOCUMENT VERIFICATION
  // --------------------------------------------------

  const handleVerify = async (e) => {
    e.preventDefault();

    setVerifyError("");
    setResult(null);

    const cleanDocumentId = documentId.trim();
    const cleanHash = sha256Hash.trim();

    if (!cleanDocumentId) {
      setVerifyError("Please enter a Document ID.");
      return;
    }

    if (!cleanHash) {
      setVerifyError("Please enter the SHA-256 hash.");
      return;
    }

    if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
      setVerifyError(
        "SHA-256 hash must contain exactly 64 hexadecimal characters."
      );
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: cleanDocumentId,
            sha256Hash: cleanHash,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setVerifyError(
          data.message ||
            "Unable to verify this document."
        );
        return;
      }

      setResult(data);

      // Refresh stats/documents after verification
      loadStats();
      loadDocuments();
    } catch (error) {
      console.error("Admin verification error:", error);

      setVerifyError(
        "Unable to connect to Veri Chain backend."
      );
    } finally {
      setVerifying(false);
    }
  };

  const clearVerification = () => {
    setDocumentId("");
    setSha256Hash("");
    setResult(null);
    setVerifyError("");
  };

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase();

    return (
      String(user.name || "")
        .toLowerCase()
        .includes(search) ||
      String(user.email || "")
        .toLowerCase()
        .includes(search) ||
      String(user.role || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const filteredDocuments = documents.filter((doc) => {
    const search = documentSearch.toLowerCase();

    return (
      String(doc.document_id || "")
        .toLowerCase()
        .includes(search) ||
      String(doc.filename || "")
        .toLowerCase()
        .includes(search) ||
      String(doc.owner_name || "")
        .toLowerCase()
        .includes(search) ||
      String(doc.owner_email || "")
        .toLowerCase()
        .includes(search) ||
      String(doc.status || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const verificationRate =
    stats.totalDocuments > 0
      ? Math.round(
          (stats.verifiedDocuments /
            stats.totalDocuments) *
            100
        )
      : 0;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="page-header admin-main-header">
        <div>
          <p className="admin-eyebrow">
            ADMINISTRATION
          </p>

          <h1>Admin Control Center</h1>

          <p>
            Manage users, documents and blockchain
            verification from one secure console.
          </p>
        </div>

        <div className="admin-live-status">
          <span className="admin-live-dot">
            ●
          </span>
          System Online
        </div>
      </div>

      {/* SECURITY BANNER */}
      <div className="admin-security-banner">
        <div className="admin-security-icon">
          🔐
        </div>

        <div>
          <strong>
            Veri Chain Administration
          </strong>

          <p>
            Blockchain-backed identity and document
            management console.
          </p>
        </div>

        <span>
          ⛓ Local Blockchain Active
        </span>
      </div>

      {/* STATS */}
      <section className="admin-stats-grid">

        <div className="card admin-stat-card">
          <div className="admin-stat-icon">
            👥
          </div>

          <div>
            <span>Total Users</span>

            <strong>
              {loadingStats ? "—" : stats.totalUsers}
            </strong>

            <small>
              Registered accounts
            </small>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon">
            📄
          </div>

          <div>
            <span>Total Documents</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.totalDocuments}
            </strong>

            <small>
              Documents in system
            </small>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon">
            ✓
          </div>

          <div>
            <span>Verified</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.verifiedDocuments}
            </strong>

            <small>
              Blockchain verified
            </small>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon">
            ⛓
          </div>

          <div>
            <span>Registered</span>

            <strong>
              {loadingStats
                ? "—"
                : stats.registeredDocuments}
            </strong>

            <small>
              Blockchain records
            </small>
          </div>
        </div>

      </section>

      {/* OVERVIEW */}
      <div className="admin-overview-grid">

        <div className="card admin-overview-card">

          <div className="admin-card-heading">
            <div>
              <h2>Verification Overview</h2>
              <p>
                Current document verification status.
              </p>
            </div>
          </div>

          <div className="admin-progress-wrapper">

            <div className="admin-progress-header">
              <span>
                Verification Rate
              </span>

              <strong>
                {verificationRate}%
              </strong>
            </div>

            <div className="admin-progress">
              <div
                className="admin-progress-fill"
                style={{
                  width: `${verificationRate}%`,
                }}
              />
            </div>

          </div>

          <div className="admin-overview-stats">

            <div>
              <span>Verified</span>
              <strong>
                {stats.verifiedDocuments}
              </strong>
            </div>

            <div>
              <span>Registered</span>
              <strong>
                {stats.registeredDocuments}
              </strong>
            </div>

            <div>
              <span>Total</span>
              <strong>
                {stats.totalDocuments}
              </strong>
            </div>

          </div>

        </div>

        <div className="card admin-overview-card">

          <div className="admin-card-heading">
            <div>
              <h2>System Security</h2>
              <p>
                Veri Chain infrastructure status.
              </p>
            </div>
          </div>

          <div className="admin-security-list">

            <div>
              <span>Blockchain</span>
              <strong className="admin-green">
                ● Connected
              </strong>
            </div>

            <div>
              <span>Database</span>
              <strong className="admin-green">
                ● SQLite Connected
              </strong>
            </div>

            <div>
              <span>Verification</span>
              <strong className="admin-green">
                ● Active
              </strong>
            </div>

            <div>
              <span>Network</span>
              <strong>
                Local Hardhat
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* USER MANAGEMENT */}
      <div className="card admin-section-card">

        <div className="admin-section-header">

          <div>
            <p className="admin-eyebrow">
              ACCESS CONTROL
            </p>

            <h2>User Management</h2>

            <p>
              Manage registered users and their
              Veri Chain roles.
            </p>
          </div>

          <div className="admin-table-count">
            {filteredUsers.length} Users
          </div>

        </div>

        {userMessage && (
          <div className="admin-success-message">
            ✓ {userMessage}
          </div>
        )}

        {userError && (
          <div className="admin-error">
            <span>!</span>
            {userError}
          </div>
        )}

        <div className="admin-toolbar">

          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={userSearch}
            onChange={(e) =>
              setUserSearch(e.target.value)
            }
          />

        </div>

        <div className="admin-table-wrapper">

          {loadingUsers ? (
            <div className="admin-loading">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty">
              No users found.
            </div>
          ) : (
            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      #{user.id}
                    </td>

                    <td>
                      <div className="admin-user-cell">

                        <div className="admin-user-avatar">
                          {String(
                            user.name || "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {user.name || "Unknown"}
                        </strong>

                      </div>
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>

                      <select
                        value={
                          user.role || "USER"
                        }
                        onChange={(e) =>
                          updateRole(
                            user.id,
                            e.target.value
                          )
                        }
                        className={`admin-role-select role-${String(
                          user.role || "USER"
                        ).toLowerCase()}`}
                      >

                        <option value="USER">
                          USER
                        </option>

                        <option value="VERIFIER">
                          VERIFIER
                        </option>

                        <option value="ADMIN">
                          ADMIN
                        </option>

                      </select>

                    </td>

                    <td>
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          deleteUser(user.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* DOCUMENT MANAGEMENT */}
      <div className="card admin-section-card">

        <div className="admin-section-header">

          <div>
            <p className="admin-eyebrow">
              DOCUMENT CONTROL
            </p>

            <h2>Document Management</h2>

            <p>
              Monitor documents and their blockchain
              registration status.
            </p>
          </div>

          <div className="admin-table-count">
            {filteredDocuments.length} Documents
          </div>

        </div>

        <div className="admin-toolbar">

          <input
            type="text"
            placeholder="Search document ID, filename, owner or status..."
            value={documentSearch}
            onChange={(e) =>
              setDocumentSearch(e.target.value)
            }
          />

        </div>

        <div className="admin-table-wrapper">

          {loadingDocuments ? (
            <div className="admin-loading">
              Loading documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="admin-empty">
              No documents found.
            </div>
          ) : (
            <table className="admin-table">

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>SHA-256</th>
                  <th>Transaction</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>

                {filteredDocuments.map((doc) => (

                  <tr key={doc.id}>

                    <td>
                      <div className="admin-document-cell">

                        <strong>
                          {doc.filename ||
                            "Document"}
                        </strong>

                        <span>
                          {doc.document_id}
                        </span>

                      </div>
                    </td>

                    <td>
                      <div>
                        <strong>
                          {doc.owner_name ||
                            "Unknown"}
                        </strong>

                        <small>
                          {doc.owner_email || ""}
                        </small>
                      </div>
                    </td>

                    <td>

                      <span
                        className={`admin-status-badge status-${String(
                          doc.status || "UNKNOWN"
                        ).toLowerCase()}`}
                      >
                        {doc.status ||
                          "UNKNOWN"}
                      </span>

                    </td>

                    <td>

                      <span className="admin-hash-preview">
                        {doc.sha256_hash
                          ? `${doc.sha256_hash.slice(
                              0,
                              10
                            )}...${doc.sha256_hash.slice(
                              -8
                            )}`
                          : "—"}
                      </span>

                    </td>

                    <td>

                      <span className="admin-tx-preview">
                        {doc.tx_hash
                          ? `${doc.tx_hash.slice(
                              0,
                              10
                            )}...${doc.tx_hash.slice(
                              -8
                            )}`
                          : "—"}
                      </span>

                    </td>

                    <td>
                      {doc.created_at
                        ? new Date(
                            doc.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* VERIFICATION CONSOLE */}
      <div className="admin-grid">

        <div className="card admin-verify-card">

          <div className="admin-card-heading">

            <div>
              <p className="admin-eyebrow">
                VERIFIER CONSOLE
              </p>

              <h2>
                Verify a Document
              </h2>

              <p>
                Verify document authenticity against
                the blockchain record.
              </p>
            </div>

            <div className="admin-card-number">
              01
            </div>

          </div>

          <form onSubmit={handleVerify}>

            <div className="admin-field">

              <label>
                Document ID
              </label>

              <input
                type="text"
                placeholder="Enter document ID"
                value={documentId}
                onChange={(e) =>
                  setDocumentId(e.target.value)
                }
              />

              <small>
                The unique ID assigned to the document.
              </small>

            </div>

            <div className="admin-field">

              <label>
                SHA-256 Hash
              </label>

              <textarea
                placeholder="Enter 64-character SHA-256 hash"
                value={sha256Hash}
                onChange={(e) =>
                  setSha256Hash(e.target.value)
                }
                rows="4"
              />

              <small>
                Enter the document's 64-character
                SHA-256 fingerprint.
              </small>

            </div>

            {verifyError && (
              <div className="admin-error">

                <span>!</span>

                {verifyError}

              </div>
            )}

            <div className="admin-form-actions">

              <button
                type="submit"
                className="admin-verify-btn"
                disabled={verifying}
              >
                {verifying
                  ? "Verifying..."
                  : "Verify on Blockchain"}
              </button>

              <button
                type="button"
                className="admin-clear-btn"
                onClick={clearVerification}
              >
                Clear
              </button>

            </div>

          </form>

        </div>

        {/* RESULT */}
        <div className="card admin-result-card">

          <div className="admin-card-heading">

            <div>
              <h2>
                Verification Result
              </h2>

              <p>
                Blockchain verification response.
              </p>
            </div>

            <div className="admin-card-number">
              02
            </div>

          </div>

          {!result ? (

            <div className="admin-result-empty">

              <div className="admin-result-icon">
                🔍
              </div>

              <h3>
                Waiting for verification
              </h3>

              <p>
                Enter a Document ID and SHA-256 hash
                to verify the document.
              </p>

            </div>

          ) : (

            <div>

              <div
                className={
                  result.verified
                    ? "admin-result-status verified"
                    : "admin-result-status invalid"
                }
              >

                <div className="admin-result-status-icon">
                  {result.verified ? "✓" : "!"}
                </div>

                <div>

                  <strong>
                    {result.verified
                      ? "Document Verified"
                      : "Document Not Verified"}
                  </strong>

                  <span>
                    {result.verified
                      ? "Hash matches the blockchain record."
                      : "The submitted document could not be verified."}
                  </span>

                </div>

              </div>

              <div className="admin-result-details">

                <div>
                  <span>Document ID</span>

                  <strong>
                    {result.documentId ||
                      documentId ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Blockchain Status</span>

                  <strong
                    className={
                      result.verified
                        ? "admin-green"
                        : "admin-red"
                    }
                  >
                    {result.verified
                      ? "✓ Valid"
                      : "✕ Invalid"}
                  </strong>
                </div>

                <div>
                  <span>Network</span>

                  <strong>
                    Veri Chain Local Network
                  </strong>
                </div>

                <div>
                  <span>Verification Method</span>

                  <strong>
                    SHA-256 + Blockchain
                  </strong>
                </div>

              </div>

              {result.txHash && (

                <div className="admin-hash-section">

                  <span>
                    Transaction Hash
                  </span>

                  <div>
                    {result.txHash}
                  </div>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

      {/* HOW IT WORKS */}
      <div className="card admin-process-card">

        <div className="admin-card-heading">

          <div>
            <h2>
              How Admin Verification Works
            </h2>

            <p>
              Three-step blockchain document
              authenticity verification.
            </p>
          </div>

        </div>

        <div className="admin-process">

          <div className="admin-process-step">

            <div className="admin-process-number">
              01
            </div>

            <div>
              <h3>
                Identify Document
              </h3>

              <p>
                The verifier provides the unique
                Document ID.
              </p>
            </div>

          </div>

          <div className="admin-process-line" />

          <div className="admin-process-step">

            <div className="admin-process-number">
              02
            </div>

            <div>
              <h3>
                Generate & Compare Hash
              </h3>

              <p>
                SHA-256 creates a cryptographic
                fingerprint of the document.
              </p>
            </div>

          </div>

          <div className="admin-process-line" />

          <div className="admin-process-step">

            <div className="admin-process-number">
              03
            </div>

            <div>
              <h3>
                Confirm Blockchain Record
              </h3>

              <p>
                The blockchain record confirms
                whether the credential is authentic.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* FINAL SECURITY NOTE */}
      <div className="card admin-note">

        <div className="admin-note-icon">
          ⛓
        </div>

        <div>

          <strong>
            Blockchain Security
          </strong>

          <p>
            Veri Chain stores a cryptographic
            fingerprint instead of exposing the
            original document on the blockchain.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Admin;
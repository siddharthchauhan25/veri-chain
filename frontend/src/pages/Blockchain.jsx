import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Blockchain() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const user = JSON.parse(
          localStorage.getItem("verichain_user") || "{}"
        );

        if (!user.id) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/documents/${user.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error(
          "Failed to load blockchain records:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const registeredDocuments = documents.filter(
    (doc) => doc.tx_hash
  );

  return (
    <div className="blockchain-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>Blockchain Records</h1>

          <p>
            View documents registered and secured
            on the blockchain.
          </p>
        </div>
      </div>


      {/* SUMMARY CARDS */}

      <div className="blockchain-summary">

        <div className="blockchain-summary-card">

          <div className="blockchain-summary-icon">
            📄
          </div>

          <div>
            <strong>{documents.length}</strong>
            <span>Total Documents</span>
          </div>

        </div>


        <div className="blockchain-summary-card">

          <div className="blockchain-summary-icon">
            ⛓
          </div>

          <div>
            <strong>
              {registeredDocuments.length}
            </strong>

            <span>Blockchain Records</span>
          </div>

        </div>


        <div className="blockchain-summary-card">

          <div className="blockchain-summary-icon">
            ✓
          </div>

          <div>
            <strong>
              {
                documents.filter(
                  (doc) => doc.status === "VERIFIED"
                ).length
              }
            </strong>

            <span>Verified Documents</span>
          </div>

        </div>

      </div>


      {/* BLOCKCHAIN RECORDS */}

      <div className="card blockchain-records-card">

        <div className="blockchain-records-header">

          <div>
            <h2>Registered Documents</h2>

            <p>
              Immutable records stored on Veri Chain.
            </p>
          </div>

          <span className="network-badge">
            ● Local Blockchain
          </span>

        </div>


        {loading ? (

          <div className="blockchain-empty">
            <div className="blockchain-loading-icon">
              ⛓
            </div>

            <h3>
              Loading blockchain records...
            </h3>
          </div>

        ) : registeredDocuments.length === 0 ? (

          <div className="blockchain-empty">

            <div className="blockchain-empty-icon">
              ⛓
            </div>

            <h3>
              No blockchain records found
            </h3>

            <p>
              Upload a document to create your
              first blockchain record.
            </p>

          </div>

        ) : (

          <div className="blockchain-table-wrapper">

            <table className="blockchain-table">

              <thead>

                <tr>

                  <th>
                    Document
                  </th>

                  <th>
                    Document ID
                  </th>

                  <th>
                    SHA-256 Hash
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Transaction Hash
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {registeredDocuments.map(
                  (doc) => (

                    <tr key={doc.id}>

                      {/* DOCUMENT */}

                      <td>

                        <div className="blockchain-document">

                          <div className="blockchain-file-icon">
                            📄
                          </div>

                          <div>

                            <strong>
                              {doc.filename ||
                                "Document"}
                            </strong>

                            <span>
                              Blockchain secured
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* DOCUMENT ID */}

                      <td>

                        <span className="document-id-text">
                          {doc.document_id}
                        </span>

                      </td>


                      {/* HASH */}

                      <td>

                        <div className="blockchain-hash">

                          {doc.sha256_hash}

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            doc.status ===
                            "VERIFIED"
                              ? "blockchain-status verified"
                              : "blockchain-status pending"
                          }
                        >

                          {doc.status ===
                          "VERIFIED"
                            ? "✓ Verified"
                            : "Pending"}

                        </span>

                      </td>


                      {/* TRANSACTION */}

                      <td>

                        <div className="transaction-hash">

                          {doc.tx_hash}

                        </div>

                      </td>


                      {/* CREATED */}

                      <td>

                        <span className="created-date">

                          {doc.created_at
                            ? new Date(
                                doc.created_at
                              ).toLocaleString()
                            : "N/A"}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <button
                          className="blockchain-view-btn"
                          onClick={() =>
                            navigate(
                              `/documents/${doc.id}`
                            )
                          }
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* SECURITY CARD */}

      <div className="card blockchain-security-card">

        <div className="security-left">

          <div className="security-icon">
            🔐
          </div>

          <div>

            <h2>
              Blockchain Security
            </h2>

            <p>
              Each document is protected using
              SHA-256 hashing and registered on
              the blockchain.
            </p>

          </div>

        </div>

        <div className="security-status">
          ✓ Secured
        </div>

      </div>

    </div>
  );
}

export default Blockchain;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const navigate = useNavigate();

  const [documentId, setDocumentId] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setResult(null);

    const cleanDocumentId = documentId.trim();
    const cleanHash = sha256Hash.trim().toLowerCase();

    if (!cleanDocumentId || !cleanHash) {
      setError(
        "Please enter both Document ID and SHA-256 Hash."
      );
      return;
    }

    if (!/^[a-f0-9]{64}$/i.test(cleanHash)) {
      setError(
        "Invalid SHA-256 hash. It must contain exactly 64 hexadecimal characters."
      );
      return;
    }

    try {
      setLoading(true);

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
        throw new Error(
          data.message || "Verification failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);

      setError(
        err.message ||
          "Unable to connect to Veri Chain backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDocumentId("");
    setSha256Hash("");
    setResult(null);
    setError("");
  };

  const isVerified = result?.verified === true;

  return (
    <div className="verify-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>Verify Document</h1>

          <p>
            Verify the authenticity of a document
            using its blockchain record.
          </p>
        </div>
      </div>


      {/* MAIN VERIFICATION CARD */}

      <div className="card verify-box">

        <div className="verify-header">

          <div className="verify-icon">
            🔍
          </div>

          <div>
            <h2>Document Verification</h2>

            <p>
              Compare the document hash with the
              immutable blockchain record.
            </p>
          </div>

        </div>


        {/* DOCUMENT ID */}

        <div className="verify-field">

          <label>
            Document ID
          </label>

          <input
            className="text-input"
            type="text"
            placeholder="e.g. DOC-123456"
            value={documentId}
            onChange={(e) => {
              setDocumentId(e.target.value);
              setError("");
              setResult(null);
            }}
          />

          <small>
            Enter the unique ID assigned to the document.
          </small>

        </div>


        {/* HASH */}

        <div className="verify-field">

          <label>
            SHA-256 Hash
          </label>

          <input
            className="text-input hash-input"
            type="text"
            placeholder="Enter 64-character SHA-256 hash"
            value={sha256Hash}
            onChange={(e) => {
              setSha256Hash(e.target.value);
              setError("");
              setResult(null);
            }}
          />

          <small>
            The hash is used to detect document tampering.
          </small>

        </div>


        {/* BUTTONS */}

        <div className="verify-actions">

          <button
            className="primary-btn verify-main-btn"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading
              ? "Verifying Blockchain..."
              : "🔗 Verify on Blockchain"}
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/qr-verify")
            }
            disabled={loading}
          >
            📷 Scan QR Code
          </button>

        </div>


        {(documentId || sha256Hash) && !loading && (
          <button
            className="verify-clear-btn"
            onClick={handleClear}
          >
            Clear fields
          </button>
        )}


        {/* ERROR */}

        {error && (
          <div className="verify-error">

            <div className="verify-result-symbol">
              !
            </div>

            <div>
              <strong>
                Verification Error
              </strong>

              <p>
                {error}
              </p>
            </div>

          </div>
        )}


        {/* RESULT */}

        {result && (
          <div
            className={
              isVerified
                ? "verify-result verified-result"
                : "verify-result invalid-result"
            }
          >

            {/* RESULT HEADER */}

            <div className="result-header">

              <div
                className={
                  isVerified
                    ? "result-status-icon verified"
                    : "result-status-icon invalid"
                }
              >
                {isVerified ? "✓" : "!"}
              </div>

              <div>

                <h2>
                  {isVerified
                    ? "Document Verified"
                    : "Document Invalid"}
                </h2>

                <p>
                  {isVerified
                    ? "The document hash matches the blockchain record."
                    : "The document could not be verified against the blockchain record."}
                </p>

              </div>

            </div>


            {/* VERIFICATION STATUS */}

            <div className="verification-status-row">

              <span>
                Verification Status
              </span>

              <strong>
                {result.status ||
                  (isVerified
                    ? "VERIFIED"
                    : "INVALID")}
              </strong>

            </div>


            {/* DOCUMENT DETAILS */}

            {result.document && (
              <div className="verification-details">

                <h3>
                  Document Information
                </h3>

                <div className="verification-detail-grid">

                  <div>
                    <span>
                      Document ID
                    </span>

                    <strong>
                      {result.document.document_id ||
                        "N/A"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Filename
                    </span>

                    <strong>
                      {result.document.filename ||
                        "N/A"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Blockchain Status
                    </span>

                    <strong>
                      {result.document.tx_hash
                        ? "Registered"
                        : "Not Registered"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Network
                    </span>

                    <strong>
                      Veri Chain Local Network
                    </strong>
                  </div>

                </div>


                {/* TRANSACTION HASH */}

                {result.document.tx_hash && (
                  <div className="verification-tx">

                    <span>
                      Blockchain Transaction
                    </span>

                    <div>
                      {result.document.tx_hash}
                    </div>

                  </div>
                )}

              </div>
            )}


            {/* MESSAGE */}

            {result.message && (
              <div className="verification-message">
                {result.message}
              </div>
            )}

          </div>
        )}

      </div>


      {/* HOW IT WORKS */}

      <div className="card verification-info">

        <h2>
          How Veri Chain Verification Works
        </h2>

        <div className="verification-steps">

          <div className="verification-step">

            <div>
              1
            </div>

            <section>
              <strong>
                Document ID
              </strong>

              <p>
                Identifies the document stored in
                Veri Chain.
              </p>
            </section>

          </div>


          <div className="verification-step">

            <div>
              2
            </div>

            <section>
              <strong>
                SHA-256 Hash
              </strong>

              <p>
                Creates a unique digital fingerprint
                of the document.
              </p>
            </section>

          </div>


          <div className="verification-step">

            <div>
              3
            </div>

            <section>
              <strong>
                Blockchain Match
              </strong>

              <p>
                Veri Chain compares the hash with
                the registered blockchain record.
              </p>
            </section>

          </div>


          <div className="verification-step">

            <div>
              4
            </div>

            <section>
              <strong>
                Verification Result
              </strong>

              <p>
                A matching hash confirms document
                authenticity.
              </p>
            </section>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Verify;
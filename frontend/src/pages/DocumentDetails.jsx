import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const user = JSON.parse(
          localStorage.getItem("verichain_user") || "{}"
        );

        const userId = user.id || 1;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/documents/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setDocument(null);
          return;
        }

        const allDocuments = data.documents || [];

        const selectedDocument = allDocuments.find(
          (doc) => String(doc.id) === String(id)
        );

        setDocument(selectedDocument || null);
      } catch (error) {
        console.error("Document details error:", error);
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const handleVerifyAgain = async () => {
    if (!document) return;

    setVerifying(true);
    setVerifyMessage("");
    setVerifySuccess(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: document.document_id,
            sha256Hash: document.sha256_hash,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.verified) {
        setVerifySuccess(true);

        setVerifyMessage(
          "The document hash matches the blockchain record."
        );

        setDocument((prev) => ({
          ...prev,
          status: "VERIFIED",
        }));
      } else {
        setVerifySuccess(false);

        setVerifyMessage(
          data.message || "Document verification failed."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);

      setVerifySuccess(false);

      setVerifyMessage(
        "Unable to connect to Veri Chain backend."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        Loading document details...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="card empty-details">
        <h2>Document Not Found</h2>

        <p>
          The requested document could not be found.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/documents")}
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const isVerified =
    document.status === "VERIFIED";

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>
          <h1>Document Details</h1>

          <p>
            View blockchain verification details
            of your document.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => navigate("/documents")}
        >
          ← Back
        </button>

      </div>


      {/* MAIN DOCUMENT CARD */}

      <div className="card document-detail-main">

        <div className="document-detail-icon">
          📄
        </div>

        <div className="document-detail-title">

          <h2>
            {document.filename || "Document"}
          </h2>

          <p>
            Document ID:{" "}
            <strong>
              {document.document_id || "N/A"}
            </strong>
          </p>

        </div>

        <div
          className={
            isVerified
              ? "detail-status verified"
              : "detail-status pending"
          }
        >
          {isVerified
            ? "✓ Verified"
            : "Pending"}
        </div>

      </div>


      {/* DOCUMENT INFORMATION */}

      <div className="card detail-section">

        <h2>Document Information</h2>

        <div className="detail-grid">

          <div className="detail-item">

            <span>Document ID</span>

            <strong>
              {document.document_id || "N/A"}
            </strong>

          </div>


          <div className="detail-item">

            <span>File Name</span>

            <strong>
              {document.filename || "N/A"}
            </strong>

          </div>


          <div className="detail-item">

            <span>Status</span>

            <strong
              className={
                isVerified
                  ? "green-text"
                  : "orange-text"
              }
            >
              {document.status || "PENDING"}
            </strong>

          </div>


          <div className="detail-item">

            <span>Uploaded At</span>

            <strong>
              {document.created_at
                ? new Date(
                    document.created_at
                  ).toLocaleString()
                : "N/A"}
            </strong>

          </div>

        </div>

      </div>


      {/* SHA-256 HASH */}

      <div className="card detail-section">

        <h2>🔐 Document Hash</h2>

        <p className="detail-label">
          SHA-256 Hash
        </p>

        <div className="hash-box">

          {document.sha256_hash ||
            "Hash not available"}

        </div>

      </div>


      {/* BLOCKCHAIN RECORD */}

      <div className="card detail-section">

        <h2>⛓ Blockchain Record</h2>

        <div className="detail-grid">

          <div className="detail-item">

            <span>Blockchain Status</span>

            <strong className="green-text">

              {document.tx_hash
                ? "✓ Registered"
                : "Not Registered"}

            </strong>

          </div>


          <div className="detail-item">

            <span>Network</span>

            <strong>
              Veri Chain Local Network
            </strong>

          </div>


          <div className="detail-item detail-full">

            <span>
              Transaction Hash
            </span>

            <div className="hash-box">

              {document.tx_hash ||
                "Not available"}

            </div>

          </div>


          <div className="detail-item detail-full">

            <span>
              Contract Address
            </span>

            <div className="hash-box">

              {document.contract_address ||
                "0x5FbDB2315678afecb367f032d93F642f64180aa3"}

            </div>

          </div>

        </div>

      </div>


      {/* LIVE BLOCKCHAIN VERIFICATION */}

      <div className="card live-verification-card">

        <div className="live-verification-header">

          <div>

            <h2>
              🔍 Live Blockchain Verification
            </h2>

            <p>
              Verify this document again against
              the blockchain record.
            </p>

          </div>

          <button
            className="verify-again-btn"
            onClick={handleVerifyAgain}
            disabled={verifying}
          >
            {verifying
              ? "Verifying..."
              : "Verify Again on Blockchain"}
          </button>

        </div>


        {/* VERIFICATION RESULT */}

        {verifyMessage && (

          <div
            className={
              verifySuccess
                ? "verify-result success"
                : "verify-result error"
            }
          >

            <div className="verify-result-icon">
              {verifySuccess ? "✓" : "!"}
            </div>

            <div>

              <strong>
                {verifySuccess
                  ? "Blockchain Verification Successful"
                  : "Verification Failed"}
              </strong>

              <p>
                {verifyMessage}
              </p>

            </div>

          </div>

        )}

      </div>


      {/* CURRENT VERIFICATION STATUS */}

      <div
        className={
          isVerified
            ? "card verification-success"
            : "card verification-pending"
        }
      >

        <div className="verification-icon">
          {isVerified ? "✓" : "!"}
        </div>

        <div>

          <h2>
            {isVerified
              ? "Document Verified"
              : "Verification Pending"}
          </h2>

          <p>
            {isVerified
              ? "The document hash matches the blockchain record."
              : "This document has not been verified yet."}
          </p>

        </div>

      </div>

    </div>
  );
}

export default DocumentDetails;
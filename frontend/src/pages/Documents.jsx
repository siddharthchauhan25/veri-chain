import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";

function Documents() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrDocument, setQrDocument] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("verichain_user") || "{}"
  );

  const loadDocuments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${user.id || 1}`
      );

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a document first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("document", file);
      formData.append("user_id", user.id || 1);

      const response = await fetch(
        "http://localhost:5000/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        setUploading(false);
        return;
      }

      setMessage("Document uploaded successfully.");

      setFile(null);

      const input = document.getElementById("documentInput");
      if (input) {
        input.value = "";
      }

      loadDocuments();

    } catch (error) {
      setMessage(
        "Unable to connect to Veri Chain backend."
      );
    }

    setUploading(false);
  };

  return (
    <div className="documents-page">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>My Documents</h1>

          <p>
            Securely store and verify your digital documents.
          </p>
        </div>
      </div>


      {/* UPLOAD CARD */}

      <div className="upload-card">

        <h2>Upload Document</h2>

        <p>
          Your document will be hashed using SHA-256
          for tamper detection.
        </p>

        <form onSubmit={handleUpload}>

          <div className="upload-box">

            <div className="upload-icon">
              ↑
            </div>

            <h3>
              {file
                ? file.name
                : "Choose a document"}
            </h3>

            <p>
              PDF, JPG, PNG or other supported files
            </p>

            <input
              id="documentInput"
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

          </div>

          <button
            type="submit"
            className="upload-btn"
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>

        </form>

        {message && (
          <div className="upload-message">
            {message}
          </div>
        )}

      </div>


      {/* DOCUMENTS LIST */}

      <div className="documents-card">

        <div className="documents-title">

          <h2>Recent Documents</h2>

          <span>
            {documents.length} documents
          </span>

        </div>


        {documents.length === 0 ? (

          <div className="empty-documents">

            <div>📄</div>

            <h3>No documents yet</h3>

            <p>
              Upload your first document to start
              using Veri Chain.
            </p>

          </div>

        ) : (

          <div className="document-list">

            {documents.map((doc) => (

              <div
                className="document-row"
                key={doc.id}
              >

                <div className="document-icon">
                  📄
                </div>

                <div className="document-info">

                  <h3>
                    {doc.filename}
                  </h3>

                  <p>
                    ID: {doc.document_id}
                  </p>

                  <small>
                    SHA-256: {doc.sha256_hash}
                  </small>

                </div>

                <div className="document-status">
                  {doc.status || "PENDING"}
                </div>


                {/* VIEW DETAILS */}

                <button
                  className="view-details-btn"
                  onClick={() =>
                    navigate(
                      `/documents/${doc.id}`
                    )
                  }
                >
                  View Details
                </button>


                {/* GENERATE QR */}

                <button
                  className="qr-btn"
                  onClick={() =>
                    setQrDocument(doc)
                  }
                >
                  Generate QR
                </button>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* QR MODAL */}

      {qrDocument && (

        <div className="qr-modal">

          <div className="qr-modal-content">

            {/* CLOSE BUTTON */}

            <button
              className="qr-close"
              onClick={() =>
                setQrDocument(null)
              }
            >
              ×
            </button>


            <h2>
              Document QR Code
            </h2>

            <p>
              Scan this QR code to verify the
              document on blockchain.
            </p>


            {/* QR CODE */}

            <div className="qr-container">

              <QRCodeCanvas
                value={JSON.stringify({
                  documentId:
                    qrDocument.document_id,

                  sha256Hash:
                    qrDocument.sha256_hash,
                })}
                size={220}
                level="H"
              />

            </div>


            {/* DOCUMENT DETAILS */}

            <h3>
              {qrDocument.filename}
            </h3>

            <p>
              ID: {qrDocument.document_id}
            </p>


            <button
              className="qr-close-btn"
              onClick={() =>
                setQrDocument(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Documents;
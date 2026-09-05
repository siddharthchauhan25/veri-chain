import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function QRVerify() {
  const scannerRef = useRef(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleQRResult(decodedText);

        scanner.clear().catch(() => {});
      },
      () => {
        // Ignore normal scanning errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleQRResult = async (decodedText) => {
    try {
      setError("");
      setResult(null);
      setVerifying(true);

      let qrData;

      try {
        qrData = JSON.parse(decodedText);
      } catch {
        throw new Error("Invalid Veri Chain QR code.");
      }

      if (!qrData.documentId || !qrData.sha256Hash) {
        throw new Error(
          "QR code does not contain valid document information."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: qrData.documentId,
            sha256Hash: qrData.sha256Hash,
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
      console.error(err);
      setError(
        err.message || "Unable to verify QR code."
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>QR Verification</h1>

          <p>
            Scan a Veri Chain QR code to verify a
            document on the blockchain.
          </p>
        </div>
      </div>


      <div className="card">

        <h2>Scan QR Code</h2>

        <p>
          Point your camera at the document's
          Veri Chain QR code.
        </p>


        <div
          id="qr-reader"
          style={{
            maxWidth: "500px",
            marginTop: "25px",
          }}
        />


        {verifying && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: "8px",
            }}
          >
            Verifying document on blockchain...
          </div>
        )}


        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#fff1f0",
              border: "1px solid #ffccc7",
              borderRadius: "8px",
              color: "#cf1322",
            }}
          >
            ❌ {error}
          </div>
        )}


        {result && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "10px",
              border: result.verified
                ? "1px solid #52c41a"
                : "1px solid #ff4d4f",
              background: result.verified
                ? "#f6ffed"
                : "#fff1f0",
            }}
          >

            <h2
              style={{
                marginTop: 0,
                color: result.verified
                  ? "#389e0d"
                  : "#cf1322",
              }}
            >
              {result.verified
                ? "✅ DOCUMENT VERIFIED"
                : "❌ INVALID DOCUMENT"}
            </h2>


            <p>
              <strong>Status:</strong>{" "}
              {result.status}
            </p>


            <p>
              {result.message}
            </p>


            {result.document && (
              <div style={{ marginTop: "15px" }}>

                <p>
                  <strong>Document ID:</strong>{" "}
                  {result.document.document_id}
                </p>

                <p>
                  <strong>Filename:</strong>{" "}
                  {result.document.filename}
                </p>

                <p
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Blockchain TX:</strong>{" "}
                  {result.document.tx_hash || "N/A"}
                </p>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default QRVerify;
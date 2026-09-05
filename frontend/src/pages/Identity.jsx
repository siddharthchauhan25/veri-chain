import { useEffect, useState } from "react";

function Identity() {
  const [user, setUser] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("verichain_user") || "{}"
    );

    setUser(savedUser);
  }, []);

  const identityId = user.id || "8f92a1";

  const did = `did:verichain:user:${identityId}`;

  const copyDID = async () => {
    try {
      await navigator.clipboard.writeText(did);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("DID copy failed:", error);
    }
  };

  return (
    <div className="identity-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <p className="identity-eyebrow">
            DIGITAL IDENTITY
          </p>

          <h1>My Identity</h1>

          <p>
            Your decentralized identity on the Veri Chain network.
          </p>
        </div>
      </div>


      {/* IDENTITY HERO */}

      <div className="card identity-hero">

        <div className="identity-hero-left">

          <div className="identity-logo-large">
            V
          </div>

          <div className="identity-hero-content">

            <div className="identity-title-row">

              <h2>
                {user.name || "Veri Chain User"}
              </h2>

              <span className="identity-verified-badge">
                ✓ Verified
              </span>

            </div>

            <p className="identity-type">
              Decentralized Digital Identity
            </p>

            <div className="did-display">

              <span>
                {did}
              </span>

              <button
                onClick={copyDID}
                className="copy-did-btn"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>

            </div>

          </div>

        </div>


        <div className="identity-status-box">

          <div className="identity-status-icon">
            ✓
          </div>

          <div>
            <strong>
              Identity Verified
            </strong>

            <span>
              Blockchain secured
            </span>
          </div>

        </div>

      </div>


      {/* IDENTITY INFORMATION */}

      <div className="card identity-section">

        <div className="identity-section-heading">

          <div>
            <h2>
              Identity Information
            </h2>

            <p>
              Core information associated with your decentralized identity.
            </p>
          </div>

        </div>


        <div className="identity-info-grid">

          <div className="identity-info-item">

            <span>
              Identity Type
            </span>

            <strong>
              Decentralized Identity
            </strong>

          </div>


          <div className="identity-info-item">

            <span>
              Identity Network
            </span>

            <strong>
              Veri Chain Local Network
            </strong>

          </div>


          <div className="identity-info-item">

            <span>
              Identity ID
            </span>

            <strong>
              {identityId}
            </strong>

          </div>


          <div className="identity-info-item">

            <span>
              Verification Status
            </span>

            <strong className="identity-green">
              ✓ Verified
            </strong>

          </div>

        </div>

      </div>


      {/* SECURITY + DID */}

      <div className="identity-two-column">

        <div className="card identity-security-card-new">

          <div className="identity-card-icon">
            🔐
          </div>

          <div>

            <h2>
              Blockchain Secured
            </h2>

            <p>
              Your identity uses Veri Chain's blockchain
              infrastructure to provide tamper-resistant
              verification.
            </p>

          </div>

          <div className="security-status-row">

            <span>
              Security Status
            </span>

            <strong>
              ● Active
            </strong>

          </div>

        </div>


        <div className="card identity-did-card">

          <div className="identity-card-icon">
            🪪
          </div>

          <div>

            <h2>
              Decentralized Identifier
            </h2>

            <p>
              Your DID uniquely represents your digital
              identity within Veri Chain.
            </p>

          </div>

          <div className="mini-did">
            {did}
          </div>

        </div>

      </div>


      {/* CREDENTIALS */}

      <div className="card identity-credentials-card">

        <div className="identity-section-heading">

          <div>

            <h2>
              Digital Credentials
            </h2>

            <p>
              Verified credentials associated with your identity.
            </p>

          </div>

          <span className="credential-count">
            0 Credentials
          </span>

        </div>


        <div className="credentials-empty">

          <div className="credentials-icon">
            📜
          </div>

          <div>

            <h3>
              No credentials issued yet
            </h3>

            <p>
              Verified documents and credentials can appear
              here as your digital identity grows.
            </p>

          </div>

        </div>

      </div>


      {/* HOW IT WORKS */}

      <div className="card identity-how-card">

        <div className="identity-section-heading">

          <div>

            <h2>
              How Your Digital Identity Works
            </h2>

            <p>
              Veri Chain connects your identity with verifiable blockchain records.
            </p>

          </div>

        </div>


        <div className="identity-steps">

          <div className="identity-step">

            <div className="identity-step-number">
              01
            </div>

            <div>
              <h3>
                Identity Created
              </h3>

              <p>
                A unique decentralized identifier is created
                for your Veri Chain account.
              </p>
            </div>

          </div>


          <div className="identity-step">

            <div className="identity-step-number">
              02
            </div>

            <div>
              <h3>
                Documents Linked
              </h3>

              <p>
                Your documents can be securely associated
                with your digital identity.
              </p>
            </div>

          </div>


          <div className="identity-step">

            <div className="identity-step-number">
              03
            </div>

            <div>
              <h3>
                Blockchain Verification
              </h3>

              <p>
                Document hashes can be verified against
                blockchain records without exposing the original file.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Identity;
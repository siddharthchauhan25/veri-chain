import { useEffect, useRef, useState } from "react";

function Profile() {
  const [user, setUser] = useState({});
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("verichain_user") || "{}"
    );

    setUser(savedUser);

    const loadDocuments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/documents/${savedUser.id || 1}`
        );

        const data = await response.json();

        if (response.ok) {
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error("Profile data error:", error);
      }
    };

    loadDocuments();
  }, []);

  // ===============================
  // OPEN PHOTO PICKER
  // ===============================

  const openPhotoPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ===============================
  // PHOTO CHANGE
  // ===============================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check image
    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Maximum 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Image size should be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const photo = reader.result;

      const updatedUser = {
        ...user,
        profilePhoto: photo,
      };

      // Save photo
      localStorage.setItem(
        "verichain_user",
        JSON.stringify(updatedUser)
      );

      // Update UI immediately
      setUser(updatedUser);

      setMessageType("success");
      setMessage("Profile photo updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    };

    reader.onerror = () => {
      setMessageType("error");
      setMessage("Failed to read the selected image.");
    };

    reader.readAsDataURL(file);

    // Allow same image to be selected again
    e.target.value = "";
  };

  // ===============================
  // REMOVE PHOTO
  // ===============================

  const removePhoto = () => {
    const updatedUser = {
      ...user,
    };

    delete updatedUser.profilePhoto;

    localStorage.setItem(
      "verichain_user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    setMessageType("success");
    setMessage("Profile photo removed.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // ===============================
  // DOCUMENT STATS
  // ===============================

  const totalDocuments = documents.length;

  const verifiedDocuments = documents.filter(
    (doc) => doc.status === "VERIFIED"
  ).length;

  const blockchainRecords = documents.filter(
    (doc) => doc.tx_hash
  ).length;

  // ===============================
  // MEMBER SINCE
  // ===============================

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A";

  // ===============================
  // USER INITIAL
  // ===============================

  const userInitial = (user.name || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="profile-container">

      {/* ===============================
          PAGE HEADER
      =============================== */}

      <div className="page-header">
        <div>
          <h1>Profile</h1>

          <p>
            Manage and view your Veri Chain identity.
          </p>
        </div>
      </div>


      {/* ===============================
          PROFILE CARD
      =============================== */}

      <div className="profile-page-card">

        <div className="profile-main">

          {/* ===============================
              PROFILE PHOTO
          =============================== */}

          <div className="profile-photo-wrapper">

            <div
              className="profile-avatar-large profile-photo"
              onClick={openPhotoPicker}
              role="button"
              tabIndex={0}
              title="Change profile photo"
            >

              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="profile-photo-image"
                />
              ) : (
                <span className="profile-initial">
                  {userInitial}
                </span>
              )}

              <span className="photo-overlay">
                📷
              </span>

            </div>


            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />


            {/* PHOTO BUTTONS */}

            <div className="profile-photo-actions">

              <button
                type="button"
                className="photo-change-btn"
                onClick={openPhotoPicker}
              >
                Change Photo
              </button>

              {user.profilePhoto && (
                <button
                  type="button"
                  className="photo-remove-btn"
                  onClick={removePhoto}
                >
                  Remove
                </button>
              )}

            </div>

          </div>


          {/* ===============================
              USER INFORMATION
          =============================== */}

          <div className="profile-user-details">

            <h2>
              {user.name || "User"}
            </h2>

            <p>
              {user.email || "No email available"}
            </p>

            <span className="profile-status">
              ✓ Verified User
            </span>

          </div>

        </div>


        {/* ===============================
            PHOTO MESSAGE
        =============================== */}

        {message && (
          <div
            className={`profile-photo-message ${
              messageType === "error"
                ? "profile-message-error"
                : "profile-message-success"
            }`}
          >
            {messageType === "error" ? "⚠" : "✓"} {message}
          </div>
        )}


        <div className="profile-divider"></div>


        {/* ===============================
            PROFILE INFORMATION
        =============================== */}

        <div className="profile-info-grid">

          <div className="profile-info-item">
            <span>Name</span>

            <strong>
              {user.name || "N/A"}
            </strong>
          </div>


          <div className="profile-info-item">
            <span>Email</span>

            <strong>
              {user.email || "N/A"}
            </strong>
          </div>


          <div className="profile-info-item">
            <span>Account ID</span>

            <strong>
              {user.id || "N/A"}
            </strong>
          </div>


          <div className="profile-info-item">
            <span>Member Since</span>

            <strong>
              {memberSince}
            </strong>
          </div>

        </div>

      </div>


      {/* ===============================
          PROFILE STATS
      =============================== */}

      <div className="profile-stats">

        {/* TOTAL DOCUMENTS */}

        <div className="profile-stat-card">

          <span className="profile-stat-icon">
            📄
          </span>

          <div>
            <strong>
              {totalDocuments}
            </strong>

            <p>
              Total Documents
            </p>
          </div>

        </div>


        {/* VERIFIED DOCUMENTS */}

        <div className="profile-stat-card">

          <span className="profile-stat-icon">
            ✓
          </span>

          <div>
            <strong>
              {verifiedDocuments}
            </strong>

            <p>
              Verified Documents
            </p>
          </div>

        </div>


        {/* BLOCKCHAIN RECORDS */}

        <div className="profile-stat-card">

          <span className="profile-stat-icon">
            ⛓
          </span>

          <div>
            <strong>
              {blockchainRecords}
            </strong>

            <p>
              Blockchain Records
            </p>
          </div>

        </div>

      </div>


      {/* ===============================
          BLOCKCHAIN SECURITY
      =============================== */}

      <div className="card profile-security">

        <div>
          <h2>
            Blockchain Security
          </h2>

          <p>
            Your documents are protected using
            SHA-256 hashing and blockchain
            verification.
          </p>
        </div>

        <div className="security-badge">
          ✓ Blockchain Secured
        </div>

      </div>


      {/* ===============================
          PROFILE PHOTO INFORMATION
      =============================== */}

      <div className="profile-photo-info">

        <span>
          📷
        </span>

        <div>
          <strong>
            Profile Photo
          </strong>

          <p>
            JPG, PNG or WebP • Maximum 2 MB
          </p>
        </div>

      </div>

    </div>
  );
}

export default Profile;
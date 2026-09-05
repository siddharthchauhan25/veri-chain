import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  // Load current user
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("verichain_user") || "{}"
      );

      setUser(savedUser);
    } catch (error) {
      console.error("User session error:", error);
      setUser({});
    }
  }, [location.pathname]);

  // Page names for breadcrumb
  const pageNames = {
    "/": "Dashboard",
    "/identity": "My Identity",
    "/documents": "My Documents",
    "/verify": "Verify Document",
    "/qr-verify": "QR Verification",
    "/blockchain": "Blockchain Records",
    "/activity": "Activity History",
    "/profile": "Profile",
    "/settings": "Settings",
    "/notifications": "Notifications",
    "/admin": "Admin Panel",
  };

  const currentPage =
    pageNames[location.pathname] || "Dashboard";

  const loadUnreadNotifications = async () => {
    try {
      if (!user.id) return;

      const response = await fetch(
        `http://localhost:5000/api/notifications/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        const unread = (
          data.notifications || []
        ).filter(
          (notification) =>
            notification.is_read === 0
        );

        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error(
        "Notification count error:",
        error
      );
    }
  };

  useEffect(() => {
    loadUnreadNotifications();

    const interval = setInterval(
      loadUnreadNotifications,
      5000
    );

    return () => clearInterval(interval);
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem("verichain_user");

    setUser({});
    setMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const userName = user.name || "User";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  const userRole = String(
    user.role || "USER"
  ).toUpperCase();

  return (
    <header className="navbar">

      {/* BREADCRUMB */}

      <div>
        <span className="breadcrumb">
          Veri Chain /
        </span>

        <strong>{currentPage}</strong>
      </div>


      <div className="navbar-right">

        {/* NOTIFICATION BELL */}

        <button
          className="notification"
          onClick={() =>
            navigate("/notifications")
          }
          title="Notifications"
        >
          🔔

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>


        {/* PROFILE */}

        <div
          style={{
            position: "relative",
          }}
        >

          <div
            className="profile"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            style={{
              cursor: "pointer",
            }}
            title="Account Menu"
          >

            <div className="avatar">
              {userInitial}
            </div>

            <div>
              <strong>{userName}</strong>

              <span>
                {userRole === "ADMIN"
                  ? "Administrator"
                  : userRole === "VERIFIER"
                  ? "Verifier"
                  : "Verified User"}
              </span>
            </div>

          </div>


          {/* DROPDOWN */}

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "58px",
                width: "210px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.12)",
                padding: "8px",
                zIndex: 9999,
              }}
            >

              {/* USER INFO */}

              <div
                style={{
                  padding: "10px 12px",
                  borderBottom:
                    "1px solid #eeeeee",
                  marginBottom: "5px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                  }}
                >
                  {userName}
                </strong>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#777",
                    marginTop: "3px",
                  }}
                >
                  {user.email || ""}
                </span>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "3px 7px",
                    borderRadius: "5px",
                    background:
                      userRole === "ADMIN"
                        ? "#fff0e6"
                        : "#f3f4f6",
                    color:
                      userRole === "ADMIN"
                        ? "#ff6b00"
                        : "#555",
                  }}
                >
                  {userRole}
                </span>
              </div>


              {/* PROFILE */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "#f7f7f7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "transparent")
                }
              >
                👤 Profile
              </button>


              {/* SETTINGS */}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "#f7f7f7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "transparent")
                }
              >
                ⚙️ Settings
              </button>


              {/* ADMIN PANEL */}

              {(userRole === "ADMIN" ||
                userRole === "VERIFIER") && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "7px",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "#f7f7f7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "transparent")
                  }
                >
                  🛡️ Admin Panel
                </button>
              )}


              {/* LOGOUT */}

              <div
                style={{
                  borderTop:
                    "1px solid #eeeeee",
                  marginTop: "5px",
                  paddingTop: "5px",
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    color: "#dc2626",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "7px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "transparent")
                  }
                >
                  🚪 Logout
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;
import { NavLink } from "react-router-dom";

function Sidebar() {
  let role = "USER";

  try {
    const data = localStorage.getItem("verichain_user");

    if (data) {
      const user = JSON.parse(data);
      role = String(user.role || "USER").toUpperCase();
    }
  } catch (error) {
    console.error("Session error:", error);
  }

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "My Identity", path: "/identity" },
    { name: "My Documents", path: "/documents" },
    { name: "Verify Document", path: "/verify" },
    { name: "Blockchain Records", path: "/blockchain" },
    { name: "Activity History", path: "/activity" },
    { name: "Profile", path: "/profile" },
    { name: "Settings", path: "/settings" },
  ];

  if (role === "ADMIN" || role === "VERIFIER") {
    menu.push({
      name: "Admin Panel",
      path: "/admin",
    });
  }

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-logo">V</div>

        <div>
          <h2>Veri Chain</h2>
          <span>Trust. Verify. Secure.</span>
        </div>
      </div>

      <nav className="sidebar-menu">

        <p className="menu-title">PLATFORM</p>

        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {item.name}
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-bottom">
        <div className="security-box">
          <div className="shield">✓</div>

          <div>
            <strong>Blockchain Secured</strong>
            <p>Your records are protected</p>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
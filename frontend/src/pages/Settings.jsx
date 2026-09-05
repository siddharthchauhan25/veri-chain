import { useEffect, useState } from "react";

function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("verichain_user") || "{}"
    );

    setName(user.name || "");
    setEmail(user.email || "");
  }, []);

  const handleSave = () => {
    const user = JSON.parse(
      localStorage.getItem("verichain_user") || "{}"
    );

    const updatedUser = {
      ...user,
      name,
      email,
    };

    localStorage.setItem(
      "verichain_user",
      JSON.stringify(updatedUser)
    );

    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your Veri Chain account.</p>
        </div>
      </div>

      <div className="card settings-card">

        <label>Name</label>

        <input
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <label>Email</label>

        <input
          className="text-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
        />

        <button
          className="primary-btn"
          onClick={handleSave}
        >
          Save Changes
        </button>

        {message && (
          <p
            style={{
              marginTop: "12px",
              color: "#16a34a",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            ✓ {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default Settings;
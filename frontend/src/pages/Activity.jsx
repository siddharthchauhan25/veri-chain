import { useEffect, useState } from "react";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("verichain_user")
      );

      if (!user) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/activity/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load activity"
        );
      }

      setActivities(data.activities || []);

    } catch (error) {
      console.error("Activity loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (result) => {
    switch (result) {
      case "DOCUMENT UPLOADED":
        return "📄";

      case "BLOCKCHAIN REGISTERED":
        return "🔗";

      case "VERIFIED":
        return "✅";

      case "INVALID":
        return "❌";

      default:
        return "•";
    }
  };

  const getColor = (result) => {
    switch (result) {
      case "VERIFIED":
        return "#237804";

      case "INVALID":
        return "#cf1322";

      case "BLOCKCHAIN REGISTERED":
        return "#0958d9";

      default:
        return "#333";
    }
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Activity History</h1>

          <p>
            Track document uploads, blockchain registrations
            and verification activities.
          </p>
        </div>
      </div>


      <div className="card">

        <h2>Recent Activity</h2>

        <p>
          Complete history of your Veri Chain activities.
        </p>


        {loading ? (

          <p style={{ marginTop: "25px" }}>
            Loading activity...
          </p>

        ) : activities.length === 0 ? (

          <div
            style={{
              textAlign: "center",
              padding: "40px 10px"
            }}
          >
            <h3>No activity yet</h3>

            <p>
              Your document activity will appear here.
            </p>
          </div>

        ) : (

          <div
            style={{
              marginTop: "30px",
              position: "relative"
            }}
          >

            {activities.map((activity, index) => (

              <div
                key={activity.id}
                style={{
                  display: "flex",
                  gap: "18px",
                  position: "relative",
                  paddingBottom: "28px"
                }}
              >

                {index !== activities.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "17px",
                      top: "38px",
                      bottom: "0",
                      width: "2px",
                      background: "#ddd"
                    }}
                  />
                )}


                <div
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1
                  }}
                >
                  {getIcon(activity.result)}
                </div>


                <div
                  style={{
                    flex: 1
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 6px",
                      color: getColor(activity.result),
                      fontSize: "16px"
                    }}
                  >
                    {activity.result}
                  </h3>


                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    {activity.filename || "Document"}
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px",
                      color: "#777"
                    }}
                  >
                    Document ID:{" "}
                    {activity.document_id}
                  </p>


                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#999"
                    }}
                  >
                    {activity.created_at
                      ? new Date(
                          activity.created_at
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Activity;
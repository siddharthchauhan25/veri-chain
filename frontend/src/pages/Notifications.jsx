import { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("verichain_user") || "{}"
  );

  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${user.id || 1}`
      );

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PUT",
        }
      );

      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/notifications/user/${user.id || 1}/read-all`,
        {
          method: "PUT",
        }
      );

      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="notifications-page">

      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated with your Veri Chain activity.
          </p>
        </div>

        {notifications.some((n) => n.is_read === 0) && (
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-card">

        {loading ? (
          <div className="notification-empty">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="notification-empty-icon">
              🔔
            </div>

            <h3>No notifications</h3>

            <p>
              You're all caught up.
            </p>
          </div>
        ) : (
          <div className="notification-list">

            {notifications.map((notification) => (

              <div
                key={notification.id}
                className={`notification-item ${
                  notification.is_read === 0
                    ? "unread"
                    : ""
                }`}
                onClick={() =>
                  notification.is_read === 0 &&
                  markAsRead(notification.id)
                }
              >

                <div className="notification-icon">
                  {notification.type === "success"
                    ? "✓"
                    : notification.type === "warning"
                    ? "!"
                    : "🔔"}
                </div>

                <div className="notification-content">

                  <h3>
                    {notification.title}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </small>

                </div>

                {notification.is_read === 0 && (
                  <span className="unread-dot"></span>
                )}

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Notifications;
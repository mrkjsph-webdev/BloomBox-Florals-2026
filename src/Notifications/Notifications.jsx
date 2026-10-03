import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./notifications.css";

const GET_NOTIFICATIONS_URL =
  "http://localhost/bbf_clientdb/get_notifications.php";

const MARK_NOTIFICATION_READ_URL =
  "http://localhost/bbf_clientdb/mark_notification_read.php";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [client, setClient] = useState(null);

  /*
   * Check the logged-in client.
   */
  useEffect(() => {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      navigate("/login");
      return;
    }

    try {
      const parsedClient = JSON.parse(storedClient);

      if (!parsedClient?.client_id) {
        localStorage.removeItem("client");
        navigate("/login");
        return;
      }

      setClient(parsedClient);
    } catch (error) {
      console.error("Invalid client session:", error);

      localStorage.removeItem("client");

      navigate("/login");
    }
  }, [navigate]);

  /*
   * Load notifications belonging to the
   * currently logged-in client.
   */
  useEffect(() => {
    if (!client?.client_id) {
      return;
    }

    const loadNotifications = async () => {
      try {
        const response = await fetch(GET_NOTIFICATIONS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Number(client.client_id),
          }),
          cache: "no-store",
        });

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error("Invalid notifications response:", responseText);

          return;
        }

        if (!response.ok || !data.success) {
          console.error(data.message || "Failed to load notifications.");

          return;
        }

        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : [],
        );
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    /*
     * Load notifications immediately.
     */
    loadNotifications();

    /*
     * Check for new notifications every 5 seconds.
     */
    const notificationInterval = setInterval(loadNotifications, 5000);

    /*
     * Allow other components to request
     * a notification refresh.
     */
    window.addEventListener("notificationsUpdated", loadNotifications);

    return () => {
      clearInterval(notificationInterval);

      window.removeEventListener("notificationsUpdated", loadNotifications);
    };
  }, [client]);

  /*
   * Mark one notification as seen.
   */
  const markAsRead = async (id) => {
    if (!client?.client_id) {
      return;
    }

    try {
      const response = await fetch(MARK_NOTIFICATION_READ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number(client.client_id),
          notification_id: Number(id),
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid mark notification response:", responseText);

        return;
      }

      if (!response.ok || !data.success) {
        console.error(data.message || "Failed to mark notification as read.");

        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                type: "seen",
              }
            : notification,
        ),
      );

      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /*
   * Mark every notification as seen.
   */
  const markAllAsRead = async () => {
    if (!client?.client_id) {
      return;
    }

    try {
      const response = await fetch(MARK_NOTIFICATION_READ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number(client.client_id),
          mark_all: true,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid mark all notifications response:", responseText);

        return;
      }

      if (!response.ok || !data.success) {
        console.error(data.message || "Failed to mark notifications as read.");

        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          type: "seen",
        })),
      );

      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const unreadNotifications = notifications.filter(
    (notification) => notification.type === "unread",
  );

  const seenNotifications = notifications.filter(
    (notification) => notification.type === "seen",
  );

  return (
    <main className="notifications-page">
      <section className="notifications-main">
        <div className="container">
          <div className="notifications-heading">
            <div>
              <h1>Notifications</h1>

              <div className="notifications-breadcrumb">
                <Link to="/home">Home</Link>

                <span>/</span>

                <span>Notifications</span>
              </div>
            </div>

            {unreadNotifications.length > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* UNREAD NOTIFICATIONS */}
          <section className="notification-section">
            <div className="notification-section-title">
              <span className="unread-dot"></span>

              <h2>Unread</h2>

              <span className="notification-count">
                {unreadNotifications.length}
              </span>
            </div>

            <p className="notification-subtitle">
              Notifications that you have not read yet.
            </p>

            {unreadNotifications.length === 0 ? (
              <div className="notification-empty">No unread notifications.</div>
            ) : (
              <div className="notification-list">
                {unreadNotifications.map((notification) => (
                  <button
                    type="button"
                    className="notification-item unread"
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <strong>{notification.title}</strong>

                      <span>{notification.message}</span>
                    </div>

                    <span className="notification-time">
                      {notification.date}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* SEEN NOTIFICATIONS */}
          <section className="notification-section">
            <div className="notification-section-title">
              <span className="seen-dot"></span>

              <h2>Seen</h2>

              <span className="notification-count seen-count">
                {seenNotifications.length}
              </span>
            </div>

            <p className="notification-subtitle">
              Notifications that you have already read.
            </p>

            {seenNotifications.length === 0 ? (
              <div className="notification-empty">No seen notifications.</div>
            ) : (
              <div className="notification-list">
                {seenNotifications.map((notification) => (
                  <div className="notification-item seen" key={notification.id}>
                    <div className="notification-content">
                      <strong>{notification.title}</strong>

                      <span>{notification.message}</span>
                    </div>

                    <span className="notification-time">
                      {notification.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default Notifications;

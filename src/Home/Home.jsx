import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import bouquetImage from "../assets/bouquet.png";
import "./home.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Home() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function getClient() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        console.log("No client found in localStorage.");
        setOrdersLoading(false);
        return;
      }

      let clientData;

      try {
        clientData = JSON.parse(storedClient);
      } catch (error) {
        console.error("Invalid client data:", error);

        setOrdersLoading(false);
        return;
      }

      console.log("Stored client:", clientData);

      if (!clientData.client_id) {
        console.log("No client_id found.");
        setOrdersLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost/bbf_clientdb/get_client.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientData.client_id,
            }),
          },
        );

        const data = await response.json();

        console.log("Database response:", data);

        if (data.success) {
          setClient(data.client);
        }
      } catch (error) {
        console.error("Failed to get client:", error);
      }
    }

    getClient();
  }, []);

  /*
   * Get the logged-in user's orders from
   * the same database endpoint used by
   * MyOrders.jsx.
   */
  useEffect(() => {
    async function getOrders() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      let clientData;

      try {
        clientData = JSON.parse(storedClient);
      } catch (error) {
        console.error("Invalid client data:", error);

        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      if (!clientData?.client_id) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);

        const response = await fetch(
          "http://localhost/bbf_clientdb/get_orders.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientData.client_id,
            }),
          },
        );

        const data = await response.json();

        console.log("Orders database response:", data);

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          console.error("Failed to get orders:", data.message);

          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to get orders:", error);

        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    getOrders();

    /*
     * Refresh Home.jsx when an order is
     * created elsewhere in the app.
     */
    const handleOrderUpdate = () => {
      getOrders();
    };

    window.addEventListener("orderUpdated", handleOrderUpdate);

    return () => {
      window.removeEventListener("orderUpdated", handleOrderUpdate);
    };
  }, []);

  /*
   * Get the number of customized bouquets
   * currently in the shopping cart.
   */
  useEffect(() => {
    async function getCartCount() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        setCartCount(0);
        return;
      }

      try {
        const clientData = JSON.parse(storedClient);

        if (!clientData.client_id) {
          setCartCount(0);
          return;
        }

        const response = await fetch("http://localhost/bbf_clientdb/cart.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
            client_id: clientData.client_id,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const groupedBouquets = {};

          (data.items || []).forEach((item) => {
            let customization = item.customization;

            if (typeof customization === "string") {
              try {
                customization = JSON.parse(customization);
              } catch (error) {
                customization = {};
              }
            }

            const bouquetId =
              customization?.bouquet_id || `item_${item.item_id}`;

            groupedBouquets[bouquetId] = true;
          });

          setCartCount(Object.keys(groupedBouquets).length);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error("Failed to get cart count:", error);

        setCartCount(0);
      }
    }

    getCartCount();

    const handleCartUpdate = () => {
      getCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);

      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  /*
   * Get the number of unread notifications
   * for the currently logged-in user from
   * the notifications database.
   */
  useEffect(() => {
    async function getNotificationCount() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        setNotificationCount(0);
        return;
      }

      let clientData;

      try {
        clientData = JSON.parse(storedClient);
      } catch (error) {
        console.error("Invalid client data:", error);

        setNotificationCount(0);
        return;
      }

      if (!clientData?.client_id) {
        setNotificationCount(0);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost/bbf_clientdb/get_notifications.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: Number(clientData.client_id),
            }),
            cache: "no-store",
          },
        );

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error("Invalid notifications response:", responseText);

          setNotificationCount(0);
          return;
        }

        if (!response.ok || !data.success) {
          console.error(data.message || "Failed to get notifications.");

          setNotificationCount(0);
          return;
        }

        const notifications = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        /*
         * get_notifications.php converts the database
         * notification_type column into the frontend
         * type property.
         *
         * unread = red notification badge
         * seen   = no notification badge
         */
        const unreadNotifications = notifications.filter(
          (notification) => notification.type === "unread",
        );

        setNotificationCount(unreadNotifications.length);
      } catch (error) {
        console.error("Failed to get notification count:", error);

        setNotificationCount(0);
      }
    }

    getNotificationCount();

    /*
     * Refresh the notification badge whenever
     * Notifications.jsx changes a notification.
     */
    const handleNotificationsUpdate = () => {
      getNotificationCount();
    };

    window.addEventListener("notificationsUpdated", handleNotificationsUpdate);

    /*
     * Refresh when the client session changes
     * in another browser tab.
     */
    const handleStorageUpdate = (event) => {
      if (event.key === "client") {
        getNotificationCount();
      }
    };

    window.addEventListener("storage", handleStorageUpdate);

    /*
     * Also check periodically so a notification
     * created by the admin appears automatically.
     */
    const notificationInterval = setInterval(getNotificationCount, 5000);

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate,
      );

      window.removeEventListener("storage", handleStorageUpdate);

      clearInterval(notificationInterval);
    };
  }, []);

  function handleLogout() {
    // Clear all session-based data, including the BouquetCustomizer mini-cart
    sessionStorage.clear();

    // Remove the logged-in client
    localStorage.removeItem("client");

    // Notify other components that the login status changed
    window.dispatchEvent(new Event("loginStatusChanged"));

    // Return to the landing page
    navigate("/");
  }

  /*
   * Orders that are currently active.
   *
   * pending and processing are considered
   * active orders.
   */
  const activeOrders = orders.filter(
    (order) =>
      order.order_status === "pending" || order.order_status === "processing",
  );

  /*
   * All orders stored for this client.
   */
  const orderHistory = orders;

  /*
   * The same recent orders shown by the
   * database, with newest orders first.
   */
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = new Date(String(a.order_date).replace(" ", "T"));

      const dateB = new Date(String(b.order_date).replace(" ", "T"));

      return dateB - dateA;
    })
    .slice(0, 2);

  function formatDate(dateString) {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(String(dateString).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatPrice(price) {
    return `₱${Number(price || 0).toFixed(2)}`;
  }

  function formatStatus(status) {
    if (!status) {
      return "Pending";
    }

    switch (status.toLowerCase()) {
      case "pending":
        return "Pending";

      case "processing":
        return "Processing";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  }

  function getStatusClass(status) {
    if (!status) {
      return "";
    }

    switch (status.toLowerCase()) {
      case "completed":
        return "delivered";

      case "cancelled":
        return "cancelled";

      case "processing":
        return "processing";

      case "pending":
        return "pending";

      default:
        return "";
    }
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/home" className="home-brand">
          BloomBox <span>Florals</span>
        </Link>

        <nav className="home-nav" aria-label="Account navigation">
          <button
            type="button"
            className="notification-button"
            onClick={() => navigate("/notifications")}
            aria-label={`Notifications${
              notificationCount > 0 ? `, ${notificationCount} unread` : ""
            }`}
          >
            <i className="bi bi-bell"></i>

            {notificationCount > 0 && (
              <span className="notification-count-badge">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => navigate("/shopping-cart")}
            aria-label={`Shopping Cart${
              cartCount > 0 ? `, ${cartCount} items` : ""
            }`}
          >
            <i className="bi bi-cart3"></i>

            {cartCount > 0 && (
              <span className="cart-count-badge">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          <Link to="/profile">Profile</Link>

          <Link to="/orders">My Orders</Link>

          <Link to="/order-history">Order History</Link>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Log out
          </button>
        </nav>
      </header>

      <section className="home-welcome">
        <div>
          <p className="home-eyebrow">Your BloomBox</p>

          <h1>Welcome back, {client ? client.name : "flower lover"}.</h1>

          <p>
            Keep track of your blooms, revisit your orders, or create something
            beautiful for your next special moment.
          </p>
        </div>

        <Link to="/customize-bouquet" className="home-primary-button">
          Order your bouquet
        </Link>
      </section>

      <section className="home-content" aria-label="Account overview">
        <article className="home-card profile-card" id="profile">
          <div className="card-heading">
            <div>
              <p className="home-eyebrow">Account</p>

              <h2>My Profile</h2>
            </div>

            <span className="profile-avatar" aria-hidden="true">
              {client?.name
                ? client.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "MB"}
            </span>
          </div>

          <div className="profile-details">
            <strong>{client?.name || "Loading..."}</strong>

            <span>{client?.email || "Loading..."}</span>

            <span>{client?.contact_number || "No contact number"}</span>

            <span>{client?.address || "No address"}</span>
          </div>

          <Link className="home-secondary-button" to="/profile">
            Edit profile
          </Link>
        </article>

        {/* MY ORDERS */}
        <article className="home-card summary-card" id="orders">
          <p className="home-eyebrow">Overview</p>

          <h2>My Orders</h2>

          <div className="summary-number">
            {ordersLoading ? "..." : activeOrders.length}
          </div>

          <p className="summary-copy">active orders in progress</p>

          <Link to="/orders" className="home-text-link">
            View order details
          </Link>
        </article>

        {/* ORDER HISTORY */}
        <article className="home-card summary-card">
          <p className="home-eyebrow">All time</p>

          <h2>Order History</h2>

          <div className="summary-number">
            {ordersLoading ? "..." : orderHistory.length}
          </div>

          <p className="summary-copy">bouquets sent with love</p>

          <Link to="/order-history" className="home-text-link">
            Browse past orders
          </Link>
        </article>
      </section>

      <section className="order-cta" aria-label="Order a bouquet">
        <div>
          <p className="home-eyebrow">Make someone&apos;s day</p>

          <h2>Order your next bouquet</h2>

          <p>
            Choose a ready-made arrangement or find flowers for every occasion.
          </p>
        </div>

        <Link to="/customize-bouquet" className="home-primary-button">
          Start an order
        </Link>

        <img src={bouquetImage} alt="" />
      </section>

      <section className="home-card history-card" id="history">
        <div className="card-heading">
          <div>
            <p className="home-eyebrow">Your activity</p>

            <h2>Recent Orders</h2>
          </div>

          <Link to="/orders#history" className="home-text-link">
            See all
          </Link>
        </div>

        <div className="orders-table">
          {ordersLoading ? (
            <div className="order-row">
              <div>
                <strong>Loading orders...</strong>
              </div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="order-row">
              <div>
                <strong>No orders yet</strong>

                <span>Your recent orders will appear here.</span>
              </div>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div className="order-row" key={order.order_id}>
                <div>
                  <strong>BloomBox Florals Order</strong>

                  <span>
                    #{String(order.order_id).padStart(4, "0")} ·{" "}
                    {formatDate(order.order_date)}
                  </span>
                </div>

                <span
                  className={`order-status ${getStatusClass(
                    order.order_status,
                  )}`}
                >
                  {formatStatus(order.order_status)}
                </span>

                <strong>{formatPrice(order.unit_price)}</strong>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;

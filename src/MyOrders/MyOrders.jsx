import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Contact from "../LandingPage/Contact";
import "./my-orders.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      navigate("/");
      return;
    }

    let client;

    try {
      client = JSON.parse(storedClient);
    } catch (error) {
      console.error("Invalid client data:", error);

      localStorage.removeItem("client");

      navigate("/");

      return;
    }

    if (!client?.client_id) {
      localStorage.removeItem("client");

      navigate("/");

      return;
    }

    fetchOrders(client.client_id);
  }, [navigate]);

  async function fetchOrders(clientId) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost/bbf_clientdb/get_orders.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Number(clientId),
          }),
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid JSON returned by get_orders.php:", responseText);

        setError("The server returned an invalid response.");
        setOrders([]);

        return;
      }

      if (!response.ok) {
        console.error("Server returned an error:", data);

        setError(data.message || `Server error (${response.status}).`);

        setOrders([]);

        return;
      }

      if (!data.success) {
        setError(data.message || "Failed to load orders.");
        setOrders([]);

        return;
      }

      const currentOrders = Array.isArray(data.orders)
        ? data.orders.filter((order) => {
            const status = String(order.order_status || "")
              .trim()
              .toLowerCase();

            return status === "pending" || status === "out for delivery";
          })
        : [];

      setOrders(currentOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      setError(
        "Unable to connect to the server. Make sure Apache and MySQL are running in XAMPP.",
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.clear();

    localStorage.removeItem("client");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/");
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(dateString.replace(" ", "T"));

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

      case "out for delivery":
        return "Out for Delivery";

      case "completed":
        return "Delivered";

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

      case "out for delivery":
        return "processing";

      case "pending":
        return "pending";

      default:
        return "";
    }
  }

  return (
    <main className="orders-page">
      <header className="orders-header">
        <Link to="/home" className="orders-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="orders-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="orders-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/">Home</Link> / <strong>My Orders</strong>
        </p>
      </section>

      <section className="orders-layout">
        <aside className="orders-menu" aria-label="Account menu">
          <Link to="/profile">Personal Information</Link>

          <Link className="active" to="/orders">
            My Orders
          </Link>

          <Link to="/address">Address</Link>

          <Link to="/payment-methods">Payment Methods</Link>

          <Link to="/password-manager">Password Manager</Link>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </aside>

        <div className="orders-panel">
          <p className="orders-eyebrow">Your activity</p>

          <h2>My Orders</h2>

          <p className="orders-intro">
            Track your current deliveries and revisit every bouquet you have
            sent with love.
          </p>

          <div className="orders-list" id="history">
            {loading ? (
              <div className="orders-message">
                <p>Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="orders-message">
                <p>{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-message">
                <p>You have no current orders.</p>

                <Link to="/home" className="orders-shop-link">
                  Start shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <article className="order-card" key={order.order_id}>
                  <div>
                    <span className="order-number">
                      #{String(order.order_id).padStart(4, "0")}
                    </span>

                    <h3>BloomBox Florals Order</h3>

                    <p>Placed on {formatDate(order.order_date)}</p>
                  </div>

                  <div className="order-meta">
                    <span
                      className={`order-status ${getStatusClass(
                        order.order_status,
                      )}`}
                    >
                      {formatStatus(order.order_status)}
                    </span>

                    <strong>{formatPrice(order.unit_price)}</strong>

                    <Link
                      className="order-details-link"
                      to={`/orders/${order.order_id}`}
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="orders-contact">
        <Contact />
      </div>
    </main>
  );
}

export default MyOrders;

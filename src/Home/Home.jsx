import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import bouquetImage from "../assets/bouquet.png";
import "./home.css";

const recentOrders = [
  {
    id: "#BB-1048",
    bouquet: "Blush Garden",
    date: "September 4, 2026",
    status: "Out for delivery",
    total: "$68.00",
  },
  {
    id: "#BB-1036",
    bouquet: "Golden Sunshine",
    date: "August 21, 2026",
    status: "Delivered",
    total: "$54.00",
  },
];

function Home() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);

  useEffect(() => {
    async function getClient() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        console.log("No client found in localStorage.");
        return;
      }

      const clientData = JSON.parse(storedClient);

      console.log("Stored client:", clientData);

      if (!clientData.client_id) {
        console.log("No client_id found.");
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

  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          BloomBox <span>Florals</span>
        </Link>

        <nav className="home-nav" aria-label="Account navigation">
          <Link to="/profile">Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/orders#history">Order History</Link>

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

          <h1>
            Welcome back, {client ? client.name : "flower lover"}.
          </h1>

          <p>
            Keep track of your blooms, revisit your orders, or create
            something beautiful for your next special moment.
          </p>
        </div>

        <Link
          to="/customize-bouquet"
          className="home-primary-button"
        >
          Order your bouquet
        </Link>
      </section>

      <section
        className="home-content"
        aria-label="Account overview"
      >
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

            <span>
              {client?.contact_number || "No contact number"}
            </span>

            <span>{client?.address || "No address"}</span>
          </div>

          <Link
            className="home-secondary-button"
            to="/profile"
          >
            Edit profile
          </Link>
        </article>

        <article
          className="home-card summary-card"
          id="orders"
        >
          <p className="home-eyebrow">Overview</p>

          <h2>My Orders</h2>

          <div className="summary-number">2</div>

          <p className="summary-copy">
            active orders in progress
          </p>

          <Link
            to="/orders"
            className="home-text-link"
          >
            View order details
          </Link>
        </article>

        <article className="home-card summary-card">
          <p className="home-eyebrow">All time</p>

          <h2>Order History</h2>

          <div className="summary-number">12</div>

          <p className="summary-copy">
            bouquets sent with love
          </p>

          <Link
            to="/orders#history"
            className="home-text-link"
          >
            Browse past orders
          </Link>
        </article>
      </section>

      <section
        className="order-cta"
        aria-label="Order a bouquet"
      >
        <div>
          <p className="home-eyebrow">
            Make someone&apos;s day
          </p>

          <h2>Order your next bouquet</h2>

          <p>
            Choose a ready-made arrangement or find flowers for
            every occasion.
          </p>
        </div>

        <Link
          to="/customize-bouquet"
          className="home-primary-button"
        >
          Start an order
        </Link>

        <img src={bouquetImage} alt="" />
      </section>

      <section
        className="home-card history-card"
        id="history"
      >
        <div className="card-heading">
          <div>
            <p className="home-eyebrow">Your activity</p>

            <h2>Recent Orders</h2>
          </div>

          <Link
            to="/orders#history"
            className="home-text-link"
          >
            See all
          </Link>
        </div>

        <div className="orders-table">
          {recentOrders.map((order) => (
            <div className="order-row" key={order.id}>
              <div>
                <strong>{order.bouquet}</strong>

                <span>
                  {order.id} · {order.date}
                </span>
              </div>

              <span
                className={`order-status ${
                  order.status === "Delivered"
                    ? "delivered"
                    : ""
                }`}
              >
                {order.status}
              </span>

              <strong>{order.total}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
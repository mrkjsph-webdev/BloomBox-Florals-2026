import { Link } from "react-router-dom";
import bouquetImage from "../assets/bouquet.png";
import "./home.css";

const recentOrders = [
  { id: "#BB-1048", bouquet: "Blush Garden", date: "September 4, 2026", status: "Out for delivery", total: "$68.00" },
  { id: "#BB-1036", bouquet: "Golden Sunshine", date: "August 21, 2026", status: "Delivered", total: "$54.00" },
];

function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">BloomBox <span>Florals</span></Link>
        <nav className="home-nav" aria-label="Account navigation">
          <Link to="/profile">Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/orders#history">Order History</Link>
          <Link to="/">Log out</Link>
        </nav>
      </header>

      <section className="home-welcome">
        <div>
          <p className="home-eyebrow">Your BloomBox</p>
          <h1>Welcome back, flower lover.</h1>
          <p>Keep track of your blooms, revisit your orders, or create something beautiful for your next special moment.</p>
        </div>
        <Link to="/customize-bouquet" className="home-primary-button">Order your bouquet</Link>
      </section>

      <section className="home-content" aria-label="Account overview">
        <article className="home-card profile-card" id="profile">
          <div className="card-heading">
            <div><p className="home-eyebrow">Account</p><h2>My Profile</h2></div>
            <span className="profile-avatar" aria-hidden="true">MB</span>
          </div>
          <div className="profile-details">
            <strong>Maria Bloom</strong><span>maria@example.com</span><span>+1 (555) 014-2048</span><span>Manila, Philippines</span>
          </div>
          <Link className="home-secondary-button" to="/profile">Edit profile</Link>
        </article>

        <article className="home-card summary-card" id="orders">
          <p className="home-eyebrow">Overview</p><h2>My Orders</h2><div className="summary-number">2</div>
          <p className="summary-copy">active orders in progress</p>          <Link to="/orders" className="home-text-link">View order details</Link>
        </article>

        <article className="home-card summary-card">
          <p className="home-eyebrow">All time</p><h2>Order History</h2><div className="summary-number">12</div>
          <p className="summary-copy">bouquets sent with love</p>          <Link to="/orders#history" className="home-text-link">Browse past orders</Link>
        </article>
      </section>

      <section className="order-cta" aria-label="Order a bouquet">
        <div><p className="home-eyebrow">Make someone&apos;s day</p><h2>Order your next bouquet</h2><p>Choose a ready-made arrangement or find flowers for every occasion.</p></div>
        <Link to="/customize-bouquet" className="home-primary-button">Start an order</Link>
        <img src={bouquetImage} alt="" />
      </section>

      <section className="home-card history-card" id="history">
        <div className="card-heading"><div><p className="home-eyebrow">Your activity</p><h2>Recent Orders</h2></div><Link to="/orders#history" className="home-text-link">See all</Link></div>
        <div className="orders-table">
          {recentOrders.map((order) => (
            <div className="order-row" key={order.id}>
              <div><strong>{order.bouquet}</strong><span>{order.id} · {order.date}</span></div>
              <span className={`order-status ${order.status === "Delivered" ? "delivered" : ""}`}>{order.status}</span>
              <strong>{order.total}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;

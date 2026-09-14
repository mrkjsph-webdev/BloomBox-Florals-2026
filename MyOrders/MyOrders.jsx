import { Link } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./my-orders.css";

const orders = [
  { id: "#BB-1048", date: "September 4, 2026", status: "Out for delivery", total: "$68.00", items: "Blush Garden Bouquet" },
  { id: "#BB-1036", date: "August 21, 2026", status: "Delivered", total: "$54.00", items: "Golden Sunshine Bouquet" },
  { id: "#BB-1022", date: "August 2, 2026", status: "Delivered", total: "$72.00", items: "Wildflower Meadow Bouquet" },
];

function MyOrders() {
  return (
    <main className="orders-page">
      <header className="orders-header"><Link to="/" className="orders-brand">BloomBox <span>Florals</span></Link><Link to="/home" className="orders-dashboard-link">Back to dashboard</Link></header>
      <section className="orders-banner"><h1>My Account</h1><p><Link to="/">Home</Link> / <strong>My Orders</strong></p></section>
      <section className="orders-layout">
        <aside className="orders-menu" aria-label="Account menu">
          <Link to="/profile">Personal Information</Link><Link className="active" to="/orders">My Orders</Link><Link to="/address">Address</Link><Link to="/payment-methods">Payment Methods</Link><Link to="/password-manager">Password Manager</Link><Link to="/">Logout</Link>
        </aside>
        <div className="orders-panel">
          <p className="orders-eyebrow">Your activity</p><h2>My Orders</h2><p className="orders-intro">Track your current deliveries and revisit every bouquet you have sent with love.</p>
          <div className="orders-list" id="history">{orders.map((order) => <article className="order-card" key={order.id}><div><span className="order-number">{order.id}</span><h3>{order.items}</h3><p>Placed on {order.date}</p></div><div className="order-meta"><span className={`order-status ${order.status === "Delivered" ? "delivered" : ""}`}>{order.status}</span><strong>{order.total}</strong><Link className="order-details-link" to={`/orders/${order.id.slice(1)}`}>View details</Link></div></article>)}</div>
        </div>
      </section>
      <div className="orders-contact"><Contact /></div>
    </main>
  );
}

export default MyOrders;

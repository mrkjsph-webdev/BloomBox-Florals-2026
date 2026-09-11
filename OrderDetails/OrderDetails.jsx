import { Link, useParams } from "react-router-dom";
import Contact from "../LandingPage/Contact";
import "./order-details.css";

const orderDetails = {
  "BB-1048": {
    number: "#BB-1048",
    bouquet: "Blush Garden Bouquet",
    date: "September 4, 2026",
    status: "Out for delivery",
    total: "$68.00",
    items: [{ name: "Blush Garden Bouquet", quantity: 1, price: "$58.00" }, { name: "Handwritten message card", quantity: 1, price: "$5.00" }, { name: "Delivery fee", quantity: 1, price: "$5.00" }],
    address: ["Maria Bloom", "24 Sampaguita Street", "Makati, Metro Manila 1200", "Philippines"],
  },
  "BB-1036": {
    number: "#BB-1036",
    bouquet: "Golden Sunshine Bouquet",
    date: "August 21, 2026",
    status: "Delivered",
    total: "$54.00",
    items: [{ name: "Golden Sunshine Bouquet", quantity: 1, price: "$49.00" }, { name: "Delivery fee", quantity: 1, price: "$5.00" }],
    address: ["Maria Bloom", "24 Sampaguita Street", "Makati, Metro Manila 1200", "Philippines"],
  },
  "BB-1022": {
    number: "#BB-1022",
    bouquet: "Wildflower Meadow Bouquet",
    date: "August 2, 2026",
    status: "Delivered",
    total: "$72.00",
    items: [{ name: "Wildflower Meadow Bouquet", quantity: 1, price: "$67.00" }, { name: "Delivery fee", quantity: 1, price: "$5.00" }],
    address: ["Maria Bloom", "24 Sampaguita Street", "Makati, Metro Manila 1200", "Philippines"],
  },
};

function OrderDetails() {
  const { orderId } = useParams();
  const order = orderDetails[orderId];

  return (
    <main className="order-details-page">
      <header className="order-details-header"><Link to="/" className="order-details-brand">BloomBox <span>Florals</span></Link><Link to="/home" className="order-details-dashboard-link">Back to dashboard</Link></header>
      <section className="order-details-banner"><h1>My Account</h1><p><Link to="/">Home</Link> / <Link to="/orders">My Orders</Link> / <strong>Order Details</strong></p></section>
      <section className="order-details-layout">
        <aside className="order-details-menu" aria-label="Account menu"><Link to="/profile">Personal Information</Link><Link className="active" to="/orders">My Orders</Link><Link to="/address">Address</Link><Link to="/payment-methods">Payment Methods</Link><Link to="/password-manager">Password Manager</Link><Link to="/">Logout</Link></aside>
        <div className="order-details-panel">
          {order ? <><div className="order-details-heading"><div><p className="order-details-eyebrow">Order {order.number}</p><h2>{order.bouquet}</h2><p>Placed on {order.date}</p></div><span className={`order-details-status ${order.status === "Delivered" ? "delivered" : ""}`}>{order.status}</span></div><div className="order-details-grid"><section className="details-card"><h3>Items ordered</h3>{order.items.map((item) => <div className="detail-line" key={item.name}><span>{item.name} <small>× {item.quantity}</small></span><strong>{item.price}</strong></div>)}<div className="detail-total"><span>Total</span><strong>{order.total}</strong></div></section><section className="details-card"><h3>Delivery address</h3>{order.address.map((line) => <p key={line}>{line}</p>)}<h3 className="details-subheading">Payment method</h3><p>Visa ending in 4242</p></section></div><Link className="back-orders-link" to="/orders">Back to My Orders</Link></> : <div className="missing-order"><h2>Order not found</h2><p>We could not find that order in your account.</p><Link className="back-orders-link" to="/orders">Back to My Orders</Link></div>}
        </div>
      </section>
      <div className="order-details-contact"><Contact /></div>
    </main>
  );
}

export default OrderDetails;

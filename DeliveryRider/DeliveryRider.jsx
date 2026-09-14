import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Map from "../Map/Map";
import "./delivery-rider.css";

const deliveries = [
  {
    id: "BB-1052",
    customer: "Sofia Reyes",
    address: "18 Magnolia Street, Quezon City",
    area: "Quezon City",
    eta: "12:40 PM",
    distance: "3.2 km",
    items: "1 bouquet",
    status: "Next stop",
    destination: {
      latitude: 14.676,
      longitude: 121.0437,
      displayName: "18 Magnolia Street, Quezon City",
    },
  },
  {
    id: "BB-1055",
    customer: "Daniel Cruz",
    address: "42 Jupiter Street, Makati",
    area: "Makati City",
    eta: "1:25 PM",
    distance: "7.8 km",
    items: "2 bouquets",
    status: "Queued",
    destination: {
      latitude: 14.5547,
      longitude: 121.0244,
      displayName: "42 Jupiter Street, Makati",
    },
  },
  {
    id: "BB-1058",
    customer: "Amara Santos",
    address: "7 Seaside Avenue, Pasay",
    area: "Pasay City",
    eta: "2:10 PM",
    distance: "11.4 km",
    items: "1 bouquet",
    status: "Queued",
    destination: {
      latitude: 14.5378,
      longitude: 120.9896,
      displayName: "7 Seaside Avenue, Pasay",
    },
  },
];

const riderLocation = {
  latitude: 14.6488,
  longitude: 121.0509,
  displayName: "BloomBox dispatch hub",
};

function DeliveryRider() {
  const [selectedId, setSelectedId] = useState(deliveries[0].id);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [deliveryStatus, setDeliveryStatus] = useState("Ready for pickup");

  const selectedDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === selectedId) ?? deliveries[0],
    [selectedId]
  );

  const route = [
    [riderLocation.latitude, riderLocation.longitude],
    [selectedDelivery.destination.latitude, selectedDelivery.destination.longitude],
  ];

  function handleDeliveryAction() {
    setDeliveryStatus((currentStatus) =>
      currentStatus === "Ready for pickup" ? "Out for delivery" : "Delivered"
    );
  }

  return (
    <main className="rider-page">
      <aside className="rider-sidebar">
        <Link to="/" className="rider-brand">
          BloomBox <span>Florals</span>
        </Link>

        <div className="rider-profile">
          <div className="rider-avatar" aria-hidden="true">JD</div>
          <div>
            <strong>Jamie Dela Cruz</strong>
            <span>Delivery rider</span>
          </div>
        </div>

        <nav className="rider-nav" aria-label="Rider navigation">
          <a className="rider-nav-link active" href="#overview">Overview</a>
          <a className="rider-nav-link" href="#deliveries">My deliveries <span>3</span></a>
          <a className="rider-nav-link" href="#earnings">Earnings</a>
          <a className="rider-nav-link" href="#help">Help center</a>
        </nav>

        <div className="rider-sidebar-footer">
          <div className="rider-shift-card">
            <span className="rider-eyebrow">Today&apos;s shift</span>
            <strong>9:00 AM – 5:00 PM</strong>
            <span>4 hours 18 minutes left</span>
          </div>
          <Link to="/" className="rider-logout">Log out</Link>
        </div>
      </aside>

      <section className="rider-content" id="overview">
        <header className="rider-header">
          <div>
            <p className="rider-eyebrow">Monday, September 14, 2026</p>
            <h1>Good morning, Jamie.</h1>
            <p className="rider-subtitle">Here&apos;s your delivery route for today.</p>
          </div>
          <button
            type="button"
            className={`rider-online-toggle ${isOnline ? "online" : ""}`}
            onClick={() => setIsOnline((online) => !online)}
            aria-pressed={isOnline}
          >
            <span className="status-dot" />
            {isOnline ? "You're online" : "Go online"}
          </button>
        </header>

        <section className="rider-stats" aria-label="Today&apos;s performance">
          <article className="rider-stat-card">
            <span className="stat-icon peach">↗</span>
            <div><span>Deliveries today</span><strong>8</strong><small>+2 from yesterday</small></div>
          </article>
          <article className="rider-stat-card">
            <span className="stat-icon green">✓</span>
            <div><span>Completion rate</span><strong>96%</strong><small>Excellent performance</small></div>
          </article>
          <article className="rider-stat-card">
            <span className="stat-icon gold">₱</span>
            <div><span>Today&apos;s earnings</span><strong>₱840</strong><small>₱140 bonus included</small></div>
          </article>
        </section>

        <section className="rider-dashboard-grid">
          <article className="rider-card route-card">
            <div className="rider-card-heading">
              <div><span className="rider-eyebrow">Live route</span><h2>Where you&apos;re headed</h2></div>
              <span className="route-badge"><span className="status-dot" />Live</span>
            </div>
            <div className="rider-map"><Map destination={selectedDelivery.destination} route={route} /></div>
            <div className="route-summary">
              <div className="route-point"><span className="route-marker hub">●</span><div><small>Pickup</small><strong>BloomBox dispatch hub</strong></div></div>
              <span className="route-line" />
              <div className="route-point"><span className="route-marker destination">●</span><div><small>Next stop · {selectedDelivery.eta}</small><strong>{selectedDelivery.address}</strong></div></div>
            </div>
          </article>

          <article className="rider-card active-delivery-card">
            <div className="rider-card-heading">
              <div><span className="rider-eyebrow">Next delivery</span><h2>{selectedDelivery.id}</h2></div>
              <span className="delivery-status">{deliveryStatus}</span>
            </div>
            <div className="customer-intro">
              <div className="customer-avatar">{selectedDelivery.customer.split(" ").map((name) => name[0]).join("")}</div>
              <div><strong>{selectedDelivery.customer}</strong><span>{selectedDelivery.items} · {selectedDelivery.distance}</span></div>
            </div>
            <div className="delivery-address"><span className="address-icon">⌖</span><div><small>Deliver to</small><strong>{selectedDelivery.address}</strong></div></div>
            <div className="delivery-notes"><span>ⓘ</span><p>Leave the flowers with the recipient. Please call if you need help finding the entrance.</p></div>
            <button type="button" className="rider-primary-button" onClick={handleDeliveryAction}>
              {deliveryStatus === "Ready for pickup" ? "Start delivery" : deliveryStatus === "Out for delivery" ? "Mark as delivered" : "Delivery complete"}
            </button>
            <button type="button" className="rider-secondary-button">Call customer</button>
          </article>
        </section>

        <section className="rider-card deliveries-card" id="deliveries">
          <div className="rider-card-heading deliveries-heading">
            <div><span className="rider-eyebrow">Your route</span><h2>Today&apos;s deliveries</h2></div>
            <div className="delivery-tabs" role="tablist" aria-label="Delivery history">
              <button type="button" className={activeTab === "today" ? "selected" : ""} onClick={() => setActiveTab("today")}>Today <span>3</span></button>
              <button type="button" className={activeTab === "completed" ? "selected" : ""} onClick={() => setActiveTab("completed")}>Completed <span>8</span></button>
            </div>
          </div>
          {activeTab === "today" ? (
            <div className="delivery-list">
              {deliveries.map((delivery, index) => (
                <button
                  type="button"
                  className={`delivery-row ${selectedId === delivery.id ? "selected" : ""}`}
                  key={delivery.id}
                  onClick={() => setSelectedId(delivery.id)}
                >
                  <span className={`delivery-number ${index === 0 ? "current" : ""}`}>{index + 1}</span>
                  <span className="delivery-row-main"><strong>{delivery.customer}</strong><span>{delivery.address}</span></span>
                  <span className="delivery-row-time"><strong>{delivery.eta}</strong><span>{delivery.distance}</span></span>
                  <span className={`delivery-row-status ${index === 0 ? "next" : ""}`}>{delivery.status}</span>
                  <span className="delivery-arrow">→</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-deliveries"><strong>Great work today!</strong><span>You&apos;ve completed 8 deliveries. Keep it up.</span></div>
          )}
        </section>
      </section>
    </main>
  );
}

export default DeliveryRider;

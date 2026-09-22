import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-dashboard.css";

const initialUsers = [
  {
    name: "John Doe",
    email: "john.doe@gmail.com",
    phone: "+63 917 555 0123",
    orders: 8,
    joined: "Aug 12, 2026",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@gmail.com",
    phone: "+63 918 555 0188",
    orders: 3,
    joined: "Aug 18, 2026",
  },
  {
    name: "Juan Dela Cruz",
    email: "juandc@gmail.com",
    phone: "+63 919 555 0142",
    orders: 12,
    joined: "Jul 25, 2026",
  },
  {
    name: "Maria Santos",
    email: "maria.santos@gmail.com",
    phone: "+63 905 555 0199",
    orders: 5,
    joined: "Jul 30, 2026",
  },
];

const initialRiders = [
  {
    name: "Alex Cruz",
    email: "alex.cruz@gmail.com",
    phone: "+63 917 300 2190",
    status: "Available",
    deliveries: 28,
  },
  {
    name: "Bea Garcia",
    email: "bea.garcia@gmail.com",
    phone: "+63 918 210 8841",
    status: "On delivery",
    deliveries: 19,
  },
  {
    name: "Carlo Reyes",
    email: "carlo.reyes@gmail.com",
    phone: "+63 905 789 4421",
    status: "Available",
    deliveries: 34,
  },
];

const initialOrders = [
  {
    id: "#BB-2026-0411",
    customer: "Juan Dela Cruz",
    bouquet: "Sunshine Garden",
    date: "Sep 10, 2026",
    total: "₱2,450",
    status: "Processing",
  },
  {
    id: "#BB-2026-0410",
    customer: "Jane Doe",
    bouquet: "Classic Rose",
    date: "Sep 10, 2026",
    total: "₱1,850",
    status: "Out for delivery",
  },
  {
    id: "#BB-2026-0409",
    customer: "John Doe",
    bouquet: "Spring Mix",
    date: "Sep 9, 2026",
    total: "₱2,100",
    status: "Delivered",
  },
  {
    id: "#BB-2026-0408",
    customer: "Maria Santos",
    bouquet: "Pastel Dreams",
    date: "Sep 9, 2026",
    total: "₱1,650",
    status: "Pending",
  },
];

const initialInventory = [
  {
    name: "Sunflower",
    category: "Flower",
    stock: 24,
    price: "₱180",
  },
  {
    name: "Rose",
    category: "Flower",
    stock: 8,
    price: "₱150",
  },
  {
    name: "Dandelion",
    category: "Flower",
    stock: 0,
    price: "₱120",
  },
  {
    name: "Eucalyptus",
    category: "Filler",
    stock: 42,
    price: "₱95",
  },
];

const navItems = [
  ["dashboard", "▦", "Dashboard"],
  ["users", "♙", "Users"],
  ["riders", "♧", "Delivery Riders"],
  ["orders", "▤", "Orders"],
  ["inventory", "❖", "Inventory"],
  ["reports", "◔", "Report and Analytics"],
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [users] = useState(initialUsers);
  const [riders] = useState(initialRiders);
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [users, query],
  );

  const filteredRiders = useMemo(
    () =>
      riders.filter((rider) =>
        `${rider.name} ${rider.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [riders, query],
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.customer} ${order.bouquet}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [orders, query],
  );

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [inventory, query],
  );

  function selectPage(page) {
    setActivePage(page);
    setQuery("");
    setSelectedUser(null);
  }

  function updateOrderStatus(id, status) {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }

  function adjustStock(name, amount) {
    setInventory((current) =>
      current.map((item) =>
        item.name === name
          ? { ...item, stock: Math.max(0, item.stock + amount) }
          : item,
      ),
    );
  }

  function handleLogout() {
    sessionStorage.clear();
    localStorage.removeItem("client");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">✾</span>
          <span>
            BloomBox <b>Florals</b>
          </span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map(([key, icon, label]) => (
            <button
              className={activePage === key ? "active" : ""}
              key={key}
              onClick={() => selectPage(key)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">September 10, 2026</p>
            <h1>{navItems.find(([key]) => key === activePage)?.[2]}</h1>
          </div>

          <div className="admin-account">
            <span className="admin-avatar">A</span>

            <span>
              <strong>Administrator</strong>
              <small>admin@gmail.com</small>
            </span>
          </div>
        </header>

        {activePage === "dashboard" && <Dashboard onNavigate={selectPage} />}

        {activePage === "users" && (
          <ManagementPage
            title="Users"
            query={query}
            setQuery={setQuery}
            placeholder="Search users..."
            count={filteredUsers.length}
          >
            <div className="admin-list">
              {filteredUsers.map((user) => (
                <PersonRow
                  key={user.email}
                  person={user}
                  action="View Profile"
                  onAction={() => setSelectedUser(user)}
                />
              ))}
            </div>
          </ManagementPage>
        )}

        {activePage === "riders" && (
          <ManagementPage
            title="Delivery Riders"
            query={query}
            setQuery={setQuery}
            placeholder="Search riders..."
            count={filteredRiders.length}
          >
            <div className="admin-list">
              {filteredRiders.map((rider) => (
                <PersonRow
                  key={rider.email}
                  person={rider}
                  action={rider.status}
                  onAction={() => setSelectedUser(rider)}
                  rider
                />
              ))}
            </div>
          </ManagementPage>
        )}

        {activePage === "orders" && (
          <ManagementPage
            title="Orders"
            query={query}
            setQuery={setQuery}
            placeholder="Search orders..."
            count={filteredOrders.length}
          >
            <div className="admin-list order-list">
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                />
              ))}
            </div>
          </ManagementPage>
        )}

        {activePage === "inventory" && (
          <ManagementPage
            title="Inventory"
            query={query}
            setQuery={setQuery}
            placeholder="Search flowers..."
            count={filteredInventory.length}
          >
            <div className="admin-list">
              {filteredInventory.map((item) => (
                <InventoryRow
                  key={item.name}
                  item={item}
                  onAdjust={adjustStock}
                />
              ))}
            </div>
          </ManagementPage>
        )}

        {activePage === "reports" && <Reports />}

        {selectedUser && (
          <ProfilePanel
            person={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatCard
          label="Orders Completed"
          value="12"
          tone="green"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          label="Out for Delivery"
          value="4"
          tone="purple"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          label="Ready for Pickup"
          value="7"
          tone="blue"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          label="Pending Orders"
          value="1"
          tone="orange"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          label="Cancelled Orders"
          value="1"
          tone="red"
          onClick={() => onNavigate("orders")}
        />
      </div>

      <div className="dashboard-grid">
        <section className="admin-card recent-card">
          <div className="card-title">
            <h2>Recent Orders Placed</h2>
            <button onClick={() => onNavigate("orders")}>View all</button>
          </div>

          <div className="mini-order">
            <b>#BB-2026-0411</b>
            <span>Juan Dela Cruz · Sunshine Garden</span>
            <strong>₱2,450</strong>
          </div>

          <div className="mini-order">
            <b>#BB-2026-0410</b>
            <span>Jane Doe · Classic Rose</span>
            <strong>₱1,850</strong>
          </div>

          <div className="mini-order">
            <b>#BB-2026-0409</b>
            <span>John Doe · Spring Mix</span>
            <strong>₱2,100</strong>
          </div>
        </section>

        <div className="dashboard-side">
          <section className="admin-card alert-card">
            <h2>Most Selling Flowers</h2>

            <p>
              <span>Rose</span>
              <b>899</b>
            </p>

            <p>
              <span>Dandelion</span>
              <b>401</b>
            </p>

            <p>
              <span>Sunflower</span>
              <b>200</b>
            </p>
          </section>

          <section className="admin-card alert-card">
            <h2>Low Stocks Alert</h2>

            <p>
              <span>Dandelion</span>
              <em>Out of stock</em>
            </p>

            <p>
              <span>Rose</span>
              <em>8 left</em>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, onClick }) {
  return (
    <button className={`stat-card ${tone}`} onClick={onClick}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>View details →</small>
    </button>
  );
}

function ManagementPage({
  title,
  query,
  setQuery,
  placeholder,
  count,
  children,
}) {
  return (
    <div className="management-content">
      <div className="management-toolbar">
        <div>
          <p className="admin-kicker">Manage your store</p>
          <h2>
            {title} <small>{count}</small>
          </h2>
        </div>

        <label className="admin-search">
          <span>⌕</span>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
        </label>

        <button className="filter-button">
          ☷ <span>Filter</span>
        </button>
      </div>

      {children}
    </div>
  );
}

function PersonRow({ person, action, onAction, rider }) {
  return (
    <article className="person-row">
      <div className="person-avatar">
        {person.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      </div>

      <div className="person-info">
        <strong>{person.name}</strong>
        <span>{person.email}</span>
        <small>{person.phone}</small>
      </div>

      <div className="person-meta">
        <span>
          {rider
            ? `${person.deliveries} deliveries`
            : `${person.orders} orders`}
        </span>

        <small>{rider ? person.status : `Joined ${person.joined}`}</small>
      </div>

      <button className="row-action" onClick={onAction}>
        {action}
      </button>
    </article>
  );
}

function OrderRow({ order, onStatusChange }) {
  return (
    <article className="order-row">
      <div>
        <strong>{order.id}</strong>
        <span>
          {order.customer} · {order.bouquet}
        </span>
      </div>

      <span className="order-date">{order.date}</span>

      <b>{order.total}</b>

      <select
        value={order.status}
        onChange={(event) => onStatusChange(order.id, event.target.value)}
      >
        <option>Pending</option>
        <option>Processing</option>
        <option>Ready for pickup</option>
        <option>Out for delivery</option>
        <option>Delivered</option>
        <option>Cancelled</option>
      </select>
    </article>
  );
}

function InventoryRow({ item, onAdjust }) {
  const stockLabel =
    item.stock === 0 ? "No stock" : item.stock < 10 ? "Low stock" : "In stock";

  return (
    <article className="inventory-row">
      <div className="flower-swatch">✿</div>

      <div>
        <strong>{item.name}</strong>
        <span>
          {item.category} · {item.price}
        </span>
      </div>

      <b
        className={
          item.stock < 10 ? "stock-low" : item.stock === 0 ? "stock-none" : ""
        }
      >
        {item.stock} <small>{stockLabel}</small>
      </b>

      <div className="stock-controls">
        <button
          onClick={() => onAdjust(item.name, -1)}
          aria-label={`Remove one ${item.name}`}
        >
          −
        </button>

        <button
          onClick={() => onAdjust(item.name, 1)}
          aria-label={`Add one ${item.name}`}
        >
          +
        </button>
      </div>
    </article>
  );
}

function Reports() {
  return (
    <div className="reports-content">
      <div className="report-heading">
        <div>
          <p className="admin-kicker">Business performance</p>
          <h2>Report and Analytics</h2>
        </div>

        <button className="export-button" onClick={() => window.print()}>
          Generate PDF report
        </button>
      </div>

      <div className="report-grid">
        <section className="admin-card chart-card">
          <h3>Orders overview</h3>

          <div className="donut-chart">
            <span>
              1,500
              <small>Total orders</small>
            </span>
          </div>

          <div className="legend">
            <span>
              <i className="legend-green" />
              Completed 86%
            </span>

            <span>
              <i className="legend-pink" />
              Cancelled 14%
            </span>
          </div>
        </section>

        <section className="admin-card report-metrics">
          <h3>Most Selling Flowers</h3>

          {[
            ["Rose", "899"],
            ["Dandelion", "401"],
            ["Sampaguita", "200"],
            ["Carnation", "189"],
            ["Spider Lily", "92"],
          ].map(([name, value]) => (
            <p key={name}>
              <span>{name}</span>
              <b>{value}</b>
            </p>
          ))}

          <hr />

          <p>
            <span>Total revenue</span>
            <b>₱89,450</b>
          </p>
        </section>
      </div>
    </div>
  );
}

function ProfilePanel({ person, onClose }) {
  return (
    <div className="profile-overlay" onClick={onClose}>
      <section
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-panel" onClick={onClose}>
          ×
        </button>

        <div className="large-avatar">
          {person.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>

        <p className="admin-kicker">Profile details</p>

        <h2>{person.name}</h2>

        <p className="profile-role">{person.email}</p>

        <dl>
          <dt>Email address</dt>
          <dd>{person.email}</dd>

          <dt>Phone number</dt>
          <dd>{person.phone}</dd>

          <dt>
            {person.deliveries ? "Deliveries completed" : "Orders placed"}
          </dt>

          <dd>{person.deliveries || person.orders}</dd>
        </dl>

        <button className="panel-button" onClick={onClose}>
          Done
        </button>
      </section>
    </div>
  );
}

export default AdminDashboard;

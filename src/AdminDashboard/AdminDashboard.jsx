import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-dashboard.css";

const ADMIN_DASHBOARD_URL = "http://localhost/bbf_clientdb/admin_dashboard.php";
const UPDATE_ORDER_URL =
  "http://localhost/bbf_clientdb/update_order_status.php";

const GET_DELIVERY_RIDER_URL =
  "http://localhost/bbf_shippingdb/get_delivery_rider.php";

const GET_DELIVERY_DASHBOARD_URL =
  "http://localhost/bbf_shippingdb/get_delivery_dashboard.php";

const ASSIGN_DELIVERY_ORDER_URL =
  "http://localhost/bbf_shippingdb/assign_delivery_order.php";

function formatCurrency(value) {
  const amount = Number(value || 0);

  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mapOrderStatus(status) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "Pending";

    case "out for delivery":
      return "Out for Delivery";

    case "completed":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return "Pending";
  }
}

function mapDisplayStatusToDatabase(status) {
  switch (status) {
    case "Pending":
      return "pending";

    case "Out for Delivery":
      return "out for delivery";

    case "Delivered":
      return "completed";

    case "Cancelled":
      return "cancelled";

    default:
      return "pending";
  }
}

function isOrderInPeriod(orderDate, period) {
  if (!orderDate) {
    return false;
  }

  const orderDateObject = new Date(orderDate);

  if (Number.isNaN(orderDateObject.getTime())) {
    return false;
  }

  const now = new Date();

  if (period === "year") {
    return orderDateObject.getFullYear() === now.getFullYear();
  }

  if (period === "month") {
    return (
      orderDateObject.getFullYear() === now.getFullYear() &&
      orderDateObject.getMonth() === now.getMonth()
    );
  }

  if (period === "week") {
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();

    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return orderDateObject >= startOfWeek && orderDateObject < endOfWeek;
  }

  return true;
}

function getPeriodLabel(period) {
  switch (period) {
    case "week":
      return "This Week";

    case "year":
      return "This Year";

    default:
      return "This Month";
  }
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [popularFlowers, setPopularFlowers] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inDelivery: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPerson, setSelectedPerson] = useState(null);

  const [assignmentRider, setAssignmentRider] = useState(null);
  const [assignmentOrderId, setAssignmentOrderId] = useState("");
  const [assigningOrder, setAssigningOrder] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [assignmentError, setAssignmentError] = useState(null);

  const [reportPeriod, setReportPeriod] = useState("month");

  const [stockModal, setStockModal] = useState(null);
  const [stockAmount, setStockAmount] = useState("");

  useEffect(() => {
    loadAdminDashboard();
    loadDeliveryRiders();
  }, []);

  async function loadDeliveryRiders() {
    try {
      const response = await fetch(
        `${GET_DELIVERY_RIDER_URL}?_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid delivery rider response:", responseText);

        throw new Error("The server returned an invalid rider response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load delivery rider information.",
        );
      }

      const riderList = data.riders || [];

      const ridersWithCompletedDeliveries = await Promise.all(
        riderList.map(async (rider) => {
          try {
            const riderResponse = await fetch(
              `${GET_DELIVERY_DASHBOARD_URL}?_=${Date.now()}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                  rider_id: Number(rider.rider_id),
                }),
              },
            );

            const riderResponseText = await riderResponse.text();

            let riderData;

            try {
              riderData = JSON.parse(riderResponseText);
            } catch (error) {
              console.error(
                `Invalid delivery dashboard response for rider ${rider.rider_id}:`,
                riderResponseText,
              );

              return {
                ...rider,
                deliveries: 0,
              };
            }

            if (!riderResponse.ok || !riderData.success) {
              return {
                ...rider,
                deliveries: 0,
              };
            }

            const completedDeliveries = Array.isArray(
              riderData.completed_deliveries,
            )
              ? riderData.completed_deliveries
              : [];

            return {
              ...rider,
              deliveries: completedDeliveries.length,
            };
          } catch (error) {
            console.error(
              `Failed to load completed deliveries for rider ${rider.rider_id}:`,
              error,
            );

            return {
              ...rider,
              deliveries: 0,
            };
          }
        }),
      );

      setRiders(ridersWithCompletedDeliveries);
    } catch (error) {
      console.error("Failed to load delivery riders:", error);

      setRiders([]);
    }
  }

  async function assignOrderToRider() {
    if (!assignmentRider) {
      return;
    }

    const orderId = Number(assignmentOrderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      alert("Please select an order to assign.");
      return;
    }

    const selectedOrder = orders.find(
      (order) => Number(order.orderId) === orderId,
    );

    if (!selectedOrder) {
      alert("Order not found.");
      return;
    }

    if (selectedOrder.status !== "Pending") {
      alert("Only pending orders can be assigned to a delivery rider.");
      return;
    }

    try {
      setAssigningOrder(true);

      const response = await fetch(ASSIGN_DELIVERY_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rider_id: Number(assignmentRider.rider_id),
          order_id: orderId,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid assign order response:", responseText);
        alert("The server returned an invalid response.");
        return;
      }

      if (!response.ok || !data.success) {
        const message = data.message || "Failed to assign the order.";

        if (message.toLowerCase().includes("already assigned")) {
          setAssignmentError({
            title: "Order Already Assigned",
            orderId: selectedOrder.id || `#${orderId}`,
            customer: selectedOrder.customer || "Unknown Customer",
            riderName: assignmentRider.name || "the delivery rider",
            message,
          });

          setAssignmentRider(null);
          setAssignmentOrderId("");
        } else {
          alert(message);
        }
        return;
      }

      setAssignmentSuccess({
        orderId: selectedOrder.id || `#${orderId}`,
        customer: selectedOrder.customer || "Unknown Customer",
        riderName: assignmentRider.name || "the delivery rider",
      });

      setAssignmentRider(null);
      setAssignmentOrderId("");

      await loadAdminDashboard();
      await loadDeliveryRiders();
    } catch (error) {
      console.error("Failed to assign order:", error);
      alert("Unable to connect to the delivery database.");
    } finally {
      setAssigningOrder(false);
    }
  }

  async function loadAdminDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${ADMIN_DASHBOARD_URL}?_=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid dashboard response:", responseText);
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load admin dashboard.");
      }

      setUsers(data.users || []);

      setOrders(
        (data.orders || []).map((order) => ({
          ...order,

          orderId: Number(order.order_id),

          customer: order.customer || order.customer_name || "Unknown Customer",

          status: mapOrderStatus(
            order.order_status || order.raw_status || order.status,
          ),
        })),
      );

      setInventory(data.inventory || []);

      setPopularFlowers(data.popular_flowers || data.popular || []);

      setStats({
        total: Number(data.stats?.total || 0),

        pending: Number(data.stats?.pending || 0),

        inDelivery: Number(data.stats?.in_delivery || 0),

        completed: Number(data.stats?.completed || 0),

        cancelled: Number(data.stats?.cancelled || 0),

        revenue: Number(data.stats?.revenue || 0),
      });
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);

      setError(error.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, displayStatus) {
    const currentOrder = orders.find(
      (order) => Number(order.orderId) === Number(orderId),
    );

    if (!currentOrder) {
      alert("Order not found.");
      return;
    }

    const currentStatus = currentOrder.status;

    // Delivered and Cancelled are final statuses.
    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      alert(
        `This order is already ${currentStatus.toLowerCase()} and cannot be updated.`,
      );

      return;
    }

    // An order that is already Out for Delivery cannot go back to Pending.
    if (currentStatus === "Out for Delivery" && displayStatus === "Pending") {
      alert("An order out for delivery cannot be changed back to Pending.");

      return;
    }

    // Do nothing if the selected status is the current status.
    if (currentStatus === displayStatus) {
      return;
    }

    const databaseStatus = mapDisplayStatusToDatabase(displayStatus);

    try {
      const response = await fetch(UPDATE_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: Number(orderId),
          order_status: databaseStatus,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid update order response:", responseText);

        alert("The server returned an invalid response.");
        return;
      }

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to update order status.");

        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          Number(order.orderId) === Number(orderId)
            ? {
                ...order,
                orderId: Number(orderId),
                status: displayStatus,
                order_status: databaseStatus,
                raw_status: databaseStatus,
              }
            : order,
        ),
      );

      await loadAdminDashboard();
    } catch (error) {
      console.error("Failed to update order status:", error);

      alert("Unable to connect to the server.");
    }
  }

  async function adjustStock(flowerId, amount) {
    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/update_inventory.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flower_id: Number(flowerId),
            amount: Number(amount),
          }),
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid inventory response:", responseText);

        alert("The server returned an invalid response.");

        return;
      }

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to update inventory.");

        return;
      }

      setInventory((currentInventory) =>
        currentInventory.map((flower) =>
          Number(flower.flower_id) === Number(flowerId)
            ? {
                ...flower,
                stock: Number(data.stock),
              }
            : flower,
        ),
      );

      closeStockModal();
    } catch (error) {
      console.error("Failed to update inventory:", error);

      alert("Unable to connect to the inventory database.");
    }
  }

  function openStockModal(flower, action) {
    setStockModal({
      flower,
      action,
    });

    setStockAmount("");
  }

  function closeStockModal() {
    setStockModal(null);
    setStockAmount("");
  }

  function handleStockSubmit() {
    const amount = Number(stockAmount);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Please enter a valid whole number greater than 0.");
      return;
    }

    if (!stockModal) {
      return;
    }

    const currentStock = Number(stockModal.flower.stock || 0);

    if (stockModal.action === "decrease") {
      if (amount > currentStock) {
        alert("You cannot decrease the stock below 0.");
        return;
      }

      adjustStock(stockModal.flower.flower_id, -amount);

      return;
    }

    adjustStock(stockModal.flower.flower_id, amount);
  }

  function handleLogout() {
    localStorage.removeItem("client");
    localStorage.removeItem("admin");
    navigate("/");
  }

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.phone]
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }, [users, search]);

  const filteredRiders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return riders;
    }

    return riders.filter((rider) =>
      [rider.name, rider.email, rider.phone, rider.status]
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }, [riders, search]);

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return orders;
    }

    return orders.filter((order) =>
      [order.id, order.customer, order.bouquet, order.date, order.status]
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }, [orders, search]);

  const filteredInventory = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = !searchValue
      ? [...inventory]
      : inventory.filter((flower) =>
          [flower.name, flower.category, flower.stock, flower.price]
            .join(" ")
            .toLowerCase()
            .includes(searchValue),
        );

    return filtered.sort((a, b) => Number(a.stock) - Number(b.stock));
  }, [inventory, search]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((flower) => Number(flower.stock) < 10);
  }, [inventory]);

  const reportOrders = useMemo(() => {
    return orders.filter((order) =>
      isOrderInPeriod(order.order_date || order.date, reportPeriod),
    );
  }, [orders, reportPeriod]);

  const reportRevenue = useMemo(() => {
    return reportOrders.reduce((total, order) => {
      const amount = Number(
        String(order.unit_price || order.total || "0").replace(/[₱,]/g, ""),
      );

      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [reportOrders]);

  const reportCompletedOrders = useMemo(() => {
    return reportOrders.filter((order) => order.status === "Delivered").length;
  }, [reportOrders]);

  const reportPendingOrders = useMemo(() => {
    return reportOrders.filter(
      (order) =>
        order.status === "Pending" || order.status === "Out for Delivery",
    ).length;
  }, [reportOrders]);

  const reportCancelledOrders = useMemo(() => {
    return reportOrders.filter((order) => order.status === "Cancelled").length;
  }, [reportOrders]);

  const completionPercentage = useMemo(() => {
    if (reportOrders.length === 0) {
      return 0;
    }

    return Math.round((reportCompletedOrders / reportOrders.length) * 100);
  }, [reportOrders, reportCompletedOrders]);

  const reportPopularFlowers = useMemo(() => {
    return [...popularFlowers]
      .sort((a, b) => Number(b.amount_sold || 0) - Number(a.amount_sold || 0))
      .slice(0, 5);
  }, [popularFlowers]);

  function navigateTo(page) {
    setActivePage(page);
    setSearch("");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">✿</span>

          <b>
            BloomBox <span>Florals</span>
          </b>
        </div>

        <nav className="admin-nav">
          <button
            type="button"
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => navigateTo("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className={activePage === "users" ? "active" : ""}
            onClick={() => navigateTo("users")}
          >
            <span>♙</span>
            Users
          </button>

          <button
            type="button"
            className={activePage === "riders" ? "active" : ""}
            onClick={() => navigateTo("riders")}
          >
            <span>♧</span>
            Delivery Riders
          </button>

          <button
            type="button"
            className={activePage === "orders" ? "active" : ""}
            onClick={() => navigateTo("orders")}
          >
            <span>▣</span>
            Orders
          </button>

          <button
            type="button"
            className={activePage === "inventory" ? "active" : ""}
            onClick={() => navigateTo("inventory")}
          >
            <span>❀</span>
            Inventory
          </button>

          <button
            type="button"
            className={activePage === "reports" ? "active" : ""}
            onClick={() => navigateTo("reports")}
          >
            <span>▥</span>
            Reports & Analytics
          </button>
        </nav>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">Admin Dashboard</p>

            <h1>
              {activePage === "dashboard" && "Overview"}
              {activePage === "users" && "Users"}
              {activePage === "riders" && "Delivery Riders"}
              {activePage === "orders" && "Orders"}
              {activePage === "inventory" && "Inventory"}
              {activePage === "reports" && "Reports & Analytics"}
            </h1>
          </div>

          <div className="admin-account">
            <div>
              <strong>Administrator</strong>
              <small>Admin</small>
            </div>

            <div className="admin-avatar">A</div>
          </div>
        </header>

        {loading && (
          <div className="admin-content">
            <div className="admin-card">
              <p>Loading dashboard data...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="admin-content">
            <div className="admin-card">
              <h3>Unable to Load Dashboard</h3>

              <p>{error}</p>

              <button
                type="button"
                className="panel-button"
                onClick={loadAdminDashboard}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && activePage === "dashboard" && (
          <Dashboard
            stats={stats}
            orders={orders}
            popularFlowers={popularFlowers}
            lowStockItems={lowStockItems}
            onNavigate={navigateTo}
          />
        )}

        {!loading && !error && activePage === "users" && (
          <ManagementPage
            title="Users"
            count={users.length}
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search users..."
          >
            {filteredUsers.map((user) => (
              <PersonRow
                key={user.client_id}
                person={user}
                type="user"
                onView={() => setSelectedPerson(user)}
              />
            ))}

            {filteredUsers.length === 0 && (
              <EmptyRow message="No users found." />
            )}
          </ManagementPage>
        )}

        {!loading && !error && activePage === "riders" && (
          <ManagementPage
            title="Delivery Riders"
            count={riders.length}
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search riders..."
          >
            {filteredRiders.map((rider, index) => (
              <PersonRow
                key={rider.rider_id || rider.id || index}
                person={rider}
                type="rider"
                onAssign={() => {
                  setAssignmentRider(rider);
                  setAssignmentOrderId("");
                }}
              />
            ))}

            {filteredRiders.length === 0 && (
              <EmptyRow message="No delivery rider data is available." />
            )}
          </ManagementPage>
        )}

        {!loading && !error && activePage === "orders" && (
          <ManagementPage
            title="Orders"
            count={orders.length}
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search orders..."
          >
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.orderId}
                order={order}
                onStatusChange={updateOrderStatus}
              />
            ))}

            {filteredOrders.length === 0 && (
              <EmptyRow message="No orders found." />
            )}
          </ManagementPage>
        )}

        {!loading && !error && activePage === "inventory" && (
          <ManagementPage
            title="Inventory"
            count={inventory.length}
            search={search}
            setSearch={setSearch}
            searchPlaceholder="Search inventory..."
          >
            {filteredInventory.map((flower) => (
              <InventoryRow
                key={flower.flower_id}
                flower={flower}
                onAdjust={openStockModal}
              />
            ))}

            {filteredInventory.length === 0 && (
              <EmptyRow message="No inventory items found." />
            )}
          </ManagementPage>
        )}

        {!loading && !error && activePage === "reports" && (
          <Reports
            orders={reportOrders}
            popularFlowers={reportPopularFlowers}
            reportPeriod={reportPeriod}
            setReportPeriod={setReportPeriod}
            reportRevenue={reportRevenue}
            reportCompletedOrders={reportCompletedOrders}
            reportPendingOrders={reportPendingOrders}
            reportCancelledOrders={reportCancelledOrders}
            completionPercentage={completionPercentage}
          />
        )}
      </main>

      {selectedPerson && (
        <ProfilePanel
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {assignmentRider && (
        <AssignmentModal
          rider={assignmentRider}
          orders={orders}
          selectedOrderId={assignmentOrderId}
          setSelectedOrderId={setAssignmentOrderId}
          onAssign={assignOrderToRider}
          onClose={() => {
            if (!assigningOrder) {
              setAssignmentRider(null);
              setAssignmentOrderId("");
            }
          }}
          assigning={assigningOrder}
        />
      )}

      {assignmentSuccess && (
        <AssignmentSuccessModal
          assignment={assignmentSuccess}
          onClose={() => setAssignmentSuccess(null)}
        />
      )}

      {assignmentError && (
        <AssignmentErrorModal
          assignment={assignmentError}
          onClose={() => setAssignmentError(null)}
        />
      )}

      {stockModal && (
        <div className="profile-overlay" onClick={closeStockModal}>
          <div
            className="profile-panel stock-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-panel"
              onClick={closeStockModal}
              aria-label="Close stock modal"
            >
              ×
            </button>

            <div className="large-avatar">✿</div>

            <h2>
              {stockModal.action === "increase"
                ? "Add Stock"
                : "Decrease Stock"}
            </h2>

            <p className="profile-role">{stockModal.flower.name}</p>

            <div className="stock-modal-current">
              <span>Current Stock</span>

              <strong>{stockModal.flower.stock}</strong>
            </div>

            <label htmlFor="stock-amount">
              {stockModal.action === "increase"
                ? "Number of flowers to add"
                : "Number of flowers to remove"}
            </label>

            <input
              id="stock-amount"
              type="number"
              min="1"
              max={
                stockModal.action === "decrease"
                  ? stockModal.flower.stock
                  : undefined
              }
              value={stockAmount}
              onChange={(event) => setStockAmount(event.target.value)}
              placeholder="Enter quantity"
              autoFocus
            />

            <button
              type="button"
              className="panel-button"
              onClick={handleStockSubmit}
            >
              {stockModal.action === "increase"
                ? "Add Flowers"
                : "Remove Flowers"}
            </button>

            <button
              type="button"
              className="panel-button stock-cancel-button"
              onClick={closeStockModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard({
  stats,
  orders,
  popularFlowers,
  lowStockItems,
  onNavigate,
}) {
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <StatCard
          value={stats.total}
          label="Total Orders"
          note="All orders"
          color="green"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          value={stats.inDelivery}
          label="Out for Delivery"
          note="Currently out for delivery"
          color="purple"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          value={stats.pending}
          label="Pending"
          note="Awaiting processing"
          color="blue"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          value={stats.completed}
          label="Delivered"
          note="Completed orders"
          color="orange"
          onClick={() => onNavigate("orders")}
        />

        <StatCard
          value={stats.cancelled}
          label="Cancelled"
          note="Cancelled orders"
          color="red"
          onClick={() => onNavigate("orders")}
        />
      </div>

      <div className="dashboard-grid">
        <section className="admin-card">
          <div className="card-title">
            <h2>Recent Orders</h2>

            <button type="button" onClick={() => onNavigate("orders")}>
              View all
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p>No orders available.</p>
          ) : (
            recentOrders.map((order) => (
              <div className="mini-order" key={order.orderId}>
                <strong>{order.id}</strong>

                <div>
                  <b>{order.customer}</b>

                  <span>{order.bouquet}</span>
                </div>

                <div>
                  <b>{order.total}</b>

                  <span>{order.status}</span>
                </div>
              </div>
            ))
          )}
        </section>

        <div className="dashboard-side">
          <section className="admin-card alert-card">
            <h3>Inventory Alerts</h3>

            {lowStockItems.length === 0 ? (
              <p>
                <span>All flowers</span>
                <b>Stock OK</b>
              </p>
            ) : (
              lowStockItems.slice(0, 5).map((flower) => (
                <p key={flower.flower_id}>
                  <span>{flower.name}</span>

                  <em>
                    {flower.stock === 0
                      ? "Out of stock"
                      : `${flower.stock} left`}
                  </em>
                </p>
              ))
            )}

            <button
              type="button"
              className="card-title"
              onClick={() => onNavigate("inventory")}
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "#c18718",
                fontSize: "11px",
              }}
            >
              Manage Inventory
            </button>
          </section>

          <section className="admin-card report-metrics">
            <h3>Sales Overview</h3>

            <p>
              <span>Total Revenue</span>
              <b>{formatCurrency(stats.revenue)}</b>
            </p>

            <p>
              <span>Completed Orders</span>
              <b>{stats.completed}</b>
            </p>

            <p>
              <span>Out for Delivery Orders</span>
              <b>{stats.inDelivery}</b>
            </p>
          </section>
        </div>
      </div>

      <section className="admin-card" style={{ marginTop: "22px" }}>
        <div className="card-title">
          <h2>Most Selling Flowers</h2>

          <button type="button" onClick={() => onNavigate("reports")}>
            View Reports
          </button>
        </div>

        {popularFlowers.length === 0 ? (
          <p>No sales data available.</p>
        ) : (
          popularFlowers.slice(0, 5).map((flower) => (
            <div className="mini-order" key={flower.flower_id}>
              <strong>{flower.name}</strong>

              <span>Flowers sold</span>

              <b>{flower.amount_sold}</b>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function StatCard({ value, label, note, color, onClick }) {
  return (
    <button type="button" className={`stat-card ${color}`} onClick={onClick}>
      <strong>{value}</strong>

      <span>{label}</span>

      <small>{note}</small>
    </button>
  );
}

function ManagementPage({
  title,
  count,
  search,
  setSearch,
  searchPlaceholder,
  children,
}) {
  return (
    <div className="management-content">
      <div className="management-toolbar">
        <div>
          <h2>
            {title} <small>({count})</small>
          </h2>
        </div>

        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        <button
          type="button"
          className="filter-button"
          onClick={() => setSearch("")}
        >
          Clear
        </button>
      </div>

      <div className="admin-list">{children}</div>
    </div>
  );
}

function PersonRow({ person, type, onView, onAssign }) {
  const name = person.name || "Unknown";

  return (
    <div className="person-row">
      <div className="person-avatar">{getInitials(name)}</div>

      <div className="person-info">
        <strong>{name}</strong>

        <span>{person.email || "—"}</span>

        <small>{person.phone || "—"}</small>
      </div>

      <div className="person-meta">
        {type === "user" ? (
          <>
            <span>{Number(person.orders || 0)} orders</span>
            <small>Joined {person.joined || "—"}</small>
          </>
        ) : (
          <>
            <span>{person.status || "—"}</span>
            <small>{Number(person.deliveries || 0)} deliveries</small>
          </>
        )}
      </div>

      {type === "rider" ? (
        <button type="button" className="row-action" onClick={onAssign}>
          Assign Order
        </button>
      ) : (
        <button type="button" className="row-action" onClick={onView}>
          View Profile
        </button>
      )}
    </div>
  );
}

function OrderRow({ order, onStatusChange }) {
  const isDelivered = order.status === "Delivered";
  const isCancelled = order.status === "Cancelled";
  const isInDelivery = order.status === "Out for Delivery";

  const isFinalStatus = isDelivered || isCancelled;

  return (
    <div className="order-row">
      <div>
        <b>{order.id}</b>
        <span>{order.customer}</span>
      </div>

      <div>
        <b>{order.bouquet}</b>
        <span>{order.total}</span>
      </div>

      <div className="order-date">
        <b>{order.date}</b>
        <span>Order date</span>
      </div>

      <select
        value={order.status}
        disabled={isFinalStatus}
        onChange={(event) => onStatusChange(order.orderId, event.target.value)}
      >
        <option value="Pending" disabled={isInDelivery}>
          Pending
        </option>

        <option value="Out for Delivery">Out for Delivery</option>

        <option value="Delivered">Delivered</option>

        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );
}

function InventoryRow({ flower, onAdjust }) {
  const stock = Number(flower.stock || 0);

  let stockClass = "";

  if (stock === 0) {
    stockClass = "stock-none";
  } else if (stock <= 10) {
    stockClass = "stock-low";
  }

  const stockLabel =
    stock === 0 ? "No stock" : stock <= 10 ? "Low stock" : "In stock";

  return (
    <div className="inventory-row">
      <div className="flower-swatch">
        <span>✿</span>
      </div>

      <div>
        <strong>{flower.name}</strong>

        <span>{flower.category || "Flower"}</span>
      </div>

      <b className={stockClass}>
        {stock}

        <small>{stockLabel}</small>
      </b>

      <b>{flower.price || "—"}</b>

      <div className="stock-controls">
        <button
          type="button"
          onClick={() => onAdjust(flower, "decrease")}
          aria-label={`Decrease ${flower.name} stock`}
        >
          −
        </button>

        <button
          type="button"
          onClick={() => onAdjust(flower, "increase")}
          aria-label={`Increase ${flower.name} stock`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Reports({
  orders,
  popularFlowers,
  reportPeriod,
  setReportPeriod,
  reportRevenue,
  reportCompletedOrders,
  reportPendingOrders,
  reportCancelledOrders,
  completionPercentage,
}) {
  const totalOrders = orders.length;

  return (
    <div className="reports-content">
      <div className="report-heading">
        <div>
          <p className="admin-kicker">Performance</p>

          <h2>Reports & Analytics</h2>
        </div>

        <button
          type="button"
          className="export-button"
          onClick={() => {
            window.print();
          }}
        >
          Export Report
        </button>
      </div>

      <div className="reports-filter">
        <div>
          <p className="reports-filter-label">REPORT PERIOD</p>

          <h3>{getPeriodLabel(reportPeriod)}</h3>
        </div>

        <div className="reports-filter-buttons">
          <button
            type="button"
            className={reportPeriod === "week" ? "active" : ""}
            onClick={() => setReportPeriod("week")}
          >
            Week
          </button>

          <button
            type="button"
            className={reportPeriod === "month" ? "active" : ""}
            onClick={() => setReportPeriod("month")}
          >
            Month
          </button>

          <button
            type="button"
            className={reportPeriod === "year" ? "active" : ""}
            onClick={() => setReportPeriod("year")}
          >
            Year
          </button>
        </div>
      </div>

      <div className="report-grid">
        <section className="admin-card chart-card">
          <h3>Order Completion</h3>

          <div
            className="donut-chart"
            style={{
              background: `conic-gradient(
                #149e47 0 ${completionPercentage}%,
                #ef5263 ${completionPercentage}% 100%
              )`,
            }}
          >
            <span>
              {completionPercentage}%<small>completed</small>
            </span>
          </div>

          <div className="legend">
            <span>
              <i className="legend-green"></i>
              Completed
            </span>

            <span>
              <i className="legend-pink"></i>
              Remaining
            </span>
          </div>
        </section>

        <section className="admin-card report-metrics">
          <h3>{getPeriodLabel(reportPeriod)} Summary</h3>

          <p>
            <span>Total Orders</span>
            <b>{totalOrders}</b>
          </p>

          <p>
            <span>Revenue</span>
            <b>{formatCurrency(reportRevenue)}</b>
          </p>

          <p>
            <span>Completed</span>
            <b>{reportCompletedOrders}</b>
          </p>

          <p>
            <span>Pending / Out for Delivery</span>
            <b>{reportPendingOrders}</b>
          </p>

          <p>
            <span>Cancelled</span>
            <b>{reportCancelledOrders}</b>
          </p>

          <hr />

          <p>
            <span>Report Period</span>
            <b>{getPeriodLabel(reportPeriod)}</b>
          </p>
        </section>

        <section className="admin-card">
          <div className="card-title">
            <h3>Most Selling Flowers</h3>

            <span
              style={{
                color: "#9b7882",
                fontSize: "11px",
              }}
            >
              All-time inventory sales
            </span>
          </div>

          {popularFlowers.length === 0 ? (
            <p>No flower sales data available.</p>
          ) : (
            popularFlowers.map((flower, index) => (
              <div className="mini-order" key={flower.flower_id || index}>
                <strong>
                  {index + 1}. {flower.name}
                </strong>

                <span>Amount sold</span>

                <b>{flower.amount_sold}</b>
              </div>
            ))
          )}
        </section>

        <section className="admin-card report-metrics">
          <h3>Sales Information</h3>

          <p>
            <span>Selected Period</span>
            <b>{getPeriodLabel(reportPeriod)}</b>
          </p>

          <p>
            <span>Orders</span>
            <b>{totalOrders}</b>
          </p>

          <p>
            <span>Revenue</span>
            <b>{formatCurrency(reportRevenue)}</b>
          </p>

          <hr />

          <p>
            <span>Completed Orders</span>
            <b>{reportCompletedOrders}</b>
          </p>

          <p>
            <span>Pending / Out for Delivery</span>
            <b>{reportPendingOrders}</b>
          </p>

          <p>
            <span>Cancelled Orders</span>
            <b>{reportCancelledOrders}</b>
          </p>
        </section>
      </div>
    </div>
  );
}

function AssignmentModal({
  rider,
  orders,
  selectedOrderId,
  setSelectedOrderId,
  onAssign,
  onClose,
  assigning,
}) {
  const pendingOrders = orders.filter((order) => order.status === "Pending");

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: "520px",
        }}
      >
        <button
          type="button"
          className="close-panel"
          onClick={onClose}
          aria-label="Close assign order"
          disabled={assigning}
        >
          ×
        </button>

        <div className="large-avatar">{getInitials(rider.name)}</div>

        <h2>Assign Order</h2>

        <p className="profile-role">
          Assign an order to {rider.name || "this delivery rider"}
        </p>

        <div
          style={{
            marginTop: "20px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#faf4f6",
            border: "1px solid #eadcdf",
          }}
        >
          <strong style={{ color: "#3b0518" }}>Delivery Rider</strong>

          <p
            style={{
              margin: "4px 0 0",
              color: "#7c3048",
              fontSize: "13px",
            }}
          >
            {rider.email || "—"}
          </p>
        </div>

        <label
          htmlFor="assign-order"
          style={{
            display: "block",
            marginTop: "22px",
            marginBottom: "8px",
            color: "#3b0518",
            fontWeight: 700,
          }}
        >
          Select Pending Order
        </label>

        <select
          id="assign-order"
          value={selectedOrderId}
          onChange={(event) => setSelectedOrderId(event.target.value)}
          disabled={assigning || pendingOrders.length === 0}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #eadcdf",
            borderRadius: "12px",
            background: "#fff",
            color: "#3b0518",
            font: "inherit",
          }}
        >
          <option value="">
            {pendingOrders.length === 0
              ? "No pending orders available"
              : "Select an order"}
          </option>

          {pendingOrders.map((order) => (
            <option key={order.orderId} value={order.orderId}>
              {order.id || `#${order.orderId}`} —{" "}
              {order.customer || "Unknown Customer"} —{" "}
              {order.bouquet || "Order"} — {order.total || "—"}
            </option>
          ))}
        </select>

        <p
          style={{
            margin: "10px 0 0",
            color: "#935466",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          You can assign multiple orders to the same delivery rider. Assign
          another order after this one is saved.
        </p>

        <button
          type="button"
          className="panel-button"
          onClick={onAssign}
          disabled={assigning || !selectedOrderId}
          style={{
            width: "100%",
            marginTop: "20px",
            opacity: assigning || !selectedOrderId ? 0.6 : 1,
          }}
        >
          {assigning ? "Assigning Order..." : "Assign Order"}
        </button>

        <button
          type="button"
          className="panel-button stock-cancel-button"
          onClick={onClose}
          disabled={assigning}
          style={{
            width: "100%",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AssignmentSuccessModal({ assignment, onClose }) {
  return (
    <div
      className="profile-overlay assignment-success-overlay"
      onClick={onClose}
    >
      <div
        className="profile-panel assignment-success-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-panel"
          onClick={onClose}
          aria-label="Close assignment success modal"
        >
          ×
        </button>

        <div className="assignment-success-icon">✓</div>

        <h2>Order Assigned Successfully</h2>

        <p className="profile-role">
          The order has been successfully assigned to the delivery rider.
        </p>

        <div className="assignment-success-details">
          <div>
            <span>Order</span>
            <strong>{assignment.orderId}</strong>
          </div>

          <div>
            <span>Customer</span>
            <strong>{assignment.customer}</strong>
          </div>

          <div>
            <span>Delivery Rider</span>
            <strong>{assignment.riderName}</strong>
          </div>
        </div>

        <button
          type="button"
          className="panel-button assignment-success-button"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function AssignmentErrorModal({ assignment, onClose }) {
  return (
    <div className="profile-overlay assignment-error-overlay" onClick={onClose}>
      <div
        className="profile-panel assignment-error-modal"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="assignment-error-title"
      >
        <button
          type="button"
          className="close-panel"
          onClick={onClose}
          aria-label="Close assignment warning"
        >
          ×
        </button>

        <div className="assignment-error-icon">!</div>

        <h2 id="assignment-error-title">{assignment.title}</h2>

        <p className="profile-role">{assignment.message}</p>

        <div className="assignment-error-details">
          <div>
            <span>Order</span>
            <strong>{assignment.orderId}</strong>
          </div>
          <div>
            <span>Customer</span>
            <strong>{assignment.customer}</strong>
          </div>
          <div>
            <span>Selected Rider</span>
            <strong>{assignment.riderName}</strong>
          </div>
        </div>

        <button
          type="button"
          className="panel-button assignment-error-button"
          onClick={onClose}
        >
          Okay
        </button>
      </div>
    </div>
  );
}

function ProfilePanel({ person, onClose }) {
  const isRider =
    person.status !== undefined || person.deliveries !== undefined;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-panel"
          onClick={onClose}
          aria-label="Close profile"
        >
          ×
        </button>

        <div className="large-avatar">{getInitials(person.name)}</div>

        <h2>{person.name || "Unknown"}</h2>

        <p className="profile-role">
          {isRider ? "Delivery Rider" : "Customer"}
        </p>

        <dl>
          <div>
            <dt>Email</dt>
            <dd>{person.email || "—"}</dd>
          </div>

          <div>
            <dt>Phone</dt>
            <dd>{person.phone || person.contact_number || "—"}</dd>
          </div>

          {isRider ? (
            <>
              <div>
                <dt>Status</dt>
                <dd>{person.status || "—"}</dd>
              </div>

              <div>
                <dt>Deliveries</dt>
                <dd>{person.deliveries || 0}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Orders</dt>
                <dd>{person.orders || 0}</dd>
              </div>

              <div>
                <dt>Joined</dt>
                <dd>{person.joined || "—"}</dd>
              </div>
            </>
          )}
        </dl>

        <button type="button" className="panel-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div
      style={{
        padding: "30px 20px",
        textAlign: "center",
        color: "#9a858b",
        fontSize: "12px",
      }}
    >
      {message}
    </div>
  );
}

export default AdminDashboard;

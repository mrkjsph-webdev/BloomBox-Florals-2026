import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Map from "../Map/Map";
import { getRoute, getShopLocation } from "../Services/routeAPI";
import { geocodeAddress } from "../Services/geoAPI";
import "./delivery-rider.css";

const GET_DELIVERY_RIDER_URL =
  "http://localhost/bbf_shippingdb/get_current_delivery_rider.php";

const GET_DELIVERY_DASHBOARD_URL =
  "http://localhost/bbf_shippingdb/get_delivery_dashboard.php";

const UPDATE_DELIVERY_STATUS_URL =
  "http://localhost/bbf_shippingdb/update_delivery_status.php";

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

function getCustomerInitials(name) {
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

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCurrentShift() {
  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const morningStart = 8 * 60;
  const morningEnd = 12 * 60;

  const afternoonStart = 13 * 60;
  const afternoonEnd = 17 * 60;

  const eveningStart = 17 * 60;
  const eveningEnd = 21 * 60;

  if (currentMinutes >= morningStart && currentMinutes < morningEnd) {
    return {
      name: "Morning Shift",
      time: "8:00 AM – 12:00 PM",
      active: true,
      endMinutes: morningEnd,
    };
  }

  if (currentMinutes >= afternoonStart && currentMinutes < afternoonEnd) {
    return {
      name: "Afternoon Shift",
      time: "1:00 PM – 5:00 PM",
      active: true,
      endMinutes: afternoonEnd,
    };
  }

  if (currentMinutes >= eveningStart && currentMinutes < eveningEnd) {
    return {
      name: "Evening Shift",
      time: "5:00 PM – 9:00 PM",
      active: true,
      endMinutes: eveningEnd,
    };
  }

  return {
    name: "Off Shift",
    time: "No active shift",
    active: false,
    endMinutes: null,
  };
}

function getTimeRemaining(endMinutes) {
  if (endMinutes === null) {
    return "No active shift";
  }

  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const remainingMinutes = Math.max(0, endMinutes - currentMinutes);

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${
      minutes
    } minute${minutes !== 1 ? "s" : ""} left`;
  }

  return `${minutes} minute${minutes !== 1 ? "s" : ""} left`;
}

function getDeliveryStatusLabel(status) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "Ready for pickup";

    case "picked_up":
      return "Picked up";

    case "in_transit":
      return "Out for delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "Pending";
  }
}

function getDeliveryStatusClass(status) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "next";

    case "picked_up":
      return "next";

    case "in_transit":
      return "next";

    case "delivered":
      return "completed";

    case "cancelled":
      return "cancelled";

    default:
      return "";
  }
}

function getNextActionLabel(status) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "Start delivery";

    case "picked_up":
      return "Start delivery";

    case "in_transit":
      return "Mark as delivered";

    case "delivered":
      return "Delivery complete";

    case "cancelled":
      return "Delivery cancelled";

    default:
      return "Start delivery";
  }
}

function getNextDeliveryStatus(status) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "picked_up";

    case "picked_up":
      return "in_transit";

    case "in_transit":
      return "delivered";

    default:
      return status;
  }
}

function DeliveryRider() {
  const navigate = useNavigate();

  const [rider, setRider] = useState(null);
  const [riderLoading, setRiderLoading] = useState(true);
  const [riderError, setRiderError] = useState("");

  const [deliveries, setDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);

  const [stats, setStats] = useState({
    deliveriesToday: 0,
    yesterdayDeliveries: 0,
    completionRate: 0,
    todayEarnings: 0,
    bonus: 0,
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [mapShop, setMapShop] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);
  const [mapRoute, setMapRoute] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    loadDeliveryRider();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rider?.rider_id) {
      loadDeliveryDashboard(rider.rider_id);
    }
  }, [rider?.rider_id]);

  async function loadDeliveryRider() {
    try {
      setRiderLoading(true);
      setRiderError("");

      const storedRider = localStorage.getItem("rider");

      if (!storedRider) {
        navigate("/login");
        return;
      }

      let parsedRider;

      try {
        parsedRider = JSON.parse(storedRider);
      } catch (error) {
        console.error("Invalid stored rider data:", error);

        localStorage.removeItem("rider");
        navigate("/login");
        return;
      }

      const riderId = Number(parsedRider?.rider_id);

      if (!riderId) {
        setRider(parsedRider);
        setRiderError("Delivery rider information is unavailable.");
        return;
      }

      const response = await fetch(GET_DELIVERY_RIDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rider_id: riderId,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid get delivery rider response:", responseText);

        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load delivery rider information.",
        );
      }

      setRider(data.rider);

      localStorage.setItem("rider", JSON.stringify(data.rider));
    } catch (error) {
      console.error("Failed to load delivery rider:", error);

      setRiderError(
        error.message || "Unable to connect to the delivery rider database.",
      );
    } finally {
      setRiderLoading(false);
    }
  }

  async function loadDeliveryDashboard(riderId) {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await fetch(GET_DELIVERY_DASHBOARD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rider_id: Number(riderId),
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid delivery dashboard response:", responseText);

        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load delivery dashboard.");
      }

      const normalizeDelivery = (delivery) => ({
        ...delivery,

        id: Number(delivery.id ?? delivery.delivery_id ?? delivery.order_id),

        delivery_id: Number(delivery.delivery_id ?? delivery.id),

        order_id: Number(delivery.order_id),

        unit_price: Number(
          delivery.unit_price ?? delivery.order_unit_price ?? 0,
        ),

        customer:
          delivery.customer || delivery.customer_name || "Unknown Customer",

        address:
          delivery.address ||
          delivery.destination_address ||
          "Delivery address unavailable",

        items: delivery.items || delivery.order_items || "No items listed",

        customer_phone: delivery.customer_phone || delivery.phone || "",

        pickupLocation: delivery.pickupLocation || {
          displayName: delivery.pickup_address || "BloomBox Florals",
          latitude: delivery.pickup_latitude,
          longitude: delivery.pickup_longitude,
        },

        destination: delivery.destination || {
          displayName:
            delivery.destination_address ||
            delivery.address ||
            "Delivery address unavailable",
          latitude: delivery.destination_latitude,
          longitude: delivery.destination_longitude,
        },

        delivery_status:
          delivery.delivery_status || delivery.status || "pending",
      });

      const activeDeliveries = (data.deliveries || []).map(normalizeDelivery);

      const completedDeliveriesData = (data.completed_deliveries || []).map(
        normalizeDelivery,
      );

      setDeliveries(activeDeliveries);

      setCompletedDeliveries(completedDeliveriesData);

      setStats({
        deliveriesToday: Number(data.stats?.deliveries_today) || 0,

        yesterdayDeliveries: Number(data.stats?.yesterday_deliveries) || 0,

        completionRate: Number(data.stats?.completion_rate) || 0,

        todayEarnings: Number(data.stats?.today_earnings) || 0,

        bonus: Number(data.stats?.bonus) || 0,
      });

      if (activeDeliveries.length > 0) {
        setSelectedId((currentId) => {
          const stillExists = activeDeliveries.some(
            (delivery) => delivery.id === currentId,
          );

          return stillExists ? currentId : activeDeliveries[0].id;
        });
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to load delivery dashboard:", error);

      setDashboardError(
        error.message || "Unable to connect to the delivery database.",
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  const selectedDelivery = useMemo(() => {
    if (!deliveries.length) {
      return null;
    }

    return (
      deliveries.find((delivery) => delivery.id === selectedId) || deliveries[0]
    );
  }, [deliveries, selectedId]);

  /*
   * Today's earnings are based on the unit_price
   * of the completed orders returned by the dashboard.
   */
  const todayEarnings = useMemo(() => {
    return completedDeliveries.reduce(
      (total, delivery) => total + Number(delivery.unit_price || 0),
      0,
    );
  }, [completedDeliveries]);

  const currentShift = useMemo(() => getCurrentShift(), [currentTime]);

  const shiftTimeRemaining = useMemo(
    () => getTimeRemaining(currentShift.endMinutes),
    [currentShift, currentTime],
  );

  useEffect(() => {
    if (!selectedDelivery?.address) {
      setMapShop(null);
      setMapDestination(null);
      setMapRoute([]);
      setMapLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDeliveryMap() {
      try {
        setMapLoading(true);

        const storeLocation = await getShopLocation();

        if (cancelled) {
          return;
        }

        setMapShop(storeLocation);

        const destinationLocation = await geocodeAddress(
          selectedDelivery.address,
        );

        if (cancelled) {
          return;
        }

        setMapDestination(destinationLocation);

        const routeData = await getRoute(storeLocation, destinationLocation);

        if (cancelled) {
          return;
        }

        const routeCoordinates =
          routeData?.geometry?.coordinates?.map(([longitude, latitude]) => [
            latitude,
            longitude,
          ]) || [];

        setMapRoute(routeCoordinates);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load delivery map:", error);

          setMapShop(null);
          setMapDestination(null);
          setMapRoute([]);
        }
      } finally {
        if (!cancelled) {
          setMapLoading(false);
        }
      }
    }

    loadDeliveryMap();

    return () => {
      cancelled = true;
    };
  }, [selectedDelivery]);

  const route = mapRoute;

  async function handleDeliveryAction() {
    if (!selectedDelivery || updatingStatus) {
      return;
    }

    const currentStatus = String(
      selectedDelivery.delivery_status || "",
    ).toLowerCase();

    const nextStatus = getNextDeliveryStatus(currentStatus);

    if (
      nextStatus === currentStatus ||
      currentStatus === "delivered" ||
      currentStatus === "cancelled"
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const response = await fetch(UPDATE_DELIVERY_STATUS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delivery_id: Number(selectedDelivery.delivery_id),

          rider_id: Number(rider?.rider_id),

          order_id: Number(selectedDelivery.order_id),

          delivery_status: nextStatus,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid update delivery response:", responseText);

        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update delivery status.");
      }

      await loadDeliveryDashboard(rider.rider_id);
    } catch (error) {
      console.error("Failed to update delivery status:", error);

      setDashboardError(error.message || "Unable to update delivery status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleLogout() {
    sessionStorage.clear();

    localStorage.removeItem("rider");
    localStorage.removeItem("client");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/");
  }

  const riderName = rider?.name || "Delivery Rider";

  const riderInitials = getInitials(riderName);

  const deliveriesToday = stats.deliveriesToday;

  const completionRate = stats.completionRate;

  const bonus = stats.bonus;

  return (
    <main className="rider-page">
      <aside className="rider-sidebar">
        <Link to="/" className="rider-brand">
          BloomBox <span>Florals</span>
        </Link>

        <div className="rider-profile">
          <div className="rider-avatar" aria-hidden="true">
            {riderInitials}
          </div>

          <div>
            <strong>{riderName}</strong>
            <span>Delivery rider</span>
          </div>
        </div>

        <nav className="rider-nav" aria-label="Rider navigation">
          <a className="rider-nav-link active" href="#overview">
            Overview
          </a>

          <a className="rider-nav-link" href="#deliveries">
            My deliveries <span>{deliveriesToday}</span>
          </a>

          <a className="rider-nav-link" href="#earnings">
            Earnings
          </a>

          <a className="rider-nav-link" href="#help">
            Help center
          </a>
        </nav>

        <div className="rider-sidebar-footer">
          <div className="rider-shift-card">
            <span className="rider-eyebrow">Today&apos;s shift</span>

            <strong>{currentShift.time}</strong>

            <span>{shiftTimeRemaining}</span>
          </div>

          <button type="button" className="rider-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <section className="rider-content" id="overview">
        <header className="rider-header">
          <div>
            <p className="rider-eyebrow">{formatDate(currentTime)}</p>

            <h1>Good morning, {riderName}.</h1>

            <p className="rider-subtitle">
              Here&apos;s your delivery route for today.
            </p>

            {riderError && (
              <p
                style={{
                  marginTop: "8px",
                  color: "#b42332",
                  fontSize: "12px",
                }}
              >
                {riderError}
              </p>
            )}

            {dashboardError && (
              <p
                style={{
                  marginTop: "8px",
                  color: "#b42332",
                  fontSize: "12px",
                }}
              >
                {dashboardError}
              </p>
            )}
          </div>

          <button
            type="button"
            className={`rider-online-toggle ${isOnline ? "online" : ""}`}
            onClick={() => setIsOnline((online) => !online)}
            aria-pressed={isOnline}
            disabled={riderLoading}
          >
            <span className="status-dot" />

            {isOnline ? "You're online" : "Go online"}
          </button>
        </header>

        <section className="rider-stats" aria-label="Today's performance">
          <article className="rider-stat-card">
            <span className="stat-icon peach">↗</span>

            <div>
              <span>Deliveries today</span>

              <strong>{dashboardLoading ? "—" : deliveriesToday}</strong>

              <small>
                {stats.yesterdayDeliveries > 0
                  ? `${
                      deliveriesToday - stats.yesterdayDeliveries >= 0
                        ? "+"
                        : ""
                    }${
                      deliveriesToday - stats.yesterdayDeliveries
                    } from yesterday`
                  : "No deliveries yesterday"}
              </small>
            </div>
          </article>

          <article className="rider-stat-card">
            <span className="stat-icon green">✓</span>

            <div>
              <span>Completion rate</span>

              <strong>{dashboardLoading ? "—" : `${completionRate}%`}</strong>

              <small>Based on your completed deliveries</small>
            </div>
          </article>

          <article className="rider-stat-card" id="earnings">
            <span className="stat-icon gold">₱</span>

            <div>
              <span>Today&apos;s earnings</span>

              <strong>
                {dashboardLoading ? "—" : `₱${todayEarnings.toFixed(2)}`}
              </strong>

              <small>
                {bonus > 0
                  ? `₱${bonus.toFixed(2)} bonus included`
                  : "No bonus today"}
              </small>
            </div>
          </article>
        </section>

        <section className="rider-dashboard-grid">
          <article className="rider-card route-card">
            <div className="rider-card-heading">
              <div>
                <span className="rider-eyebrow">Live route</span>

                <h2>Where you&apos;re headed</h2>
              </div>

              <span className="route-badge">
                <span className="status-dot" />
                Live
              </span>
            </div>

            {selectedDelivery ? (
              <>
                <div className="rider-map">
                  {mapLoading ? (
                    <div
                      style={{
                        minHeight: "260px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <strong>Locating delivery address...</strong>

                        <p
                          style={{
                            marginTop: "8px",
                          }}
                        >
                          Please wait while the route is being loaded.
                        </p>
                      </div>
                    </div>
                  ) : mapShop && mapDestination && route.length > 1 ? (
                    <Map
                      shop={mapShop}
                      destination={mapDestination}
                      route={route}
                    />
                  ) : (
                    <div
                      style={{
                        minHeight: "260px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <strong>Delivery location</strong>

                        <p
                          style={{
                            marginTop: "8px",
                          }}
                        >
                          {selectedDelivery.address}
                        </p>

                        <small>
                          Map coordinates are not available for this delivery
                          yet.
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="route-summary">
                  <div className="route-point">
                    <span className="route-marker hub">●</span>

                    <div>
                      <small>Pickup</small>

                      <strong>
                        {selectedDelivery.pickupLocation?.displayName ||
                          "BloomBox dispatch hub"}
                      </strong>
                    </div>
                  </div>

                  <span className="route-line" />

                  <div className="route-point">
                    <span className="route-marker destination">●</span>

                    <div>
                      <small>
                        Next stop
                        {selectedDelivery.eta
                          ? ` · ${selectedDelivery.eta}`
                          : ""}
                      </small>

                      <strong>
                        {selectedDelivery.address ||
                          "Delivery address unavailable"}
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-deliveries">
                <strong>No active deliveries</strong>

                <span>You currently have no assigned deliveries.</span>
              </div>
            )}
          </article>

          <article className="rider-card active-delivery-card">
            <div className="rider-card-heading">
              <div>
                <span className="rider-eyebrow">Next delivery</span>

                <h2>{selectedDelivery?.id || "No delivery"}</h2>
              </div>

              {selectedDelivery && (
                <span className="delivery-status">
                  {getDeliveryStatusLabel(selectedDelivery.delivery_status)}
                </span>
              )}
            </div>

            {selectedDelivery ? (
              <>
                <div className="customer-intro">
                  <div className="customer-avatar">
                    {getCustomerInitials(selectedDelivery.customer)}
                  </div>

                  <div>
                    <strong>{selectedDelivery.customer}</strong>

                    <span>
                      {selectedDelivery.items || "No items listed"}
                      {selectedDelivery.distance
                        ? ` · ${selectedDelivery.distance}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="delivery-address">
                  <span className="address-icon">⌖</span>

                  <div>
                    <small>Deliver to</small>

                    <strong>
                      {selectedDelivery.address ||
                        "Delivery address unavailable"}
                    </strong>
                  </div>
                </div>

                <div className="delivery-notes">
                  <span>ⓘ</span>

                  <p>
                    Leave the flowers with the recipient. Please call if you
                    need help finding the entrance.
                  </p>
                </div>

                <button
                  type="button"
                  className="rider-primary-button"
                  onClick={handleDeliveryAction}
                  disabled={
                    updatingStatus ||
                    selectedDelivery.delivery_status === "delivered" ||
                    selectedDelivery.delivery_status === "cancelled"
                  }
                >
                  {updatingStatus
                    ? "Updating..."
                    : getNextActionLabel(selectedDelivery.delivery_status)}
                </button>

                <button
                  type="button"
                  className="rider-secondary-button"
                  disabled={!selectedDelivery.customer_phone}
                  onClick={() => {
                    if (selectedDelivery.customer_phone) {
                      window.location.href = `tel:${selectedDelivery.customer_phone}`;
                    }
                  }}
                >
                  Call customer
                </button>
              </>
            ) : (
              <div className="empty-deliveries">
                <strong>No delivery selected</strong>

                <span>Your assigned deliveries will appear here.</span>
              </div>
            )}
          </article>
        </section>

        <section className="rider-card deliveries-card" id="deliveries">
          <div className="rider-card-heading deliveries-heading">
            <div>
              <span className="rider-eyebrow">Your route</span>

              <h2>Today&apos;s deliveries</h2>
            </div>

            <div
              className="delivery-tabs"
              role="tablist"
              aria-label="Delivery history"
            >
              <button
                type="button"
                className={activeTab === "today" ? "selected" : ""}
                onClick={() => setActiveTab("today")}
              >
                Today <span>{deliveries.length}</span>
              </button>

              <button
                type="button"
                className={activeTab === "completed" ? "selected" : ""}
                onClick={() => setActiveTab("completed")}
              >
                Completed <span>{completedDeliveries.length}</span>
              </button>
            </div>
          </div>

          {activeTab === "today" ? (
            dashboardLoading ? (
              <div className="empty-deliveries">
                <strong>Loading deliveries...</strong>

                <span>Retrieving your assigned deliveries.</span>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="empty-deliveries">
                <strong>No deliveries today</strong>

                <span>
                  You currently have no active deliveries assigned to you.
                </span>
              </div>
            ) : (
              <div className="delivery-list">
                {deliveries.map((delivery, index) => (
                  <button
                    type="button"
                    className={`delivery-row ${
                      selectedId === delivery.id ? "selected" : ""
                    }`}
                    key={delivery.delivery_id || delivery.id}
                    onClick={() => setSelectedId(delivery.id)}
                  >
                    <span
                      className={`delivery-number ${
                        index === 0 ? "current" : ""
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="delivery-row-main">
                      <strong>{delivery.customer}</strong>

                      <span>{delivery.address}</span>
                    </span>

                    <span className="delivery-row-time">
                      <strong>{delivery.eta || "—"}</strong>

                      <span>{delivery.distance || "—"}</span>
                    </span>

                    <span
                      className={`delivery-row-status ${getDeliveryStatusClass(
                        delivery.delivery_status,
                      )}`}
                    >
                      {getDeliveryStatusLabel(delivery.delivery_status)}
                    </span>

                    <span className="delivery-arrow">→</span>
                  </button>
                ))}
              </div>
            )
          ) : completedDeliveries.length === 0 ? (
            <div className="empty-deliveries">
              <strong>No completed deliveries yet</strong>

              <span>Completed deliveries will appear here.</span>
            </div>
          ) : (
            <div className="delivery-list">
              {completedDeliveries.map((delivery, index) => (
                <button
                  type="button"
                  className={`delivery-row ${
                    selectedId === delivery.id ? "selected" : ""
                  }`}
                  key={delivery.delivery_id || delivery.id}
                  onClick={() => {
                    setSelectedId(delivery.id);
                    setActiveTab("today");
                  }}
                >
                  <span className="delivery-number completed">{index + 1}</span>

                  <span className="delivery-row-main">
                    <strong>{delivery.customer}</strong>

                    <span>{delivery.address}</span>
                  </span>

                  <span className="delivery-row-time">
                    <strong>
                      {delivery.delivered_at
                        ? formatTime(new Date(delivery.delivered_at))
                        : "Delivered"}
                    </strong>

                    <span>{delivery.distance || "—"}</span>
                  </span>

                  <span className="delivery-row-status completed">
                    Delivered
                  </span>

                  <span className="delivery-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default DeliveryRider;

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Contact from "../LandingPage/Contact";
import Map from "../Map/Map";

import { getRoute, getShopLocation } from "../Services/routeAPI";
import { geocodeAddress } from "../Services/geoAPI";

import "./order-details.css";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shop, setShop] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

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

    fetchOrderDetails(client.client_id, orderId);
  }, [navigate, orderId]);

  async function fetchOrderDetails(clientId, currentOrderId) {
    try {
      setLoading(true);
      setError("");

      const numericOrderId = Number(currentOrderId);

      if (!numericOrderId || numericOrderId <= 0) {
        setError("Invalid order ID.");
        setOrder(null);
        return;
      }

      const response = await fetch(
        "http://localhost/bbf_clientdb/get_order_details.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Number(clientId),
            order_id: numericOrderId,
          }),
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Invalid JSON returned by get_order_details.php:",
          responseText,
        );

        setError("The server returned an invalid response.");
        setOrder(null);

        return;
      }

      if (!response.ok) {
        console.error("Server returned an error:", data);

        setError(data.message || `Server error (${response.status}).`);

        setOrder(null);

        return;
      }

      if (!data.success) {
        setError(data.message || "Order not found.");
        setOrder(null);

        return;
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Failed to fetch order details:", error);

      setError(
        "Unable to connect to the server. Make sure Apache and MySQL are running in XAMPP.",
      );

      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!order || !order.address) {
      setMapLoading(false);
      return;
    }

    async function loadDeliveryMap() {
      try {
        setMapLoading(true);

        const destinationLocation = await geocodeAddress(order.address);

        setDestination(destinationLocation);

        const storeLocation = await getShopLocation();

        setShop(storeLocation);

        const routeData = await getRoute(storeLocation, destinationLocation);

        const routeCoordinates = routeData.geometry.coordinates.map(
          ([longitude, latitude]) => [latitude, longitude],
        );

        setRoute(routeCoordinates);
      } catch (error) {
        console.error("Failed to locate delivery address:", error);

        setShop(null);
        setDestination(null);
        setRoute([]);
      } finally {
        setMapLoading(false);
      }
    }

    loadDeliveryMap();
  }, [order]);

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

    switch (String(status).trim().toLowerCase()) {
      case "pending":
        return "Pending";

      case "out for delivery":
        return "Out for Delivery";

      case "in delivery":
        return "In Delivery";

      case "completed":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return "Pending";
    }
  }

  function getStatusStep(status) {
    if (!status) {
      return 0;
    }

    switch (String(status).trim().toLowerCase()) {
      case "pending":
        return 0;

      case "out for delivery":
        return 1;

      case "in delivery":
        return 1;

      case "completed":
        return 2;

      case "cancelled":
        return -1;

      default:
        return 0;
    }
  }

  function getAddressLines(address) {
    if (!address) {
      return ["No delivery address saved."];
    }

    return address
      .split(",")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function getPaymentMethod() {
    const payment = order?.payment_method;

    if (!payment) {
      return "No payment method found";
    }

    if (typeof payment === "string") {
      return payment;
    }

    if (payment.payment_type === "cash") {
      return "Cash on Delivery";
    }

    if (payment.payment_type === "gcash") {
      if (payment.gcash_last_four) {
        return `GCash •••• ${payment.gcash_last_four}`;
      }

      return "GCash";
    }

    return payment.payment_type || "No payment method found";
  }

  function getCustomization(item) {
    if (!item?.customization) {
      return {};
    }

    if (typeof item.customization === "object") {
      return item.customization;
    }

    if (typeof item.customization === "string") {
      try {
        const parsed = JSON.parse(item.customization);

        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (error) {
        console.error("Failed to parse item customization:", error);
      }
    }

    return {};
  }

  function getDisplayValue(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    if (typeof value === "object") {
      return value?.name || value?.label || value?.title || value?.value || "";
    }

    return "";
  }

  function getItemName(item) {
    const customization = getCustomization(item);

    return (
      item?.item_name ||
      item?.name ||
      item?.bouquet_name ||
      item?.template_name ||
      item?.bouquetName ||
      customization?.name ||
      customization?.bouquet_name ||
      customization?.template_name ||
      customization?.bouquetName ||
      customization?.template?.name ||
      "BloomBox Bouquet"
    );
  }

  function getItemImage(item) {
    const customization = getCustomization(item);

    return (
      item?.image ||
      item?.image_url ||
      item?.flower_image ||
      item?.bouquet_image ||
      customization?.image ||
      customization?.image_url ||
      customization?.bouquet_image ||
      null
    );
  }

  function getItemQuantity(item) {
    const quantity = Number(item?.quantity || 1);

    return quantity > 0 ? quantity : 1;
  }

  function getItemUnitPrice(item) {
    const price = Number(item?.unit_price || 0);

    return Number.isFinite(price) ? price : 0;
  }

  function getItemCustomizationDetails(item) {
    const customization = getCustomization(item);

    const paper =
      item?.paper ||
      item?.paperSize ||
      customization?.paper ||
      customization?.paper_size ||
      customization?.paperSize ||
      customization?.selectedPaper ||
      customization?.paper_name ||
      null;

    const wrapper =
      item?.wrapper ||
      item?.wrapperType ||
      customization?.wrapper ||
      customization?.wrapper_type ||
      customization?.wrapperType ||
      customization?.selectedWrapper ||
      customization?.wrapper_name ||
      null;

    const flowers = Array.isArray(item?.flowers)
      ? item.flowers
      : Array.isArray(customization?.flowers)
        ? customization.flowers
        : [];

    const extras = Array.isArray(item?.extras)
      ? item.extras
      : Array.isArray(customization?.extras)
        ? customization.extras
        : [];

    return {
      paper,
      wrapper,
      flowers,
      extras,
      greetingCard:
        item?.greeting_card ??
        customization?.greeting_card ??
        customization?.greetingCard ??
        false,
      plushToy:
        item?.plush_toy ??
        customization?.plush_toy ??
        customization?.plushToy ??
        false,
    };
  }

  function getFlowerName(flower) {
    return (
      flower?.name || flower?.flower_name || flower?.flowerName || "Flower"
    );
  }

  function getFlowerQuantity(flower) {
    const quantity = Number(flower?.quantity || 1);

    return quantity > 0 ? quantity : 1;
  }

  function getExtraName(extra) {
    if (typeof extra === "string") {
      return extra;
    }

    return (
      extra?.name || extra?.label || extra?.extra_name || extra?.extraName || ""
    );
  }

  function renderOrderItem(item) {
    const customization = getCustomization(item);
    const details = getItemCustomizationDetails(item);

    const itemName = getItemName(item);
    const itemImage = getItemImage(item);
    const quantity = getItemQuantity(item);
    const unitPrice = getItemUnitPrice(item);
    const itemTotal = unitPrice * quantity;

    const paper = getDisplayValue(details.paper);
    const wrapper = getDisplayValue(details.wrapper);

    return (
      <div className="order-item-detail" key={item.item_id}>
        <div className="detail-line">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            {itemImage && (
              <img
                src={itemImage}
                alt={itemName}
                style={{
                  width: "64px",
                  height: "64px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              />
            )}

            <span>
              {itemName}
              <small>× {quantity}</small>
            </span>
          </div>

          <strong>{formatPrice(itemTotal)}</strong>
        </div>

        <div
          className="order-item-customization"
          style={{
            marginTop: "10px",
            paddingLeft: itemImage ? "76px" : "0",
          }}
        >
          {paper && <p>Paper: {paper}</p>}

          {wrapper && <p>Wrapper: {wrapper}</p>}

          {details.flowers.length > 0 && (
            <p>
              Flowers:{" "}
              {details.flowers
                .map(
                  (flower) =>
                    `${getFlowerName(flower)} ×${getFlowerQuantity(flower)}`,
                )
                .join(", ")}
            </p>
          )}

          {details.greetingCard && <p>Greeting Card</p>}

          {details.plushToy && <p>Mini Stuff Toy</p>}

          {details.extras.length > 0 && (
            <p>
              Extras:{" "}
              {details.extras
                .map((extra) => getExtraName(extra))
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {customization?.template &&
            typeof customization.template === "object" &&
            customization.template.name && (
              <p>Template: {customization.template.name}</p>
            )}
        </div>
      </div>
    );
  }

  function handleLogout() {
    sessionStorage.clear();

    localStorage.removeItem("client");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/");
  }

  if (loading) {
    return (
      <main className="order-details-page">
        <header className="order-details-header">
          <Link to="/home" className="order-details-brand">
            BloomBox <span>Florals</span>
          </Link>

          <Link to="/home" className="order-details-dashboard-link">
            Back to dashboard
          </Link>
        </header>

        <section className="order-details-banner">
          <h1>My Account</h1>

          <p>
            <Link to="/home">Home</Link> /<Link to="/orders"> My Orders</Link> /
            <strong> Order Details</strong>
          </p>
        </section>

        <section className="order-details-layout">
          <aside className="order-details-menu" aria-label="Account menu">
            <Link to="/profile">Personal Information</Link>

            <Link className="active" to="/orders">
              My Orders
            </Link>

            <Link to="/address">Address</Link>

            <Link to="/payment-methods">Payment Methods</Link>

            <Link to="/password-manager">Password Manager</Link>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </aside>

          <div className="order-details-panel">
            <div className="missing-order">
              <h2>Loading order...</h2>

              <p>Please wait while we retrieve your order details.</p>
            </div>
          </div>
        </section>

        <div className="order-details-contact">
          <Contact />
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">
      <header className="order-details-header">
        <Link to="/home" className="order-details-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="order-details-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="order-details-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/home">Home</Link> /<Link to="/orders"> My Orders</Link> /
          <strong> Order Details</strong>
        </p>
      </section>

      <section className="order-details-layout">
        <aside className="order-details-menu" aria-label="Account menu">
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

        <div className="order-details-panel">
          {error ? (
            <div className="missing-order">
              <h2>Order not found</h2>

              <p>{error}</p>

              <Link className="back-orders-link" to="/orders">
                Back to My Orders
              </Link>
            </div>
          ) : order ? (
            <>
              <div className="order-details-heading">
                <div>
                  <p className="order-details-eyebrow">
                    Order #{String(order.order_id).padStart(4, "0")}
                  </p>

                  <h2>BloomBox Florals Order</h2>

                  <p>Placed on {formatDate(order.order_date)}</p>
                </div>

                <span
                  className={`order-details-status ${
                    String(order.order_status || "").toLowerCase() ===
                    "completed"
                      ? "delivered"
                      : ""
                  }`}
                >
                  {formatStatus(order.order_status)}
                </span>
              </div>

              {/* DELIVERY PROGRESS */}
              <section className="delivery-progress">
                {["Order Placed", "In Delivery", "Delivered"].map(
                  (step, index) => {
                    const steps = ["Order Placed", "In Delivery", "Delivered"];

                    const currentStep = getStatusStep(order.order_status);

                    const isCancelled =
                      String(order.order_status || "").toLowerCase() ===
                      "cancelled";

                    const isCompleted = !isCancelled && index < currentStep;

                    const isCurrent = !isCancelled && index === currentStep;

                    return (
                      <div
                        className={`progress-step ${
                          isCompleted ? "completed" : ""
                        } ${isCurrent ? "current" : ""}`}
                        key={step}
                      >
                        <div className="progress-circle">
                          {isCompleted ? "✓" : isCurrent ? "●" : ""}
                        </div>

                        <span>{step}</span>

                        {index < steps.length - 1 && (
                          <div
                            className={`progress-line ${
                              !isCancelled && index < currentStep
                                ? "completed"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    );
                  },
                )}
              </section>

              {String(order.order_status || "").toLowerCase() ===
                "cancelled" && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: "#f8eeee",
                    color: "#7a1f1f",
                  }}
                >
                  <strong>Order Cancelled</strong>

                  <p
                    style={{
                      margin: "4px 0 0",
                    }}
                  >
                    This order has been cancelled.
                  </p>
                </div>
              )}

              <div className="order-details-grid">
                {/* ITEMS ORDERED */}
                <section className="details-card">
                  <h3>Items ordered</h3>

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item) => renderOrderItem(item))
                  ) : (
                    <div className="detail-line">
                      <span>
                        BloomBox Florals Order
                        <small>× 1</small>
                      </span>

                      <strong>{formatPrice(order.unit_price)}</strong>
                    </div>
                  )}

                  <div className="detail-total">
                    <span>Total</span>

                    <strong>{formatPrice(order.unit_price)}</strong>
                  </div>

                  <button
                    type="button"
                    className="order-complete-button"
                    onClick={() =>
                      navigate(`/order-complete?orderId=${order.order_id}`)
                    }
                  >
                    View Order Complete
                  </button>
                </section>

                {/* DELIVERY / PAYMENT */}
                <section className="details-card">
                  <h3>Delivery address</h3>

                  {getAddressLines(order.address).map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}

                  {order.contact_number && <p>{order.contact_number}</p>}

                  {order.email && <p>{order.email}</p>}

                  <h3 className="details-subheading">Delivery method</h3>

                  <p>
                    {String(order.delivery_method || "").toLowerCase() ===
                    "express"
                      ? "Express Delivery"
                      : "Standard Delivery"}
                  </p>

                  <h3 className="details-subheading">Payment method</h3>

                  <p>{getPaymentMethod()}</p>
                </section>
              </div>

              {/* DELIVERY TRACKING */}
              <section className="details-card">
                <h3>Delivery Tracking</h3>

                {mapLoading ? (
                  <p>Locating delivery address...</p>
                ) : shop && destination ? (
                  <Map shop={shop} destination={destination} route={route} />
                ) : (
                  <p>
                    Unable to locate the delivery address. Please make sure your
                    saved address is complete.
                  </p>
                )}
              </section>

              <Link className="back-orders-link" to="/orders">
                Back to My Orders
              </Link>
            </>
          ) : (
            <div className="missing-order">
              <h2>Order not found</h2>

              <p>We could not find that order in your account.</p>

              <Link className="back-orders-link" to="/orders">
                Back to My Orders
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="order-details-contact">
        <Contact />
      </div>
    </main>
  );
}

export default OrderDetails;

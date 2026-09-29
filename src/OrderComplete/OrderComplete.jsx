import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./OrderComplete.css";

const templates = [
  {
    id: "blush",
    name: "Blush Garden",
    description: "Soft roses, carnations, and seasonal blooms.",
    price: 580,
    colors: ["#e7a5b5", "#f5d9c9", "#c56e85"],
  },
  {
    id: "sunshine",
    name: "Golden Sunshine",
    description: "Bright sunflowers with cheerful yellow blooms.",
    price: 490,
    colors: ["#f5c936", "#f28c38", "#83a85d"],
  },
  {
    id: "wildflower",
    name: "Wildflower Meadow",
    description: "A loose, colorful mix inspired by the countryside.",
    price: 670,
    colors: ["#9b83bb", "#e69caa", "#f4cf70"],
  },
];

function OrderComplete() {
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const storedClient = localStorage.getItem("client");

        if (!storedClient) {
          if (isMounted) {
            setError("Please log in to view your order.");
          }

          return;
        }

        let client;

        try {
          client = JSON.parse(storedClient);
        } catch (parseError) {
          console.error(
            "Failed to parse localStorage client data:",
            parseError,
          );

          if (isMounted) {
            setError("The saved client information is invalid.");
          }

          return;
        }

        if (!client?.client_id) {
          if (isMounted) {
            setError("Invalid client information.");
          }

          return;
        }

        /*
          If an orderId is provided in the URL, use it.

          Example:
          /order-complete?orderId=8

          This is used when viewing a specific historical order.
        */
        const searchParams = new URLSearchParams(location.search);
        const orderIdFromUrl = searchParams.get("orderId");

        let orderId = orderIdFromUrl;

        /*
          If there is no orderId in the URL, fall back to
          lastOrder for the newly completed checkout flow.
        */
        if (!orderId) {
          const storedLastOrder = localStorage.getItem("lastOrder");

          if (!storedLastOrder) {
            if (isMounted) {
              setError("No recently placed order was found.");
            }

            return;
          }

          let lastOrder;

          try {
            lastOrder = JSON.parse(storedLastOrder);
          } catch (parseError) {
            console.error(
              "Failed to parse localStorage order data:",
              parseError,
            );

            if (isMounted) {
              setError("The saved order information is invalid.");
            }

            return;
          }

          if (!lastOrder || typeof lastOrder !== "object") {
            if (isMounted) {
              setError("Invalid order information.");
            }

            return;
          }

          orderId = lastOrder.order_id || lastOrder.orderId || lastOrder.id;
        }

        console.log("OrderComplete orderId:", orderId);

        if (!orderId || Number(orderId) <= 0) {
          if (isMounted) {
            setError("Invalid order ID.");
          }

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
              client_id: Number(client.client_id),
              order_id: Number(orderId),
            }),
          },
        );

        const responseText = await response.text();

        console.log("get_order_details.php status:", response.status);

        console.log("get_order_details.php response:", responseText);

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid JSON returned by get_order_details.php:",
            responseText,
          );

          if (isMounted) {
            setError("The server returned an invalid response.");
          }

          return;
        }

        if (!response.ok || !data.success) {
          console.error("Failed to retrieve order:", data);

          if (isMounted) {
            setError(data.message || "Unable to load the order details.");
          }

          return;
        }

        if (!data.order) {
          if (isMounted) {
            setError("The order could not be found.");
          }

          return;
        }

        console.log("OrderComplete loaded order:", data.order);

        if (isMounted) {
          setOrder(data.order);
        }
      } catch (fetchError) {
        console.error("Failed to load order:", fetchError);

        if (isMounted) {
          setError(
            "Unable to connect to the server. Make sure Apache and MySQL are running in XAMPP.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    const updateOrder = () => {
      loadOrder();
    };

    window.addEventListener("orderUpdated", updateOrder);

    window.addEventListener("storage", updateOrder);

    return () => {
      isMounted = false;

      window.removeEventListener("orderUpdated", updateOrder);

      window.removeEventListener("storage", updateOrder);
    };
  }, [location.search]);

  function formatDate(dateString) {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(String(dateString).replace(" ", "T"));

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

  function getStatusClass(status) {
    const formattedStatus = formatStatus(status);

    return `order-status ${formattedStatus.toLowerCase().replace(/\s+/g, "-")}`;
  }

  function formatPaymentMethod(order) {
    const payment = order?.payment_method;

    if (payment && typeof payment === "object") {
      if (payment.payment_type === "gcash") {
        return payment.gcash_last_four
          ? `GCash •••• ${payment.gcash_last_four}`
          : "GCash";
      }

      if (payment.payment_type === "cash") {
        return "Cash";
      }

      return payment.payment_type || "Unknown";
    }

    if (typeof payment === "string") {
      if (payment.toLowerCase() === "gcash") {
        return "GCash";
      }

      if (payment.toLowerCase() === "cash") {
        return "Cash";
      }

      return payment;
    }

    if (order?.payment_type) {
      return String(order.payment_type).toLowerCase() === "gcash"
        ? "GCash"
        : String(order.payment_type).toLowerCase() === "cash"
          ? "Cash"
          : String(order.payment_type);
    }

    return "Not specified";
  }

  function formatDeliveryMethod(deliveryMethod) {
    switch (
      String(deliveryMethod || "")
        .trim()
        .toLowerCase()
    ) {
      case "express":
        return "Express Delivery";

      case "standard":
      default:
        return "Standard Delivery";
    }
  }

  function getDeliveryFee(deliveryMethod) {
    return String(deliveryMethod || "")
      .trim()
      .toLowerCase() === "express"
      ? 100
      : 50;
  }

  /*
    Find the template using the exact item_name
    from the exact order_items row.
  */
  function getTemplate(itemName) {
    const normalizedName = String(itemName || "")
      .trim()
      .toLowerCase();

    return (
      templates.find(
        (template) =>
          String(template.name || "")
            .trim()
            .toLowerCase() === normalizedName,
      ) || null
    );
  }

  /*
    Get the template for a specific order item.

    The order_id confirms that the item belongs to
    the currently displayed order.

    The item_id identifies the exact order_items row.

    The item_name determines which template to display.
  */
  function getOrderItemTemplate(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const currentOrderId = Number(order?.order_id || 0);

    const itemOrderId = Number(item?.order_id || 0);

    const itemId = Number(item?.item_id || 0);

    /*
      Do not use an item from another order.
    */
    if (
      currentOrderId > 0 &&
      itemOrderId > 0 &&
      currentOrderId !== itemOrderId
    ) {
      console.warn("Order item does not belong to the current order:", {
        currentOrderId,
        itemOrderId,
        itemId,
      });

      return null;
    }

    /*
      item_id must exist because it identifies the
      exact row in order_items.
    */
    if (itemId <= 0) {
      console.warn("Order item has no valid item_id:", item);

      return null;
    }

    /*
      The template itself is determined by item_name.
    */
    return getTemplate(item.item_name);
  }

  function renderTemplatePreview(item) {
    const template = getOrderItemTemplate(item);

    const colors = template
      ? template.colors
      : ["#935466", "#eadcdf", "#3b0518"];

    return (
      <div
        className="order-product-template"
        style={{
          "--template-color-1": colors[0],
          "--template-color-2": colors[1],
          "--template-color-3": colors[2],
        }}
      >
        <div className="template-gradient-preview"></div>
      </div>
    );
  }

  const downloadInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bloombox-wrapper order-complete-page">
        <Header />

        <main className="order-empty">
          <i className="bi bi-receipt"></i>

          <h1>Loading Order</h1>

          <p>Please wait while we retrieve your order details.</p>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bloombox-wrapper order-complete-page">
        <Header />

        <main className="order-empty">
          <i className="bi bi-receipt"></i>

          <h1>Unable to Load Order</h1>

          <p>{error}</p>

          <a href="/customize-bouquet" className="order-back-btn">
            Continue Shopping
          </a>
        </main>

        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bloombox-wrapper order-complete-page">
        <Header />

        <main className="order-empty">
          <i className="bi bi-receipt"></i>

          <h1>No Order Found</h1>

          <p>There is no recently placed order to display.</p>

          <a href="/customize-bouquet" className="order-back-btn">
            Continue Shopping
          </a>
        </main>

        <Footer />
      </div>
    );
  }

  /*
    Only use order_items that belong to the currently
    loaded order_id.
  */
  const items = Array.isArray(order.items)
    ? order.items.filter((item) => {
        if (!item || typeof item !== "object") {
          return false;
        }

        const currentOrderId = Number(order.order_id || 0);

        const itemOrderId = Number(item.order_id || 0);

        /*
          If order_id exists on the item, it must match
          the currently loaded order.
        */
        if (
          currentOrderId > 0 &&
          itemOrderId > 0 &&
          currentOrderId !== itemOrderId
        ) {
          return false;
        }

        /*
          Every order_items row should have its own item_id.
        */
        return Number(item.item_id || 0) > 0;
      })
    : [];

  const itemCount = items.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0,
  );

  const deliveryFee = getDeliveryFee(order.delivery_method);

  const orderTotal = Number(order.unit_price || 0);

  return (
    <div className="bloombox-wrapper order-complete-page">
      <Header />

      <main className="order-complete-main">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <h1>Your order is completed!</h1>

            <p>Thank you. Your order has been received.</p>

            <div className="order-breadcrumb">
              <a href="/home">Home</a>

              <span>/</span>

              <span>Order Complete</span>
            </div>
          </div>

          <div className="order-info-card">
            <div className="order-info-item">
              <span>Order ID</span>

              <strong>#{String(order.order_id).padStart(4, "0")}</strong>
            </div>

            <div className="order-info-item">
              <span>Payment Method</span>

              <strong>{formatPaymentMethod(order)}</strong>
            </div>

            <div className="order-info-item">
              <span>Delivery Method</span>

              <strong>{formatDeliveryMethod(order.delivery_method)}</strong>
            </div>

            <div className="order-info-item">
              <span>Order Date</span>

              <strong>{formatDate(order.order_date)}</strong>
            </div>

            <div className="order-info-action">
              <button type="button" onClick={downloadInvoice}>
                <i className="bi bi-download"></i>
                Download Invoice
              </button>
            </div>
          </div>

          <div className="order-status-card">
            <div>
              <span>Order Status</span>

              <strong>{formatStatus(order.order_status)}</strong>
            </div>

            <span className={getStatusClass(order.order_status)}>
              {formatStatus(order.order_status)}
            </span>
          </div>

          <section className="order-details-card">
            <div className="order-details-header">
              <h2>Order Details</h2>

              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="order-product-heading">
              <span>Product</span>

              <span>Sub Total</span>
            </div>

            <div className="order-products">
              {items.length > 0 ? (
                items.map((item) => {
                  /*
                    These values come directly from the
                    exact order_items row.
                  */
                  const itemId = Number(item.item_id);

                  const itemOrderId = Number(item.order_id);

                  const itemName =
                    String(item.item_name || "").trim() || "BloomBox Bouquet";

                  const template = getOrderItemTemplate(item);

                  const itemQuantity = Number(item.quantity || 1);

                  const itemUnitPrice = Number(item.unit_price || 0);

                  const itemSubtotal = itemUnitPrice * itemQuantity;

                  return (
                    <div
                      className="order-product"
                      key={`order-${itemOrderId}-item-${itemId}`}
                    >
                      <div className="order-product-left">
                        {renderTemplatePreview(item)}

                        <div className="order-product-info">
                          <span>
                            {template ? "Bouquet Template" : "Flower"}
                          </span>

                          <strong>{template ? template.name : itemName}</strong>

                          <small>Qty: {itemQuantity}</small>
                        </div>
                      </div>

                      <strong className="order-product-price">
                        {formatPrice(itemSubtotal)}
                      </strong>
                    </div>
                  );
                })
              ) : (
                <div className="order-product">
                  <div className="order-product-left">
                    <div className="order-product-template">
                      <div className="template-color-preview">
                        <span
                          className="template-color"
                          style={{
                            backgroundColor: "#935466",
                          }}
                        ></span>

                        <span
                          className="template-color"
                          style={{
                            backgroundColor: "#eadcdf",
                          }}
                        ></span>

                        <span
                          className="template-color"
                          style={{
                            backgroundColor: "#3b0518",
                          }}
                        ></span>
                      </div>
                    </div>

                    <div className="order-product-info">
                      <strong>BloomBox Florals Order</strong>

                      <small>No individual items found.</small>
                    </div>
                  </div>

                  <strong className="order-product-price">
                    {formatPrice(orderTotal)}
                  </strong>
                </div>
              )}
            </div>

            <div className="order-summary-lines">
              <div>
                <span>Delivery</span>

                <strong>{formatPrice(deliveryFee)}</strong>
              </div>
            </div>

            <div className="order-total">
              <span>Total</span>

              <strong>{formatPrice(orderTotal)}</strong>
            </div>
          </section>

          <div className="order-actions">
            <a href="/customize-bouquet" className="continue-shopping-btn">
              Continue Shopping
            </a>

            <a href="/orders" className="admin-orders-link">
              View Past Orders
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderComplete;

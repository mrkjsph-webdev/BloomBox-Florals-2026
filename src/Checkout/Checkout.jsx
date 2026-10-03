import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  const [loadingClient, setLoadingClient] = useState(true);

  const [loadingPayments, setLoadingPayments] = useState(true);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [checkoutItems, setCheckoutItems] = useState([]);

  const [orderSuccess, setOrderSuccess] = useState(null);

  /*
   * PayMongo QR Ph payment
   */
  const [qrPayment, setQrPayment] = useState(null);

  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      navigate("/");
      return;
    }

    let parsedClient;

    try {
      parsedClient = JSON.parse(storedClient);
    } catch (error) {
      console.error("Invalid client data:", error);

      localStorage.removeItem("client");

      navigate("/");
      return;
    }

    if (!parsedClient?.client_id) {
      localStorage.removeItem("client");

      navigate("/");
      return;
    }

    setClient(parsedClient);

    loadClient(parsedClient.client_id);

    loadPaymentMethods(parsedClient.client_id);

    try {
      const savedItems = JSON.parse(
        localStorage.getItem("checkoutItems") || "[]",
      );

      const savedDeliveryMethod =
        localStorage.getItem("checkoutShipping") || "standard";

      setCheckoutItems(Array.isArray(savedItems) ? savedItems : []);

      if (
        savedDeliveryMethod === "standard" ||
        savedDeliveryMethod === "express"
      ) {
        setDeliveryMethod(savedDeliveryMethod);
      }
    } catch (error) {
      console.error("Failed to load checkout items:", error);

      setCheckoutItems([]);
      setDeliveryMethod("standard");
    }
  }, [navigate]);

  /*
   * Monitor QR Ph payment status.
   *
   * Payment must be confirmed before
   * cart items are marked as selected.
   */
  useEffect(() => {
    if (!qrPayment?.paymentIntentId) {
      return undefined;
    }

    let cancelled = false;
    let intervalId = null;

    async function checkPaymentStatus() {
      if (cancelled) {
        return;
      }

      try {
        setCheckingPayment(true);

        const response = await fetch(
          "http://localhost/bbf_clientdb/create_paymongo_checkout.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "status",
              order_id: Number(qrPayment.orderId),
              client_id: Number(client?.client_id),
              payment_intent_id: qrPayment.paymentIntentId,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error("Payment status check failed:", data);

          return;
        }

        if (data.payment_status === "paid") {
          if (cancelled) {
            return;
          }

          clearInterval(intervalId);

          /*
           * Payment is confirmed.
           *
           * Now mark the purchased cart rows
           * as is_selected = 1.
           */
          const cartUpdated = await markCheckedOutCartItems(qrPayment.orderId);

          if (!cartUpdated) {
            console.error(
              "Payment was confirmed, but cart items could not be marked as selected.",
            );
          }

          localStorage.removeItem("checkoutItems");

          localStorage.removeItem("checkoutShipping");

          window.dispatchEvent(new Event("cartUpdated"));

          window.dispatchEvent(new Event("orderUpdated"));

          window.dispatchEvent(new Event("notificationsUpdated"));

          setQrPayment(null);

          setOrderSuccess({
            orderId: qrPayment.orderId,
          });
        }
      } catch (error) {
        console.error("Failed to check PayMongo payment:", error);
      } finally {
        if (!cancelled) {
          setCheckingPayment(false);
        }
      }
    }

    checkPaymentStatus();

    intervalId = setInterval(checkPaymentStatus, 3000);

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [qrPayment?.paymentIntentId, qrPayment?.orderId, client?.client_id]);

  async function loadClient(clientId) {
    try {
      setLoadingClient(true);

      const response = await fetch(
        "http://localhost/bbf_clientdb/get_client.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        console.error(data.message);

        return;
      }

      setClient(data.client);

      localStorage.setItem("client", JSON.stringify(data.client));
    } catch (error) {
      console.error("Failed to load client:", error);
    } finally {
      setLoadingClient(false);
    }
  }

  async function loadPaymentMethods(clientId) {
    try {
      setLoadingPayments(true);

      const response = await fetch(
        "http://localhost/bbf_clientdb/payment_methods.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
            client_id: clientId,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        console.error(data.message);

        setPaymentMethods([]);

        return;
      }

      const methods = Array.isArray(data.payment_methods)
        ? data.payment_methods
        : [];

      setPaymentMethods(methods);

      const defaultMethod = methods.find(
        (method) => Number(method.is_default) === 1,
      );

      if (defaultMethod) {
        setSelectedPayment(String(defaultMethod.payment_id));
      } else if (methods.length > 0) {
        setSelectedPayment(String(methods[0].payment_id));
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);

      setPaymentMethods([]);
    } finally {
      setLoadingPayments(false);
    }
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
        return {};
      }
    }

    return {};
  }

  function getItemName(item) {
    const customization = getCustomization(item);

    return (
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

  function parsePrice(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const cleaned = String(value).replace(/[₱$,\s]/g, "");

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) ? parsed : null;
  }

  function getItemUnitPrice(item) {
    const customization = getCustomization(item);

    const possiblePrices = [
      item?.unit_price,
      item?.unitPrice,
      item?.price,
      item?.total_price,
      item?.totalPrice,

      customization?.unit_price,
      customization?.unitPrice,
      customization?.price,
      customization?.total_price,
      customization?.totalPrice,
      customization?.bouquet_price,
      customization?.bouquetPrice,

      item?.bouquet?.price,
      item?.template?.price,

      customization?.template_price,
      customization?.templatePrice,
    ];

    for (const value of possiblePrices) {
      const parsed = parsePrice(value);

      if (parsed !== null && parsed > 0) {
        return parsed;
      }
    }

    if (customization?.template && typeof customization.template === "object") {
      const templatePrice = parsePrice(customization.template.price);

      if (templatePrice !== null && templatePrice > 0) {
        return templatePrice;
      }
    }

    return 0;
  }

  function getItemQuantity(item) {
    const quantity = Number(item?.quantity || 1);

    return quantity > 0 ? quantity : 1;
  }

  function getCustomizationDetails(item) {
    const customization = getCustomization(item);

    return {
      paper:
        item?.paper ||
        item?.paperSize ||
        customization?.paper ||
        customization?.paper_size ||
        customization?.paperSize ||
        customization?.selectedPaper ||
        customization?.paper_name ||
        null,

      wrapper:
        item?.wrapper ||
        item?.wrapperType ||
        customization?.wrapper ||
        customization?.wrapper_type ||
        customization?.wrapperType ||
        customization?.selectedWrapper ||
        customization?.wrapper_name ||
        null,

      flowers: Array.isArray(item?.flowers)
        ? item.flowers
        : Array.isArray(customization?.flowers)
          ? customization.flowers
          : [],

      extras: Array.isArray(item?.extras)
        ? item.extras
        : Array.isArray(customization?.extras)
          ? customization.extras
          : [],
    };
  }

  function getFlowerDisplayName(flower) {
    return (
      flower?.name || flower?.flower_name || flower?.flowerName || "Flower"
    );
  }

  function getDisplayValue(value) {
    if (!value) {
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

  function getCustomizationTags(item) {
    const details = getCustomizationDetails(item);

    const tags = [];

    const paper = getDisplayValue(details.paper);

    const wrapper = getDisplayValue(details.wrapper);

    if (paper) {
      tags.push(`Paper: ${paper}`);
    }

    if (wrapper) {
      tags.push(`Wrapper: ${wrapper}`);
    }

    if (details.flowers.length > 0) {
      const flowerText = details.flowers
        .map((flower) => {
          const name = getFlowerDisplayName(flower);

          const quantity = Number(flower?.quantity || 1);

          return `${name} ×${quantity}`;
        })
        .join(", ");

      tags.push(`Flowers: ${flowerText}`);
    }

    details.extras.forEach((extra) => {
      if (typeof extra === "string") {
        tags.push(extra);

        return;
      }

      const extraName =
        extra?.name || extra?.label || extra?.extra_name || extra?.extraName;

      if (extraName) {
        tags.push(extraName);
      }
    });

    return tags;
  }

  /*
   * Get flowers being purchased.
   */
  function getCheckoutFlowers() {
    const flowers = [];

    checkoutItems.forEach((item) => {
      if (!Array.isArray(item?.flowers)) {
        return;
      }

      const bouquetQuantity = getItemQuantity(item);

      item.flowers.forEach((flower) => {
        const flowerId = Number(flower?.flower_id);

        const flowerQuantity = Number(flower?.quantity || 1);

        if (flowerId > 0 && flowerQuantity > 0) {
          flowers.push({
            flower_id: flowerId,
            quantity: flowerQuantity * bouquetQuantity,
          });
        }
      });
    });

    return flowers;
  }

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => {
      const unitPrice = getItemUnitPrice(item);

      const quantity = getItemQuantity(item);

      return total + unitPrice * quantity;
    }, 0);
  }, [checkoutItems]);

  const deliveryFee = useMemo(() => {
    if (checkoutItems.length === 0) {
      return 0;
    }

    return deliveryMethod === "express" ? 100 : 50;
  }, [checkoutItems, deliveryMethod]);

  const orderTotal = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  function formatCurrency(amount) {
    return `₱${Number(amount || 0).toFixed(2)}`;
  }

  function getPaymentLabel(method) {
    if (method.payment_type === "cash") {
      return "Cash";
    }

    if (method.payment_type === "gcash") {
      return `GCash •••• ${method.gcash_last_four || ""}`;
    }

    return method.payment_type;
  }

  function getSelectedPaymentMethod() {
    return paymentMethods.find(
      (method) => String(method.payment_id) === String(selectedPayment),
    );
  }

  /*
   * Get every shopping_cart_items.item_id
   * belonging to the selected bouquets.
   */
  const getCheckoutCartItemIds = () => {
    const itemIds = [];

    checkoutItems.forEach((item) => {
      if (Array.isArray(item.cart_item_ids)) {
        item.cart_item_ids.forEach((itemId) => {
          const numericId = Number(itemId);

          if (numericId > 0 && !itemIds.includes(numericId)) {
            itemIds.push(numericId);
          }
        });

        return;
      }

      if (Array.isArray(item.flowers)) {
        item.flowers.forEach((flower) => {
          const numericId = Number(flower.item_id);

          if (numericId > 0 && !itemIds.includes(numericId)) {
            itemIds.push(numericId);
          }
        });
      }

      const numericItemId = Number(item.item_id);

      if (numericItemId > 0 && !itemIds.includes(numericItemId)) {
        itemIds.push(numericItemId);
      }
    });

    return itemIds;
  };

  /*
   * Mark purchased cart rows as selected.
   *
   * IMPORTANT:
   * This does NOT delete the rows.
   *
   * 0 = visible in cart
   * 1 = purchased/hidden from cart
   */
  async function markCheckedOutCartItems(orderId) {
    const itemIds = getCheckoutCartItemIds();

    console.log("Cart items to mark as selected:", itemIds);

    if (itemIds.length === 0) {
      console.warn("No shopping cart item IDs were found in checkoutItems.");

      return false;
    }

    if (!orderId) {
      console.warn("No order ID was provided.");

      return false;
    }

    try {
      const response = await fetch("http://localhost/bbf_clientdb/cart.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_selected",
          client_id: Number(client.client_id),
          order_id: Number(orderId),
          item_ids: itemIds,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid cart response:", responseText);

        return false;
      }

      if (!response.ok || !data.success) {
        console.error("Failed to mark cart items as selected:", data);

        return false;
      }

      console.log("Cart items marked as selected successfully:", data);

      return true;
    } catch (error) {
      console.error("Failed to mark cart items as selected:", error);

      return false;
    }
  }

  async function attachCartItemsToOrder(orderId) {
    const itemIds = getCheckoutCartItemIds();

    console.log("Cart items to attach to pending order:", itemIds);

    if (itemIds.length === 0) {
      console.warn("No shopping cart item IDs were found.");

      return false;
    }

    if (!orderId) {
      console.warn("No order ID was provided.");

      return false;
    }

    try {
      const response = await fetch("http://localhost/bbf_clientdb/cart.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "attach_order",
          client_id: Number(client.client_id),
          order_id: Number(orderId),
          item_ids: itemIds,
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid cart response:", responseText);

        return false;
      }

      if (!response.ok || !data.success) {
        console.error("Failed to attach cart items to order:", data);

        return false;
      }

      console.log("Cart items attached to pending order successfully:", data);

      /*
       * Immediately tell Header / ShoppingCart to refresh.
       */
      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (error) {
      console.error("Failed to attach cart items to order:", error);

      return false;
    }
  }

  /*
   * Create a real PayMongo QR Ph payment.
   */
  async function createPayMongoQrPayment(orderId) {
    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/create_paymongo_checkout.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create",
            order_id: Number(orderId),
            client_id: Number(client.client_id),
          }),
        },
      );

      const responseText = await response.text();

      console.log("create_paymongo_checkout.php status:", response.status);

      console.log("create_paymongo_checkout.php response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error(
          "Invalid JSON returned by PayMongo endpoint:",
          responseText,
        );

        alert(
          "PayMongo returned an invalid response.\n\n" +
            "Check your PHP error log.",
        );

        return false;
      }

      if (!response.ok || !data.success) {
        console.error("PayMongo QR creation failed:", data);

        alert(data.message || "Unable to create the PayMongo QR payment.");

        return false;
      }

      if (!data.qr_code) {
        console.error("PayMongo did not return a QR code:", data);

        alert("PayMongo did not return a QR code for this payment.");

        return false;
      }

      setQrPayment({
        orderId: Number(orderId),
        amount: Number(orderTotal.toFixed(2)),
        qrCode: data.qr_code,
        paymentIntentId: data.payment_intent_id,
        expiresAt: data.expires_at || null,
      });

      return true;
    } catch (error) {
      console.error("Failed to create PayMongo QR payment:", error);

      alert(
        "Unable to connect to PayMongo.\n\n" +
          "Make sure Apache is running and your PHP backend is available.",
      );

      return false;
    }
  }

  async function placeOrder() {
    if (!client?.client_id) {
      alert("Please log in before placing your order.");

      navigate("/");

      return;
    }

    if (!client.address) {
      alert("Please add your address before placing your order.");

      navigate("/address");

      return;
    }

    if (!selectedPayment) {
      alert("Please select a payment method.");

      navigate("/payment-methods");

      return;
    }

    if (!checkoutItems.length) {
      alert("Your checkout is empty.");

      navigate("/shopping-cart");

      return;
    }

    if (orderTotal <= 0) {
      alert("The order total is invalid.");

      return;
    }

    const checkoutFlowers = getCheckoutFlowers();

    if (checkoutFlowers.length === 0) {
      alert(
        "No flowers were found in this checkout. Please return to your shopping cart and try again.",
      );

      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "http://localhost/bbf_clientdb/add_order.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Number(client.client_id),
            payment_id: Number(selectedPayment),
            delivery_method: deliveryMethod,
            unit_price: Number(orderTotal.toFixed(2)),
            items: checkoutItems,
            flowers: checkoutFlowers,
          }),
        },
      );

      const responseText = await response.text();

      console.log("add_order.php status:", response.status);

      console.log("add_order.php response:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Invalid JSON returned by add_order.php:", responseText);

        alert(
          "The server returned an invalid response.\n\n" +
            "Check your XAMPP/PHP error or the browser console.",
        );

        return;
      }

      if (!response.ok) {
        console.error("Server returned an error:", data);

        alert(data.message || `Server error (${response.status}).`);

        return;
      }

      if (!data.success) {
        console.error("Order creation failed:", data);

        alert(data.message || "Failed to place your order.");

        return;
      }

      console.log("Order created successfully:", data);

      const selectedMethod = getSelectedPaymentMethod();

      /*
       * CASH
       *
       * Cash orders are immediately confirmed.
       *
       * Mark the purchased cart rows as
       * is_selected = 1.
       */
      if (selectedMethod?.payment_type === "cash") {
        const cartUpdated = await markCheckedOutCartItems();

        if (!cartUpdated) {
          console.error(
            "Order was created, but cart items could not be marked as selected.",
          );
        }

        localStorage.removeItem("checkoutItems");

        localStorage.removeItem("checkoutShipping");

        window.dispatchEvent(new Event("cartUpdated"));

        window.dispatchEvent(new Event("orderUpdated"));

        window.dispatchEvent(new Event("notificationsUpdated"));

        setOrderSuccess({
          orderId: data.order_id,
        });

        return;
      }

      /*
       * GCASH
       *
       * The saved GCash payment method is used as
       * the customer's selected payment option,
       * but payment is completed through PayMongo QR Ph.
       */
      if (selectedMethod?.payment_type === "gcash") {
        const qrCreated = await createPayMongoQrPayment(data.order_id);

        if (!qrCreated) {
          return;
        }
        const cartAttached = await attachCartItemsToOrder(data.order_id);

        if (!cartAttached) {
          console.error(
            "PayMongo QR was created, but cart items could not be attached to the order.",
          );

          alert(
            "Your payment QR was created, but the cart could not be updated. " +
              "Please do not place another order for these items.",
          );

          return;
        }

        return;
      }

      alert("This payment method is not supported.");
    } catch (error) {
      console.error("Network/fetch error:", error);

      alert(
        "Unable to connect to the server.\n\n" +
          "Make sure Apache and MySQL are running in XAMPP.",
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loadingClient) {
    return (
      <>
        <Header />

        <main className="checkout-page">
          <div className="container py-5 text-center">
            <p>Loading checkout...</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!client) {
    return null;
  }

  if (!checkoutItems.length) {
    return (
      <>
        <Header />

        <main className="checkout-page">
          <section className="checkout-hero">
            <div className="container">
              <div className="checkout-breadcrumb">
                <Link to="/home">Home</Link>

                <span>/</span>

                <span>Checkout</span>
              </div>

              <h1>Checkout</h1>

              <p>Review your order before placing it.</p>
            </div>
          </section>

          <div className="container py-5">
            <div className="checkout-empty">
              <i className="bi bi-bag-x"></i>

              <h2>Your checkout is empty</h2>

              <p>There are no items waiting for checkout.</p>

              <Link to="/shopping-cart" className="checkout-back-btn">
                Back to Shopping Cart
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="checkout-page">
        <section className="checkout-hero">
          <div className="container">
            <div className="checkout-breadcrumb">
              <Link to="/home">Home</Link>

              <span>/</span>

              <span>Checkout</span>
            </div>

            <h1>Checkout</h1>

            <p>
              Review your delivery information and payment method before placing
              your order.
            </p>
          </div>
        </section>

        <div className="container checkout-main py-4">
          <div className="checkout-layout">
            <div className="checkout-details">
              {/* DELIVERY INFORMATION */}
              <section className="checkout-section">
                <div className="checkout-section-title">
                  <span>1</span>

                  <div>
                    <p>DELIVERY INFORMATION</p>

                    <h2>Address</h2>
                  </div>
                </div>

                <div className="saved-address">
                  <div className="saved-address-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>

                  <div className="saved-address-content">
                    <strong>{client.name || "Customer"}</strong>

                    <p>{client.address || "No address saved."}</p>

                    {client.contact_number && (
                      <span>
                        <i className="bi bi-telephone me-1"></i>
                        {client.contact_number}
                      </span>
                    )}

                    {client.email && (
                      <span>
                        <i className="bi bi-envelope me-1"></i>
                        {client.email}
                      </span>
                    )}
                  </div>

                  <Link to="/address" className="checkout-change-link">
                    Change
                  </Link>
                </div>
              </section>

              {/* DELIVERY METHOD */}
              <section className="checkout-section">
                <div className="checkout-section-title">
                  <span>2</span>

                  <div>
                    <p>DELIVERY METHOD</p>

                    <h2>Choose Delivery</h2>
                  </div>
                </div>

                <div className="shipping-choice">
                  <label
                    className={`shipping-option ${
                      deliveryMethod === "standard" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={deliveryMethod === "standard"}
                      onChange={(e) => {
                        setDeliveryMethod(e.target.value);

                        localStorage.setItem(
                          "checkoutShipping",
                          e.target.value,
                        );
                      }}
                    />

                    <div className="shipping-option-icon">
                      <i className="bi bi-truck"></i>
                    </div>

                    <div className="shipping-option-content">
                      <strong>Standard Delivery</strong>

                      <span>3–5 business days</span>
                    </div>

                    <b>{formatCurrency(50)}</b>
                  </label>

                  <label
                    className={`shipping-option ${
                      deliveryMethod === "express" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="express"
                      checked={deliveryMethod === "express"}
                      onChange={(e) => {
                        setDeliveryMethod(e.target.value);

                        localStorage.setItem(
                          "checkoutShipping",
                          e.target.value,
                        );
                      }}
                    />

                    <div className="shipping-option-icon">
                      <i className="bi bi-lightning-charge-fill"></i>
                    </div>

                    <div className="shipping-option-content">
                      <strong>Express Delivery</strong>

                      <span>1–2 business days</span>
                    </div>

                    <b>{formatCurrency(100)}</b>
                  </label>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="checkout-section">
                <div className="checkout-section-title">
                  <span>3</span>

                  <div>
                    <p>PAYMENT</p>

                    <h2>Payment Method</h2>
                  </div>
                </div>

                {loadingPayments ? (
                  <div className="checkout-loading">
                    <span className="spinner-border spinner-border-sm"></span>

                    <span>Loading payment methods...</span>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="no-payment-method">
                    <i className="bi bi-wallet2"></i>

                    <div>
                      <p>You don't have a saved payment method yet.</p>

                      <Link
                        to="/payment-methods"
                        className="checkout-change-link"
                      >
                        Add Payment Method
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="method-options">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.payment_id}
                        className={`method-card ${
                          selectedPayment === String(method.payment_id)
                            ? "active"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.payment_id}
                          checked={
                            selectedPayment === String(method.payment_id)
                          }
                          onChange={(e) => setSelectedPayment(e.target.value)}
                        />

                        <div className="payment-method-icon">
                          <i
                            className={
                              method.payment_type === "gcash"
                                ? "bi bi-qr-code"
                                : "bi bi-cash-stack"
                            }
                          ></i>
                        </div>

                        <div>
                          <strong>{getPaymentLabel(method)}</strong>

                          <span>
                            {method.payment_type === "cash"
                              ? "Pay upon delivery"
                              : "Pay using QR Ph with GCash"}
                          </span>

                          {Number(method.is_default) === 1 && <b>Default</b>}
                        </div>
                      </label>
                    ))}

                    <Link
                      to="/payment-methods"
                      className="checkout-change-link payment-change-link"
                    >
                      Manage Payment Methods
                    </Link>
                  </div>
                )}
              </section>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="checkout-sidebar">
              <div className="checkout-summary">
                <div className="checkout-summary-header">
                  <p>YOUR ORDER</p>

                  <h2>Order Summary</h2>
                </div>

                <div className="checkout-products">
                  {checkoutItems.map((item, index) => {
                    const unitPrice = getItemUnitPrice(item);

                    const quantity = getItemQuantity(item);

                    const itemTotal = unitPrice * quantity;

                    const image = getItemImage(item);

                    const name = getItemName(item);

                    const customizationTags = getCustomizationTags(item);

                    return (
                      <div
                        className="checkout-product"
                        key={
                          item.item_id ||
                          item.cart_id ||
                          item.bouquet_id ||
                          item.id ||
                          index
                        }
                      >
                        <div className="checkout-product-image">
                          {image ? (
                            <img src={image} alt={name} />
                          ) : (
                            <div className="checkout-product-placeholder">
                              <i className="bi bi-flower1"></i>
                            </div>
                          )}

                          <span>{quantity}</span>
                        </div>

                        <div className="checkout-product-info">
                          <strong>{name}</strong>

                          <span>Qty: {quantity}</span>

                          {customizationTags.map((tag, tagIndex) => (
                            <small key={`${tag}-${tagIndex}`}>{tag}</small>
                          ))}
                        </div>

                        <div className="checkout-product-price">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-summary-lines">
                  <div>
                    <span>Subtotal</span>

                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>

                    <strong>{formatCurrency(deliveryFee)}</strong>
                  </div>
                </div>

                <div className="checkout-total">
                  <span>Total</span>

                  <strong>{formatCurrency(orderTotal)}</strong>
                </div>

                <button
                  type="button"
                  className="place-order-btn"
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    loadingPayments ||
                    !selectedPayment ||
                    !client.address
                  }
                >
                  <i
                    className={`bi ${
                      placingOrder ? "bi-hourglass-split" : "bi-bag-check"
                    }`}
                  ></i>

                  <span>
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </span>
                </button>

                <p className="checkout-security">
                  <i className="bi bi-lock-fill"></i>

                  <span>Secure checkout</span>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* PAYMONGO QR PH PAYMENT MODAL */}
      {qrPayment && (
        <div className="order-success-overlay">
          <div
            className="order-success-modal"
            style={{
              maxWidth: "480px",
            }}
          >
            <div
              className="order-success-icon"
              style={{
                marginBottom: "16px",
              }}
            >
              <i className="bi bi-qr-code"></i>
            </div>

            <p className="order-success-eyebrow">QR PH PAYMENT</p>

            <h2>Scan to Pay</h2>

            <p className="order-success-message">
              Scan this QR Ph code using GCash or another supported banking or
              e-wallet app to complete your payment.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#ffffff",
                  border: "1px solid #eadcdf",
                  borderRadius: "12px",
                  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.12)",
                }}
              >
                <img
                  src={qrPayment.qrCode}
                  alt="PayMongo QR Ph payment"
                  style={{
                    width: "280px",
                    height: "280px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            </div>

            <div className="order-success-number">
              <span>Order ID</span>

              <strong>#{String(qrPayment.orderId).padStart(4, "0")}</strong>
            </div>

            <div
              className="order-success-number"
              style={{
                marginTop: "8px",
              }}
            >
              <span>Amount to Pay</span>

              <strong>{formatCurrency(qrPayment.amount)}</strong>
            </div>

            <p
              style={{
                marginTop: "16px",
                marginBottom: "0",
                fontSize: "13px",
                color: "#777",
              }}
            >
              {checkingPayment
                ? "Waiting for payment confirmation..."
                : "After you complete the payment, this page will automatically detect it."}
            </p>

            {checkingPayment && (
              <div
                className="text-center"
                style={{
                  marginTop: "12px",
                }}
              >
                <div className="spinner-border spinner-border-sm"></div>
              </div>
            )}

            <button
              type="button"
              className="order-success-button"
              onClick={() => {
                setQrPayment(null);

                navigate("/orders");
              }}
              style={{
                marginTop: "18px",
              }}
            >
              View My Orders
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS MODAL */}
      {orderSuccess && (
        <div className="order-success-overlay">
          <div className="order-success-modal">
            <div className="order-success-icon">
              <i className="bi bi-check-lg"></i>
            </div>

            <p className="order-success-eyebrow">ORDER CONFIRMED</p>

            <h2>Order Placed Successfully!</h2>

            <p className="order-success-message">
              Thank you for your order. Your bouquet has been successfully
              placed.
            </p>

            <div className="order-success-number">
              <span>Order ID</span>

              <strong>#{String(orderSuccess.orderId).padStart(4, "0")}</strong>
            </div>

            <button
              type="button"
              className="order-success-button"
              onClick={() => {
                setOrderSuccess(null);

                navigate("/orders");
              }}
            >
              View My Orders
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Checkout;

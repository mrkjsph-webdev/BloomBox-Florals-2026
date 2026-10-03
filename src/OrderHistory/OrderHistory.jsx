import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Contact from "../LandingPage/Contact";
import "./OrderHistory.css";

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

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
    -------------------------------------------------------
    FORMAT HELPERS
    -------------------------------------------------------
  */

  function formatPrice(value) {
    const amount = Number(value || 0);

    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateTime(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatStatus(status) {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();

    switch (normalized) {
      case "completed":
      case "delivered":
        return "Delivered";

      case "cancelled":
      case "canceled":
        return "Cancelled";

      default:
        return "—";
    }
  }

  function getStatusClass(status) {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();

    if (normalized === "completed" || normalized === "delivered") {
      return "completed";
    }

    if (normalized === "cancelled" || normalized === "canceled") {
      return "cancelled";
    }

    return "";
  }

  function formatPaymentMethod(order) {
    const payment = order?.payment_method;

    if (!payment) {
      return "—";
    }

    const paymentType = String(payment.payment_type || "")
      .trim()
      .toLowerCase();

    if (paymentType === "gcash") {
      if (payment.gcash_last_four) {
        return `GCash •••• ${payment.gcash_last_four}`;
      }

      return "GCash";
    }

    if (paymentType === "cash") {
      return "Cash";
    }

    if (paymentType) {
      return paymentType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    return "—";
  }

  function formatDeliveryMethod(method) {
    const normalized = String(method || "")
      .trim()
      .toLowerCase();

    if (normalized === "express") {
      return "Express Delivery";
    }

    if (normalized === "standard") {
      return "Standard Delivery";
    }

    return "—";
  }

  /*
    -------------------------------------------------------
    TEMPLATE HELPERS
    -------------------------------------------------------
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

  function getOrderItemTemplate(item, currentOrder) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const currentOrderId = Number(currentOrder?.order_id || 0);

    const itemOrderId = Number(item.order_id || 0);

    /*
      Make sure the item belongs to the selected order.
    */
    if (
      currentOrderId > 0 &&
      itemOrderId > 0 &&
      currentOrderId !== itemOrderId
    ) {
      return null;
    }

    /*
      Every order_items row should have an item_id.
    */
    if (Number(item.item_id || 0) <= 0) {
      return null;
    }

    return getTemplate(item.item_name);
  }

  function renderTemplatePreview(item, currentOrder) {
    const template = getOrderItemTemplate(item, currentOrder);

    if (template) {
      return (
        <div
          className="history-template-preview"
          style={{
            background:
              `radial-gradient(circle at 25% 30%, ` +
              `${template.colors[0]} 0 22%, transparent 23%), ` +
              `radial-gradient(circle at 70% 30%, ` +
              `${template.colors[1]} 0 25%, transparent 26%), ` +
              `radial-gradient(circle at 50% 75%, ` +
              `${template.colors[2]} 0 28%, transparent 29%), ` +
              `linear-gradient(135deg, ${template.colors[0]}, ` +
              `${template.colors[1]}, ${template.colors[2]})`,
          }}
        >
          <span>
            <i className="bi bi-flower1"></i>
          </span>
        </div>
      );
    }

    if (item?.item_image) {
      return (
        <img
          src={item.item_image}
          alt={item.item_name || "BloomBox bouquet"}
        />
      );
    }

    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "#773448",
          fontSize: "24px",
        }}
      >
        <i className="bi bi-flower1"></i>
      </span>
    );
  }

  /*
    -------------------------------------------------------
    LOAD REVIEWS
    -------------------------------------------------------
  */

  useEffect(() => {
    try {
      const storedReviews = localStorage.getItem("reviews");

      if (!storedReviews) {
        setReviews([]);
        return;
      }

      const parsedReviews = JSON.parse(storedReviews);

      setReviews(Array.isArray(parsedReviews) ? parsedReviews : []);
    } catch (storageError) {
      console.error("Failed to load reviews:", storageError);

      setReviews([]);
    }
  }, []);

  /*
    -------------------------------------------------------
    LOAD ORDER HISTORY FROM DATABASE
    -------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    async function loadOrderHistory() {
      setLoading(true);
      setError("");

      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        navigate("/login");
        return;
      }

      let client;

      try {
        client = JSON.parse(storedClient);
      } catch (parseError) {
        console.error("Failed to parse client:", parseError);

        localStorage.removeItem("client");
        navigate("/login");
        return;
      }

      const clientId = Number(client?.client_id || 0);

      if (clientId <= 0) {
        localStorage.removeItem("client");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost/bbf_clientdb/get_order_history.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientId,
            }),
            cache: "no-store",
          },
        );

        const responseText = await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Invalid order history response:", responseText);

          throw new Error("The server returned an invalid response.");
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to retrieve order history.");
        }

        const databaseOrders = Array.isArray(data.orders)
          ? data.orders
          : [];

        /*
          Only Delivered / Cancelled orders belong
          in Order History.
        */
        const historyOrders = databaseOrders.filter((order) => {
          const status = String(order?.order_status || "")
            .trim()
            .toLowerCase();

          return (
            status === "completed" ||
            status === "delivered" ||
            status === "cancelled" ||
            status === "canceled"
          );
        });

        if (!isMounted) {
          return;
        }

        setOrders(historyOrders);
      } catch (fetchError) {
        console.error("Failed to load order history:", fetchError);

        if (!isMounted) {
          return;
        }

        setOrders([]);

        setError(fetchError?.message || "Unable to load your order history.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrderHistory();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  /*
    -------------------------------------------------------
    FILTER HISTORY
    -------------------------------------------------------
  */

  const historyOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order?.order_status || "")
        .trim()
        .toLowerCase();

      return (
        status === "completed" ||
        status === "delivered" ||
        status === "cancelled" ||
        status === "canceled"
      );
    });
  }, [orders]);

  /*
    -------------------------------------------------------
    REVIEW HELPERS
    -------------------------------------------------------
  */

  function getOrderReview(orderId) {
    const numericOrderId = Number(orderId);

    return reviews.find((review) => {
      return (
        Number(review?.order_id || review?.orderId || 0) === numericOrderId
      );
    });
  }

  function canWriteReview(order) {
    const status = String(order?.order_status || "")
      .trim()
      .toLowerCase();

    return status === "completed" || status === "delivered";
  }

  function openReviewModal(order) {
    setReviewOrder(order);
    setReviewRating(0);
    setReviewComment("");
  }

  function closeReviewModal() {
    if (reviewSubmitting) {
      return;
    }

    setReviewOrder(null);
    setReviewRating(0);
    setReviewComment("");
  }

  function renderStars(rating, interactive = false) {
    return (
      <div className={interactive ? "review-stars" : "review-rating-display"}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            className={
              interactive
                ? `review-star ${star <= rating ? "selected" : ""}`
                : undefined
            }
            onClick={
              interactive
                ? () => setReviewRating(star)
                : undefined
            }
            aria-label={
              interactive ? `Rate ${star} out of 5 stars` : undefined
            }
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  async function handleSubmitReview(event) {
    event.preventDefault();

    if (!reviewOrder) {
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      alert("Please select a rating from 1 to 5 stars.");
      return;
    }

    const comment = reviewComment.trim();

    if (!comment) {
      alert("Please write a review.");
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/bbf_shippingdb/add_order_review.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: Number(reviewOrder.order_id),
            rating: Number(reviewRating),
            review_comment: comment,
          }),
        },
      );

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Invalid review response:", responseText);

        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your review.");
      }

      const savedReview = {
        ...(data.review || {}),
        order_id: Number(reviewOrder.order_id),
        rating: Number(reviewRating),
        comment,
        review: comment,
        product_name: "BloomBox Florals Order",
      };

      setReviews((previousReviews) => {
        const updatedReviews = [
          ...previousReviews.filter(
            (review) =>
              Number(review?.order_id || review?.orderId || 0) !==
              Number(reviewOrder.order_id),
          ),
          savedReview,
        ];

        localStorage.setItem("reviews", JSON.stringify(updatedReviews));

        return updatedReviews;
      });

      setReviewOrder(null);
      setReviewRating(0);
      setReviewComment("");
    } catch (submitError) {
      console.error("Failed to submit review:", submitError);

      alert(
        submitError?.message ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  /*
    -------------------------------------------------------
    LOGOUT
    -------------------------------------------------------
  */

  function handleLogout() {
    sessionStorage.clear();

    localStorage.removeItem("client");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/");
  }

  /*
    -------------------------------------------------------
    ORDER SELECTION
    -------------------------------------------------------
  */

  function handleSelectOrder(order) {
    setSelectedOrder(order);
  }

  function handleBackToHistory() {
    setSelectedOrder(null);
  }

  /*
    -------------------------------------------------------
    LOADING
    -------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="bloombox-wrapper">
        <Header />

        <main className="order-history-page">
          <div className="order-history-container">
            <div className="order-history-breadcrumb">
              <span onClick={() => navigate("/home")}>Home</span>

              <span>/</span>

              <span>Order History</span>
            </div>

            <div className="order-history-heading">
              <h1>Order History</h1>

              <p>View your delivered and cancelled orders.</p>
            </div>

            <div className="empty-history">
              <span className="material-symbols-outlined">history</span>

              <h2>Loading Order History</h2>

              <p>Please wait while we retrieve your previous orders.</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
    -------------------------------------------------------
    ERROR
    -------------------------------------------------------
  */

  if (error) {
    return (
      <div className="bloombox-wrapper">
        <Header />

        <main className="order-history-page">
          <div className="order-history-container">
            <div className="order-history-breadcrumb">
              <span onClick={() => navigate("/home")}>Home</span>

              <span>/</span>

              <span>Order History</span>
            </div>

            <div className="order-history-heading">
              <h1>Order History</h1>

              <p>View your delivered and cancelled orders.</p>
            </div>

            <div className="empty-history">
              <span className="material-symbols-outlined">error</span>

              <h2>Unable to Load History</h2>

              <p>{error}</p>

              <button type="button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
    -------------------------------------------------------
    SELECTED ORDER DETAILS
    -------------------------------------------------------
  */

  if (selectedOrder) {
    const selectedItems = Array.isArray(selectedOrder.items)
      ? selectedOrder.items.filter((item) => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const currentOrderId = Number(selectedOrder.order_id || 0);

          const itemOrderId = Number(item.order_id || 0);

          if (
            currentOrderId > 0 &&
            itemOrderId > 0 &&
            currentOrderId !== itemOrderId
          ) {
            return false;
          }

          return Number(item.item_id || 0) > 0;
        })
      : [];

    const review = getOrderReview(selectedOrder.order_id);

    const itemCount = selectedItems.reduce(
      (total, item) => total + Number(item?.quantity || 0),
      0,
    );

    const orderTotal = Number(selectedOrder.unit_price || 0);

    return (
      <div className="bloombox-wrapper">
        <Header />

        <main className="order-history-page">
          <div className="order-history-container">
            <div className="order-history-breadcrumb">
              <span onClick={() => navigate("/home")}>Home</span>

              <span>/</span>

              <span onClick={handleBackToHistory}>Order History</span>

              <span>/</span>

              <span>
                Order #{String(selectedOrder.order_id).padStart(4, "0")}
              </span>
            </div>

            <button
              type="button"
              className="order-detail-back"
              onClick={handleBackToHistory}
            >
              <i
                className="bi bi-arrow-left"
                style={{ marginRight: "7px" }}
              ></i>
              Back to Order History
            </button>

            <div className="order-detail-grid">
              <section className="order-detail-card">
                <div className="order-detail-header">
                  <div>
                    <small>ORDER NUMBER</small>

                    <h2>#{String(selectedOrder.order_id).padStart(4, "0")}</h2>
                  </div>

                  <span
                    className={`history-status ${getStatusClass(
                      selectedOrder.order_status,
                    )}`}
                  >
                    {formatStatus(selectedOrder.order_status)}
                  </span>
                </div>

                <div className="order-detail-date">
                  <span>Order date</span>

                  <strong>{formatDateTime(selectedOrder.order_date)}</strong>
                </div>

                <h3>Items Ordered</h3>

                <div className="order-detail-products">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item) => {
                      const itemId = Number(item.item_id);

                      const itemName =
                        String(item.item_name || "").trim() ||
                        "BloomBox Bouquet";

                      const quantity = Number(item.quantity || 1);

                      const unitPrice = Number(item.unit_price || 0);

                      const subtotal = unitPrice * quantity;

                      const template = getOrderItemTemplate(
                        item,
                        selectedOrder,
                      );

                      return (
                        <div
                          className="order-detail-product"
                          key={`history-order-${selectedOrder.order_id}-item-${itemId}`}
                        >
                          <div className="history-product-image">
                            {template ? (
                              <div
                                className="history-template-preview"
                                style={{
                                  background:
                                    `radial-gradient(circle at 25% 30%, ` +
                                    `${template.colors[0]} 0 22%, transparent 23%), ` +
                                    `radial-gradient(circle at 70% 30%, ` +
                                    `${template.colors[1]} 0 25%, transparent 26%), ` +
                                    `radial-gradient(circle at 50% 75%, ` +
                                    `${template.colors[2]} 0 28%, transparent 29%), ` +
                                    `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]}, ${template.colors[2]})`,
                                }}
                              >
                                <span>
                                  <i className="bi bi-flower1"></i>
                                </span>
                              </div>
                            ) : item.item_image ? (
                              <img src={item.item_image} alt={itemName} />
                            ) : (
                              <i
                                className="bi bi-flower1"
                                style={{
                                  color: "#773448",
                                  fontSize: "24px",
                                }}
                              ></i>
                            )}
                          </div>

                          <div>
                            <small>
                              {template ? "BOUQUET TEMPLATE" : "PRODUCT"}
                            </small>

                            <strong>{itemName}</strong>

                            <span>Quantity: {quantity}</span>
                          </div>

                          <strong>{formatPrice(subtotal)}</strong>
                        </div>
                      );
                    })
                  ) : (
                    <div className="order-detail-product">
                      <div className="history-product-image">
                        <i
                          className="bi bi-flower1"
                          style={{
                            color: "#773448",
                            fontSize: "24px",
                          }}
                        ></i>
                      </div>

                      <div>
                        <small>PRODUCT</small>

                        <strong>BloomBox Florals Order</strong>

                        <span>Quantity: 1</span>
                      </div>

                      <strong>{formatPrice(selectedOrder.unit_price)}</strong>
                    </div>
                  )}
                </div>

                <div className="order-detail-total">
                  <span>
                    Total{" "}
                    {itemCount > 0
                      ? `(${itemCount} ${itemCount === 1 ? "item" : "items"})`
                      : ""}
                  </span>

                  <strong>{formatPrice(orderTotal)}</strong>
                </div>
              </section>

              <aside className="order-summary-card">
                <h2>Order Summary</h2>

                <div>
                  <span>Order ID</span>

                  <strong>
                    #{String(selectedOrder.order_id).padStart(4, "0")}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>{formatStatus(selectedOrder.order_status)}</strong>
                </div>

                <div>
                  <span>Order Date</span>

                  <strong>{formatDate(selectedOrder.order_date)}</strong>
                </div>

                <div>
                  <span>Delivery</span>

                  <strong>
                    {formatDeliveryMethod(selectedOrder.delivery_method)}
                  </strong>
                </div>

                <div>
                  <span>Payment</span>

                  <strong>{formatPaymentMethod(selectedOrder)}</strong>
                </div>

                <div className="summary-total">
                  <span>Total</span>

                  <strong>{formatPrice(orderTotal)}</strong>
                </div>
              </aside>
            </div>

            <section className="customer-review-section">
              <div className="review-section-header">
                <h2>Customer Review</h2>

                {canWriteReview(selectedOrder) && !review && (
                  <button
                    type="button"
                    className="history-review-button"
                    onClick={() => openReviewModal(selectedOrder)}
                  >
                    Write Review
                  </button>
                )}
              </div>

              {review ? (
                <div className="saved-review">
                  <div className="review-product">
                    <strong>
                      {review.product_name ||
                        review.product ||
                        "BloomBox Florals Order"}
                    </strong>

                    <span>
                      {"★".repeat(
                        Math.max(0, Math.min(5, Number(review.rating || 0))),
                      )}
                    </span>
                  </div>

                  {review.comment && <p>{review.comment}</p>}

                  {!review.comment && review.review && (
                    <p>{review.review}</p>
                  )}
                </div>
              ) : (
                <p className="no-review">
                  {canWriteReview(selectedOrder)
                    ? "You have not written a review for this order yet."
                    : "Reviews are not available for cancelled orders."}
                </p>
              )}
            </section>

            <button
              type="button"
              className="order-detail-back-button"
              onClick={handleBackToHistory}
            >
              Back to Order History
            </button>
          </div>
        </main>

        <Footer />

        {reviewOrder && (
          <div
            className="review-modal-overlay"
            onClick={closeReviewModal}
          >
            <div
              className="review-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewModal}
                disabled={reviewSubmitting}
                aria-label="Close review modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="review-modal-header">
                <h2>Write a Review</h2>

                <p>
                  Share your experience with your BloomBox Florals order.
                </p>
              </div>

              <form
                className="review-modal-form"
                onSubmit={handleSubmitReview}
              >
                <div className="review-rating-field">
                  <label>Rating</label>

                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`review-star ${
                          star <= reviewRating ? "selected" : ""
                        }`}
                        onClick={() => setReviewRating(star)}
                        disabled={reviewSubmitting}
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <span className="review-rating-text">
                    {reviewRating > 0
                      ? `${reviewRating} out of 5 stars`
                      : "Select a rating"}
                  </span>
                </div>

                <div className="review-comment-field">
                  <label htmlFor="review-comment">Your Review</label>

                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    placeholder="Write your review here..."
                    maxLength={500}
                    disabled={reviewSubmitting}
                    rows={5}
                  ></textarea>

                  <span className="review-character-count">
                    {reviewComment.length}/500
                  </span>
                </div>

                <div className="review-modal-actions">
                  <button
                    type="button"
                    className="review-cancel-button"
                    onClick={closeReviewModal}
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="review-submit-button"
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /*
    -------------------------------------------------------
    EMPTY HISTORY
    -------------------------------------------------------
  */

  if (historyOrders.length === 0) {
    return (
      <div className="bloombox-wrapper">
        <Header />

        <main className="order-history-page">
          <div className="order-history-container">
            <div className="order-history-breadcrumb">
              <span onClick={() => navigate("/home")}>Home</span>

              <span>/</span>

              <span>Order History</span>
            </div>

            <div className="order-history-heading">
              <h1>Order History</h1>

              <p>View your delivered and cancelled orders.</p>
            </div>

            <div className="empty-history">
              <span className="material-symbols-outlined">history</span>

              <h2>No Order History</h2>

              <p>You do not have any delivered or cancelled orders yet.</p>

              <button type="button" onClick={() => navigate("/customize-bouquet")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
    -------------------------------------------------------
    MAIN ORDER HISTORY
    -------------------------------------------------------
  */

  return (
    <div className="bloombox-wrapper">
      <Header />

      <main className="order-history-page">
        <div className="order-history-container">
          <div className="order-history-breadcrumb">
            <span onClick={() => navigate("/home")}>Home</span>

            <span>/</span>

            <span>Order History</span>
          </div>

          <div className="order-history-heading">
            <h1>Order History</h1>

            <p>View your delivered and cancelled orders.</p>
          </div>

          <div className="history-list">
            {historyOrders.map((order) => {
              const items = Array.isArray(order.items)
                ? order.items.filter((item) => {
                    if (!item || typeof item !== "object") {
                      return false;
                    }

                    const currentOrderId = Number(order.order_id || 0);

                    const itemOrderId = Number(item.order_id || 0);

                    if (
                      currentOrderId > 0 &&
                      itemOrderId > 0 &&
                      currentOrderId !== itemOrderId
                    ) {
                      return false;
                    }

                    return Number(item.item_id || 0) > 0;
                  })
                : [];

              const total = Number(order.unit_price || 0);

              return (
                <article
                  className="history-order-card"
                  key={order.order_id}
                  onClick={() => handleSelectOrder(order)}
                >
                  <div className="history-order-header">
                    <div>
                      <small>ORDER NUMBER</small>

                      <strong>
                        #{String(order.order_id).padStart(4, "0")}
                      </strong>
                    </div>

                    <div>
                      <small>ORDER DATE</small>

                      <strong>{formatDate(order.order_date)}</strong>
                    </div>

                    <span
                      className={`history-status ${getStatusClass(
                        order.order_status,
                      )}`}
                    >
                      {formatStatus(order.order_status)}
                    </span>
                  </div>

                  <div className="history-products">
                    {items.length > 0 ? (
                      items.map((item) => {
                        const itemId = Number(item.item_id);

                        const itemName =
                          String(item.item_name || "").trim() ||
                          "BloomBox Bouquet";

                        const quantity = Number(item.quantity || 1);

                        const unitPrice = Number(item.unit_price || 0);

                        const subtotal = unitPrice * quantity;

                        const template = getOrderItemTemplate(item, order);

                        return (
                          <div
                            className="history-product"
                            key={`history-${order.order_id}-${itemId}`}
                          >
                            <div className="history-product-image">
                              {template ? (
                                <div
                                  className="history-template-preview"
                                  style={{
                                    background:
                                      `radial-gradient(circle at 25% 30%, ` +
                                      `${template.colors[0]} 0 22%, transparent 23%), ` +
                                      `radial-gradient(circle at 70% 30%, ` +
                                      `${template.colors[1]} 0 25%, transparent 26%), ` +
                                      `radial-gradient(circle at 50% 75%, ` +
                                      `${template.colors[2]} 0 28%, transparent 29%), ` +
                                      `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]}, ${template.colors[2]})`,
                                  }}
                                >
                                  <span>
                                    <i className="bi bi-flower1"></i>
                                  </span>
                                </div>
                              ) : item.item_image ? (
                                <img src={item.item_image} alt={itemName} />
                              ) : (
                                <i
                                  className="bi bi-flower1"
                                  style={{
                                    color: "#773448",
                                    fontSize: "24px",
                                  }}
                                ></i>
                              )}
                            </div>

                            <div className="history-product-info">
                              <small>
                                {template ? "BOUQUET TEMPLATE" : "PRODUCT"}
                              </small>

                              <h3>{itemName}</h3>

                              <span>Quantity: {quantity}</span>
                            </div>

                            <strong>{formatPrice(subtotal)}</strong>
                          </div>
                        );
                      })
                    ) : (
                      <div className="history-product">
                        <div className="history-product-image">
                          <i
                            className="bi bi-flower1"
                            style={{
                              color: "#773448",
                              fontSize: "24px",
                            }}
                          ></i>
                        </div>

                        <div className="history-product-info">
                          <small>PRODUCT</small>

                          <h3>BloomBox Florals Order</h3>

                          <span>Quantity: 1</span>
                        </div>

                        <strong>{formatPrice(total)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="history-order-footer">
                    <span>Total</span>

                    <strong>{formatPrice(total)}</strong>
                  </div>

                  <div className="history-view-details">
                    View Order Details
                    <i
                      className="bi bi-arrow-right"
                      style={{
                        marginLeft: "6px",
                      }}
                    ></i>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderHistory;
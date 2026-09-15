import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./OrderHistory.css";

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const loadData = () => {
            const savedHistory =
                JSON.parse(localStorage.getItem("orderHistory")) || [];

            const savedReviews =
                JSON.parse(localStorage.getItem("reviews")) || [];

            setOrders(savedHistory);
            setReviews(savedReviews);
        };

        loadData();

        window.addEventListener("orderUpdated", loadData);
        window.addEventListener("storage", loadData);

        return () => {
            window.removeEventListener("orderUpdated", loadData);
            window.removeEventListener("storage", loadData);
        };
    }, []);

    const getImage = (product) => {
        return (
            product?.image ||
            product?.img ||
            product?.imageUrl ||
            product?.thumbnail ||
            "/images/fundamentals/logo.png"
        );
    };

    const getName = (product) => {
        return (
            product?.name ||
            product?.title ||
            product?.productName ||
            "Product"
        );
    };

    const getStatus = (order) => {
        const status = String(order.status || "").toLowerCase();

        if (status === "cancelled" || status === "canceled") {
            return "Cancelled";
        }

        return "Completed";
    };

    const getOrderReview = (order) => {
        return reviews.filter(
            (review) =>
                review.orderId === order.orderId ||
                review.orderID === order.orderId
        );
    };

    const openOrder = (order) => {
        setSelectedOrder(order);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeOrder = () => {
        setSelectedOrder(null);
    };

    if (selectedOrder) {
        const orderReviews = getOrderReview(selectedOrder);

        return (
            <>
                <Header />

                <main className="order-history-page">
                    <div className="order-history-container">
                        <button
                            className="order-detail-back"
                            onClick={closeOrder}
                        >
                            ← Past Orders
                        </button>

                        <div className="order-history-heading">
                            <h1>Order Details</h1>
                            <p>
                                Review your order information and feedback.
                            </p>
                        </div>

                        <div className="order-detail-grid">
                            <section className="order-detail-card">
                                <div className="order-detail-header">
                                    <div>
                                        <small>Order ID</small>
                                        <h2>
                                            {selectedOrder.orderId || "N/A"}
                                        </h2>
                                    </div>

                                    <span
                                        className={`history-status ${getStatus(
                                            selectedOrder
                                        )
                                            .toLowerCase()
                                            .replace(" ", "-")}`}
                                    >
                                        {getStatus(selectedOrder)}
                                    </span>
                                </div>

                                <div className="order-detail-date">
                                    <span>Date</span>
                                    <strong>
                                        {selectedOrder.date
                                            ? new Date(
                                                  selectedOrder.date
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </strong>
                                </div>

                                <h3>Ordered Products</h3>

                                <div className="order-detail-products">
                                    {selectedOrder.items?.map(
                                        (product, index) => (
                                            <div
                                                className="order-detail-product"
                                                key={index}
                                            >
                                                <img
                                                    src={getImage(product)}
                                                    alt={getName(product)}
                                                />

                                                <div>
                                                    <small>Product</small>
                                                    <strong>
                                                        {getName(product)}
                                                    </strong>
                                                    <span>
                                                        Quantity:{" "}
                                                        {
                                                            product.quantity
                                                        }
                                                    </span>
                                                </div>

                                                <strong>
                                                    ₱
                                                    {(
                                                        Number(
                                                            product.price || 0
                                                        ) *
                                                        Number(
                                                            product.quantity ||
                                                                1
                                                        )
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="order-detail-total">
                                    <span>Total Amount</span>
                                    <strong>
                                        ₱
                                        {Number(
                                            selectedOrder.total || 0
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            </section>

                            <aside className="order-summary-card">
                                <h2>Order Summary</h2>

                                <div>
                                    <span>Order Status</span>
                                    <strong>
                                        {getStatus(selectedOrder)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Payment</span>
                                    <strong>
                                        {selectedOrder.paymentMethod ||
                                            "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Delivery</span>
                                    <strong>
                                        {selectedOrder.deliveryMethod ||
                                            "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Shipping</span>
                                    <strong>
                                        ₱
                                        {Number(
                                            selectedOrder.shipping || 0
                                        ).toFixed(2)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Taxes</span>
                                    <strong>
                                        ₱
                                        {Number(
                                            selectedOrder.taxes || 0
                                        ).toFixed(2)}
                                    </strong>
                                </div>

                                {Number(selectedOrder.discount || 0) > 0 && (
                                    <div>
                                        <span>Discount</span>
                                        <strong>
                                            -₱
                                            {Number(
                                                selectedOrder.discount
                                            ).toFixed(2)}
                                        </strong>
                                    </div>
                                )}

                                <div className="summary-total">
                                    <span>Total</span>
                                    <strong>
                                        ₱
                                        {Number(
                                            selectedOrder.total || 0
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            </aside>
                        </div>

                        <section className="customer-review-section">
                            <div className="review-section-header">
                                <h2>User Review / Feedback</h2>

                                {getStatus(selectedOrder) === "Completed" && (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem(
                                                "lastOrder",
                                                JSON.stringify(selectedOrder)
                                            );
                                            navigate("/review");
                                        }}
                                    >
                                        Write Review
                                    </button>
                                )}
                            </div>

                            {orderReviews.length === 0 ? (
                                <p className="no-review">
                                    No review or feedback has been submitted
                                    for this order yet.
                                </p>
                            ) : (
                                <div className="saved-reviews">
                                    {orderReviews.map((review, index) => (
                                        <div
                                            className="saved-review"
                                            key={index}
                                        >
                                            <div className="review-product">
                                                <strong>
                                                    {review.productName ||
                                                        review.product?.name ||
                                                        "Product"}
                                                </strong>

                                                <span>
                                                    {review.rating
                                                        ? `${review.rating}/5`
                                                        : "No rating"}
                                                </span>
                                            </div>

                                            <p>
                                                {review.comment ||
                                                    review.feedback ||
                                                    review.review ||
                                                    "No written feedback."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <button
                            className="order-detail-back-button"
                            onClick={closeOrder}
                        >
                            Save and Proceed Back
                        </button>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="order-history-page">
                <div className="order-history-container">
                    <div className="order-history-breadcrumb">
                        <span onClick={() => navigate("/")}>Home</span>
                        <span>/</span>
                        <strong>Order History</strong>
                    </div>

                    <div className="order-history-heading">
                        <h1>Order History</h1>
                        <p>View your completed and cancelled orders.</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="empty-history">
                            <span className="material-symbols-outlined">
                                receipt_long
                            </span>

                            <h2>No Past Orders</h2>

                            <p>
                                Your completed or cancelled orders will appear
                                here.
                            </p>

                            <button onClick={() => navigate("/")}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="history-list">
                            {orders
                                .slice()
                                .reverse()
                                .map((order, orderIndex) => (
                                    <div
                                        className="history-order-card"
                                        key={
                                            order.orderId ||
                                            orderIndex
                                        }
                                        onClick={() => openOrder(order)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                openOrder(order);
                                            }
                                        }}
                                    >
                                        <div className="history-order-header">
                                            <div>
                                                <small>Order ID</small>
                                                <strong>
                                                    {order.orderId || "N/A"}
                                                </strong>
                                            </div>

                                            <div>
                                                <small>Date</small>
                                                <strong>
                                                    {order.date
                                                        ? new Date(
                                                              order.date
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </strong>
                                            </div>

                                            <span
                                                className={`history-status ${getStatus(
                                                    order
                                                )
                                                    .toLowerCase()
                                                    .replace(" ", "-")}`}
                                            >
                                                {getStatus(order)}
                                            </span>
                                        </div>

                                        <div className="history-products">
                                            {order.items?.map(
                                                (
                                                    product,
                                                    productIndex
                                                ) => (
                                                    <div
                                                        className="history-product"
                                                        key={productIndex}
                                                    >
                                                        <div className="history-product-image">
                                                            <img
                                                                src={getImage(
                                                                    product
                                                                )}
                                                                alt={getName(
                                                                    product
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="history-product-info">
                                                            <small>
                                                                Product
                                                            </small>

                                                            <h3>
                                                                {getName(
                                                                    product
                                                                )}
                                                            </h3>

                                                            <span>
                                                                Quantity:{" "}
                                                                {
                                                                    product.quantity
                                                                }
                                                            </span>
                                                        </div>

                                                        <strong>
                                                            ₱
                                                            {(
                                                                Number(
                                                                    product.price ||
                                                                        0
                                                                ) *
                                                                Number(
                                                                    product.quantity ||
                                                                        1
                                                                )
                                                            ).toFixed(2)}
                                                        </strong>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div className="history-order-footer">
                                            <span>Total Amount</span>

                                            <strong>
                                                ₱
                                                {Number(
                                                    order.total || 0
                                                ).toFixed(2)}
                                            </strong>
                                        </div>

                                        <div className="history-view-details">
                                            Click to view order details →
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default OrderHistory;
import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./OrderComplete.css";

function OrderComplete() {
    const [order, setOrder] = useState(() => {
        return JSON.parse(localStorage.getItem("lastOrder") || "null");
    });

    useEffect(() => {
        const updateOrder = () => {
            const savedOrder = JSON.parse(
                localStorage.getItem("lastOrder") || "null"
            );
            setOrder(savedOrder);
        };

        window.addEventListener("orderUpdated", updateOrder);
        window.addEventListener("storage", updateOrder);

        return () => {
            window.removeEventListener("orderUpdated", updateOrder);
            window.removeEventListener("storage", updateOrder);
        };
    }, []);

    if (!order) {
        return (
            <div className="bloombox-wrapper order-complete-page">
                <Header />

                <main className="order-empty">
                    <span className="material-symbols-outlined">
                        receipt_long
                    </span>

                    <h1>No Order Found</h1>

                    <p>
                        There is no recently placed order to display.
                    </p>

                    <a href="/" className="order-back-btn">
                        Continue Shopping
                    </a>
                </main>

                <Footer />
            </div>
        );
    }

    const customerName =
        `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim();

    const paymentNames = {
        cod: "Cash on Delivery",
        gcash: "GCash",
        card: "Credit Card",
    };

    const getStatusClass = (status) => {
        return `order-status ${status.toLowerCase().replace(/\s+/g, "-")}`;
    };

    const downloadInvoice = () => {
        window.print();
    };

    return (
        <div className="bloombox-wrapper order-complete-page">
            <Header />

            <main className="order-complete-main">
                <div className="container">

                    <div className="order-success">
                        <div className="success-icon">
                            <span className="material-symbols-outlined">
                                check
                            </span>
                        </div>

                        <h1>Your order is completed!</h1>

                        <p>
                            Thank you. Your order has been received.
                        </p>

                        <div className="order-breadcrumb">
                            <a href="/">Home</a>
                            <span>/</span>
                            <span>Order Complete</span>
                        </div>
                    </div>

                    <div className="order-info-card">

                        <div className="order-info-item">
                            <span>Order ID</span>
                            <strong>{order.orderId}</strong>
                        </div>

                        <div className="order-info-item">
                            <span>Payment Method</span>
                            <strong>
                                {paymentNames[order.paymentMethod] ||
                                    order.paymentMethod}
                            </strong>
                        </div>

                        <div className="order-info-item">
                            <span>Transaction ID</span>
                            <strong>{order.transactionId}</strong>
                        </div>

                        <div className="order-info-item">
                            <span>Estimated Delivery</span>
                            <strong>{order.estimatedDelivery}</strong>
                        </div>

                        <div className="order-info-action">
                            <button
                                type="button"
                                onClick={downloadInvoice}
                            >
                                <span className="material-symbols-outlined">
                                    download
                                </span>
                                Download Invoice
                            </button>
                        </div>

                    </div>

                    <div className="order-status-card">
                        <div>
                            <span>Order Status</span>
                            <strong>
                                {order.status}
                            </strong>
                        </div>

                        <span className={getStatusClass(order.status)}>
                            {order.status}
                        </span>
                    </div>

                    <section className="order-details-card">

                        <div className="order-details-header">
                            <h2>Order Details</h2>
                            <span>
                                {order.items.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                )}{" "}
                                items
                            </span>
                        </div>

                        <div className="order-product-heading">
                            <span>Product</span>
                            <span>Sub Total</span>
                        </div>

                        <div className="order-products">

                            {order.items.map((item, index) => (
                                <div
                                    className="order-product"
                                    key={`${item.id}-${index}`}
                                >
                                    <div className="order-product-left">

                                        <div className="order-product-image">
                                            <img
                                                src={
                                                    item.image ||
                                                    item.img ||
                                                    "/images/fundamentals/logo.png"
                                                }
                                                alt={item.name}
                                            />
                                        </div>

                                        <div className="order-product-info">
                                            <span>
                                                {item.category ||
                                                    "Flower"}
                                            </span>

                                            <strong>
                                                {item.name}
                                            </strong>

                                            <small>
                                                Qty: {item.quantity}
                                            </small>
                                        </div>

                                    </div>

                                    <strong className="order-product-price">
                                        ₱
                                        {(
                                            item.price * item.quantity
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            ))}

                        </div>

                        <div className="order-summary-lines">

                            <div>
                                <span>Shipping</span>
                                <strong>
                                    ₱{order.shipping.toFixed(2)}
                                </strong>
                            </div>

                            <div>
                                <span>Taxes</span>
                                <strong>
                                    ₱{order.taxes.toFixed(2)}
                                </strong>
                            </div>

                            {order.discount > 0 && (
                                <div className="order-discount">
                                    <span>Coupon Discount</span>
                                    <strong>
                                        -₱{order.discount.toFixed(2)}
                                    </strong>
                                </div>
                            )}

                        </div>

                        <div className="order-total">
                            <span>Total</span>
                            <strong>
                                ₱{order.total.toFixed(2)}
                            </strong>
                        </div>

                    </section>

                    <div className="order-actions">
    <a href="/" className="continue-shopping-btn">
        Continue Shopping
    </a>

    <a
        href="/order-history"
        className="admin-orders-link"
    >
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
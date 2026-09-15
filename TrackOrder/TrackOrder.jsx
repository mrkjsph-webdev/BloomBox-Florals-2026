import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./TrackOrder.css";

const statusSteps = [
    {
        key: "placed",
        title: "Order Placed",
        icon: "receipt_long",
    },
    {
        key: "accepted",
        title: "Accepted",
        icon: "fact_check",
    },
    {
        key: "progress",
        title: "In Progress",
        icon: "inventory_2",
    },
    {
        key: "way",
        title: "On The Way",
        icon: "local_shipping",
    },
    {
        key: "delivered",
        title: "Delivered",
        icon: "package_2",
    },
];

function TrackOrder() {
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const loadOrder = () => {
            const savedOrder = localStorage.getItem("lastOrder");

            if (savedOrder) {
                setOrder(JSON.parse(savedOrder));
            }
        };

        loadOrder();

        window.addEventListener("orderUpdated", loadOrder);
        window.addEventListener("storage", loadOrder);

        return () => {
            window.removeEventListener("orderUpdated", loadOrder);
            window.removeEventListener("storage", loadOrder);
        };
    }, []);

    const getStatusIndex = () => {
        if (!order) return 0;

        const status = order.status || "placed";

        return statusSteps.findIndex((step) => step.key === status);
    };

    const currentStatusIndex = getStatusIndex();

    const getStepDate = (index) => {
        if (!order) return "";

        if (index === 0) {
            return new Date(order.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        }

        if (index <= currentStatusIndex) {
            return "Updated";
        }

        return "Expected";
    };

    return (
        <div className="track-order-page">
            <Header />

            <main className="track-order-main">
                <div className="container">

                    <div className="track-page-heading">
                        <p>ORDER TRACKING</p>
                        <h1>Track Your Order</h1>

                        <div className="track-breadcrumb">
                            <a href="/">Home</a>
                            <span>/</span>
                            <span>Track Your Order</span>
                        </div>
                    </div>

                    {!order ? (
                        <div className="track-empty">
                            <span className="material-symbols-outlined">
                                local_shipping
                            </span>

                            <h2>No Recent Order</h2>

                            <p>
                                Place an order first to track your delivery
                                status.
                            </p>

                            <a href="/" className="track-shop-btn">
                                Continue Shopping
                            </a>
                        </div>
                    ) : (
                        <>
                            <section className="order-status-section">

                                <div className="order-status-heading">
                                    <div>
                                        <p>ORDER STATUS</p>
                                        <h2>Order Status</h2>
                                    </div>

                                    <div className="order-id">
                                        Order ID: <strong>#{order.orderId}</strong>
                                    </div>
                                </div>

                                <div className="status-timeline">

                                    {statusSteps.map((step, index) => {
                                        const completed =
                                            index <= currentStatusIndex;

                                        return (
                                            <React.Fragment key={step.key}>

                                                <div
                                                    className={
                                                        completed
                                                            ? "status-step completed"
                                                            : "status-step"
                                                    }
                                                >
                                                    <div className="status-icon">
                                                        <span className="material-symbols-outlined">
                                                            {step.icon}
                                                        </span>
                                                    </div>

                                                    <h3>{step.title}</h3>

                                                    <p>
                                                        {getStepDate(index)}
                                                    </p>
                                                </div>

                                                {index <
                                                    statusSteps.length - 1 && (
                                                    <div
                                                        className={
                                                            index <
                                                            currentStatusIndex
                                                                ? "status-line completed"
                                                                : "status-line"
                                                        }
                                                    ></div>
                                                )}

                                            </React.Fragment>
                                        );
                                    })}

                                </div>

                            </section>

                            <section className="track-products">

                                <div className="track-products-header">
                                    <p>ORDER ITEMS</p>
                                    <h2>Products</h2>
                                </div>

                                <div className="track-product-list">

                                    {order.items?.map((item, index) => (
                                        <div
                                            className="track-product"
                                            key={`${item.id}-${index}`}
                                        >
                                            <div className="track-product-image">
                                                <img
                                                    src={
                                                        item.image ||
                                                        item.img ||
                                                        "/images/fundamentals/logo.png"
                                                    }
                                                    alt={item.name}
                                                />
                                            </div>

                                            <div className="track-product-info">
                                                <span>
                                                    {item.category ||
                                                        "Flower"}
                                                </span>

                                                <h3>{item.name}</h3>

                                                <p>
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>

                                            <strong className="track-product-price">
                                                ₱
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </strong>
                                        </div>
                                    ))}

                                </div>

                            </section>
                        </>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default TrackOrder;
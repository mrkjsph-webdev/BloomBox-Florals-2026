import React, { useEffect, useState } from "react";
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import "./Notifications.css";

const defaultNotifications = [
    {
        id: 1,
        title: "Order Confirmed",
        message: "Your order #ORD-1024 has been successfully confirmed.",
        type: "unread",
        date: "Today",
    },
    {
        id: 2,
        title: "Order Ready",
        message: "Your bouquet is being prepared. Our florist is currently arranging the flowers for Order #ORD-1024.",
        type: "unread",
        date: "Today",
    },
    {
        id: 3,
        title: "Out for Delivery",
        message: "Your order is on the way! Order #ORD-1024 has been picked up by the delivery rider.",
        type: "unread",
        date: "Today",
    },
    {
        id: 4,
        title: "Delivery Reminder",
        message: "Delivery pending for Order #ORD-1025. Please proceed with the customer's delivery address.",
        type: "seen",
        date: "Yesterday",
    },
    {
        id: 5,
        title: "Delivery Complete",
        message: "Order #ORD-1025 marked as delivered. Customer delivery has been successfully completed.",
        type: "seen",
        date: "Yesterday",
    },
    {
        id: 6,
        title: "Order Delivered",
        message: "Your order #ORD-1024 has been successfully delivered.",
        type: "seen",
        date: "Yesterday",
    },
];

function Notifications() {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("notifications");

        if (saved) {
            return JSON.parse(saved);
        }

        localStorage.setItem(
            "notifications",
            JSON.stringify(defaultNotifications)
        );

        return defaultNotifications;
    });

    useEffect(() => {
        const updateNotifications = () => {
            const saved = localStorage.getItem("notifications");

            if (saved) {
                setNotifications(JSON.parse(saved));
            }
        };

        window.addEventListener("notificationsUpdated", updateNotifications);
        window.addEventListener("storage", updateNotifications);

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                updateNotifications
            );
            window.removeEventListener("storage", updateNotifications);
        };
    }, []);

    const unreadNotifications = notifications.filter(
        (notification) => notification.type === "unread"
    );

    const seenNotifications = notifications.filter(
        (notification) => notification.type === "seen"
    );

    const markAsRead = (id) => {
        const updated = notifications.map((notification) =>
            notification.id === id
                ? { ...notification, type: "seen" }
                : notification
        );

        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
        window.dispatchEvent(new Event("notificationsUpdated"));
    };

    const markAllAsRead = () => {
        const updated = notifications.map((notification) => ({
            ...notification,
            type: "seen",
        }));

        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
        window.dispatchEvent(new Event("notificationsUpdated"));
    };

    return (
        <div className="notifications-page">
            <Header />

            <main className="notifications-main">
                <div className="container">

                    <div className="notifications-heading">
                        <div>
                            <h1>Notifications</h1>

                            <div className="notifications-breadcrumb">
                                <a href="/">Home</a>
                                <span>/</span>
                                <span>Notifications</span>
                            </div>
                        </div>

                        {unreadNotifications.length > 0 && (
                            <button
                                className="mark-all-btn"
                                onClick={markAllAsRead}
                            >
                                Mark All as Read
                            </button>
                        )}
                    </div>

                    <section className="notification-section">

                        <div className="notification-section-title">
                            <span className="unread-dot"></span>
                            <h2>Unread</h2>
                            <span className="notification-count">
                                {unreadNotifications.length}
                            </span>
                        </div>

                        <p className="notification-subtitle">
                            🔔 You have {unreadNotifications.length} new
                            notification
                            {unreadNotifications.length !== 1 ? "s" : ""}
                        </p>

                        {unreadNotifications.length === 0 ? (
                            <div className="notification-empty">
                                You're all caught up.
                            </div>
                        ) : (
                            <div className="notification-list">
                                {unreadNotifications.map((notification) => (
                                    <button
                                        className="notification-item unread"
                                        key={notification.id}
                                        onClick={() =>
                                            markAsRead(notification.id)
                                        }
                                    >
                                        <div className="notification-content">
                                            <strong>
                                                {notification.title}
                                            </strong>

                                            <span>
                                                {notification.message}
                                            </span>
                                        </div>

                                        <span className="notification-time">
                                            {notification.date}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                    </section>

                    <section className="notification-section seen-section">

                        <div className="notification-section-title">
                            <span className="seen-dot"></span>
                            <h2>Seen</h2>
                            <span className="notification-count seen-count">
                                {seenNotifications.length}
                            </span>
                        </div>

                        {seenNotifications.length === 0 ? (
                            <div className="notification-empty">
                                No seen notifications.
                            </div>
                        ) : (
                            <div className="notification-list">
                                {seenNotifications.map((notification) => (
                                    <div
                                        className="notification-item seen"
                                        key={notification.id}
                                    >
                                        <div className="notification-content">
                                            <strong>
                                                {notification.title}
                                            </strong>

                                            <span>
                                                {notification.message}
                                            </span>
                                        </div>

                                        <span className="notification-time">
                                            {notification.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Notifications;
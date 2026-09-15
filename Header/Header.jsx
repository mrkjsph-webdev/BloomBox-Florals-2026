import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const updateCounts = () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const notifications =
                JSON.parse(localStorage.getItem("notifications")) || [];

            const cartTotal = cart.reduce(
                (total, item) => total + item.quantity,
                0
            );

            const unreadTotal = notifications.filter(
                (notification) => notification.type === "unread"
            ).length;

            setCartCount(cartTotal);
            setNotificationCount(unreadTotal);
        };

        updateCounts();

        window.addEventListener("storage", updateCounts);
        window.addEventListener("cartUpdated", updateCounts);
        window.addEventListener("notificationsUpdated", updateCounts);

        return () => {
            window.removeEventListener("storage", updateCounts);
            window.removeEventListener("cartUpdated", updateCounts);
            window.removeEventListener(
                "notificationsUpdated",
                updateCounts
            );
        };
    }, []);

    return (
        <header className="bloombox-header">
            <div className="container">

                <a href="/" className="me-auto">
                    <img
                        src="/images/fundamentals/logo.png"
                        alt="BloomBox Florals"
                        className="brand-logo"
                    />
                </a>

                <nav className="d-flex align-items-center gap-4">
                    <a href="/#home" className="nav-link">
                        Home
                    </a>

                    <a href="/#shop" className="nav-link">
                        Shop
                    </a>

                    <a href="/#about" className="nav-link">
                        About Us
                    </a>

                    <a href="/#contact" className="nav-link">
                        Contact
                    </a>
                </nav>

                <div className="d-flex align-items-center gap-3 ms-4">

                    <span className="material-symbols-outlined nav-icon">
                        search
                    </span>

                    <button
                        className="header-notification-icon"
                        onClick={() => navigate("/notifications")}
                        aria-label="Notifications"
                    >
                        <span className="material-symbols-outlined nav-icon">
                            notifications
                        </span>

                        {notificationCount > 0 && (
                            <span className="notification-badge">
                                {notificationCount > 99
                                    ? "99+"
                                    : notificationCount}
                            </span>
                        )}
                    </button>

                    <button
                        className="cart-icon"
                        onClick={() => navigate("/shopping-cart")}
                    >
                        <span className="material-symbols-outlined nav-icon">
                            shopping_cart
                        </span>

                        {cartCount > 0 && (
                            <span className="cart-badge">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <span className="material-symbols-outlined nav-icon">
                        person
                    </span>

                </div>

            </div>
        </header>
    );
}

export default Header;
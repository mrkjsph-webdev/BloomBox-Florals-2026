import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import logo from "../assets/fundamentals/logo.png";

function Header() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateCounts = () => {
      const storedClient = localStorage.getItem("client");

      let loggedIn = false;

      if (storedClient) {
        try {
          const client = JSON.parse(storedClient);

          if (client && client.client_id) {
            loggedIn = true;
          }
        } catch (error) {
          console.error("Invalid client session:", error);
          localStorage.removeItem("client");
        }
      }

      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        setCartCount(0);
        setNotificationCount(0);
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];

      const cartTotal = cart.reduce((total, item) => total + item.quantity, 0);

      const unreadTotal = notifications.filter(
        (notification) => notification.type === "unread",
      ).length;

      setCartCount(cartTotal);
      setNotificationCount(unreadTotal);
    };

    updateCounts();

    window.addEventListener("storage", updateCounts);
    window.addEventListener("cartUpdated", updateCounts);
    window.addEventListener("notificationsUpdated", updateCounts);
    window.addEventListener("loginStatusChanged", updateCounts);

    return () => {
      window.removeEventListener("storage", updateCounts);
      window.removeEventListener("cartUpdated", updateCounts);
      window.removeEventListener("notificationsUpdated", updateCounts);
      window.removeEventListener("loginStatusChanged", updateCounts);
    };
  }, []);

  return (
    <header className="bloombox-header">
      <div className="container">
        <a href="/" className="me-auto">
          <img src={logo} alt="BloomBox Florals" className="brand-logo" />
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
          <span className="bi bi-search nav-icon"></span>

          {isLoggedIn && (
            <>
              <button
                className="header-notification-icon"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
              >
                <span className="bi bi-bell nav-icon"></span>

                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              <button
                className="cart-icon"
                onClick={() => navigate("/shopping-cart")}
              >
                <span className="bi bi-cart3 nav-icon"></span>

                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>

              <button
                className="profile-icon"
                onClick={() => navigate("/profile")}
                aria-label="Profile"
              >
                <span className="bi bi-person nav-icon"></span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

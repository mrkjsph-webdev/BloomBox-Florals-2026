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

  const requireLogin = () => {
    const storedClient = localStorage.getItem("client");

    if (storedClient) {
      try {
        const client = JSON.parse(storedClient);

        if (client && client.client_id) {
          navigate("/home");
          return;
        }
      } catch (error) {
        console.error("Invalid client session:", error);
        localStorage.removeItem("client");
      }
    }

    navigate("/login");
  };

  const handleBrandClick = () => {
    const storedClient = localStorage.getItem("client");

    if (storedClient) {
      try {
        const client = JSON.parse(storedClient);

        if (client && client.client_id) {
          navigate("/home");
          return;
        }
      } catch (error) {
        console.error("Invalid client session:", error);
        localStorage.removeItem("client");
      }
    }

    navigate("/#home");
  };

  useEffect(() => {
    const updateCounts = () => {
      const storedClient = localStorage.getItem("client");

      let loggedIn = false;
      let client = null;

      if (storedClient) {
        try {
          client = JSON.parse(storedClient);

          if (client && client.client_id) {
            loggedIn = true;
          }
        } catch (error) {
          console.error("Invalid client session:", error);
          localStorage.removeItem("client");
        }
      }

      setIsLoggedIn(loggedIn);

      if (!loggedIn || !client) {
        setCartCount(0);
        setNotificationCount(0);
        return;
      }

      /*
       * Get notifications from the database.
       *
       * The backend returns:
       * notification.type = "unread" or "seen"
       */
      fetch("http://localhost/bbf_clientdb/get_notifications.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number(client.client_id),
        }),
        cache: "no-store",
      })
        .then(async (response) => {
          const responseText = await response.text();

          let data;

          try {
            data = JSON.parse(responseText);
          } catch (error) {
            console.error("Invalid notifications response:", responseText);

            setNotificationCount(0);
            return null;
          }

          if (!response.ok || !data.success) {
            console.error(data?.message || "Failed to load notifications.");

            setNotificationCount(0);
            return null;
          }

          return data;
        })
        .then((data) => {
          if (!data) {
            return;
          }

          const notifications = Array.isArray(data.notifications)
            ? data.notifications
            : [];

          const unreadTotal = notifications.filter(
            (notification) => notification.type === "unread",
          ).length;

          setNotificationCount(unreadTotal);
        })
        .catch((error) => {
          console.error("Failed to load notifications:", error);

          setNotificationCount(0);
        });

      fetch("http://localhost/bbf_clientdb/cart.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          client_id: Number(client.client_id),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && Array.isArray(data.items)) {
            const bouquetIds = new Set();

            data.items.forEach((item) => {
              let customization = null;

              try {
                customization =
                  typeof item.customization === "string"
                    ? JSON.parse(item.customization)
                    : item.customization;
              } catch (error) {
                customization = null;
              }

              /*
               * Match the same grouping logic used by ShoppingCart.jsx.
               *
               * If a bouquet_id exists, all flowers belonging to that
               * customized bouquet count as ONE bouquet.
               *
               * If there is no bouquet_id, use the item_id as a fallback.
               */
              const bouquetId =
                customization?.bouquet_id || `item_${item.item_id}`;

              bouquetIds.add(bouquetId);
            });

            setCartCount(bouquetIds.size);
          } else {
            setCartCount(0);
          }
        })
        .catch((error) => {
          console.error("Failed to load cart count:", error);

          setCartCount(0);
        });
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
        <button
          type="button"
          className="me-auto border-0 bg-transparent p-0"
          onClick={handleBrandClick}
          aria-label="BloomBox Florals Home"
        >
          <img src={logo} alt="BloomBox Florals" className="brand-logo" />
        </button>

        {!isLoggedIn && (
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
        )}

        <div className="d-flex align-items-center gap-3 ms-4">
          {isLoggedIn && (
            <>
              <button
                type="button"
                className="header-notification-icon"
                onClick={() => navigate("/notifications")}
                aria-label={`Notifications${
                  notificationCount > 0 ? `, ${notificationCount} unread` : ""
                }`}
              >
                <i className="bi bi-bell nav-icon"></i>

                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="cart-icon"
                onClick={() => navigate("/shopping-cart")}
                aria-label="Shopping Cart"
              >
                <i className="bi bi-cart3 nav-icon"></i>

                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="profile-icon"
                onClick={() => navigate("/profile")}
                aria-label="Profile"
              >
                <i className="bi bi-person nav-icon"></i>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

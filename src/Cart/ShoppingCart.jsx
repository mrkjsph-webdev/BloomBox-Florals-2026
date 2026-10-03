import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./ShoppingCart.css";

const API_URL = "http://localhost/bbf_clientdb/cart.php";

const groupBouquets = (cartItems) => {
  const grouped = {};

  cartItems.forEach((item) => {
    let customization = item.customization;

    if (typeof customization === "string") {
      try {
        customization = JSON.parse(customization);
      } catch (error) {
        console.error("Failed to parse customization:", error);

        customization = {};
      }
    }

    const bouquetId = customization?.bouquet_id || `item_${item.item_id}`;

    if (!grouped[bouquetId]) {
      grouped[bouquetId] = {
        id: bouquetId,
        cart_id: item.cart_id,
        item_id: item.item_id,
        cart_item_ids: [],
        name: customization?.template?.name || "Customized Bouquet",
        quantity: 1,
        customization,
        flowers: [],
      };
    }

    /*
     * Keep every database cart item ID that belongs
     * to this customized bouquet.
     */
    if (!grouped[bouquetId].cart_item_ids.includes(item.item_id)) {
      grouped[bouquetId].cart_item_ids.push(item.item_id);
    }

    const flowerCustomization = customization?.flowers?.[0] || {};

    grouped[bouquetId].flowers.push({
      item_id: item.item_id,
      flower_id: item.flower_id,
      name: flowerCustomization.name || item.name || "Flower",
      quantity: Number(flowerCustomization.quantity || item.quantity || 1),
      unit_price: Number(
        flowerCustomization.unit_price ||
          flowerCustomization.price ||
          item.price ||
          item.unit_price ||
          0,
      ),
    });
  });

  return Object.values(grouped);
};

/*
 * Calculates the complete price of one
 * customized bouquet.
 *
 * Template
 * + Paper
 * + Wrapper
 * + Flowers
 * + Greeting Card
 * + Mini Stuff Toy
 */
const calculateBouquetTotal = (item) => {
  const customization = item.customization || {};

  const templatePrice = Number(customization.template?.price || 0);

  const paperPrice = Number(customization.paper_size?.price || 0);

  const wrapperPrice = Number(customization.wrapper?.price || 0);

  const flowerTotal = (item.flowers || []).reduce(
    (sum, flower) =>
      sum + Number(flower.unit_price || 0) * Number(flower.quantity || 1),
    0,
  );

  const greetingCardPrice = customization.greeting_card ? 50 : 0;

  const plushToyPrice = customization.plush_toy ? 120 : 0;

  return (
    templatePrice +
    paperPrice +
    wrapperPrice +
    flowerTotal +
    greetingCardPrice +
    plushToyPrice
  );
};

function ShoppingCart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  let storedClient = null;

  try {
    storedClient = JSON.parse(localStorage.getItem("client") || "null");
  } catch (error) {
    console.error("Invalid client data:", error);
  }

  const clientId = storedClient?.client_id;

  const loadCart = async () => {
    if (!clientId) {
      setItems([]);
      setSelectedItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          client_id: clientId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        /*
         * cart.php now only returns items where
         * is_selected = 0.
         *
         * Therefore, once checkout marks an item
         * as selected, it automatically disappears
         * from this cart.
         */
        const groupedItems = groupBouquets(data.items || []);

        setItems(groupedItems);

        /*
         * Remove selections that no longer
         * exist in the database cart.
         */
        setSelectedItems((previous) =>
          previous.filter((id) => groupedItems.some((item) => item.id === id)),
        );
      } else {
        console.error("Failed to load cart:", data.message);

        setItems([]);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error("Error loading shopping cart:", error);

      setItems([]);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [clientId]);

  /*
   * Reload the cart whenever another component
   * tells us that the cart has changed.
   */
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);

      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [clientId]);

  const toggleItem = (bouquetId) => {
    setSelectedItems((previous) =>
      previous.includes(bouquetId)
        ? previous.filter((id) => id !== bouquetId)
        : [...previous, bouquetId],
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const removeBouquet = async (item) => {
    try {
      /*
       * Manual Remove still permanently removes
       * the cart rows because this is an explicit
       * cart-management action.
       */
      for (const itemId of item.cart_item_ids || []) {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "remove",
            client_id: clientId,
            item_id: itemId,
          }),
        });
      }

      setSelectedItems((previous) => previous.filter((id) => id !== item.id));

      await loadCart();

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to remove bouquet:", error);
    }
  };

  const clearCart = async () => {
    if (!clientId) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear",
          client_id: clientId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems([]);
        setSelectedItems([]);

        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        console.error("Failed to clear cart:", data.message);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const selectedBouquets = items.filter((item) =>
    selectedItems.includes(item.id),
  );

  /*
   * Calculate the actual customized
   * bouquet subtotal.
   *
   * There is NO shipping fee here.
   */
  const subtotal = selectedBouquets.reduce(
    (sum, item) => sum + calculateBouquetTotal(item),
    0,
  );

  const total = subtotal;

  /*
   * Send the selected customized bouquets
   * to Checkout.jsx.
   */
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return;
    }

    const checkoutBouquets = selectedBouquets.map((item) => {
      const customizedPrice = calculateBouquetTotal(item);

      return {
        id: item.id,
        cart_id: item.cart_id,
        item_id: item.item_id,

        /*
         * Keep ALL database cart item IDs.
         *
         * A customized bouquet can consist
         * of several shopping_cart_items rows.
         */
        cart_item_ids: item.cart_item_ids || [],

        // Bouquet information
        name: item.name,
        bouquet_name: item.name,
        template_name: item.name,

        // Complete customization
        customization: item.customization,

        // All flowers included in the bouquet
        flowers: item.flowers || [],

        // One cart item = one customized bouquet
        quantity: 1,

        // Complete customized bouquet price
        unit_price: customizedPrice,
        price: customizedPrice,
        total_price: customizedPrice,
      };
    });

    console.log("Sending selected bouquets to Checkout:", checkoutBouquets);

    localStorage.setItem("checkoutItems", JSON.stringify(checkoutBouquets));

    localStorage.removeItem("checkoutShipping");

    localStorage.removeItem("checkoutDiscount");

    navigate("/checkout");
  };

  /*
   * Clear temporary bouquet customization
   * before returning to the Bouquet Customizer.
   *
   * This does NOT clear the database cart.
   */
  const handleContinueShopping = () => {
    const storedClient = localStorage.getItem("client");

    if (storedClient) {
      try {
        const client = JSON.parse(storedClient);

        if (client?.client_id) {
          sessionStorage.removeItem(`bouquetFlowers_${client.client_id}`);
        }
      } catch (error) {
        console.error("Failed to clear bouquet selections:", error);
      }
    }

    navigate("/customize-bouquet");
  };

  if (loading) {
    return (
      <>
        <Header />

        <main className="shopping-cart-page">
          <div className="container shopping-cart-main">
            <div className="text-center py-5">
              <p>Loading your cart...</p>
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

      <main className="shopping-cart-page">
        <div className="container shopping-cart-main">
          {/* PAGE HEADING */}
          <div className="cart-page-heading">
            <div className="cart-eyebrow">Your Selection</div>

            <h1>Shopping Cart</h1>

            <p>Review your customized bouquets before checkout.</p>
          </div>

          <div className="cart-breadcrumb">
            <Link to="/home">Home</Link>

            <span>/</span>

            <span>Shopping Cart</span>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>

              <p>Your perfect bouquet is waiting to be created.</p>

              <Link to="/customize-bouquet">Create a Bouquet</Link>
            </div>
          ) : (
            <div className="row g-4">
              {/* CART ITEMS */}
              <div className="col-lg-8">
                <div className="cart-section-header">
                  <h2>Your Bouquets</h2>

                  <div className="cart-header-actions">
                    <span>
                      {items.length}{" "}
                      {items.length === 1 ? "bouquet" : "bouquets"}
                    </span>

                    <button
                      type="button"
                      className="clear-all-btn"
                      onClick={clearCart}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="summary-selection">
                  <div>
                    <span className="selected-count">
                      {selectedItems.length} selected
                    </span>

                    <small>Choose the bouquets you want to checkout.</small>
                  </div>

                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={toggleAll}
                  >
                    {selectedItems.length === items.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="cart-products">
                  {items.map((item) => {
                    const customization = item.customization || {};

                    const itemTotal = calculateBouquetTotal(item);

                    const isSelected = selectedItems.includes(item.id);

                    return (
                      <div
                        className={`cart-product ${
                          isSelected ? "cart-product-selected" : ""
                        }`}
                        key={item.id}
                      >
                        <div className="cart-select">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(item.id)}
                          />
                        </div>

                        <div className="cart-product-image">
                          <div className="cart-bouquet-icon">
                            <i className="bi bi-flower1"></i>
                          </div>
                        </div>

                        <div className="cart-product-info">
                          <p className="cart-product-category">
                            Customized Bouquet
                          </p>

                          <h3>{item.name}</h3>

                          <p className="cart-product-price">
                            ₱{itemTotal.toFixed(2)}
                          </p>

                          <div className="cart-customization">
                            {customization.paper_size?.name && (
                              <span>
                                Paper: {customization.paper_size.name}
                              </span>
                            )}

                            {customization.wrapper?.name && (
                              <span>Wrapper: {customization.wrapper.name}</span>
                            )}

                            {item.flowers?.length > 0 && (
                              <span>
                                Flowers:{" "}
                                {item.flowers
                                  .map(
                                    (flower) =>
                                      `${flower.name} ×${flower.quantity}`,
                                  )
                                  .join(", ")}
                              </span>
                            )}

                            {customization.greeting_card && (
                              <span>Greeting Card</span>
                            )}

                            {customization.plush_toy && (
                              <span>Mini Stuff Toy</span>
                            )}
                          </div>
                        </div>

                        <div className="cart-product-actions">
                          <button
                            type="button"
                            className="cart-remove"
                            onClick={() => removeBouquet(item)}
                          >
                            <i className="bi bi-trash3"></i>
                            Remove
                          </button>
                        </div>

                        <div className="cart-product-total">
                          ₱{itemTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="col-lg-4">
                <div className="order-summary">
                  <div className="summary-heading">
                    <h2>Order Summary</h2>

                    <p>Your selected bouquet items</p>
                  </div>

                  <div className="summary-lines">
                    <div className="summary-line">
                      <span>Subtotal</span>

                      <strong>₱{subtotal.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>

                    <span>₱{total.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    <span>Proceed to Checkout</span>

                    <i className="bi bi-arrow-right"></i>
                  </button>

                  <p className="secure-checkout">
                    <i className="bi bi-shield-check"></i> Secure checkout
                  </p>
                </div>

                <button
                  type="button"
                  className="continue-shopping"
                  onClick={handleContinueShopping}
                >
                  <i className="bi bi-arrow-left"></i>

                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ShoppingCart;

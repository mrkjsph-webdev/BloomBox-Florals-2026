import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Header from '../Header/Header'; 
import Footer from '../Footer/Footer';

import './ShoppingCart.css';

function ShoppingCart() {
    const [items, setItems] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);

    const toggleItem = (id) => {
        setSelectedItems((current) =>
            current.includes(id)
                ? current.filter((itemId) => itemId !== id)
                : [...current, id]
        );
    };

    const toggleAll = () => {
        if (items.length === 0) {
            return;
        }

        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item.id));
        }
    };

    const updateQuantity = (id, amount) => {
        const updatedItems = items.map((item) =>
            item.id === id
                ? {
                    ...item,
                    quantity: Math.max(1, item.quantity + amount)
                }
                : item
        );

        setItems(updatedItems);
        localStorage.setItem("cart", JSON.stringify(updatedItems));
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const removeItem = (id) => {
        const updatedItems = items.filter((item) => item.id !== id);

        setItems(updatedItems);
        setSelectedItems((current) =>
            current.filter((itemId) => itemId !== id)
        );

        localStorage.setItem("cart", JSON.stringify(updatedItems));
        window.dispatchEvent(new Event("cartUpdated"));
    };
    const clearCart = () => {
    setItems([]);
    setSelectedItems([]);
    setDiscount(0);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
};

    const selectedCartItems = items.filter((item) =>
        selectedItems.includes(item.id)
    );

    const cartSubtotal = selectedCartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const shipping = selectedCartItems.length > 0 ? 10 : 0;

    const taxes = cartSubtotal * 0.10;

    const total = cartSubtotal + shipping + taxes - discount;

    const applyCoupon = () => {
        if (coupon.trim().toUpperCase() === "BLOOM10") {
            setDiscount(cartSubtotal * 0.10);
        } else {
            setDiscount(0);
        }
    };

    return (
        <div className="bloombox-wrapper shopping-cart-page">

            <Header />

            <main className="container shopping-cart-main">

                <div className="cart-page-heading">
                    <p className="cart-eyebrow">
                    </p>

                    <h1>
                        Shopping Cart
                    </h1>

                    <p>
                        Review your selected flowers before checkout.
                    </p>
                </div>

                <p className="cart-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Shopping Cart</span>
                </p>

                {items.length === 0 ? (

                    <div className="empty-cart">

                        <i className="bi bi-bag-fill"></i>

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Add some beautiful flowers to your cart to get started.
                        </p>

                        <a
                            href="/home"
                            className="cart-continue-btn"
                        >
                            Continue Shopping
                        </a>

                    </div>

                ) : (

                    <div className="row g-5 align-items-start">

                        <div className="col-lg-8">

                            <div className="cart-section">

                                <div className="cart-section-header">

                                    <div>

                                        <h2>
                                            Your Items
                                        </h2>

                                        <p>
                                            {items.length} product
                                            {items.length !== 1 ? "s" : ""}
                                        </p>

                                    </div>

                                    <span className="cart-count">

                                        {items.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0
                                        )}

                                        {" "}

                                        items

                                    </span>

                                </div>

                                <div className="cart-products">

                                    {items.map((item) => (

                                        <div
                                            className="cart-product"
                                            key={item.id}
                                        >

                                            <div className="cart-select">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(
                                                        item.id
                                                    )}
                                                    onChange={() =>
                                                        toggleItem(item.id)
                                                    }
                                                />

                                            </div>

                                            <div className="cart-product-image">

                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                />

                                            </div>

                                            <div className="cart-product-info">

                                                <p className="cart-product-category">
                                                    {item.category}
                                                </p>

                                                <h3>
                                                    {item.name}
                                                </h3>

                                                <p className="cart-product-price">
                                                    ₱{item.price.toFixed(2)}
                                                </p>

                                                <div className="cart-product-actions">

                                                    <div className="qty-picker">

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    -1
                                                                )
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span>
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    1
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                    <button
                                                        className="cart-remove"
                                                        onClick={() =>
                                                            removeItem(item.id)
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="cart-product-total">

                                                <p>
                                                    Subtotal
                                                </p>

                                                <strong>
                                                    ₱
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </strong>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>

                            <div className="continue-shopping">

                                <a href="/">

                                    <span className="material-symbols-outlined">
                                        arrow_back
                                    </span>

                                    Continue Shopping

                                </a>

                            </div>

                        </div>

                        <div className="col-lg-4">

                            <div className="order-summary">

                                <div className="summary-heading">

                                    <p>
                                        ORDER DETAILS
                                    </p>

                                    <h2>
                                        Order Summary
                                    </h2>

                                </div>

                                <div className="summary-selection">

                                    <div>

                                        <span className="selected-count">
                                            {selectedCartItems.length} selected
                                        </span>

                                    </div>

                                    <div className="cart-header-actions">

                                    <button
                                        className="select-all-btn"
                                        onClick={toggleAll}
                                    >
                                        {selectedItems.length === items.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </button>

                                    <button
                                        className="clear-all-btn"
                                        onClick={clearCart}
                                    >
                                        Clear All
                                    </button>

                                </div>

                                </div>

                                <div className="summary-lines">

                                    <div className="summary-line">

                                        <span>
                                            Items
                                        </span>

                                        <strong>

                                            {selectedCartItems.reduce(
                                                (total, item) =>
                                                    total + item.quantity,
                                                0
                                            )}

                                        </strong>

                                    </div>

                                    <div className="summary-line">

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            ₱{cartSubtotal.toFixed(2)}
                                        </strong>

                                    </div>

                                    <div className="summary-line">

                                        <span>
                                            Shipping
                                        </span>

                                        <strong>
                                            ₱{shipping.toFixed(2)}
                                        </strong>

                                    </div>

                                    <div className="summary-line">

                                        <span>
                                            Taxes
                                        </span>

                                        <strong>
                                            ₱{taxes.toFixed(2)}
                                        </strong>

                                    </div>

                                    <div className="summary-line discount-line">

                                        <span>
                                            Coupon Discount
                                        </span>

                                        <strong>
                                            -₱{discount.toFixed(2)}
                                        </strong>

                                    </div>

                                </div>

                                <div className="coupon-box">

                                    <label>
                                        Have a coupon?
                                    </label>

                                    <div className="coupon-input">

                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={coupon}
                                            onChange={(e) =>
                                                setCoupon(e.target.value)
                                            }
                                        />

                                        <button onClick={applyCoupon}>
                                            Apply
                                        </button>

                                    </div>

                                    <small>
                                        Try BLOOM10 for 10% off.
                                    </small>

                                </div>

                                <div className="summary-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ₱{total.toFixed(2)}
                                    </strong>

                                </div>

                                <button
    className="checkout-btn"
    disabled={selectedItems.length === 0}
    onClick={() => {
        const checkoutItems = items.filter((item) =>
            selectedItems.includes(item.id)
        );

        localStorage.setItem(
            "checkoutItems",
            JSON.stringify(checkoutItems)
        );

        localStorage.setItem(
            "checkoutDiscount",
            discount.toString()
        );

        window.location.href = "/checkout";
    }}
>
    Proceed to Checkout

</button>

                                <p className="secure-checkout">

                                    <span className="material-symbols-outlined">
                                        lock
                                    </span>

                                    Secure checkout

                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </main>

            <Footer />

        </div>
    );
}

export default ShoppingCart;
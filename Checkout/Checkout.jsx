import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Checkout.css";

function CardPaymentForm({ onCardAdded }) {
    const [cardData, setCardData] = useState({
        holderName: "",
        cardNumber: "",
        expiry: "",
        ccv: "",
        saveCard: true,
    });

    const [selectedPayment, setSelectedPayment] = useState("visa8096");

    const handleCardChange = (e) => {
        const { name, value, type, checked } = e.target;

        setCardData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const addCard = () => {
        if (
            !cardData.holderName.trim() ||
            !cardData.cardNumber.trim() ||
            !cardData.expiry.trim() ||
            !cardData.ccv.trim()
        ) {
            alert("Please complete all card details.");
            return;
        }

        onCardAdded(cardData);
    };

    return (
        <div className="card-payment-panel">
            <div className="card-payment-title">
                <h3>Select Payment Method</h3>
            </div>

            <div className="saved-payment-options">
                <label
                    className={`saved-payment-option ${
                        selectedPayment === "paypal" ? "selected" : ""
                    }`}
                >
                    <input
                        type="radio"
                        name="savedPayment"
                        checked={selectedPayment === "paypal"}
                        onChange={() => setSelectedPayment("paypal")}
                    />
                    <span className="payment-radio"></span>
                    <span className="payment-brand paypal-brand">
                        PayPal
                    </span>
                </label>

                <label
                    className={`saved-payment-option ${
                        selectedPayment === "visa8096" ? "selected" : ""
                    }`}
                >
                    <input
                        type="radio"
                        name="savedPayment"
                        checked={selectedPayment === "visa8096"}
                        onChange={() => setSelectedPayment("visa8096")}
                    />
                    <span className="payment-radio"></span>
                    <span className="payment-brand visa-brand">
                        <strong>VISA</strong>
                        <span>Card ending in 8096</span>
                    </span>
                </label>

                <label
                    className={`saved-payment-option ${
                        selectedPayment === "debitCard" ? "selected" : ""
                    }`}
                >
                    <input
                        type="radio"
                        name="savedPayment"
                        checked={selectedPayment === "debitCard"}
                        onChange={() => setSelectedPayment("debitCard")}
                    />
                    <span className="payment-radio"></span>
                    <span className="payment-brand visa-brand">
                        <strong>DEBIT</strong>
                        <span>Card ending in XXXX</span>
                    </span>
                </label>

                <label
                    className={`saved-payment-option ${
                        selectedPayment === "googlePay" ? "selected" : ""
                    }`}
                >
                    <input
                        type="radio"
                        name="savedPayment"
                        checked={selectedPayment === "googlePay"}
                        onChange={() => setSelectedPayment("googlePay")}
                    />
                    <span className="payment-radio"></span>
                    <span className="payment-brand google-pay-brand">
                        Google Pay
                    </span>
                </label>
            </div>

            <label
                className={`new-card-heading ${
                    selectedPayment === "newCard" ? "selected" : ""
                }`}
            >
                <input
                    type="radio"
                    name="savedPayment"
                    checked={selectedPayment === "newCard"}
                    onChange={() => setSelectedPayment("newCard")}
                />
                <strong>Add New Credit/Debit Card</strong>
            </label>

            {selectedPayment === "newCard" && (
                <div className="new-card-form">
                    <div className="card-form-field">
                        <label>Card Holder Name*</label>
                        <input
                            type="text"
                            name="holderName"
                            placeholder="Ex. John Doe"
                            value={cardData.holderName}
                            onChange={handleCardChange}
                        />
                    </div>

                    <div className="card-form-field">
                        <label>Card Number*</label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="Enter Card Number"
                            value={cardData.cardNumber}
                            onChange={handleCardChange}
                            maxLength="19"
                        />
                    </div>

                    <div className="card-form-row">
                        <div className="card-form-field">
                            <label>Expiry Date*</label>
                            <input
                                type="text"
                                name="expiry"
                                placeholder="MM/YY"
                                value={cardData.expiry}
                                onChange={handleCardChange}
                                maxLength="5"
                            />
                        </div>

                        <div className="card-form-field">
                            <label>CCV*</label>
                            <input
                                type="text"
                                name="ccv"
                                placeholder="123"
                                value={cardData.ccv}
                                onChange={handleCardChange}
                                maxLength="4"
                            />
                        </div>
                    </div>

                    <div className="card-form-actions">
                        <label className="save-card-option">
                            <input
                                type="checkbox"
                                name="saveCard"
                                checked={cardData.saveCard}
                                onChange={handleCardChange}
                            />
                            <span>Save card for future payments</span>
                        </label>

                        <button
                            type="button"
                            className="add-card-btn"
                            onClick={addCard}
                        >
                            Add Card
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Checkout() {
    const checkoutItems = JSON.parse(
        localStorage.getItem("checkoutItems") || "[]"
    );

    const savedDiscount = Number(
        localStorage.getItem("checkoutDiscount") || 0
    );

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        company: "",
        country: "Philippines",
        state: "",
        city: "",
        zipCode: "",
        phone: "",
        email: "",
        address: "",
        apartment: "",
    });

    const [sameShipping, setSameShipping] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [deliveryMethod, setDeliveryMethod] = useState("standard");

    const handleCardAdded = () => {
        setPaymentMethod("card");
        alert("Card added successfully.");
    };

    const subtotal = checkoutItems.reduce(
        (total, item) =>
            total + Number(item.price) * Number(item.quantity),
        0
    );

    const shipping =
        checkoutItems.length === 0
            ? 0
            : deliveryMethod === "express"
            ? 100
            : 50;

    const taxes = subtotal * 0.1;

    const total = Math.max(
        0,
        subtotal + shipping + taxes - savedDiscount
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const placeOrder = (e) => {
        e.preventDefault();

        const requiredFields = [
            "firstName",
            "lastName",
            "country",
            "state",
            "city",
            "zipCode",
            "phone",
            "email",
            "address",
        ];

        const missingField = requiredFields.find(
            (field) => !String(formData[field]).trim()
        );

        if (missingField) {
            alert("Please complete all required billing details.");
            return;
        }

        if (!sameShipping) {
            alert("Please use the same shipping address for this checkout.");
            return;
        }

        if (checkoutItems.length === 0) {
            alert("There are no items ready for checkout.");
            window.location.href = "/shopping-cart";
            return;
        }

        const currentCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const checkoutIds = checkoutItems.map((item) => item.id);

        const remainingCart = currentCart.filter(
            (item) => !checkoutIds.includes(item.id)
        );

        const orderId = `ORD-${Date.now().toString().slice(-8)}`;

        const order = {
            orderId,
            customer: formData,
            paymentMethod,
            deliveryMethod,
            items: checkoutItems,
            subtotal,
            shipping,
            taxes,
            discount: savedDiscount,
            total,
            date: new Date().toISOString(),
            status: "placed",
        };

        const orderHistory = JSON.parse(
            localStorage.getItem("orderHistory") || "[]"
        );

        orderHistory.push(order);

        localStorage.setItem(
            "orderHistory",
            JSON.stringify(orderHistory)
        );

        localStorage.setItem(
            "lastOrder",
            JSON.stringify(order)
        );

        localStorage.setItem(
            "currentOrderId",
            orderId
        );

        localStorage.setItem(
            "cart",
            JSON.stringify(remainingCart)
        );

        const notifications = JSON.parse(
            localStorage.getItem("notifications") || "[]"
        );

        notifications.unshift({
            id: Date.now(),
            type: "unread",
            title: "Order Placed",
            message: `Your order ${orderId} has been successfully placed.`,
            date: new Date().toISOString(),
            orderId,
        });

        localStorage.setItem(
            "notifications",
            JSON.stringify(notifications)
        );

        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("checkoutDiscount");

        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("orderUpdated"));
        window.dispatchEvent(new Event("notificationsUpdated"));

        alert(`Order placed successfully!\nOrder ID: ${orderId}`);

        window.location.href = "/order-complete";
    };

    return (
        <div className="bloombox-wrapper checkout-page">
            <Header />

            <div className="checkout-hero">
                <div className="container">
                    <h1>Checkout</h1>
                    <p>Review your selected flowers before checkout.</p>

                    <p className="checkout-breadcrumb">
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/shopping-cart">Shopping Cart</a>
                        <span>/</span>
                        <span>Checkout</span>
                    </p>
                </div>
            </div>

            <main className="container checkout-main">
                {checkoutItems.length === 0 ? (
                    <div className="checkout-empty">
                        <span className="material-symbols-outlined">
                            shopping_bag
                        </span>

                        <h2>No items to checkout</h2>

                        <p>
                            Please return to your shopping cart and select
                            the items you want to purchase.
                        </p>

                        <a
                            href="/shopping-cart"
                            className="checkout-back-btn"
                        >
                            Back to Shopping Cart
                        </a>
                    </div>
                ) : (
                    <form
                        className="checkout-layout"
                        onSubmit={placeOrder}
                    >
                        <section className="checkout-details">
                            <div className="checkout-section">
                                <div className="checkout-section-title">
                                    <span>01</span>

                                    <div>
                                        <p>YOUR INFORMATION</p>
                                        <h2>Billing Details</h2>
                                    </div>
                                </div>

                                <div className="checkout-grid two-columns">
                                    <div className="checkout-field">
                                        <label>First Name*</label>

                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="Ex. Jane"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>Last Name*</label>

                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Ex. Cooper"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        Company Name
                                        <span>(Optional)</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="company"
                                        placeholder="Enter Company Name"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="checkout-section">
                                <div className="checkout-section-title">
                                    <span>02</span>

                                    <div>
                                        <p>CONTACT & ADDRESS</p>
                                        <h2>Contact Information</h2>
                                    </div>
                                </div>

                                <div className="checkout-field">
                                    <label>Country*</label>

                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="Philippines">
                                            Philippines
                                        </option>
                                        <option value="United States">
                                            United States
                                        </option>
                                        <option value="Canada">
                                            Canada
                                        </option>
                                        <option value="United Kingdom">
                                            United Kingdom
                                        </option>
                                    </select>
                                </div>

                                <div className="checkout-grid two-columns">
                                    <div className="checkout-field">
                                        <label>State / Province*</label>

                                        <input
                                            type="text"
                                            name="state"
                                            placeholder="Ex. Cavite"
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>City*</label>

                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="Ex. Dasmariñas"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="checkout-grid two-columns">
                                    <div className="checkout-field">
                                        <label>Zip Code*</label>

                                        <input
                                            type="text"
                                            name="zipCode"
                                            placeholder="Enter Zip Code"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>Phone Number*</label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Enter Phone Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="checkout-field">
                                    <label>Email Address*</label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>Delivery Address*</label>

                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street address, house number"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="checkout-field">
                                    <label>
                                        Apartment / Unit
                                        <span>(Optional)</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="apartment"
                                        placeholder="Apartment, unit, building"
                                        value={formData.apartment}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="shipping-choice">
                                    <label
                                        className={
                                            sameShipping
                                                ? "shipping-option active"
                                                : "shipping-option"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="shippingAddress"
                                            checked={sameShipping}
                                            onChange={() =>
                                                setSameShipping(true)
                                            }
                                        />

                                        <span>
                                            Same as billing address
                                        </span>
                                    </label>

                                    <label
                                        className={
                                            !sameShipping
                                                ? "shipping-option active"
                                                : "shipping-option"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="shippingAddress"
                                            checked={!sameShipping}
                                            onChange={() =>
                                                setSameShipping(false)
                                            }
                                        />

                                        <span>
                                            Use a different shipping address
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-section">
                                <div className="checkout-section-title">
                                    <span>03</span>

                                    <div>
                                        <p>DELIVERY</p>
                                        <h2>Delivery Method</h2>
                                    </div>
                                </div>

                                <div className="method-options">
                                    <label
                                        className={
                                            deliveryMethod === "standard"
                                                ? "method-card active"
                                                : "method-card"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="standard"
                                            checked={
                                                deliveryMethod === "standard"
                                            }
                                            onChange={(e) =>
                                                setDeliveryMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Standard Delivery
                                            </strong>

                                            <span>
                                                3–5 business days
                                            </span>
                                        </div>

                                        <b>₱50.00</b>
                                    </label>

                                    <label
                                        className={
                                            deliveryMethod === "express"
                                                ? "method-card active"
                                                : "method-card"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value="express"
                                            checked={
                                                deliveryMethod === "express"
                                            }
                                            onChange={(e) =>
                                                setDeliveryMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Express Delivery
                                            </strong>

                                            <span>
                                                1–2 business days
                                            </span>
                                        </div>

                                        <b>₱100.00</b>
                                    </label>
                                </div>
                            </div>

                            <div className="checkout-section">
                                <div className="checkout-section-title">
                                    <span>04</span>

                                    <div>
                                        <p>PAYMENT</p>
                                        <h2>Payment Method</h2>
                                    </div>
                                </div>

                                <div className="method-options">
                                    <label
                                        className={
                                            paymentMethod === "cod"
                                                ? "method-card active"
                                                : "method-card"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={
                                                paymentMethod === "cod"
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Cash on Delivery
                                            </strong>

                                            <span>
                                                Pay when your order arrives
                                            </span>
                                        </div>
                                    </label>

                                    <label
                                        className={
                                            paymentMethod === "gcash"
                                                ? "method-card active"
                                                : "method-card"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="gcash"
                                            checked={
                                                paymentMethod === "gcash"
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>GCash</strong>

                                            <span>
                                                Pay securely using GCash
                                            </span>
                                        </div>
                                    </label>

                                    <label
                                        className={
                                            paymentMethod === "card"
                                                ? "method-card active"
                                                : "method-card"
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={
                                                paymentMethod === "card"
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Credit / Debit Card
                                            </strong>

                                            <span>
                                                Secure card payment
                                            </span>
                                        </div>
                                    </label>

                                    {paymentMethod === "card" && (
                                        <CardPaymentForm
                                            onCardAdded={handleCardAdded}
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        <aside className="checkout-sidebar">
                            <div className="checkout-summary">
                                <div className="checkout-summary-header">
                                    <p>YOUR ORDER</p>

                                    <h2>Order Summary</h2>
                                </div>

                                <div className="checkout-products">
                                    {checkoutItems.map((item) => (
                                        <div
                                            className="checkout-product"
                                            key={item.id}
                                        >
                                            <div className="checkout-product-image">
                                                <img
                                                    src={
                                                        item.image ||
                                                        "/images/fundamentals/logo.png"
                                                    }
                                                    alt={item.name}
                                                />

                                                <span>
                                                    {item.quantity}
                                                </span>
                                            </div>

                                            <div className="checkout-product-info">
                                                <strong>
                                                    {item.name}
                                                </strong>

                                                <span>
                                                    {item.category}
                                                </span>
                                            </div>

                                            <strong className="checkout-product-price">
                                                ₱
                                                {(
                                                    Number(item.price) *
                                                    Number(item.quantity)
                                                ).toFixed(2)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-summary-lines">
                                    <div>
                                        <span>Items</span>

                                        <strong>
                                            {checkoutItems.reduce(
                                                (total, item) =>
                                                    total +
                                                    Number(item.quantity),
                                                0
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Subtotal</span>

                                        <strong>
                                            ₱{subtotal.toFixed(2)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Shipping</span>

                                        <strong>
                                            ₱{shipping.toFixed(2)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Taxes</span>

                                        <strong>
                                            ₱{taxes.toFixed(2)}
                                        </strong>
                                    </div>

                                    {savedDiscount > 0 && (
                                        <div className="checkout-discount">
                                            <span>
                                                Coupon Discount
                                            </span>

                                            <strong>
                                                -₱
                                                {savedDiscount.toFixed(2)}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <div className="checkout-total">
                                    <span>Total</span>

                                    <strong>
                                        ₱{total.toFixed(2)}
                                    </strong>
                                </div>

                                <button
                                    type="submit"
                                    className="place-order-btn"
                                >
                                    Place Order

                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </button>

                                <p className="checkout-security">
                                    <span className="material-symbols-outlined">
                                        lock
                                    </span>

                                    Your information is secure
                                </p>
                            </div>
                        </aside>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Checkout;
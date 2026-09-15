import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./Review.css";

const ratingLabels = [
    "Delivery Performance",
    "Order Appearance",
    "Flower / Bouquet Design"
];

function getProductName(product) {
    return (
        product?.name ||
        product?.title ||
        product?.productName ||
        "Product"
    );
}

function getProductImage(product) {
    return (
        product?.image ||
        product?.img ||
        product?.imageUrl ||
        product?.thumbnail ||
        "/images/fundamentals/logo.png"
    );
}

function Review() {
    const navigate = useNavigate();
    const { productIndex } = useParams();

    const [order, setOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ratings, setRatings] = useState({});
    const [feedback, setFeedback] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const savedOrder = localStorage.getItem("lastOrder");

        if (!savedOrder) {
            return;
        }

        const parsedOrder = JSON.parse(savedOrder);
        setOrder(parsedOrder);

        if (
            productIndex !== undefined &&
            parsedOrder.items &&
            parsedOrder.items[Number(productIndex)]
        ) {
            setSelectedProduct(
                parsedOrder.items[Number(productIndex)]
            );
        }
    }, [productIndex]);

    const chooseProduct = index => {
        navigate(`/review/${index}`);
    };

    const setRating = (category, value) => {
        setRatings(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const submitReview = () => {
        if (!selectedProduct) {
            alert("Please select a product.");
            return;
        }

        const missingRating = ratingLabels.some(
            category => !ratings[category]
        );

        if (missingRating) {
            alert("Please complete all ratings.");
            return;
        }

        const existingReviews =
            JSON.parse(localStorage.getItem("reviews")) || [];

        const review = {
            reviewId: `REV-${Date.now()}`,
            orderId:
                order?.orderId ||
                localStorage.getItem("currentOrderId") ||
                "",
            productIndex: Number(productIndex),
            productId:
                selectedProduct.id ||
                selectedProduct.productId ||
                "",
            productName: getProductName(selectedProduct),
            productImage: getProductImage(selectedProduct),
            ratings,
            feedback,
            uploadedFile: file ? file.name : "",
            customer: order?.customer || {},
            date: new Date().toISOString()
        };

        localStorage.setItem(
            "reviews",
            JSON.stringify([
                ...existingReviews,
                review
            ])
        );

        localStorage.setItem(
            "lastReview",
            JSON.stringify(review)
        );

        window.dispatchEvent(
            new Event("reviewsUpdated")
        );

        navigate("/review/thanks");
    };

    if (!order) {
        return (
            <>
                <Header />

                <main className="review-page">
                    <div className="review-empty">
                        <h1>No Order Found</h1>

                        <p>
                            Complete an order before submitting
                            a review.
                        </p>

                        <button onClick={() => navigate("/")}>
                            Back to Home
                        </button>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    if (
        productIndex === undefined ||
        !selectedProduct
    ) {
        return (
            <>
                <Header />

                <main className="review-page">
                    <div className="review-container">

                        <div className="review-breadcrumb">
                            <span onClick={() => navigate("/")}>
                                Home
                            </span>

                            <span>/</span>

                            <strong>Review</strong>
                        </div>

                        <div className="review-heading">
                            <h1>Review</h1>

                            <p>
                                Select an item from your order to review.
                            </p>
                        </div>

                        <div className="review-list-card">

                            <div className="review-list-header">
                                <span>←</span>
                                <strong>To Rate</strong>
                            </div>

                            {order.items &&
                            order.items.length > 0 ? (
                                order.items.map((product, index) => (
                                    <button
                                        className="review-product-row"
                                        key={index}
                                        onClick={() =>
                                            chooseProduct(index)
                                        }
                                    >
                                        <div className="review-product-image">
                                            <img
                                                src={getProductImage(product)}
                                                alt={getProductName(product)}
                                            />
                                        </div>

                                        <div className="review-product-info">
                                            <small>
                                                Ordered Product
                                            </small>

                                            <h3>
                                                {getProductName(product)}
                                            </h3>

                                            {product.quantity && (
                                                <span>
                                                    Quantity:{" "}
                                                    {product.quantity}
                                                </span>
                                            )}
                                        </div>

                                        <strong>
                                            ₱
                                            {Number(
                                                product.price || 0
                                            ).toFixed(2)}
                                        </strong>
                                    </button>
                                ))
                            ) : (
                                <div className="no-products">
                                    No products were found in this order.
                                </div>
                            )}

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

            <main className="review-page">
                <div className="review-container">

                    <div className="review-breadcrumb">
                        <span onClick={() => navigate("/")}>
                            Home
                        </span>

                        <span>/</span>

                        <span onClick={() => navigate("/review")}>
                            Review
                        </span>

                        <span>/</span>

                        <strong>Rate Product</strong>
                    </div>

                    <div className="review-layout">

                        <section className="review-form-card">

                            <button
                                className="back-product"
                                onClick={() => navigate("/review")}
                            >
                                ← Product
                            </button>

                            <div className="selected-product">

                                <div className="selected-product-image">
                                    <img
                                        src={getProductImage(
                                            selectedProduct
                                        )}
                                        alt={getProductName(
                                            selectedProduct
                                        )}
                                    />
                                </div>

                                <div className="selected-product-info">
                                    <small>
                                        Ordered Product
                                    </small>

                                    <h2>
                                        {getProductName(
                                            selectedProduct
                                        )}
                                    </h2>
                                </div>

                                <strong>
                                    ₱
                                    {Number(
                                        selectedProduct.price || 0
                                    ).toFixed(2)}
                                </strong>

                            </div>

                            <div className="review-main">

                                <div className="upload-section">

                                    <h3>
                                        Rate Our Product
                                    </h3>

                                    <label className="upload-box">

                                        <span className="material-symbols-outlined">
                                            cloud_upload
                                        </span>

                                        <strong>
                                            Choose a file or drag & drop it here
                                        </strong>

                                        <small>
                                            JPEG, PNG, JPG, and MP4 formats,
                                            up to 50MB
                                        </small>

                                        <span className="browse-button">
                                            Browse File
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,video/mp4"
                                            onChange={e =>
                                                setFile(
                                                    e.target.files?.[0] ||
                                                    null
                                                )
                                            }
                                        />

                                    </label>

                                    {file && (
                                        <p className="selected-file">
                                            Selected: {file.name}
                                        </p>
                                    )}

                                </div>

                                <div className="ratings">

                                    {ratingLabels.map(category => (
                                        <div
                                            className="rating-item"
                                            key={category}
                                        >
                                            <span>
                                                {category}
                                            </span>

                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map(
                                                    star => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            className={
                                                                star <=
                                                                (
                                                                    ratings[
                                                                        category
                                                                    ] || 0
                                                                )
                                                                    ? "star active"
                                                                    : "star"
                                                            }
                                                            onClick={() =>
                                                                setRating(
                                                                    category,
                                                                    star
                                                                )
                                                            }
                                                        >
                                                            ★
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                </div>

                            </div>

                            <div className="feedback">

                                <label>
                                    Can you tell us more?
                                </label>

                                <textarea
                                    value={feedback}
                                    onChange={e =>
                                        setFeedback(e.target.value)
                                    }
                                    placeholder="Add your feedback..."
                                />

                                <button
                                    className="submit-review"
                                    onClick={submitReview}
                                >
                                    Send and Proceed
                                </button>

                            </div>

                        </section>

                        <aside className="order-summary">

                            <h3>
                                Order Summary
                            </h3>

                            <div>
                                <span>
                                    Order Status:
                                </span>

                                <strong>
                                    {order.status || "Delivered"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Order ID:
                                </span>

                                <strong>
                                    {order.orderId ||
                                        localStorage.getItem(
                                            "currentOrderId"
                                        ) ||
                                        "N/A"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Products:
                                </span>

                                <strong>
                                    {order.items?.length || 0}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Delivery Method:
                                </span>

                                <strong>
                                    {order.deliveryMethod ||
                                        "Standard"}
                                </strong>
                            </div>

                        </aside>

                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export function ReviewThanks() {
    const navigate = useNavigate();

    return (
        <>
            <Header />

            <main className="review-page">
                <div className="review-container">

                    <div className="review-breadcrumb">
                        <span onClick={() => navigate("/")}>
                            Home
                        </span>

                        <span>/</span>

                        <strong>Review</strong>
                    </div>
                    <div className="review-thanks">
                        <div className="success-icon">✓</div>

                        <h1>Thank you for your review!</h1>

                        <p>
                            Your feedback helps our community
                            <br />
                            grow.
                        </p>

                        <div className="review-thanks-buttons">
                            <button onClick={() => navigate("/")}>
                                Proceed Back Home
                            </button>

                            <button onClick={() => navigate("/order-history")}>
                                View Past Orders
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Review;
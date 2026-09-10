import { Routes, Route } from "react-router-dom";
import FlowerDetails from "./FlowerDetails";
import ShoppingCart from "./ShoppingCart";
import Checkout from "./Checkout";
import OrderComplete from "./OrderComplete";
import Notifications from "./Notifications";
import TrackOrder from "./TrackOrder";
import Review, { ReviewThanks } from "./Review";
import OrderHistory from "./OrderHistory";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<FlowerDetails />} />
            <Route path="/shopping-cart" element={<ShoppingCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-complete" element={<OrderComplete />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/review" element={<Review />} />
            <Route path="/review/thanks" element={<ReviewThanks />} />
            <Route path="/review/:productIndex" element={<Review />} />
            <Route path="/order-history" element={<OrderHistory />} />
        </Routes>
    );
}

export default App;
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingScreen from "./LandingPage/LandingScreen";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import FlowerDetails from "./Flowers/FlowerDetails";
import Home from "./Home/Home";
import Profile from "./Profile/Profile";
import ShoppingCart from "./Cart/ShoppingCart";
import Notifications from "./Notifications/Notifications";
import MyOrders from "./MyOrders/MyOrders";
import OrderDetails from "./OrderDetails/OrderDetails";
import Address from "./Address/Address";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PasswordManager from "./PasswordManager/PasswordManager";
import BouquetCustomizer from "./BouquetCustomizer/BouquetCustomizer";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import DeliveryRider from "./DeliveryRider/DeliveryRider";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/flower-details/:flowerId" element={<FlowerDetails />} />

        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/delivery-rider" element={<DeliveryRider />} />
        <Route path="/shopping-cart" element={<ShoppingCart />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/customize-bouquet" element={<BouquetCustomizer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/address" element={<Address />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/password-manager" element={<PasswordManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

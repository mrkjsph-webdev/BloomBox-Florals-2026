import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingScreen from "./pages/LandingScreen";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/Signup";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


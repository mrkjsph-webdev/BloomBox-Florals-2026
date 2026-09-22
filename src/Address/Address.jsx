import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Contact from "../LandingPage/Contact";
import "./address.css";

function Address() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  function handleLogout() {
    // Clear all session-based data, including the BouquetCustomizer mini-cart
    sessionStorage.clear();

    // Remove the logged-in client
    localStorage.removeItem("client");

    // Notify other components that the login status changed
    window.dispatchEvent(new Event("loginStatusChanged"));

    // Return to the landing page
    navigate("/");
  }

  useEffect(() => {
    async function getClient() {
      const storedClient = localStorage.getItem("client");

      if (!storedClient) {
        console.log("No client found in localStorage.");
        return;
      }

      const clientData = JSON.parse(storedClient);

      try {
        const response = await fetch(
          "http://localhost/bbf_clientdb/get_client.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ client_id: clientData.client_id }),
          },
        );

        const data = await response.json();

        if (data.success) {
          setClient(data.client);

          if (data.client.address) {
            const addressParts = data.client.address.split(", ");

            setStreetAddress(addressParts[0] || "");
            setCity(addressParts[1] || "");
            setPostalCode(addressParts[2] || "");
            setProvince(addressParts[3] || "");
            setCountry(addressParts[4] || "Philippines");
          }
        } else {
          console.log(data.message);
        }
      } catch (error) {
        console.error("Failed to get client:", error);
      }
    }

    getClient();
  }, []);

  async function handleSaveAddress() {
    setMessage("");

    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      setMessage("You are not logged in.");
      return;
    }

    const clientData = JSON.parse(storedClient);

    const fullAddress = [streetAddress, city, postalCode, province, country]
      .filter((value) => value.trim() !== "")
      .join(", ");

    if (!fullAddress) {
      setMessage("Please enter your address.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/update_address.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientData.client_id,
            address: fullAddress,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setMessage("");
        setShowSuccessModal(true);

        setClient((prev) => ({
          ...prev,
          address: fullAddress,
        }));
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Address update error:", error);
      setMessage("Unable to connect to the server.");
    }
  }

  const nameParts = client?.name?.split(" ") || [];

  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <main className="address-page">
      <header className="address-header">
        <Link to="/" className="address-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="address-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="address-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/">Home</Link> / <strong>Address</strong>
        </p>
      </section>

      <section className="address-layout">
        <aside className="address-menu" aria-label="Account menu">
          <Link to="/profile">Personal Information</Link>

          <Link to="/orders">My Orders</Link>

          <Link className="active" to="/address">
            Address
          </Link>

          <Link to="/payment-methods">Payment Methods</Link>

          <Link to="/password-manager">Password Manager</Link>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </aside>

        <div className="address-panel">
          <p className="address-eyebrow">Delivery details</p>

          <h2>My Address</h2>

          <p className="address-intro">
            Keep your delivery information up to date for a smooth and
            thoughtful arrival.
          </p>

          <form
            className="address-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveAddress();
            }}
          >
            <div className="address-form-row">
              <label>
                First Name*
                <input type="text" value={firstName} disabled readOnly />
              </label>

              <label>
                Last Name*
                <input type="text" value={lastName} disabled readOnly />
              </label>
            </div>

            <label>
              Street Address*
              <input
                type="text"
                value={streetAddress}
                onChange={(event) => setStreetAddress(event.target.value)}
                placeholder="Enter your street address"
                disabled={!client}
                required
              />
            </label>

            <div className="address-form-row">
              <label>
                City*
                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Enter your city"
                  disabled={!client}
                  required
                />
              </label>

              <label>
                Postal Code*
                <input
                  type="text"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="Enter postal code"
                  disabled={!client}
                  required
                />
              </label>
            </div>

            <div className="address-form-row">
              <label>
                Province*
                <input
                  type="text"
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                  placeholder="Enter your province"
                  disabled={!client}
                  required
                />
              </label>

              <label>
                Country*
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  disabled={!client}
                >
                  <option value="Philippines">Philippines</option>
                </select>
              </label>
            </div>

            <label>
              Phone Number*
              <input
                type="tel"
                value={client?.contact_number || ""}
                disabled
                readOnly
              />
            </label>

            {message && <p className="address-message">{message}</p>}

            <button type="submit" disabled={!client}>
              Save Address
            </button>
          </form>
        </div>
      </section>

      <div className="address-contact">
        <Contact />
      </div>

      {showSuccessModal && (
        <div className="address-modal-overlay">
          <div className="address-success-modal">
            <h2>Address Updated</h2>

            <p>Your address has been updated successfully.</p>

            <button type="button" onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Address;

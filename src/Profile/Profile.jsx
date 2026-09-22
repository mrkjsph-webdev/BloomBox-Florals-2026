import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Contact from "../LandingPage/Contact";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Prefer not to say");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: clientData.client_id,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          setClient(data.client);
          setPhone(data.client.contact_number || "");
          setGender(data.client.gender || "Prefer not to say");
        } else {
          console.log(data.message);
        }
      } catch (error) {
        console.error("Failed to get client:", error);
      }
    }

    getClient();
  }, []);

  async function handleSaveProfile() {
    setMessage("");

    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      setMessage("You are not logged in.");
      return;
    }

    const clientData = JSON.parse(storedClient);

    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/update_profile.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientData.client_id,
            contact_number: phone,
            gender: gender,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setMessage("");
        setShowSuccessModal(true);

        setClient((prev) => ({
          ...prev,
          contact_number: phone,
          gender: gender,
        }));
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Unable to connect to the server.");
    }
  }

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

  const nameParts = client?.name?.split(" ") || [];

  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const initials = client?.name
    ? client.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MB";

  return (
    <main className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-brand">
          BloomBox <span>Florals</span>
        </Link>

        <Link to="/home" className="profile-dashboard-link">
          Back to dashboard
        </Link>
      </header>

      <section className="profile-banner">
        <h1>My Account</h1>

        <p>
          <Link to="/">Home</Link> / <strong>My Account</strong>
        </p>
      </section>

      <section className="profile-layout">
        <aside className="account-menu" aria-label="Account menu">
          <Link className="active" to="/profile">
            Personal Information
          </Link>

          <Link to="/orders">My Orders</Link>

          <Link to="/address">Address</Link>

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

        <div className="profile-form-panel" id="profile-form">
          <div className="profile-form-heading">
            <span className="profile-avatar" aria-hidden="true">
              {initials}
            </span>

            <div>
              <p className="profile-eyebrow">Personal Information</p>

              <h2>My Profile</h2>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveProfile();
            }}
          >
            <div className="profile-form-row">
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
              Email*
              <input
                type="email"
                value={client?.email || ""}
                disabled
                readOnly
              />
            </label>

            <label>
              Phone Number*
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={!client}
              />
            </label>

            <label>
              Gender*
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                disabled={!client}
              >
                <option value="Female">Female</option>

                <option value="Male">Male</option>

                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            {message && <p className="profile-message">{message}</p>}

            <button className="profile-submit" type="submit" disabled={!client}>
              Save Profile
            </button>
          </form>
        </div>
      </section>

      <div className="profile-contact">
        <Contact />
      </div>

      {showSuccessModal && (
        <div className="profile-modal-overlay">
          <div className="profile-success-modal">
            <h2>Profile Updated</h2>

            <p>Your profile has been updated successfully.</p>

            <button type="button" onClick={() => setShowSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;

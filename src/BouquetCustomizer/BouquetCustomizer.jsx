import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./bouquet-customizer.css";

const templates = [
  {
    id: "blush",
    name: "Blush Garden",
    description: "Soft roses, carnations, and seasonal blooms.",
    price: 580,
    colors: ["#e7a5b5", "#f5d9c9", "#c56e85"],
  },
  {
    id: "sunshine",
    name: "Golden Sunshine",
    description: "Bright sunflowers with cheerful yellow blooms.",
    price: 490,
    colors: ["#f5c936", "#f28c38", "#83a85d"],
  },
  {
    id: "wildflower",
    name: "Wildflower Meadow",
    description: "A loose, colorful mix inspired by the countryside.",
    price: 670,
    colors: ["#9b83bb", "#e69caa", "#f4cf70"],
  },
];

const flowerOptions = [
  { id: 1, name: "Rose", price: 80, color: "#d77991" },
  { id: 2, name: "Tulip", price: 70, color: "#ef9c63" },
  { id: 3, name: "Sunflower", price: 70, color: "#f5c936" },
  { id: 4, name: "Lily", price: 80, color: "#f5d9c9" },
  { id: 5, name: "Daisy", price: 60, color: "#f1eee7" },
  { id: 6, name: "Orchid", price: 90, color: "#9b83bb" },
  { id: 7, name: "Carnation", price: 60, color: "#e69caa" },
  { id: 8, name: "Peony", price: 90, color: "#e7a5b5" },
];

function BouquetCustomizer() {
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState("blush");
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [greetingCard, setGreetingCard] = useState(false);
  const [plushToy, setPlushToy] = useState(false);
  const [added, setAdded] = useState(false);
  const [bouquetItems, setBouquetItems] = useState([]);

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("client"));

    if (!client) {
      setBouquetItems([]);
      return;
    }

    const storedFlower = JSON.parse(
      sessionStorage.getItem(`bouquetFlower_${client.client_id}`),
    );

    if (storedFlower) {
      setBouquetItems([storedFlower]);

      setSelectedFlowers((current) =>
        current.includes(Number(storedFlower.id))
          ? current
          : [...current, Number(storedFlower.id)],
      );
    }
  }, []);

  function handleBackToDashboard() {
    sessionStorage.clear();
    navigate("/home");
  }

  const template = templates.find((item) => item.id === templateId);

  const total = useMemo(
    () =>
      template.price +
      bouquetItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
      (greetingCard ? 50 : 0) +
      (plushToy ? 120 : 0),
    [template, bouquetItems, greetingCard, plushToy],
  );

  function toggleFlower(item) {
    const client = JSON.parse(localStorage.getItem("client"));

    if (!client) {
      navigate("/login");
      return;
    }

    const storageKey = `bouquetFlower_${client.client_id}`;

    const storedFlower = JSON.parse(sessionStorage.getItem(storageKey));

    const isAdded = storedFlower && Number(storedFlower.id) === Number(item.id);

    if (isAdded) {
      sessionStorage.removeItem(storageKey);
      setBouquetItems([]);
      setSelectedFlowers([]);
      return;
    }

    const flowerToAdd = {
      id: item.id,
      name: item.name,
      price: item.price,
      color: item.color,
      quantity: 1,
    };

    sessionStorage.setItem(storageKey, JSON.stringify(flowerToAdd));

    setBouquetItems([flowerToAdd]);
    setSelectedFlowers([item.id]);
  }

  return (
    <main className="customizer-page">
      <header className="customizer-header">
        <Link to="/" className="customizer-brand">
          BloomBox <span>Florals</span>
        </Link>

        <button
          type="button"
          onClick={handleBackToDashboard}
          className="customizer-dashboard-link"
        >
          Back to dashboard
        </button>
      </header>

      <section className="customizer-banner">
        <h1>Create Your Bouquet</h1>

        <p>
          <Link to="/home">Home</Link> / <strong>Bouquet Customizer</strong>
        </p>
      </section>

      <section className="customizer-layout">
        <div className="customizer-options">
          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 1</p>

            <h2>Choose a template</h2>

            <div className="template-grid">
              {templates.map((item) => (
                <button
                  className={`template-card ${
                    templateId === item.id ? "selected" : ""
                  }`}
                  type="button"
                  key={item.id}
                  onClick={() => setTemplateId(item.id)}
                >
                  <span
                    className="template-art"
                    style={{
                      "--template-one": item.colors[0],
                      "--template-two": item.colors[1],
                      "--template-three": item.colors[2],
                    }}
                    aria-hidden="true"
                  />

                  <strong>{item.name}</strong>

                  <span>{item.description}</span>

                  <b>₱{item.price}.00</b>
                </button>
              ))}
            </div>
          </section>

          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 2</p>

            <h2>Add flowers</h2>

            <div className="flower-grid">
              {flowerOptions.map((item) => (
                <div
                  className={`flower-option ${
                    selectedFlowers.includes(item.id) ? "selected" : ""
                  }`}
                  key={item.id}
                >
                  <span
                    className="flower-dot"
                    style={{ background: item.color }}
                    aria-hidden="true"
                  />

                  <span>
                    <strong>{item.name}</strong>
                    <small>+₱{item.price}.00</small>
                  </span>

                  <div className="flower-actions">
                    <button
                      type="button"
                      className="view-flower-button"
                      onClick={() => navigate(`/flower-details/${item.id}`)}
                    >
                      View Flower
                    </button>

                    <button
                      type="button"
                      className={`flower-add-button ${
                        bouquetItems.some(
                          (flower) => Number(flower.id) === Number(item.id),
                        )
                          ? "remove"
                          : ""
                      }`}
                      onClick={() => toggleFlower(item)}
                    >
                      {bouquetItems.some(
                        (flower) => Number(flower.id) === Number(item.id),
                      )
                        ? "Remove"
                        : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 3</p>

            <h2>Add something special</h2>

            <div className="extras-grid">
              <label
                className={`extra-option ${greetingCard ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={greetingCard}
                  onChange={(event) => setGreetingCard(event.target.checked)}
                />

                <span>
                  <strong>Greeting card</strong>

                  <small>Include a handwritten message · +₱50.00</small>
                </span>
              </label>

              <label className={`extra-option ${plushToy ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={plushToy}
                  onChange={(event) => setPlushToy(event.target.checked)}
                />

                <span>
                  <strong>Mini stuff toy</strong>

                  <small>Add a cuddly little surprise · +₱120.00</small>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="customizer-summary">
          <p className="customizer-eyebrow">Your design</p>

          <div
            className="summary-art"
            style={{
              "--template-one": template.colors[0],
              "--template-two": template.colors[1],
              "--template-three": template.colors[2],
            }}
            aria-label={`${template.name} color preview`}
          />

          <h2>{template.name}</h2>

          <p>{template.description}</p>

          <div className="summary-lines">
            <div>
              <span>Base bouquet</span>
              <strong>₱{template.price}.00</strong>
            </div>

            {bouquetItems.map((item) => (
              <div key={`bouquet-${item.id}`}>
                <span>
                  {item.name} × {item.quantity}
                </span>

                <strong>+₱{item.price * item.quantity}.00</strong>
              </div>
            ))}

            {greetingCard && (
              <div>
                <span>Greeting card</span>
                <strong>+₱50.00</strong>
              </div>
            )}

            {plushToy && (
              <div>
                <span>Mini stuff toy</span>
                <strong>+₱120.00</strong>
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₱{total}.00</strong>
          </div>

          <Link to="/shopping-cart" className="add-cart-button">
            Add to Cart
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default BouquetCustomizer;

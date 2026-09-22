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

const paperSizes = [
  { name: "Small", price: 0 },
  { name: "Medium", price: 30 },
  { name: "Large", price: 60 },
];

const bouquetWrappers = [
  { name: "Kraft Paper", price: 20 },
  { name: "Tissue Paper", price: 30 },
  { name: "Wrapping Paper", price: 40 },
  { name: "Cellophane", price: 25 },
];

function BouquetCustomizer() {
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState("blush");
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [greetingCard, setGreetingCard] = useState(false);
  const [plushToy, setPlushToy] = useState(false);
  const [added, setAdded] = useState(false);
  const [bouquetItems, setBouquetItems] = useState([]);

  // Paper customization
  const [selectedPaperSize, setSelectedPaperSize] = useState("Small");
  const [selectedPaper, setSelectedPaper] = useState("Kraft Paper");

  // AI chatbot
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I can help you choose the right paper size, bouquet paper, flowers, or care options.",
    },
  ]);

  useEffect(() => {
    const client = JSON.parse(localStorage.getItem("client"));

    if (!client) {
      setBouquetItems([]);
      return;
    }

    const storedFlowers = JSON.parse(
      sessionStorage.getItem(`bouquetFlowers_${client.client_id}`),
    );

    if (Array.isArray(storedFlowers)) {
      setBouquetItems(storedFlowers);

      setSelectedFlowers(storedFlowers.map((flower) => Number(flower.id)));
    }
  }, []);

  function handleBackToDashboard() {
    sessionStorage.clear();
    navigate("/home");
  }

  function handleChat() {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    let response =
      "I can help you customize your bouquet. You can ask me about paper size, bouquet paper, flowers, or bouquet care.";

    const message = userMessage.toLowerCase();

    if (message.includes("size")) {
      response =
        "For a small bouquet or a simple gift, I recommend Small. Medium is suitable for a fuller arrangement, while Large works well for bigger bouquets or special occasions.";
    } else if (message.includes("kraft")) {
      response =
        "Kraft Paper gives your bouquet a natural, simple, and elegant look.";
    } else if (message.includes("tissue")) {
      response =
        "Tissue Paper gives your bouquet a soft and delicate appearance.";
    } else if (message.includes("wrapping")) {
      response =
        "Wrapping Paper is a good choice if you want a more decorative and colorful bouquet presentation.";
    } else if (message.includes("cellophane")) {
      response =
        "Cellophane gives your bouquet a clean and transparent finish while keeping the flowers visible.";
    } else if (message.includes("paper")) {
      response =
        "You can choose between Kraft Paper, Tissue Paper, Wrapping Paper, and Cellophane depending on the look you want.";
    } else if (message.includes("flower")) {
      response =
        "Roses and peonies create a romantic look, sunflowers and tulips give a bright feel, while daisies and carnations create a cheerful arrangement.";
    } else if (message.includes("care")) {
      response =
        "Keep your bouquet away from direct heat and sunlight, and make sure fresh flowers have enough water.";
    }

    setChatInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: response }]);
    }, 500);
  }

  const template = templates.find((item) => item.id === templateId);

  const selectedSize = paperSizes.find(
    (item) => item.name === selectedPaperSize,
  );

  const selectedWrapper = bouquetWrappers.find(
    (item) => item.name === selectedPaper,
  );

  const total = useMemo(
    () =>
      template.price +
      (selectedSize?.price || 0) +
      (selectedWrapper?.price || 0) +
      bouquetItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
      (greetingCard ? 50 : 0) +
      (plushToy ? 120 : 0),
    [
      template,
      selectedSize,
      selectedWrapper,
      bouquetItems,
      greetingCard,
      plushToy,
    ],
  );

  function updateFlowerQuantity(item, change) {
    const client = JSON.parse(localStorage.getItem("client"));

    if (!client) {
      navigate("/login");
      return;
    }

    const storageKey = `bouquetFlowers_${client.client_id}`;

    setBouquetItems((currentItems) => {
      const existingFlower = currentItems.find(
        (flower) => Number(flower.id) === Number(item.id),
      );

      let updatedItems;

      if (existingFlower) {
        const newQuantity = existingFlower.quantity + change;

        if (newQuantity <= 0) {
          updatedItems = currentItems.filter(
            (flower) => Number(flower.id) !== Number(item.id),
          );
        } else {
          updatedItems = currentItems.map((flower) =>
            Number(flower.id) === Number(item.id)
              ? {
                  ...flower,
                  quantity: newQuantity,
                }
              : flower,
          );
        }
      } else if (change > 0) {
        updatedItems = [
          ...currentItems,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            color: item.color,
            quantity: 1,
          },
        ];
      } else {
        updatedItems = currentItems;
      }

      sessionStorage.setItem(storageKey, JSON.stringify(updatedItems));

      setSelectedFlowers(updatedItems.map((flower) => Number(flower.id)));

      return updatedItems;
    });
  }

  function getFlowerQuantity(flowerId) {
    const flower = bouquetItems.find(
      (item) => Number(item.id) === Number(flowerId),
    );

    return flower ? flower.quantity : 0;
  }

  return (
    <main className="customizer-page">
      {/* LEFT SIDE AI MINI CHAT */}
      <section className={`ai-mini-chat ${showChat ? "open" : ""}`}>
        {!showChat ? (
          <button
            type="button"
            className="ai-mini-button"
            onClick={() => setShowChat(true)}
          >
            <span className="ai-mini-icon">✨</span>
            <span>Ask AI</span>
          </button>
        ) : (
          <div className="ai-mini-panel">
            <div className="ai-mini-header">
              <div>
                <strong>BloomBox AI</strong>
                <small>Here to help you customize</small>
              </div>

              <button
                type="button"
                className="ai-close-button"
                onClick={() => setShowChat(false)}
              >
                ×
              </button>
            </div>

            <div className="ai-mini-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${
                    message.sender === "user" ? "user-bubble" : "bot-bubble"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="ai-mini-input">
              <input
                type="text"
                placeholder="Ask about your bouquet..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChat();
                  }
                }}
              />

              <button type="button" onClick={handleChat}>
                →
              </button>
            </div>
          </div>
        )}
      </section>

      <header className="customizer-header">
        <Link to="/home" className="customizer-brand">
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
          {/* TEMPLATE */}
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

          {/* PAPER SIZE AND BOUQUET WRAPPER */}
          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 2</p>

            <h2>Choose your bouquet paper</h2>

            <div className="paper-customizer-grid">
              <div className="paper-choice-group">
                <label className="customizer-label">Paper Size</label>

                <div className="paper-options">
                  {paperSizes.map((size) => (
                    <button
                      key={size.name}
                      type="button"
                      className={`paper-option ${
                        selectedPaperSize === size.name ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPaperSize(size.name)}
                    >
                      <span>{size.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="paper-choice-group">
                <label className="customizer-label">Bouquet Wrapper</label>

                <div className="paper-options">
                  {bouquetWrappers.map((wrapper) => (
                    <button
                      key={wrapper.name}
                      type="button"
                      className={`paper-option ${
                        selectedPaper === wrapper.name ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPaper(wrapper.name)}
                    >
                      <span>{wrapper.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FLOWERS */}
          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 3</p>

            <h2>Add flowers</h2>

            <div className="flower-grid">
              {flowerOptions.map((item) => {
                const quantity = getFlowerQuantity(item.id);

                return (
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

                      <small>+₱{item.price}.00 each</small>
                    </span>

                    <div className="flower-actions">
                      <button
                        type="button"
                        className="flower-quantity-button"
                        onClick={() => updateFlowerQuantity(item, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={quantity === 0}
                      >
                        −
                      </button>

                      <span className="flower-quantity">{quantity}</span>

                      <button
                        type="button"
                        className="flower-quantity-button"
                        onClick={() => updateFlowerQuantity(item, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* EXTRAS */}
          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 4</p>

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

        {/* SUMMARY */}
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

            <div>
              <span>Paper Size</span>

              <strong>{selectedPaperSize}</strong>
            </div>

            <div>
              <span>Bouquet Wrapper</span>

              <strong>{selectedPaper}</strong>
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

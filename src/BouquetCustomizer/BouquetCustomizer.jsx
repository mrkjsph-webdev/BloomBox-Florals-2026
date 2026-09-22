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

  const [chatContext, setChatContext] = useState({
    topic: null,
    style: null,
  });
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 🌷 I'd love to help you build your bouquet. Tell me the occasion or the kind of feeling you're going for, and we'll build it together.",
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

  function handleChatFAQ(question) {
    setChatInput(question);

    // Let the normal chatbot logic handle the FAQ
    setTimeout(() => {
      handleChat();
    }, 0);
  }
  function handleChat(inputMessage = chatInput) {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    const message = userMessage.toLowerCase();

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    let response = "";
    let newContext = { ...chatContext };

    // =========================================================
    // FLOWER DATA
    // =========================================================

    const flowers = {
      rose: { name: "roses", price: 80 },
      tulip: { name: "tulips", price: 70 },
      sunflower: { name: "sunflowers", price: 70 },
      lily: { name: "lilies", price: 80 },
      daisy: { name: "daisies", price: 60 },
      orchid: { name: "orchids", price: 90 },
      carnation: { name: "carnations", price: 60 },
      peony: { name: "peonies", price: 90 },
    };

    const findFlower = () =>
      Object.keys(flowers).find((flower) => message.includes(flower));

    const flowerKey = findFlower();

    const hasAny = (words) =>
      words.some((word) => {
        if (word.includes(" ")) {
          return message.includes(word);
        }

        return new RegExp(`\\b${word}\\b`, "i").test(message);
      });

    // =========================================================
    // 1. GREETING / START CONVERSATION
    // =========================================================

    if (
      hasAny([
        "hello",
        "hi",
        "hey",
        "help me",
        "help",
        "i don't know",
        "i dont know",
        "not sure",
      ])
    ) {
      response =
        "Of course! 🌷 I can help you build your bouquet step by step. Let's start with the occasion. Is it for a birthday, anniversary, congratulations, a special someone, or just because?";

      newContext = {
        topic: "occasion",
      };
    }

    // =========================================================
    // 2. OCCASION
    // =========================================================
    else if (hasAny(["birthday", "birthdays"])) {
      response =
        "For a birthday bouquet, something cheerful and colorful works beautifully. 🌻 Sunflowers, tulips, and daisies are great directions. Would you like the bouquet to feel bright and playful or soft and elegant?";

      newContext = {
        ...newContext,
        topic: "bouquet_style",
        occasion: "birthday",
      };
    } else if (hasAny(["anniversary", "anniv", "valentine", "valentines", "wedding", "wedding anniversary"])) {
      response =
        "For an anniversary or Valentine's bouquet, a romantic arrangement would be a lovely direction. 🌹 Roses and peonies are natural choices. Would you like something soft and delicate or more elegant?";

      newContext = {
        ...newContext,
        topic: "bouquet_style",
        occasion: "romantic",
        style: "romantic",
      };
    } else if (
      hasAny(["congratulations", "congrats", "graduation", "graduate"])
    ) {
      response =
        "For congratulations or graduation, I'd suggest something cheerful and celebratory. 🌻 Sunflowers, tulips, and daisies can give the bouquet a bright feeling. Would you prefer colorful and lively or simple and elegant?";

      newContext = {
        ...newContext,
        topic: "bouquet_style",
        occasion: "congratulations",
      };
    } else if (
      hasAny([
        "just because",
        "no occasion",
        "nothing special",
        "for myself",
        "myself",
      ])
    ) {
      response =
        "Honestly, those can be some of the nicest bouquets. 🌸 Since there's no specific occasion, we can build it around the feeling you want. Would you like something cheerful, soft, romantic, or elegant?";

      newContext = {
        ...newContext,
        topic: "bouquet_style",
        occasion: "just_because",
      };
    }

    // =========================================================
    // 3. STYLE / MOOD
    // =========================================================
    else if (hasAny(["romantic", "romance", "love"])) {
      response =
        "Romantic sounds lovely. 🌹 I'd start with roses or peonies. For the presentation, Tissue Paper would keep everything soft and delicate. Do you want the bouquet to be simple or fuller?";

      newContext = {
        ...newContext,
        topic: "bouquet_size",
        style: "romantic",
      };
    } else if (hasAny(["soft", "delicate", "gentle"])) {
      response =
        "A soft look would work beautifully with roses, peonies, or carnations. 🌸 I'd pair those with Tissue Paper. Do you want a small, medium, or fuller bouquet?";

      newContext = {
        ...newContext,
        topic: "bouquet_size",
        style: "soft",
      };
    } else if (hasAny(["elegant", "classy", "refined"])) {
      response =
        "For something elegant, I'd lean toward lilies or orchids. ✨ Kraft Paper would give it a clean, refined finish. Would you like a simple arrangement or something fuller?";

      newContext = {
        ...newContext,
        topic: "bouquet_size",
        style: "elegant",
      };
    } else if (hasAny(["cheerful", "bright", "colorful", "playful"])) {
      response =
        "A bright and cheerful bouquet would be fun! 🌻 Sunflowers, tulips, and daisies are good choices for that feeling. Would you like to keep it small or make it fuller?";

      newContext = {
        ...newContext,
        topic: "bouquet_size",
        style: "cheerful",
      };
    }

    // =========================================================
    // 4. SIZE / FULLNESS
    // =========================================================
    else if (
      (chatContext.topic === "bouquet_size" ||
        chatContext.topic === "paper_size") &&
      hasAny(["small", "simple", "medium", "full", "fuller", "large", "big"])
    ) {
      let size = "medium";

      if (hasAny(["small", "simple"])) {
        size = "Small";
      } else if (hasAny(["large", "big", "full", "fuller"])) {
        size = "Large";
      } else {
        size = "Medium";
      }

      response = `${size} would work nicely. 🌷 For the paper size, ${size} gives you ${
        size === "Small"
          ? "a compact and simple presentation"
          : size === "Medium"
            ? "a comfortable amount of room for your flowers"
            : "plenty of room for a fuller arrangement"
      }. Would you like help choosing the wrapping next?`;

      newContext = {
        ...newContext,
        topic: "wrapper",
        preferredSize: size,
      };
    }

    // =========================================================
    // 5. SPECIFIC FLOWER
    // =========================================================
    else if (flowerKey) {
      const flower = flowers[flowerKey];

      newContext = {
        ...newContext,
        topic: "flower",
        flower: flowerKey,
      };

      if (hasAny(["price", "cost", "how much"])) {
        response = `${flower.name.charAt(0).toUpperCase() + flower.name.slice(1)} are ₱${flower.price} each.`;
      } else {
        response =
          `${flower.name.charAt(0).toUpperCase() + flower.name.slice(1)} are available for ₱${flower.price} each. ` +
          (chatContext.style
            ? `They can work well with the ${chatContext.style} direction you're going for.`
            : "If you'd like, tell me the occasion and I can help you decide whether they fit your bouquet.");
      }
    }

    // =========================================================
    // 6. WRAPPER
    // =========================================================
    else if (hasAny(["kraft", "tissue", "wrapping paper", "cellophane"])) {
      newContext = {
        ...newContext,
        topic: "extras",
        previousTopic: chatContext.topic,
      };

      if (message.includes("kraft")) {
        response =
          "Kraft Paper would give your bouquet a natural, clean look and costs ₱20. 🌿 Would you like to add a greeting card or mini stuff toy as a finishing touch?";
      } else if (message.includes("tissue")) {
        response =
          "Tissue Paper costs ₱30 and gives the bouquet a soft, delicate presentation. 🌸 Would you like to add a greeting card or mini stuff toy?";
      } else if (message.includes("wrapping paper")) {
        response =
          "Wrapping Paper costs ₱40 and gives the bouquet a more decorative finish. Would you like to add a greeting card or mini stuff toy?";
      } else {
        response =
          "Cellophane costs ₱25 and gives the bouquet a clean, transparent finish. Would you like to add a greeting card or mini stuff toy?";
      }
    }

    // =========================================================
    // 7. GENERAL FLOWERS
    // =========================================================
    else if (
      hasAny([
        "what flowers",
        "available flowers",
        "flowers do you have",
        "what flowers do you have",
      ])
    ) {
      response =
        "We have roses, tulips, sunflowers, lilies, daisies, orchids, carnations, and peonies. 🌷 Are you choosing flowers for a particular occasion?";

      newContext = {
        ...newContext,
        topic: "flower_faq_followup",
      };
    }

    // =========================================================
    // 8. PAPER SIZE INFORMATION
    // =========================================================
    else if (hasAny(["paper size", "sizes", "what sizes", "size options"])) {
      response =
        "We have Small, Medium, and Large paper sizes. 🌸 Small is better for a compact arrangement, Medium gives you more room, and Large works well for fuller bouquets. Are you going for a simple bouquet or something fuller?";

      newContext = {
        ...newContext,
        topic: "paper_size",
      };
    }

    // =========================================================
    // 9. PRICE / CURRENT TOTAL
    // =========================================================
    else if (
      hasAny([
        "my total",
        "total price",
        "current total",
        "how much is my bouquet",
        "how much will this cost",
      ])
    ) {
      response = `Your current bouquet total is ₱${total.toLocaleString()}. 💐 Would you like me to break down what's included in that total?`;

      newContext = {
        ...newContext,
        topic: "price",
      };
    }

    // =========================================================
    // 10. CURRENT BOUQUET
    // =========================================================
    else if (
      hasAny([
        "what did i add",
        "what did i choose",
        "my bouquet",
        "my selections",
        "what's in my bouquet",
        "what is in my bouquet",
      ])
    ) {
      const flowerSummary =
        bouquetItems.length > 0
          ? bouquetItems
              .map((item) => `${item.name} × ${item.quantity}`)
              .join(", ")
          : "no additional flowers";

      const extras = [];

      if (greetingCard) extras.push("a greeting card");
      if (plushToy) extras.push("a mini stuff toy");

      const extrasSummary =
        extras.length > 0 ? extras.join(" and ") : "no extras";

      response = `Here's what you have so far: ${template.name}, ${selectedPaperSize} paper size, ${selectedPaper}, ${flowerSummary}, and ${extrasSummary}. 🌷`;

      newContext = {
        ...newContext,
        topic: "current_bouquet",
      };
    }

    // =========================================================
    // 11. CARE
    // =========================================================
    else if (hasAny(["care", "keep fresh", "keep them fresh", "preserve"])) {
      response =
        "To keep fresh flowers looking their best, keep them away from direct sunlight and excessive heat. Make sure they have enough water and avoid letting the stems dry out. 🌿";

      newContext = {
        ...newContext,
        topic: "care",
      };
    }

    // =========================================================
    // 12. EXTRAS
    // =========================================================
    else if (hasAny(["card", "stuff toy", "plush", "extra", "gift"])) {
      response =
        "You can finish the bouquet with a greeting card for ₱50 or a mini stuff toy for ₱120. 🎁 Would you like to keep the bouquet simple or add one of those touches?";

      newContext = {
        ...newContext,
        topic: "extras",
      };
    }
    // =========================================================
    // 13. CONTEXT-AWARE YES / CONTINUE
    // =========================================================
    else if (
      hasAny([
        "no thanks",
        "no thank",
        "nope",
        "nah",
        "not now",
        "skip",
        "nothing",
        "none",
      ])
    ) {
      if (chatContext.topic === "extras") {
        response =
          "No problem! 🌷 We'll keep the bouquet simple. Would you like to choose your flowers next?";

        newContext = {
          ...newContext,
          topic: "flowers",
        };
      } else {
        response =
          "No problem! 🌸 We can keep it simple. What would you like to work on next?";

        newContext = {
          ...newContext,
          topic: "next_step",
        };
      }
    } else if (hasAny(["yes", "yeah", "yep", "sure", "okay", "ok"])) {
      if (chatContext.topic === "price") {
        const flowerSummary =
          bouquetItems.length > 0
            ? bouquetItems
                .map(
                  (item) =>
                    `${item.name} × ${item.quantity} = ₱${item.price * item.quantity}`,
                )
                .join(", ")
            : "No additional flowers";

        const extras = [];

        if (greetingCard) {
          extras.push("Greeting card = ₱50");
        }

        if (plushToy) {
          extras.push("Mini stuff toy = ₱120");
        }

        response =
          `Here's your current breakdown: 🌷 ` +
          `Base bouquet: ${template.name} = ₱${template.price}. ` +
          `Paper size: ${selectedPaperSize} = ₱${selectedSize?.price || 0}. ` +
          `Wrapper: ${selectedPaper} = ₱${selectedWrapper?.price || 0}. ` +
          `Flowers: ${flowerSummary}. ` +
          `Extras: ${extras.length > 0 ? extras.join(", ") : "None"}. ` +
          `Total: ₱${total.toLocaleString()}. 💐 Would you like to change anything?`;

        newContext = {
          ...newContext,
          topic: "price_breakdown",
        };
      }
      if (chatContext.topic === "wrapper") {
        response =
          "Great! 🌸 For your bouquet, you can choose from Kraft Paper, Tissue Paper, Wrapping Paper, or Cellophane. If you're going for the style we discussed, I'd suggest Tissue Paper for a softer look or Kraft Paper for something more elegant. Which one would you like?";

        newContext = {
          ...newContext,
          topic: "wrapper_choice",
        };
      }

      // User said YES after being asked about extras
      else if (chatContext.topic === "extras") {
        response =
          "Lovely! 🎁 You can add a greeting card for ₱50 or a mini stuff toy for ₱120. Which would you like to add?";

        newContext = {
          ...newContext,
          topic: "extras_choice",
        };
      }

      // User said YES after skipping extras
      else if (chatContext.topic === "flowers") {
        response =
          "Of course! 🌷 You can choose from roses, tulips, sunflowers, lilies, daisies, orchids, carnations, and peonies. Which flowers would you like to add?";

        newContext = {
          ...newContext,
          topic: "flower",
        };
      }

      // User said YES after discussing bouquet size
      else if (chatContext.topic === "bouquet_size") {
        response =
          "Perfect! 🌷 For the next step, let's choose the wrapping. We have Kraft Paper, Tissue Paper, Wrapping Paper, and Cellophane. Which style would you like?";

        newContext = {
          ...newContext,
          topic: "wrapper",
        };
      }

      // User said YES after discussing style
      else if (chatContext.topic === "bouquet_style") {
        response =
          "Great! 🌸 Now let's choose the bouquet size. Small is compact, Medium gives you more room, and Large is best for a fuller arrangement. Which size sounds right for you?";

        newContext = {
          ...newContext,
          topic: "bouquet_size",
        };
      }

      // Fallback
      else {
        response =
          "Absolutely! 🌷 Tell me what you'd like to choose next—flowers, size, wrapping, or extras.";

        newContext = {
          ...newContext,
          topic: "next_step",
        };
      }
    }

    // =========================================================
    // 14. THANK YOU
    // =========================================================
    else if (hasAny(["thank you", "thanks", "thank u"])) {
      response =
        "You're welcome! 🌷 I'm here if you want to keep building the bouquet.";
    }

    // =========================================================
    // 15. FALLBACK — KEEP GUIDING THE USER
    // =========================================================
    else {
      response =
        "Let's build it together. 🌸 You can tell me the occasion you're shopping for, the style you like, or simply say something like “I want a romantic bouquet” and I'll guide you from there.";
    }

    // =========================================================
    // UPDATE
    // =========================================================

    setChatContext(newContext);
    setChatInput("");

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: response,
      },
    ]);
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
                <strong>Chloris 1.0</strong>
                <small>Your Friendly Assistant for bouquet customization</small>
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

            <div className="ai-faq-buttons">
              <button
                type="button"
                onClick={() => handleChatFAQ("What flowers do you have?")}
              >
                🌷 What flowers do you have?
              </button>

              <button
                type="button"
                onClick={() => handleChatFAQ("What paper sizes do you have?")}
              >
                📏 What paper sizes do you have?
              </button>

              <button
                type="button"
                onClick={() => handleChatFAQ("How much is my bouquet?")}
              >
                💰 How much is my bouquet?
              </button>
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

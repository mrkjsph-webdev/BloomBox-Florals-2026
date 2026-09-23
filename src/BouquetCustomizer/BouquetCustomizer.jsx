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


/*
 * Chloris AI configuration
 *
 * Chloris is intentionally client-side and rule-based.
 * It uses the actual BloomBox options as its source of truth.
 *
 * IMPORTANT:
 * - Factual questions stay inside ONE category.
 * - Recommendations may combine categories only when the client asks
 *   for a recommendation.
 * - Unsupported questions are rejected instead of guessed.
 */

const AI_FLOWER_DATA = {
  rose: {
    name: "Rose",
    price: 80,
    color: "pink",
    styles: ["romantic", "soft", "elegant"],
    occasions: ["birthday", "anniversary", "valentine", "wedding"],
  },
  tulip: {
    name: "Tulip",
    price: 70,
    color: "orange",
    styles: ["cheerful", "soft", "elegant"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
  sunflower: {
    name: "Sunflower",
    price: 70,
    color: "yellow",
    styles: ["cheerful", "bright"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
  lily: {
    name: "Lily",
    price: 80,
    color: "blush/cream",
    styles: ["elegant", "refined"],
    occasions: ["congratulations", "wedding", "just_because"],
  },
  daisy: {
    name: "Daisy",
    price: 60,
    color: "white/cream",
    styles: ["cheerful", "soft", "playful"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
  orchid: {
    name: "Orchid",
    price: 90,
    color: "purple",
    styles: ["elegant", "refined"],
    occasions: ["anniversary", "wedding", "congratulations", "just_because"],
  },
  carnation: {
    name: "Carnation",
    price: 60,
    color: "pink",
    styles: ["soft", "cheerful"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
  peony: {
    name: "Peony",
    price: 90,
    color: "blush pink",
    styles: ["romantic", "soft", "elegant"],
    occasions: ["romantic", "anniversary", "valentine", "wedding"],
  },
};

const AI_PROFILES = {
  romantic: {
    label: "romantic",
    flowers: ["rose", "peony"],
    wrapper: "Tissue Paper",
  },
  soft: {
    label: "soft and delicate",
    flowers: ["rose", "peony", "carnation"],
    wrapper: "Tissue Paper",
  },
  elegant: {
    label: "elegant",
    flowers: ["lily", "orchid", "rose"],
    wrapper: "Kraft Paper",
  },
  cheerful: {
    label: "bright and cheerful",
    flowers: ["sunflower", "tulip", "daisy"],
    wrapper: "Wrapping Paper",
  },
  refined: {
    label: "refined",
    flowers: ["orchid", "lily"],
    wrapper: "Kraft Paper",
  },
};

const AI_OCCASIONS = {
  birthday: {
    label: "birthday",
    styles: ["cheerful", "soft", "elegant"],
  },
  anniversary: {
    label: "anniversary",
    styles: ["romantic", "elegant"],
  },
  valentine: {
    label: "Valentine's",
    styles: ["romantic", "soft"],
  },
  wedding: {
    label: "wedding",
    styles: ["elegant", "soft", "romantic"],
  },
  congratulations: {
    label: "congratulations or graduation",
    styles: ["cheerful", "elegant"],
  },
  just_because: {
    label: "a no-special-occasion gift",
    styles: ["cheerful", "soft", "romantic", "elegant"],
  },
};

const AI_WRAPPERS = {
  kraft: {
    name: "Kraft Paper",
    price: 20,
    styles: ["elegant", "refined"],
  },
  tissue: {
    name: "Tissue Paper",
    price: 30,
    styles: ["soft", "romantic"],
  },
  wrapping: {
    name: "Wrapping Paper",
    price: 40,
    styles: ["cheerful", "playful"],
  },
  cellophane: {
    name: "Cellophane",
    price: 25,
    styles: ["clean", "simple"],
  },
};

const AI_TEMPLATES = {
  blush: {
    name: "Blush Garden",
    price: 580,
    description: "Soft roses, carnations, and seasonal blooms.",
    colors: ["pink", "cream", "rose"],
  },
  sunshine: {
    name: "Golden Sunshine",
    price: 490,
    description: "Bright sunflowers with cheerful yellow blooms.",
    colors: ["yellow", "orange", "green"],
  },
  wildflower: {
    name: "Wildflower Meadow",
    price: 670,
    description: "A loose, colorful mix inspired by the countryside.",
    colors: ["purple", "pink", "yellow"],
  },
};

const AI_EXTRAS = {
  card: { name: "Greeting Card", price: 50 },
  plush: { name: "Mini Stuff Toy", price: 120 },
};

const AI_UNAVAILABLE_RESPONSE =
  "I'm sorry, but that request or question isn't available in Chloris 1.0 right now. 🌷 " +
  "I can answer BloomBox questions about flowers, flower prices, flower colors, " +
  "paper sizes, wrappers, templates, extras, your current bouquet, total price, " +
  "flower care, and bouquet recommendations.";

function normalizeAIInput(value = "") {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9₱\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aiHasAny(message, words) {
  return words.some((word) => {
    const normalizedWord = normalizeAIInput(word);
    if (!normalizedWord) return false;

    if (normalizedWord.includes(" ")) {
      return message.includes(normalizedWord);
    }

    return new RegExp(`\\b${normalizedWord}\\b`, "i").test(message);
  });
}

function aiFindFlower(message) {
  return Object.keys(AI_FLOWER_DATA).find((key) =>
    aiHasAny(message, [key, AI_FLOWER_DATA[key].name]),
  );
}

function aiFindWrapper(message) {
  return Object.keys(AI_WRAPPERS).find((key) =>
    aiHasAny(message, [key, AI_WRAPPERS[key].name]),
  );
}

function aiFindTemplate(message) {
  return Object.keys(AI_TEMPLATES).find((key) =>
    aiHasAny(message, [AI_TEMPLATES[key].name]),
  );
}

function aiFindOccasion(message) {
  const aliases = {
    birthday: ["birthday", "birthdays", "bday"],
    anniversary: ["anniversary", "anniv"],
    valentine: ["valentine", "valentines", "valentines day"],
    wedding: ["wedding"],
    congratulations: ["congratulations", "congrats", "graduation", "graduate"],
    just_because: ["just because", "no occasion", "nothing special", "for myself"],
  };

  return Object.keys(aliases).find((key) => aiHasAny(message, aliases[key]));
}

function aiFindStyle(message) {
  const aliases = {
    romantic: ["romantic", "romance", "love"],
    soft: ["soft", "delicate", "gentle"],
    elegant: ["elegant", "classy", "refined"],
    cheerful: ["cheerful", "bright", "colorful", "playful"],
  };

  return Object.keys(aliases).find((key) => aiHasAny(message, aliases[key]));
}

function aiFindSize(message) {
  if (aiHasAny(message, ["small"])) return "Small";
  if (aiHasAny(message, ["medium"])) return "Medium";
  if (aiHasAny(message, ["large", "big"])) return "Large";
  return null;
}

function aiGetTopStyles(occasion, message, previousStyle) {
  const scores = {};

  Object.keys(AI_PROFILES).forEach((style) => {
    scores[style] = 0;
  });

  if (occasion && AI_OCCASIONS[occasion]) {
    AI_OCCASIONS[occasion].styles.forEach((style, index) => {
      scores[style] += 5 - index;
    });
  }

  const detectedStyle = aiFindStyle(message);

  if (detectedStyle && scores[detectedStyle] !== undefined) {
    scores[detectedStyle] += 8;
  }

  if (previousStyle && scores[previousStyle] !== undefined) {
    scores[previousStyle] += 2;
  }

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([style]) => style);
}

function aiGetFlowerRecommendation(style, occasion, selectedFlowers = []) {
  const scores = Object.keys(AI_FLOWER_DATA).map((key) => {
    const flower = AI_FLOWER_DATA[key];
    let score = 0;

    if (style && flower.styles.includes(style)) score += 5;
    if (occasion && flower.occasions.includes(occasion)) score += 4;

    if (selectedFlowers.includes(key)) {
      score -= 2;
    }

    return { key, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => AI_FLOWER_DATA[item.key].name);
}

function aiGetBouquetSummary({
  template,
  selectedPaperSize,
  selectedPaper,
  bouquetItems,
  greetingCard,
  plushToy,
}) {
  const flowers =
    bouquetItems.length > 0
      ? bouquetItems
        .map((item) => `${item.name} × ${item.quantity}`)
        .join(", ")
      : "no additional flowers";

  const extras = [];

  if (greetingCard) extras.push("a greeting card");
  if (plushToy) extras.push("a mini stuff toy");

  return `${template.name}, ${selectedPaperSize} paper size, ${selectedPaper}, ${flowers}, and ${extras.length ? extras.join(" and ") : "no extras"
    }`;
}

function aiGetRecommendation(message, occasion, style, budget) {
  const detectedOccasion = occasion || aiFindOccasion(message);
  const detectedStyle = style || aiFindStyle(message);

  const styles = aiGetTopStyles(
    detectedOccasion,
    message,
    detectedStyle,
  );

  const chosenStyle = detectedStyle || styles[0] || null;

  let flowers = aiGetFlowerRecommendation(
    chosenStyle,
    detectedOccasion,
    [],
  );

  if (!flowers.length && detectedOccasion) {
    flowers = aiGetFlowerRecommendation(null, detectedOccasion, []);
  }

  if (!flowers.length) {
    flowers = ["Roses", "Peonies", "Sunflowers"];
  }

  let wrapper = null;

  if (chosenStyle && AI_PROFILES[chosenStyle]) {
    wrapper = AI_PROFILES[chosenStyle].wrapper;
  }

  const budgetAmount = Number(
    String(budget || "")
      .replace(/[₱,\s]/g, "")
      .replace(/[^0-9.]/g, ""),
  );

  const affordableFlowers =
    Number.isFinite(budgetAmount) && budgetAmount > 0
      ? flowers.filter((flowerName) => {
        const key = Object.keys(AI_FLOWER_DATA).find(
          (item) => AI_FLOWER_DATA[item].name === flowerName,
        );

        return key && AI_FLOWER_DATA[key].price <= budgetAmount;
      })
      : flowers;

  if (affordableFlowers.length) {
    flowers = affordableFlowers;
  }

  return {
    occasion: detectedOccasion,
    style: chosenStyle,
    flowers,
    wrapper,
    budget: budgetAmount || null,
  };
}

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
    occasion: null,
    budget: null,
    recipient: null,
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! 🌷 I'm Chloris 1.0. I can help with BloomBox flowers, prices, colors, sizes, wrappers, templates, extras, your current bouquet, total price, care, and recommendations.",
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
    handleChat(question);
  }

  function handleChat(inputMessage = chatInput) {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    const message = normalizeAIInput(userMessage);

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    let newContext = { ...chatContext };
    let response = "";

    /*
     * ENTITY DETECTION
     * Detect what the client actually mentioned before deciding what
     * category of answer should be returned.
     */
    const flowerKey = aiFindFlower(message);
    const wrapperKey = aiFindWrapper(message);
    const templateKey = aiFindTemplate(message);
    const occasionKey = aiFindOccasion(message);
    const styleKey = aiFindStyle(message);
    const sizeKey = aiFindSize(message);

    /*
     * INTENT DETECTION
     *
     * The order matters. Specific questions are evaluated before
     * general/recommendation questions so Chloris does not mix answers.
     */
    const isGreeting = aiHasAny(message, [
      "hello",
      "hi",
      "hey",
      "help",
      "help me",
    ]);

    const isThanks = aiHasAny(message, [
      "thank you",
      "thanks",
      "thank u",
    ]);

    const asksFlowerList =
      aiHasAny(message, [
        "what flowers",
        "available flowers",
        "flowers do you have",
        "what kind of flowers",
        "which flowers",
        "flower options",
        "what blooms",
        "available blooms",
      ]) ||
      (aiHasAny(message, ["list"]) &&
        aiHasAny(message, ["flower", "flowers"]));

    const asksFlowerPrice =
      Boolean(flowerKey) &&
      aiHasAny(message, ["price", "cost", "how much", "per flower", "each"]);

    const asksFlowerColor =
      Boolean(flowerKey) &&
      aiHasAny(message, [
        "color",
        "colour",
        "what color",
        "what colour",
      ]);

    const asksFlowerGeneral =
      Boolean(flowerKey) ||
      aiHasAny(message, [
        "flower",
        "flowers",
        "bloom",
        "blooms",
      ]);

    const asksSize =
      aiHasAny(message, [
        "paper size",
        "paper sizes",
        "size options",
        "what sizes",
        "sizes do you have",
        "size do you have",
        "paper size options",
      ]) ||
      (Boolean(sizeKey) &&
        aiHasAny(message, ["size", "paper"]));

    const asksWrapperList = aiHasAny(message, [
      "wrappers",
      "wrapper options",
      "what wrappers",
      "what wrapper",
      "wrapping options",
      "what wrapping",
      "bouquet wrapper",
      "wrapper choices",
    ]);

    const asksWrapperPrice =
      Boolean(wrapperKey) &&
      aiHasAny(message, ["price", "cost", "how much"]);

    const asksWrapperGeneral =
      Boolean(wrapperKey) || asksWrapperList;

    const asksTemplateList = aiHasAny(message, [
      "templates",
      "template options",
      "what templates",
      "what template",
      "available templates",
      "template choices",
    ]);

    const asksTemplatePrice =
      Boolean(templateKey) &&
      aiHasAny(message, ["price", "cost", "how much"]);

    const asksTemplateGeneral =
      Boolean(templateKey) || asksTemplateList;

    const asksColorGeneral = aiHasAny(message, [
      "colors",
      "colours",
      "available colors",
      "available colours",
      "what colors",
      "what colours",
      "color options",
      "colour options",
      "flower colors",
      "flower colours",
    ]);

    const asksExtras = aiHasAny(message, [
      "extras",
      "extra",
      "greeting card",
      "stuff toy",
      "plush toy",
      "add ons",
      "addon",
      "add-on",
    ]);

    const asksTotal = aiHasAny(message, [
      "my total",
      "total price",
      "current total",
      "how much is my bouquet",
      "how much will this cost",
      "total cost",
      "total amount",
    ]);

    const asksCurrentBouquet = aiHasAny(message, [
      "my bouquet",
      "my selections",
      "what did i add",
      "what did i choose",
      "whats in my bouquet",
      "what is in my bouquet",
      "current bouquet",
      "current selection",
    ]);

    const asksCare = aiHasAny(message, [
      "flower care",
      "care for flowers",
      "keep fresh",
      "keep them fresh",
      "preserve flowers",
      "how do i care",
    ]);

    const asksRecommendation = aiHasAny(message, [
      "recommend",
      "recommendation",
      "suggest",
      "what should i choose",
      "what should i get",
      "help me choose",
      "which should i choose",
      "which one should i get",
      "best flower",
      "best flowers",
      "best bouquet",
    ]);

    const asksColorCustomization =
      Boolean(flowerKey) &&
      aiHasAny(message, [
        "change color",
        "change colour",
        "make it",
        "make the",
        "can i get",
        "can i have",
        "do you have",
        "available in",
      ]) &&
      aiHasAny(message, [
        "red",
        "blue",
        "green",
        "black",
        "white",
        "yellow",
        "orange",
        "purple",
        "pink",
        "brown",
      ]);

    /*
     * CATEGORY 1 — GREETING
     */
    if (isGreeting) {
      response =
        "Of course! 🌷 I can help with BloomBox bouquet customization. " +
        "You can ask me about flowers, flower prices/colors, paper sizes, " +
        "wrappers, templates, extras, your current bouquet, total price, " +
        "flower care, or recommendations.";

      newContext.topic = "welcome";
    }

    /*
     * CATEGORY 2 — FLOWERS
     * Nothing about wrappers, sizes, extras, or recommendations is added
     * unless the client explicitly asks for it.
     */
    else if (asksFlowerList) {
      response =
        "🌷 Flowers available in BloomBox:\n\n" +
        flowerOptions
          .map((flower) => `• ${flower.name} — ₱${flower.price} each`)
          .join("\n");

      newContext.topic = "flowers";
    }

    else if (asksFlowerPrice && flowerKey) {
      const flower = AI_FLOWER_DATA[flowerKey];

      response = `🌷 ${flower.name}: ₱${flower.price} each.`;

      newContext.topic = "flower_price";
      newContext.flower = flowerKey;
    }

    else if (asksFlowerColor && flowerKey) {
      const flower = AI_FLOWER_DATA[flowerKey];

      response =
        `🎨 ${flower.name} is currently shown in ${flower.color}. ` +
        "BloomBox does not have a separate flower-color selector.";

      newContext.topic = "flower_color";
      newContext.flower = flowerKey;
    }

    else if (asksColorCustomization) {
      const flower = AI_FLOWER_DATA[flowerKey];

      response =
        `🎨 Custom flower-color selection isn't available right now. ` +
        `${flower.name} is currently shown in ${flower.color}.`;

      newContext.topic = "flower_color";
      newContext.flower = flowerKey;
    }

    else if (
      asksFlowerGeneral &&
      !asksSize &&
      !asksWrapperGeneral &&
      !asksTemplateGeneral &&
      !asksExtras &&
      !asksTotal &&
      !asksCurrentBouquet &&
      !asksCare &&
      !asksRecommendation
    ) {
      if (flowerKey) {
        const flower = AI_FLOWER_DATA[flowerKey];

        response =
          `🌷 ${flower.name} is available for ₱${flower.price} each. ` +
          `Its current displayed color is ${flower.color}.`;

        newContext.topic = "flower";
        newContext.flower = flowerKey;
      } else {
        response =
          "🌷 We have Rose (₱80), Tulip (₱70), Sunflower (₱70), " +
          "Lily (₱80), Daisy (₱60), Orchid (₱90), Carnation (₱60), " +
          "and Peony (₱90).";

        newContext.topic = "flowers";
      }
    }

    /*
     * CATEGORY 3 — PAPER SIZE
     */
    else if (asksSize) {
      response =
        "📏 Paper sizes available:\n\n" +
        "• Small — Included\n" +
        "• Medium — +₱30\n" +
        "• Large — +₱60";

      newContext.topic = "paper_size";
    }

    /*
     * CATEGORY 4 — WRAPPERS
     */
    else if (asksWrapperGeneral) {
      if (wrapperKey && asksWrapperPrice) {
        const wrapper = AI_WRAPPERS[wrapperKey];

        response = `🎀 ${wrapper.name}: +₱${wrapper.price}.`;
      } else if (wrapperKey) {
        const wrapper = AI_WRAPPERS[wrapperKey];

        response =
          `🎀 ${wrapper.name}: +₱${wrapper.price}. ` +
          `It gives the bouquet a ${wrapper.styles.includes("soft") ? "soft" : "clean"} presentation.`;
      } else {
        response =
          "🎀 Wrappers available:\n\n" +
          "• Kraft Paper — +₱20\n" +
          "• Tissue Paper — +₱30\n" +
          "• Wrapping Paper — +₱40\n" +
          "• Cellophane — +₱25";
      }

      newContext.topic = "wrapper";

      if (wrapperKey) {
        newContext.wrapper = wrapperKey;
      }
    }

    /*
     * CATEGORY 5 — TEMPLATES
     */
    else if (asksTemplateGeneral) {
      if (templateKey) {
        const templateInfo = AI_TEMPLATES[templateKey];

        response =
          `🌸 ${templateInfo.name}: ₱${templateInfo.price}. ` +
          templateInfo.description;
      } else {
        response =
          "🌸 Templates available:\n\n" +
          "• Blush Garden — ₱580\n" +
          "• Golden Sunshine — ₱490\n" +
          "• Wildflower Meadow — ₱670";
      }

      newContext.topic = "templates";
    }

    /*
     * CATEGORY 6 — COLORS
     */
    else if (asksColorGeneral) {
      response =
        "🎨 Current flower colors shown in BloomBox:\n\n" +
        "• Rose — Pink\n" +
        "• Tulip — Orange\n" +
        "• Sunflower — Yellow\n" +
        "• Lily — Blush/Cream\n" +
        "• Daisy — White/Cream\n" +
        "• Orchid — Purple\n" +
        "• Carnation — Pink\n" +
        "• Peony — Blush Pink\n\n" +
        "There is no separate flower-color selection feature at the moment.";

      newContext.topic = "colors";
    }

    /*
     * CATEGORY 7 — EXTRAS
     */
    else if (asksExtras) {
      response =
        "🎁 Extras available:\n\n" +
        "• Greeting Card — ₱50\n" +
        "• Mini Stuff Toy — ₱120";

      newContext.topic = "extras";
    }

    /*
     * CATEGORY 8 — CURRENT BOUQUET
     */
    else if (asksCurrentBouquet) {
      const flowerSummary = bouquetItems.length
        ? bouquetItems
          .map((item) => `${item.name} × ${item.quantity}`)
          .join(", ")
        : "No additional flowers";

      const extras = [];

      if (greetingCard) extras.push("Greeting Card");
      if (plushToy) extras.push("Mini Stuff Toy");

      response =
        "💐 Current bouquet:\n\n" +
        `Template: ${template.name}\n` +
        `Paper size: ${selectedPaperSize}\n` +
        `Wrapper: ${selectedPaper}\n` +
        `Flowers: ${flowerSummary}\n` +
        `Extras: ${extras.length ? extras.join(", ") : "None"}`;

      newContext.topic = "current_bouquet";
    }

    /*
     * CATEGORY 9 — TOTAL
     */
    else if (asksTotal) {
      response = `💰 Your current bouquet total is ₱${total.toLocaleString()}.`;

      newContext.topic = "total";
    }

    /*
     * CATEGORY 10 — FLOWER CARE
     */
    else if (asksCare) {
      response =
        "🌿 Flower care:\n\n" +
        "Keep fresh flowers away from direct sunlight and excessive heat. " +
        "Make sure they have enough water and avoid letting the stems dry out.";

      newContext.topic = "care";
    }

    /*
     * CATEGORY 11 — RECOMMENDATIONS
     *
     * Recommendations are the ONLY responses allowed to combine
     * occasion + style + flower + wrapper + budget.
     */
    else if (asksRecommendation) {
      const budgetMatch = message.match(/(?:₱|php|p)\s?(\d+(?:\.\d+)?)/i);
      const budget = budgetMatch ? budgetMatch[1] : chatContext.budget;

      const recommendation = aiGetRecommendation(
        message,
        occasionKey || chatContext.occasion,
        styleKey || chatContext.style,
        budget,
      );

      const occasionLabel = recommendation.occasion
        ? AI_OCCASIONS[recommendation.occasion]?.label
        : null;

      const styleLabel = recommendation.style
        ? AI_PROFILES[recommendation.style]?.label
        : null;

      response =
        "✨ Here's a focused BloomBox recommendation:\n\n" +
        (occasionLabel ? `Occasion: ${occasionLabel}\n` : "") +
        (styleLabel ? `Style: ${styleLabel}\n` : "") +
        (recommendation.budget
          ? `Budget reference: ₱${recommendation.budget.toLocaleString()}\n`
          : "") +
        `Flowers: ${recommendation.flowers.join(", ")}\n` +
        (recommendation.wrapper
          ? `Wrapper: ${recommendation.wrapper}\n`
          : "") +
        "\nThese suggestions are based only on the BloomBox options currently available.";

      newContext.topic = "recommendation";
      newContext.occasion =
        recommendation.occasion || newContext.occasion;
      newContext.style = recommendation.style || newContext.style;
      newContext.budget = recommendation.budget || newContext.budget;
    }

    /*
     * CATEGORY 12 — GREETING / THANKS
     */
    else if (isThanks) {
      response =
        "You're welcome! 🌷 Ask me another BloomBox question anytime.";
    }

    /*
     * CATEGORY 13 — STRICT SCOPE
     */
    else {
      response = AI_UNAVAILABLE_RESPONSE;
      newContext.topic = "unavailable";
    }

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

  /*
   * Add the customized bouquet to the database cart.
   * After a successful database save, redirect to Shopping Cart.
   */
  async function handleAddToCart() {
    const storedClient = localStorage.getItem("client");

    if (!storedClient) {
      navigate("/login");
      return;
    }

    let client;

    try {
      client = JSON.parse(storedClient);
    } catch (error) {
      console.error("Invalid client session:", error);
      localStorage.removeItem("client");
      navigate("/login");
      return;
    }

    if (!client?.client_id) {
      navigate("/login");
      return;
    }

    const customization = {
      template: {
        id: template.id,
        name: template.name,
        price: template.price,
      },

      paper_size: {
        name: selectedPaperSize,
        price: selectedSize?.price || 0,
      },

      wrapper: {
        name: selectedPaper,
        price: selectedWrapper?.price || 0,
      },

      flowers: bouquetItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),

      greeting_card: greetingCard,

      plush_toy: plushToy,
    };

    try {
      const response = await fetch(
        "http://localhost/bbf_clientdb/add_to_cart.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: client.client_id,
            unit_price: total,
            customization: JSON.stringify(customization),
          }),
        },
      );

      const data = await response.json();

      console.log("Add to cart response:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to add item to cart.");
      }

      /*
       * Clear the temporary bouquet flower selections
       * only after the database save succeeds.
       */
      const storageKey = `bouquetFlowers_${client.client_id}`;

      sessionStorage.removeItem(storageKey);

      setBouquetItems([]);
      setSelectedFlowers([]);

      setAdded(true);

      /*
       * Keep the frontend cart synchronized with
       * the database so the Header cart count updates.
       */
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const cartItem = {
        item_id: data.item_id,
        id: data.item_id,
        cart_id: data.cart_id,
        name: template.name,
        category: "Custom Bouquet",
        quantity: 1,
        price: total,
        customization,
      };

      const updatedCart = [...currentCart, cartItem];

      localStorage.setItem("cart", JSON.stringify(updatedCart));

      window.dispatchEvent(new Event("cartUpdated"));

      /*
       * Navigate to Shopping Cart only after
       * the database save succeeds.
       */
      navigate("/shopping-cart");
    } catch (error) {
      console.error("Failed to add bouquet to cart:", error);
    }
  }

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
                  className={`chat-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"
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
          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 1</p>

            <h2>Choose a template</h2>

            <div className="template-grid">
              {templates.map((item) => (
                <button
                  className={`template-card ${templateId === item.id ? "selected" : ""
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

            <h2>Choose your bouquet paper</h2>

            <div className="paper-customizer-grid">
              <div className="paper-choice-group">
                <label className="customizer-label">Paper Size</label>

                <div className="paper-options">
                  {paperSizes.map((size) => (
                    <button
                      key={size.name}
                      type="button"
                      className={`paper-option ${selectedPaperSize === size.name ? "selected" : ""
                        }`}
                      onClick={() => setSelectedPaperSize(size.name)}
                    >
                      <span>{size.name}</span>

                      <small>
                        {size.price === 0 ? "Included" : `+₱${size.price}.00`}
                      </small>
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
                      className={`paper-option ${selectedPaper === wrapper.name ? "selected" : ""
                        }`}
                      onClick={() => setSelectedPaper(wrapper.name)}
                    >
                      <span>{wrapper.name}</span>

                      <small>+₱{wrapper.price}.00</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="customizer-section">
            <p className="customizer-eyebrow">Step 3</p>

            <h2>Add flowers</h2>

            <div className="flower-grid">
              {flowerOptions.map((item) => {
                const quantity = getFlowerQuantity(item.id);

                return (
                  <div
                    className={`flower-option ${selectedFlowers.includes(item.id) ? "selected" : ""
                      }`}
                    key={item.id}
                  >
                    <span
                      className="flower-dot"
                      style={{
                        background: item.color,
                      }}
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

                <strong>
                  +₱
                  {(item.price * item.quantity).toFixed(2)}
                </strong>
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

          <button
            type="button"
            className="add-cart-button"
            onClick={handleAddToCart}
          >
            {added ? "Added to Cart" : "Add to Cart"}
          </button>
        </aside>
      </section>
    </main>
  );
}

export default BouquetCustomizer;

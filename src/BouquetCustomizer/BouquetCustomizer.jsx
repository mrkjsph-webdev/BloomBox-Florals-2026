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
 * Chloris AI
 *
 * Guided recommendation engine for the existing Bouquet Customizer.
 * This remains client-side and uses the project's existing flower, paper,
 * wrapper, pricing, cart, and database structures.
 */

const AI_FLOWER_DATA = {
  rose: {
    name: "Roses",
    singular: "Rose",
    price: 80,
    styles: ["romantic", "soft", "elegant"],
    occasions: ["romantic", "anniversary", "valentine", "birthday"],
    keywords: ["rose", "roses", "romantic", "love"],
  },
  tulip: {
    name: "Tulips",
    singular: "Tulip",
    price: 70,
    styles: ["cheerful", "soft", "elegant"],
    occasions: ["birthday", "congratulations", "just_because"],
    keywords: ["tulip", "tulips"],
  },
  sunflower: {
    name: "Sunflowers",
    singular: "Sunflower",
    price: 70,
    styles: ["cheerful", "bright"],
    occasions: ["birthday", "congratulations", "just_because"],
    keywords: ["sunflower", "sunflowers", "bright", "sunny"],
  },
  lily: {
    name: "Lilies",
    singular: "Lily",
    price: 80,
    styles: ["elegant", "refined"],
    occasions: ["congratulations", "wedding", "just_because"],
    keywords: ["lily", "lilies"],
  },
  daisy: {
    name: "Daisies",
    singular: "Daisy",
    price: 60,
    styles: ["cheerful", "soft", "playful"],
    occasions: ["birthday", "congratulations", "just_because"],
    keywords: ["daisy", "daisies", "cute", "playful"],
  },
  orchid: {
    name: "Orchids",
    singular: "Orchid",
    price: 90,
    styles: ["elegant", "refined"],
    occasions: ["anniversary", "wedding", "congratulations", "just_because"],
    keywords: ["orchid", "orchids"],
  },
  carnation: {
    name: "Carnations",
    singular: "Carnation",
    price: 60,
    styles: ["soft", "cheerful"],
    occasions: ["birthday", "congratulations", "just_because"],
    keywords: ["carnation", "carnations"],
  },
  peony: {
    name: "Peonies",
    singular: "Peony",
    price: 90,
    styles: ["romantic", "soft", "elegant"],
    occasions: ["romantic", "anniversary", "valentine", "wedding"],
    keywords: ["peony", "peonies"],
  },
};

const AI_PROFILES = {
  romantic: {
    label: "romantic",
    keywords: ["romantic", "love", "sweet", "loving", "girlfriend", "boyfriend", "partner"],
    wrapper: "Tissue Paper",
  },
  soft: {
    label: "soft and delicate",
    keywords: ["soft", "delicate", "gentle", "pastel", "cute"],
    wrapper: "Tissue Paper",
  },
  elegant: {
    label: "elegant",
    keywords: ["elegant", "classy", "formal", "sophisticated"],
    wrapper: "Kraft Paper",
  },
  cheerful: {
    label: "bright and cheerful",
    keywords: ["cheerful", "bright", "colorful", "happy", "fun", "sunny"],
    wrapper: "Wrapping Paper",
  },
  refined: {
    label: "refined",
    keywords: ["refined", "premium", "luxurious", "simple"],
    wrapper: "Kraft Paper",
  },
};

const AI_OCCASIONS = {
  birthday: {
    label: "birthday",
    keywords: ["birthday", "bday", "birth day"],
    styles: ["cheerful", "soft", "elegant"],
  },
  anniversary: {
    label: "anniversary",
    keywords: ["anniversary", "anniv"],
    styles: ["romantic", "elegant"],
  },
  valentine: {
    label: "Valentine's",
    keywords: ["valentine", "valentines", "valentines day"],
    styles: ["romantic", "soft"],
  },
  wedding: {
    label: "wedding",
    keywords: ["wedding", "marriage", "bridal"],
    styles: ["elegant", "soft", "romantic"],
  },
  congratulations: {
    label: "congratulations or graduation",
    keywords: ["congratulations", "congrats", "graduation", "graduate", "grad"],
    styles: ["cheerful", "elegant"],
  },
  just_because: {
    label: "a no-special-occasion gift",
    keywords: ["just because", "nothing special", "no occasion", "for myself"],
    styles: ["cheerful", "soft", "romantic", "elegant"],
  },
};

const AI_WRAPPERS = {
  kraft: {
    name: "Kraft Paper",
    price: 20,
    styles: ["elegant", "refined"],
    keywords: ["kraft", "kraft paper"],
  },
  tissue: {
    name: "Tissue Paper",
    price: 30,
    styles: ["soft", "romantic"],
    keywords: ["tissue", "tissue paper"],
  },
  wrapping: {
    name: "Wrapping Paper",
    price: 40,
    styles: ["cheerful", "playful"],
    keywords: ["wrapping", "wrapping paper"],
  },
  cellophane: {
    name: "Cellophane",
    price: 25,
    styles: ["clean", "simple"],
    keywords: ["cellophane"],
  },
};


function normalizeAIInput(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s₱.,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aiHasAny(message, words = []) {
  return words.some((word) => {
    const normalized = normalizeAIInput(word);
    if (!normalized) return false;

    if (normalized.includes(" ")) {
      return message.includes(normalized);
    }

    return new RegExp(`\\b${normalized}\\b`, "i").test(message);
  });
}

function aiDetectOccasion(message) {
  return (
    Object.keys(AI_OCCASIONS).find((key) =>
      aiHasAny(message, AI_OCCASIONS[key].keywords),
    ) || null
  );
}

function aiDetectStyle(message) {
  const matches = Object.entries(AI_PROFILES)
    .filter(([, profile]) => aiHasAny(message, profile.keywords))
    .map(([style]) => style);

  return matches[0] || null;
}

function aiDetectFlower(message) {
  return (
    Object.keys(AI_FLOWER_DATA).find((key) =>
      aiHasAny(message, AI_FLOWER_DATA[key].keywords),
    ) || null
  );
}

function aiDetectAllFlowers(message) {
  return Object.keys(AI_FLOWER_DATA).filter((key) =>
    aiHasAny(message, AI_FLOWER_DATA[key].keywords),
  );
}

function aiDetectWrapper(message) {
  return (
    Object.keys(AI_WRAPPERS).find((key) =>
      aiHasAny(message, AI_WRAPPERS[key].keywords),
    ) || null
  );
}

function aiDetectSize(message) {
  if (aiHasAny(message, ["small", "compact"])) return "Small";
  if (aiHasAny(message, ["medium", "mid size", "mid-sized"])) return "Medium";
  if (aiHasAny(message, ["large", "big", "full", "fuller"])) return "Large";
  return null;
}

function aiDetectBudget(message) {
  const normalized = normalizeAIInput(message).replace(/,/g, "");

  const patterns = [
    /(?:₱|php|pesos?)\s*(\d{2,5}(?:\.\d{1,2})?)/i,
    /(?:budget|maximum|max|around|under|below|less than|up to|spend|spending|only)\s*(?:is|of|around|about|up to|under|below)?\s*(?:₱|php|pesos?)?\s*(\d{2,5}(?:\.\d{1,2})?)/i,
    /(?:i have|my budget is|i can spend|i want to spend|i only have)\s*(?:₱|php|pesos?)?\s*(\d{2,5}(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) return value;
    }
  }

  return null;
}

function aiDetectRecipient(message) {
  if (
    aiHasAny(message, [
      "girlfriend",
      "boyfriend",
      "partner",
      "wife",
      "husband",
      "fiance",
      "fiancee",
      "crush",
      "someone special",
      "special someone",
    ])
  ) {
    return "someone special";
  }

  if (aiHasAny(message, ["mom", "mother", "mama", "nanay"])) return "mom";
  if (aiHasAny(message, ["dad", "father", "papa", "tatay"])) return "dad";
  if (aiHasAny(message, ["friend", "bestie", "best friend"])) return "friend";
  if (aiHasAny(message, ["myself", "for me", "for myself"])) return "myself";

  return null;
}

function aiDetectBudgetIntent(message) {
  return aiHasAny(message, [
    "budget",
    "affordable",
    "cheap",
    "cheapest",
    "inexpensive",
    "not too expensive",
    "within my budget",
    "dont want to spend",
    "do not want to spend",
    "save money",
    "under",
    "below",
    "less than",
    "up to",
    "maximum",
  ]);
}

function aiDetectQuestionTypes(message) {
  return {
    total: aiHasAny(message, [
      "my total",
      "current total",
      "total cost",
      "total price",
      "how much is my bouquet",
      "how much will my bouquet cost",
      "how much does my bouquet cost",
      "what is my current price",
    ]),
    flowerPrice: aiHasAny(message, [
      "price of",
      "cost of",
      "how much is a",
      "how much are",
      "how much does a",
      "how much do",
      "per flower",
      "each flower",
    ]),
    flowers: aiHasAny(message, [
      "what flowers",
      "available flowers",
      "flowers do you have",
      "what flower options",
      "flower options",
      "what kinds of flowers",
      "which flowers are available",
    ]),
    paperSizes: aiHasAny(message, [
      "paper size",
      "paper sizes",
      "what sizes",
      "size options",
      "what size",
    ]),
    wrapper: aiHasAny(message, [
      "wrapper",
      "wrappers",
      "wrapping",
      "paper options",
      "what wrapping",
    ]),
    extras: aiHasAny(message, [
      "greeting card",
      "stuff toy",
      "plush",
      "extra",
      "extras",
      "add ons",
      "add-ons",
    ]),
    care: aiHasAny(message, [
      "care",
      "keep fresh",
      "keep them fresh",
      "preserve",
      "last longer",
      "make flowers last",
    ]),
    templates: aiHasAny(message, [
      "template",
      "templates",
      "bouquet design",
      "base bouquet",
    ]),
    currentBouquet: aiHasAny(message, [
      "what did i add",
      "what did i choose",
      "my bouquet",
      "my selections",
      "whats in my bouquet",
      "what is in my bouquet",
      "show my bouquet",
      "current bouquet",
      "what have i selected",
    ]),
    cheapest: aiHasAny(message, [
      "cheapest flower",
      "least expensive flower",
      "lowest price flower",
      "most affordable flower",
      "cheapest option",
    ]),
  };
}

function aiGetCurrentFlowerKeys(bouquetItems) {
  return bouquetItems
    .map((item) =>
      Object.keys(AI_FLOWER_DATA).find(
        (key) =>
          normalizeAIInput(AI_FLOWER_DATA[key].singular) ===
            normalizeAIInput(item.name) ||
          normalizeAIInput(AI_FLOWER_DATA[key].name) ===
            normalizeAIInput(item.name),
      ),
    )
    .filter(Boolean);
}

function aiGetRecommendedWrapper(style, currentWrapper) {
  if (currentWrapper) return currentWrapper;

  const profile = style ? AI_PROFILES[style] : null;
  if (profile) {
    const wrapperKey = Object.keys(AI_WRAPPERS).find(
      (key) => AI_WRAPPERS[key].name === profile.wrapper,
    );

    if (wrapperKey) return wrapperKey;
  }

  return "kraft";
}

function aiGetBouquetSummary({
  template,
  selectedPaperSize,
  selectedPaper,
  bouquetItems,
  greetingCard,
  plushToy,
  total,
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

  return (
    `${template.name}, ${selectedPaperSize} paper size, ${selectedPaper}, ` +
    `${flowers}, and ${extras.length ? extras.join(" and ") : "no extras"}. ` +
    `Current total: ₱${total.toLocaleString()}.`
  );
}

function aiGetRecommendationCandidates({
  occasion,
  style,
  budget,
  preferredFlower,
  selectedFlowers = [],
}) {
  const scored = Object.entries(AI_FLOWER_DATA).map(([key, flower]) => {
    let score = 0;

    if (occasion && flower.occasions.includes(occasion)) score += 8;
    if (style && flower.styles.includes(style)) score += 8;
    if (preferredFlower === key) score += 20;
    if (selectedFlowers.includes(key)) score -= 6;

    if (budget !== null && budget !== undefined) {
      if (flower.price <= 60) score += 3;
      else if (flower.price <= 70) score += 2;
      else if (flower.price <= 80) score += 1;
    }

    return { key, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.key);
}

function aiBuildRecommendation({
  occasion,
  style,
  budget,
  preferredFlower,
  selectedFlowers = [],
  template,
  size,
  wrapper,
}) {
  const resolvedOccasion = occasion || "just_because";
  const resolvedStyle =
    style || AI_OCCASIONS[resolvedOccasion]?.styles?.[0] || "soft";
  const resolvedSize = size || "Medium";
  const resolvedWrapper =
    wrapper || aiGetRecommendedWrapper(resolvedStyle);

  const sizeData = paperSizes.find((item) => item.name === resolvedSize);
  const wrapperData = bouquetWrappers.find(
    (item) => item.name === AI_WRAPPERS[resolvedWrapper]?.name,
  );

  const fixedCost =
    (template?.price || 0) +
    (sizeData?.price || 0) +
    (wrapperData?.price || 0);

  const candidates = aiGetRecommendationCandidates({
    occasion: resolvedOccasion,
    style: resolvedStyle,
    budget,
    preferredFlower,
    selectedFlowers,
  });

  let flowers = candidates.slice(0, 3);

  if (budget !== null && budget !== undefined) {
    const affordable = [];

    for (const key of candidates) {
      const flowerPrice = AI_FLOWER_DATA[key].price;
      if (fixedCost + flowerPrice <= budget) {
        affordable.push(key);
      }
    }

    flowers = affordable.slice(0, 3);

    // If the budget is too low for even one flower, do not pretend it fits.
    if (!flowers.length) {
      flowers = candidates.slice(0, 1);
    }
  }

  if (!flowers.length) {
    flowers = ["rose"];
  }

  const flowerCost = flowers.reduce(
    (sum, key) => sum + AI_FLOWER_DATA[key].price,
    0,
  );

  return {
    occasion: resolvedOccasion,
    style: resolvedStyle,
    flowers,
    wrapper: resolvedWrapper,
    size: resolvedSize,
    estimatedTotal: fixedCost + flowerCost,
    fixedCost,
    budgetExceeded:
      budget !== null &&
      budget !== undefined &&
      fixedCost + flowerCost > budget,
  };
}

function aiFormatRecommendation(recommendation, budget) {
  const flowerNames = recommendation.flowers
    .map((key) => `${AI_FLOWER_DATA[key].singular} (₱${AI_FLOWER_DATA[key].price})`)
    .join(" + ");

  const styleLabel =
    AI_PROFILES[recommendation.style]?.label || "balanced";
  const occasionLabel =
    AI_OCCASIONS[recommendation.occasion]?.label || "your occasion";

  let budgetLine = "";
  if (budget !== null && budget !== undefined) {
    budgetLine = recommendation.budgetExceeded
      ? `\n⚠️ This estimate is ₱${recommendation.estimatedTotal.toLocaleString()}, which is above your ₱${budget.toLocaleString()} budget. I would keep the current setup and change the flowers or size to bring it down.`
      : `\n💰 Estimated total: ₱${recommendation.estimatedTotal.toLocaleString()} — within your ₱${budget.toLocaleString()} budget.`;
  } else {
    budgetLine = `\n💰 Estimated total: ₱${recommendation.estimatedTotal.toLocaleString()}.`;
  }

  return (
    `For ${occasionLabel}, I'd suggest a ${styleLabel} bouquet. 🌷\n\n` +
    `🌸 Flowers: ${flowerNames}\n` +
    `🎀 Wrapper: ${AI_WRAPPERS[recommendation.wrapper]?.name || "Kraft Paper"}\n` +
    `📏 Size: ${recommendation.size}` +
    budgetLine
  );
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
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const [chatContext, setChatContext] = useState({
    stage: "discover",
    topic: "occasion",
    occasion: null,
    style: null,
    recipient: null,
    budget: null,
    preferredFlower: null,
    size: null,
    wrapper: null,
    recommendedFlowers: [],
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! I'm Chloris 🌷 I can help you create a bouquet based on the occasion, style, flowers, or budget. What are you looking for?",
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

  function applyAIRecommendation(recommendation) {
    const client = JSON.parse(localStorage.getItem("client"));

    if (!client) {
      return;
    }

    const storageKey = `bouquetFlowers_${client.client_id}`;

    setBouquetItems((currentItems) => {
      const updatedItems = [...currentItems];

      recommendation.flowers.forEach((flowerKey) => {
        const flowerData = AI_FLOWER_DATA[flowerKey];
        const existing = updatedItems.find(
          (item) =>
            normalizeAIInput(item.name) ===
            normalizeAIInput(flowerData.singular),
        );

        if (!existing) {
          const option = flowerOptions.find(
            (item) =>
              normalizeAIInput(item.name) ===
              normalizeAIInput(flowerData.singular),
          );

          if (option) {
            updatedItems.push({
              id: option.id,
              name: option.name,
              price: option.price,
              color: option.color,
              quantity: 1,
            });
          }
        }
      });

      sessionStorage.setItem(storageKey, JSON.stringify(updatedItems));
      setSelectedFlowers(updatedItems.map((flower) => Number(flower.id)));

      return updatedItems;
    });

    if (recommendation.size) {
      setSelectedPaperSize(recommendation.size);
    }

    if (recommendation.wrapper) {
      const wrapperName = AI_WRAPPERS[recommendation.wrapper]?.name;
      if (wrapperName) {
        setSelectedPaper(wrapperName);
      }
    }
  }

  function handleChat(inputMessage = chatInput) {
    const userMessage = String(inputMessage || "").trim();
    if (!userMessage) return;

    const message = normalizeAIInput(userMessage);
    setHasStartedChat(true);

    const currentContext = chatContext || {};
    let newContext = { ...currentContext };
    let response = "";

    const detectedOccasion = aiDetectOccasion(message);
    const detectedStyle = aiDetectStyle(message);
    const detectedFlowers = aiDetectAllFlowers(message);
    const detectedFlower = detectedFlowers[0] || null;
    const detectedWrapper = aiDetectWrapper(message);
    const detectedSize = aiDetectSize(message);
    const detectedBudget = aiDetectBudget(message);
    const detectedRecipient = aiDetectRecipient(message);
    const question = aiDetectQuestionTypes(message);
    const mentionsBudget = aiDetectBudgetIntent(message);

    const isPositive = aiHasAny(message, [
      "yes",
      "yeah",
      "yep",
      "sure",
      "okay",
      "ok",
      "sounds good",
      "i like it",
      "go with it",
      "use it",
      "build it",
      "apply it",
    ]);

    const isNegative = aiHasAny(message, [
      "no",
      "nope",
      "nah",
      "not really",
      "change it",
      "something else",
      "different",
    ]);

    const currentFlowerKeys = aiGetCurrentFlowerKeys(bouquetItems);

    const mergedOccasion = detectedOccasion || currentContext.occasion;
    const mergedStyle = detectedStyle || currentContext.style;
    const mergedRecipient =
      detectedRecipient || currentContext.recipient;
    const mergedBudget =
      detectedBudget !== null
        ? detectedBudget
        : currentContext.budget;
    const mergedFlower =
      detectedFlower || currentContext.preferredFlower;
    const mergedSize = detectedSize || currentContext.size;
    const mergedWrapper =
      detectedWrapper || currentContext.wrapper;

    newContext = {
      ...newContext,
      occasion: mergedOccasion,
      style: mergedStyle,
      recipient: mergedRecipient,
      budget: mergedBudget,
      preferredFlower: mergedFlower,
      size: mergedSize,
      wrapper: mergedWrapper,
    };

    /*
     * Priority 1:
     * Answer factual questions first.
     * This prevents Chloris from accidentally turning a question like
     * "How much are roses?" into a recommendation flow.
     */

    if (question.total) {
      response =
        `Your current bouquet total is ₱${total.toLocaleString()}. 💐 ` +
        `That includes ${template.name} (₱${template.price}), ` +
        `${selectedPaperSize} paper (+₱${selectedSize?.price || 0}), ` +
        `${selectedPaper} (+₱${selectedWrapper?.price || 0}), ` +
        `${bouquetItems.length ? "your selected flowers" : "no additional flowers"}, ` +
        `${greetingCard ? "a greeting card (+₱50)" : "no greeting card"}, ` +
        `and ${plushToy ? "a mini stuff toy (+₱120)" : "no mini stuff toy"}.`;

      newContext.stage = "review";
      newContext.topic = "price";
    } else if (question.flowerPrice) {
      const flowerMatches =
        detectedFlowers.length
          ? detectedFlowers
          : Object.keys(AI_FLOWER_DATA).filter((key) =>
              aiHasAny(message, [
                AI_FLOWER_DATA[key].singular,
                AI_FLOWER_DATA[key].name,
              ]),
            );

      if (flowerMatches.length) {
        response =
          flowerMatches
            .map(
              (key) =>
                `🌸 ${AI_FLOWER_DATA[key].singular}: ₱${AI_FLOWER_DATA[key].price} each`,
            )
            .join("\n") +
          `\n\nThese are the current flower prices in BloomBox.`;
      } else {
        response =
          "Here are our current flower prices:\n\n" +
          Object.values(AI_FLOWER_DATA)
            .map((flower) => `🌸 ${flower.singular}: ₱${flower.price} each`)
            .join("\n");
      }

      newContext.stage = "refine";
      newContext.topic = "flower";
    } else if (question.cheapest) {
      const cheapestPrice = Math.min(
        ...Object.values(AI_FLOWER_DATA).map((flower) => flower.price),
      );

      const cheapest = Object.values(AI_FLOWER_DATA)
        .filter((flower) => flower.price === cheapestPrice)
        .map((flower) => flower.singular)
        .join(" and ");

      response =
        `The most affordable flowers are ${cheapest}, at ₱${cheapestPrice} each. 🌸`;

      newContext.stage = "refine";
      newContext.topic = "flower";
    } else if (question.flowers) {
      response =
        "We currently have these flowers:\n\n" +
        Object.values(AI_FLOWER_DATA)
          .map((flower) => `🌸 ${flower.singular} — ₱${flower.price} each`)
          .join("\n") +
        "\n\nTell me your occasion or preferred style and I can recommend which ones fit.";
      newContext.stage = "understand";
      newContext.topic = "flowers";
    } else if (question.paperSizes) {
      response =
        "Our paper sizes are:\n\n" +
        "📏 Small — included\n" +
        "📏 Medium — +₱30\n" +
        "📏 Large — +₱60\n\n" +
        "Small is more compact, Medium is balanced, and Large gives the bouquet a fuller presentation.";
      newContext.stage = "refine";
      newContext.topic = "size";
    } else if (question.wrapper) {
      response =
        "Our bouquet wrappers are:\n\n" +
        Object.values(AI_WRAPPERS)
          .map(
            (wrapper) =>
              `🎀 ${wrapper.name} — +₱${wrapper.price}`,
          )
          .join("\n") +
        "\n\nIf you tell me the style you want, I can suggest a wrapper that matches.";
      newContext.stage = "refine";
      newContext.topic = "wrapper";
    } else if (question.extras) {
      response =
        "You can add these optional extras:\n\n" +
        "💌 Greeting card — +₱50\n" +
        "🧸 Mini stuff toy — +₱120";
      newContext.stage = "refine";
      newContext.topic = "extras";
    } else if (question.templates) {
      response =
        "We currently have three bouquet templates:\n\n" +
        templates
          .map(
            (item) =>
              `💐 ${item.name} — ₱${item.price}\n${item.description}`,
          )
          .join("\n\n");
      newContext.stage = "refine";
      newContext.topic = "template";
    } else if (question.care) {
      response =
        "For fresh flowers, keep them away from direct sunlight and excessive heat, use clean water, and avoid letting the stems dry out. 🌿";
      newContext.topic = "care";
    } else if (question.currentBouquet) {
      response = `Here's your current bouquet:\n\n${aiGetBouquetSummary({
        template,
        selectedPaperSize,
        selectedPaper,
        bouquetItems,
        greetingCard,
        plushToy,
        total,
      })} 🌸`;

      newContext.stage = "review";
      newContext.topic = "review";
    } else if (
      currentContext.stage === "recommend" &&
      isPositive &&
      currentContext.recommendedFlowers?.length
    ) {
      const recommendation = {
        flowers: currentContext.recommendedFlowers,
        size: currentContext.size || "Medium",
        wrapper:
          currentContext.wrapper ||
          aiGetRecommendedWrapper(currentContext.style),
      };

      applyAIRecommendation(recommendation);

      response =
        `Perfect! 🌷 I've applied the recommendation: ` +
        `${recommendation.flowers
          .map((key) => AI_FLOWER_DATA[key].name)
          .join(" + ")} with ` +
        `${AI_WRAPPERS[recommendation.wrapper]?.name || "Kraft Paper"} ` +
        `and ${recommendation.size} size. You can still edit anything in the customizer.`;

      newContext.stage = "refine";
      newContext.topic = "refine";
    } else if (
      currentContext.stage === "recommend" &&
      isNegative
    ) {
      response =
        "Of course! 🌸 Tell me what you want to change—flower, style, size, wrapper, or budget.";
      newContext.stage = "refine";
      newContext.topic = "refine";
    } else if (detectedBudget !== null && !detectedOccasion && !detectedStyle && !detectedFlower) {
      if (currentContext.occasion || currentContext.style || currentContext.preferredFlower) {
        newContext.stage = "recommend";
        newContext.topic = "recommend";
        const recommendation = aiBuildRecommendation({
          occasion: mergedOccasion,
          style: mergedStyle,
          budget: detectedBudget,
          preferredFlower: mergedFlower,
          selectedFlowers: currentFlowerKeys,
          template,
          size: mergedSize,
          wrapper: mergedWrapper,
        });

        response =
          `Got it — I'll work with a ₱${detectedBudget.toLocaleString()} budget. 💰\n\n` +
          aiFormatRecommendation(recommendation, detectedBudget) +
          "\n\nWould you like me to use this recommendation?";
        newContext = {
          ...newContext,
          stage: "recommend",
          topic: "recommend",
          recommendedFlowers: recommendation.flowers,
          size: recommendation.size,
          wrapper: recommendation.wrapper,
          occasion: recommendation.occasion,
          style: recommendation.style,
        };
      } else {
        response =
          `Got it! Your budget is ₱${detectedBudget.toLocaleString()}. 💰 ` +
          "What is the bouquet for—birthday, anniversary, graduation, Valentine's, wedding, or just because?";
        newContext.stage = "discover";
        newContext.topic = "occasion";
      }
    } else if (
      currentContext.stage === "discover" &&
      (detectedOccasion ||
        detectedStyle ||
        detectedRecipient ||
        detectedFlower)
    ) {
      // A recipient such as "girlfriend" also gives us a useful romantic signal.
      const contextualStyle =
        mergedStyle ||
        (mergedRecipient === "someone special" ? "romantic" : null);

      newContext.style = contextualStyle;

      if (!mergedOccasion && !mergedStyle && !detectedFlower) {
        response =
          "Got it! 🌷 Who is the bouquet for, or what feeling do you want it to have?";
        newContext.stage = "understand";
        newContext.topic = "recipient";
      } else if (!contextualStyle && !mergedFlower) {
        response =
          `Got it! 🌷 ${
            AI_OCCASIONS[mergedOccasion]?.label
              ? `This is for ${AI_OCCASIONS[mergedOccasion].label}. `
              : ""
          }What feeling do you want—romantic, soft, elegant, or cheerful?`;
        newContext.stage = "understand";
        newContext.topic = "style";
      } else {
        newContext.stage = "recommend";
        newContext.topic = "recommend";
      }
    } else if (
      currentContext.stage === "understand" ||
      currentContext.stage === "discover"
    ) {
      if (!mergedOccasion) {
        response =
          "I'd love to help! 🌷 What is the bouquet for—birthday, anniversary, graduation, Valentine's, wedding, or just because?";
        newContext.stage = "discover";
        newContext.topic = "occasion";
      } else if (!mergedStyle && !mergedFlower) {
        response =
          `Nice! 💐 For ${AI_OCCASIONS[mergedOccasion]?.label || "that occasion"}, ` +
          "what style do you prefer: romantic, soft, elegant, or cheerful?";
        newContext.stage = "understand";
        newContext.topic = "style";
      } else if (mentionsBudget && mergedBudget === null) {
        response =
          "Sure! 💰 What budget would you like me to stay within? For example, ₱700 or ₱1,000.";
        newContext.stage = "understand";
        newContext.topic = "budget";
      } else {
        newContext.stage = "recommend";
        newContext.topic = "recommend";
      }
    }

    if (
      !response &&
      (currentContext.stage === "recommend" ||
        detectedOccasion ||
        detectedStyle ||
        detectedFlower ||
        detectedBudget !== null)
    ) {
      const recommendation = aiBuildRecommendation({
        occasion: mergedOccasion,
        style: mergedStyle,
        budget: mergedBudget,
        preferredFlower: mergedFlower,
        selectedFlowers: currentFlowerKeys,
        template,
        size: mergedSize,
        wrapper: mergedWrapper,
      });

      response =
        aiFormatRecommendation(recommendation, mergedBudget) +
        "\n\nWould you like me to use this recommendation? 💐";

      newContext = {
        ...newContext,
        stage: "recommend",
        topic: "recommend",
        occasion: recommendation.occasion,
        style: recommendation.style,
        recommendedFlowers: recommendation.flowers,
        wrapper: recommendation.wrapper,
        size: recommendation.size,
      };
    }

    if (!response && (detectedSize || detectedWrapper || detectedFlower || detectedStyle)) {
      if (detectedSize) {
        setSelectedPaperSize(detectedSize);
        newContext.size = detectedSize;
        response = `Done! 🌸 I set the paper size to ${detectedSize}.`;
      } else if (detectedWrapper) {
        const wrapper = AI_WRAPPERS[detectedWrapper];
        setSelectedPaper(wrapper.name);
        newContext.wrapper = detectedWrapper;
        response = `Done! 🎀 I set the wrapper to ${wrapper.name} (+₱${wrapper.price}).`;
      } else if (detectedFlower) {
        const flower = AI_FLOWER_DATA[detectedFlower];
        newContext.preferredFlower = detectedFlower;
        response =
          `${flower.singular} is ₱${flower.price} each. 🌷 ` +
          "If you'd like, I can also build a recommendation around it.";
      } else if (detectedStyle) {
        newContext.style = detectedStyle;
        response =
          `A ${AI_PROFILES[detectedStyle].label} style sounds lovely. ✨ ` +
          "Tell me the occasion or budget and I can make a more specific recommendation.";
      }
    }

    if (!response) {
      response =
        "I can help with bouquet prices, flowers, sizes, wrappers, extras, your current total, or recommendations. 🌷 " +
        "What would you like to know?";
      newContext.stage = "discover";
      newContext.topic = "occasion";
    }

    setChatContext(newContext);
    setChatInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
      { sender: "bot", text: response },
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

            {!hasStartedChat && (
              <div className="ai-faq-buttons">
                <span className="ai-faq-label">Start with</span>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("It's for a birthday")}
                >
                  <span>🎂</span>
                  <span>Birthday</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("It's for someone special")}
                >
                  <span>💕</span>
                  <span>Someone special</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("I want something cheerful")}
                >
                  <span>🌻</span>
                  <span>Bright & cheerful</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("I'm not sure yet")}
                >
                  <span>✨</span>
                  <span>I'm not sure yet</span>
                </button>
              </div>
            )}

            {hasStartedChat && chatContext.stage === "understand" && (
              <div className="ai-faq-buttons ai-context-options">
                <span className="ai-faq-label">
                  {chatContext.topic === "style"
                    ? "Choose a feeling"
                    : chatContext.topic === "budget"
                      ? "Budget"
                      : "Quick choice"}
                </span>

                {chatContext.topic === "style" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleChatFAQ("I want something romantic")}
                    >
                      <span>💕</span>
                      <span>Romantic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChatFAQ("I want something soft and delicate")}
                    >
                      <span>🌸</span>
                      <span>Soft & delicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChatFAQ("I want something elegant")}
                    >
                      <span>✨</span>
                      <span>Elegant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChatFAQ("I want something cheerful")}
                    >
                      <span>🌻</span>
                      <span>Bright & cheerful</span>
                    </button>
                  </>
                )}

                {chatContext.topic === "budget" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleChatFAQ("My budget is ₱700")}
                    >
                      <span>💵</span>
                      <span>Around ₱700</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChatFAQ("My budget is ₱1000")}
                    >
                      <span>💵</span>
                      <span>Around ₱1,000</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {hasStartedChat && chatContext.stage === "recommend" && (
              <div className="ai-faq-buttons ai-context-options">
                <span className="ai-faq-label">Recommendation</span>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("Yes, use this recommendation")}
                >
                  <span>💐</span>
                  <span>Use this recommendation</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("No, I want something different")}
                >
                  <span>🔄</span>
                  <span>Change it</span>
                </button>
              </div>
            )}

            {hasStartedChat && chatContext.stage === "refine" && (
              <div className="ai-faq-buttons ai-context-options">
                <span className="ai-faq-label">Refine your bouquet</span>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("Show me flower options")}
                >
                  <span>🌷</span>
                  <span>Change flowers</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("I want a Medium size")}
                >
                  <span>📏</span>
                  <span>Change size</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("Show me wrapper options")}
                >
                  <span>🎀</span>
                  <span>Change wrapper</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("What is my current total?")}
                >
                  <span>💰</span>
                  <span>Check total</span>
                </button>
              </div>
            )}

            {hasStartedChat && chatContext.stage === "review" && (
              <div className="ai-faq-buttons ai-context-options">
                <span className="ai-faq-label">Your bouquet</span>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("What is my current bouquet?")}
                >
                  <span>💐</span>
                  <span>Review bouquet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChatFAQ("I want to change something")}
                >
                  <span>✏️</span>
                  <span>Keep editing</span>
                </button>
              </div>
            )}

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

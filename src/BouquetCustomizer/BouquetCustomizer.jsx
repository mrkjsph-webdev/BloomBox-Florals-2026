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
  const scores = Object.entries(AI_PROFILES).map(([style, profile]) => ({
    style,
    score: aiHasAny(message, profile.keywords) ? 1 : 0,
  }));

  const match = scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  return match?.style || null;
}

function aiDetectFlower(message) {
  return (
    Object.keys(AI_FLOWER_DATA).find((key) =>
      aiHasAny(message, AI_FLOWER_DATA[key].keywords),
    ) || null
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
  if (aiHasAny(message, ["small", "compact", "simple"])) return "Small";
  if (aiHasAny(message, ["medium", "mid"])) return "Medium";
  if (aiHasAny(message, ["large", "big", "full", "fuller"])) return "Large";
  return null;
}

function aiDetectBudget(message) {
  const normalized = normalizeAIInput(message);

  const pesoMatch = normalized.match(
    /(?:₱|php|pesos?|budget(?:\s+of|\s+is)?|around|under|below|maximum|max)\s*(\d{2,5}(?:[.,]\d{1,2})?)/i,
  );

  if (pesoMatch) {
    const value = Number(pesoMatch[1].replace(/,/g, ""));
    return Number.isFinite(value) ? value : null;
  }

  const numberMatch = normalized.match(
    /(?:i have|my budget is|budget is|spend|spending|only)\s*(?:₱|php)?\s*(\d{2,5})/i,
  );

  if (numberMatch) {
    const value = Number(numberMatch[1]);
    return Number.isFinite(value) ? value : null;
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
    ])
  ) {
    return "someone special";
  }

  if (aiHasAny(message, ["mom", "mother", "mama", "nanay"])) return "mom";
  if (aiHasAny(message, ["dad", "father", "papa", "tatay"])) return "dad";
  if (aiHasAny(message, ["friend", "bestie", "best friend"])) return "friend";
  if (aiHasAny(message, ["myself", "me"])) return "myself";

  return null;
}

function aiDetectBudgetIntent(message) {
  return aiHasAny(message, [
    "budget",
    "affordable",
    "cheap",
    "inexpensive",
    "not too expensive",
    "within my budget",
    "dont want to spend",
    "don't want to spend",
    "save money",
  ]);
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

function aiRecommendFlowers({
  occasion,
  style,
  budget,
  selectedFlowers = [],
  preferredFlower,
}) {
  const scored = Object.entries(AI_FLOWER_DATA).map(([key, flower]) => {
    let score = 0;

    if (occasion && flower.occasions.includes(occasion)) score += 6;
    if (style && flower.styles.includes(style)) score += 6;
    if (preferredFlower === key) score += 10;
    if (selectedFlowers.includes(key)) score -= 5;

    // Prefer lower-priced flowers when the client explicitly mentions budget.
    if (budget && flower.price <= Math.max(60, budget / 8)) {
      score += 2;
    }

    return { key, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.key);
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

function aiFormatRecommendation({
  occasion,
  style,
  flowers,
  wrapper,
  size,
  budget,
}) {
  const flowerNames = flowers.map((key) => AI_FLOWER_DATA[key].name).join(" + ");
  const styleLabel = AI_PROFILES[style]?.label || "balanced";
  const occasionLabel = AI_OCCASIONS[occasion]?.label || "your occasion";
  const budgetText = budget ? ` while keeping your ₱${budget} budget in mind` : "";

  return (
    `For ${occasionLabel}${budgetText}, I'd suggest a ${styleLabel} bouquet. 🌷\n\n` +
    `🌸 Flowers: ${flowerNames || "a balanced flower mix"}\n` +
    `🎀 Wrapper: ${AI_WRAPPERS[wrapper]?.name || "Kraft Paper"}\n` +
    `📏 Size: ${size || "Medium"}\n\n` +
    `This combination matches the details you've shared so far.`
  );
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
    const detectedFlower = aiDetectFlower(message);
    const detectedWrapper = aiDetectWrapper(message);
    const detectedSize = aiDetectSize(message);
    const detectedBudget = aiDetectBudget(message);
    const detectedRecipient = aiDetectRecipient(message);
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

    const wantsPrice = aiHasAny(message, [
      "price",
      "cost",
      "how much",
      "total",
      "budget",
    ]);

    const wantsCurrentBouquet = aiHasAny(message, [
      "what did i add",
      "what did i choose",
      "my bouquet",
      "my selections",
      "whats in my bouquet",
      "what is in my bouquet",
      "show my bouquet",
    ]);

    const wantsFlowers = aiHasAny(message, [
      "what flowers",
      "available flowers",
      "flowers do you have",
      "what flowers do you have",
      "flower options",
    ]);

    const wantsPaperSizes = aiHasAny(message, [
      "paper size",
      "paper sizes",
      "what sizes",
      "size options",
    ]);

    const wantsCare = aiHasAny(message, [
      "care",
      "keep fresh",
      "keep them fresh",
      "preserve",
    ]);

    const wantsExtras = aiHasAny(message, [
      "card",
      "stuff toy",
      "plush",
      "extra",
      "extras",
    ]);

    const isThanks = aiHasAny(message, ["thank you", "thanks", "thank u"]);

    const currentFlowerKeys = aiGetCurrentFlowerKeys(bouquetItems);

    // Merge newly detected information into the conversation context.
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
     * Priority 1: direct information requests.
     * These should always answer the question instead of forcing the user
     * through the guided flow.
     */
    if (isThanks) {
      response =
        "You're welcome! 🌷 I'm here whenever you want to refine your bouquet.";

      newContext.stage = "refine";
      newContext.topic = "refine";
    } else if (wantsCurrentBouquet) {
      response = `Here's your current bouquet: ${aiGetBouquetSummary({
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
    } else if (wantsPrice) {
      response =
        `Your current bouquet total is ₱${total.toLocaleString()}. 💐 ` +
        `This includes your ${template.name}, ${selectedPaperSize} paper, ` +
        `${selectedPaper}, selected flowers, and extras.`;

      newContext.stage = "review";
      newContext.topic = "price";
    } else if (wantsFlowers) {
      response =
        "We currently have Roses, Tulips, Sunflowers, Lilies, Daisies, Orchids, Carnations, and Peonies. 🌷 " +
        "If you tell me the occasion or style, I'll narrow them down for you.";

      newContext.stage = "understand";
      newContext.topic = "flowers";
    } else if (wantsPaperSizes) {
      response =
        "We have Small, Medium, and Large. 🌸 Small is compact, Medium gives you a balanced arrangement, and Large works well for a fuller bouquet.";

      newContext.stage = "refine";
      newContext.topic = "size";
    } else if (wantsCare) {
      response =
        "To keep fresh flowers looking their best, keep them away from direct sunlight and excessive heat, use clean water, and avoid letting the stems dry out. 🌿";

      newContext.topic = "care";
    } else if (wantsExtras) {
      response =
        "You can add a greeting card for ₱50 or a mini stuff toy for ₱120. 🎁 " +
        "These are optional finishing touches.";

      newContext.stage = "refine";
      newContext.topic = "extras";
    }

    /*
     * Priority 2: explicit confirmation of an existing recommendation.
     */
    else if (
      isPositive &&
      currentContext.stage === "recommend" &&
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
        `Perfect! 🌷 I've applied the recommendation to your bouquet: ` +
        `${recommendation.flowers
          .map((key) => AI_FLOWER_DATA[key].name)
          .join(" + ")} with ${AI_WRAPPERS[recommendation.wrapper]?.name}. ` +
        `You can still change anything in the customizer.`;

      newContext = {
        ...newContext,
        stage: "refine",
        topic: "refine",
        size: recommendation.size,
        wrapper: recommendation.wrapper,
      };
    }

    /*
     * Priority 3: client rejects the recommendation.
     */
    else if (
      isNegative &&
      currentContext.stage === "recommend"
    ) {
      response =
        "No problem! 🌸 What would you like to change? You can tell me the flower, style, size, wrapper, or budget you prefer.";

      newContext.stage = "refine";
      newContext.topic = "refine";
    }

    /*
     * Priority 4: if the client gives an occasion, start understanding
     * their preference instead of immediately dumping recommendations.
     */
    else if (
      currentContext.stage === "discover" &&
      (detectedOccasion || detectedStyle || detectedRecipient || detectedFlower)
    ) {
      const occasionLabel =
        AI_OCCASIONS[mergedOccasion]?.label || null;

      if (!mergedStyle && !mergedFlower) {
        response =
          `Got it! 🌷 ${occasionLabel
            ? `This is for a ${occasionLabel}.`
            : "I have the occasion in mind."
          } ` +
          `What kind of feeling do you want?`;

        newContext.stage = "understand";
        newContext.topic = "style";
      } else {
        newContext.stage = "recommend";
        newContext.topic = "recommend";
      }
    }

    /*
     * Priority 5: identify missing information during the understanding stage.
     */
    else if (
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
          `what style do you prefer: romantic, soft, elegant, or cheerful?`;

        newContext.stage = "understand";
        newContext.topic = "style";
      } else if (mentionsBudget && mergedBudget === null) {
        response =
          "Absolutely! 💰 What budget would you like me to stay around? You can say something like ₱700 or ₱1,000.";

        newContext.stage = "understand";
        newContext.topic = "budget";
      } else {
        newContext.stage = "recommend";
        newContext.topic = "recommend";
      }
    }

    /*
     * Priority 6: generate the recommendation once enough information exists.
     */
    else if (
      currentContext.stage === "recommend" ||
      detectedOccasion ||
      detectedStyle ||
      detectedFlower ||
      detectedBudget !== null
    ) {
      const occasion =
        mergedOccasion || "just_because";

      const style =
        mergedStyle ||
        AI_OCCASIONS[occasion]?.styles?.[0] ||
        "soft";

      const recommendedFlowers = aiRecommendFlowers({
        occasion,
        style,
        budget: mergedBudget,
        selectedFlowers: currentFlowerKeys,
        preferredFlower: mergedFlower,
      });

      const wrapper =
        mergedWrapper ||
        aiGetRecommendedWrapper(style);

      const size = mergedSize || "Medium";

      response = aiFormatRecommendation({
        occasion,
        style,
        flowers:
          recommendedFlowers.length
            ? recommendedFlowers
            : ["rose", "carnation"],
        wrapper,
        size,
        budget: mergedBudget,
      });

      response +=
        "\n\nWould you like me to use this recommendation for your bouquet? 💐";

      newContext = {
        ...newContext,
        stage: "recommend",
        topic: "recommend",
        occasion,
        style,
        recommendedFlowers:
          recommendedFlowers.length
            ? recommendedFlowers
            : ["rose", "carnation"],
        wrapper,
        size,
      };
    }

    /*
     * Priority 7: refine a recommendation without restarting the conversation.
     */
    else if (
      currentContext.stage === "refine" ||
      currentContext.stage === "review"
    ) {
      if (detectedFlower) {
        response =
          `${AI_FLOWER_DATA[detectedFlower].name} are ₱${AI_FLOWER_DATA[detectedFlower].price} each. 🌷 ` +
          `They can be added to your current bouquet.`;

        newContext.preferredFlower = detectedFlower;
        newContext.topic = "flower";
        newContext.stage = "refine";
      } else if (detectedSize) {
        response =
          `${detectedSize} works! 🌸 ` +
          `${detectedSize === "Small"
            ? "It keeps the arrangement compact and simple."
            : detectedSize === "Medium"
              ? "It gives you a balanced amount of room for the flowers."
              : "It gives you more room for a fuller arrangement."
          }`;

        setSelectedPaperSize(detectedSize);

        newContext.size = detectedSize;
        newContext.topic = "size";
        newContext.stage = "refine";
      } else if (detectedWrapper) {
        const wrapper = AI_WRAPPERS[detectedWrapper];

        response =
          `${wrapper.name} costs ₱${wrapper.price} and gives the bouquet a ` +
          `${wrapper.styles[0]} presentation. 🎀`;

        setSelectedPaper(wrapper.name);

        newContext.wrapper = detectedWrapper;
        newContext.topic = "wrapper";
        newContext.stage = "refine";
      } else if (detectedBudget !== null || mentionsBudget) {
        if (detectedBudget !== null) {
          response =
            `Got it! 💰 I'll keep your ₱${detectedBudget} budget in mind. ` +
            `Would you like me to create a more budget-conscious recommendation?`;

          newContext.budget = detectedBudget;
          newContext.stage = "recommend";
          newContext.topic = "recommend";
        } else {
          response =
            "Sure! 💰 Tell me the maximum amount you'd like to spend, and I'll keep the recommendation around that range.";

          newContext.topic = "budget";
        }
      } else {
        response =
          "We can still refine it. 🌷 Tell me what you'd like to change—flowers, style, size, wrapper, or budget.";

        newContext.topic = "refine";
        newContext.stage = "refine";
      }
    }

    /*
     * Final fallback.
     */
    else {
      response =
        "I can help you design the bouquet step by step. 🌷 " +
        "Tell me the occasion, style, favorite flower, or budget, and I'll build a recommendation around it.";

      newContext.stage = "discover";
      newContext.topic = "occasion";
    }

    setChatContext(newContext);
    setChatInput("");

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
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

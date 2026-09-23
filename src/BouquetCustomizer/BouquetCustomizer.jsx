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
 * Chloris is a client-side, rule-based assistant.
 *
 * DESIGN PRINCIPLES
 * 1. Classify the client's intent before answering.
 * 2. Keep factual answers inside the requested topic.
 * 3. Allow multiple sections only when the client explicitly asks
 *    about multiple topics in the same message.
 * 4. Recommendations may combine occasion, recipient, style, color,
 *    flower, wrapper, size, and budget when those details are relevant.
 * 5. Store-specific facts come only from BloomBox data available in
 *    this component. General knowledge is clearly labeled as general.
 * 6. Never invent stock, delivery fees, discounts, wrapper colors,
 *    policies, or products that are not present in the project data.
 */

const AI_FLOWER_DATA = {
  rose: {
    name: "Rose",
    price: 80,
    color: "pink",
    styles: ["romantic", "soft", "elegant"],
    occasions: ["birthday", "anniversary", "valentine", "wedding"],
    meanings: ["love", "romance", "affection"],
  },
  tulip: {
    name: "Tulip",
    price: 70,
    color: "orange",
    styles: ["cheerful", "soft", "elegant"],
    occasions: ["birthday", "congratulations", "just_because"],
    meanings: ["affection", "cheerful love", "fresh beginnings"],
  },
  sunflower: {
    name: "Sunflower",
    price: 70,
    color: "yellow",
    styles: ["cheerful", "bright"],
    occasions: ["birthday", "congratulations", "just_because"],
    meanings: ["happiness", "warmth", "positivity"],
  },
  lily: {
    name: "Lily",
    price: 80,
    color: "blush/cream",
    styles: ["elegant", "refined"],
    occasions: ["congratulations", "wedding", "just_because"],
    meanings: ["purity", "elegance", "renewal"],
  },
  daisy: {
    name: "Daisy",
    price: 60,
    color: "white/cream",
    styles: ["cheerful", "soft", "playful"],
    occasions: ["birthday", "congratulations", "just_because"],
    meanings: ["innocence", "cheerfulness", "friendship"],
  },
  orchid: {
    name: "Orchid",
    price: 90,
    color: "purple",
    styles: ["elegant", "refined"],
    occasions: ["anniversary", "wedding", "congratulations", "just_because"],
    meanings: ["admiration", "elegance", "refinement"],
  },
  carnation: {
    name: "Carnation",
    price: 60,
    color: "pink",
    styles: ["soft", "cheerful"],
    occasions: ["birthday", "congratulations", "just_because"],
    meanings: ["affection", "admiration", "gratitude"],
  },
  peony: {
    name: "Peony",
    price: 90,
    color: "blush pink",
    styles: ["romantic", "soft", "elegant"],
    occasions: ["romantic", "anniversary", "valentine", "wedding"],
    meanings: ["romance", "prosperity", "good fortune"],
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
  sympathy: {
    label: "sympathy or condolence",
    styles: ["elegant", "soft"],
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
    styles: ["soft", "romantic", "elegant"],
    occasions: ["birthday", "anniversary", "valentine", "wedding"],
  },
  sunshine: {
    name: "Golden Sunshine",
    price: 490,
    description: "Bright sunflowers with cheerful yellow blooms.",
    colors: ["yellow", "orange", "green"],
    styles: ["cheerful"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
  wildflower: {
    name: "Wildflower Meadow",
    price: 670,
    description: "A loose, colorful mix inspired by the countryside.",
    colors: ["purple", "pink", "yellow"],
    styles: ["cheerful", "soft"],
    occasions: ["birthday", "congratulations", "just_because"],
  },
};

const AI_EXTRAS = {
  card: { name: "Greeting Card", price: 50 },
  plush: { name: "Mini Stuff Toy", price: 120 },
};

const AI_COLORS = [
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
  "cream",
  "blush",
];

const AI_UNAVAILABLE_RESPONSE =
  "I don't have enough reliable information to answer that accurately. 🌷 " +
  "I can help with BloomBox flowers, prices, colors, wrappers, sizes, templates, " +
  "your current bouquet, recommendations, and general flower information.";

const AI_STORE_UNAVAILABLE_RESPONSE =
  "I don't have that information in the BloomBox data available to me right now, " +
  "so I don't want to guess.";

function normalizeAIInput(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/₱/g, " php ")
    .replace(/[^a-z0-9\s-]/g, " ")
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

function aiFindFlowers(message) {
  return Object.keys(AI_FLOWER_DATA).filter((key) =>
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
    birthday: ["birthday", "birthdays", "bday", "birth day"],
    anniversary: ["anniversary", "anniv"],
    valentine: ["valentine", "valentines", "valentines day"],
    wedding: ["wedding", "marriage"],
    congratulations: [
      "congratulations",
      "congrats",
      "graduation",
      "graduate",
      "graduating",
    ],
    sympathy: [
      "sympathy",
      "condolence",
      "condolences",
      "funeral",
      "funerals",
      "mourning",
    ],
    just_because: [
      "just because",
      "no occasion",
      "nothing special",
      "for myself",
      "no special occasion",
    ],
  };

  return Object.keys(aliases).find((key) => aiHasAny(message, aliases[key]));
}

function aiFindStyle(message) {
  const aliases = {
    romantic: ["romantic", "romance", "love", "loving"],
    soft: ["soft", "delicate", "gentle"],
    elegant: ["elegant", "classy", "refined"],
    cheerful: ["cheerful", "bright", "colorful", "playful", "happy"],
  };

  return Object.keys(aliases).find((key) => aiHasAny(message, aliases[key]));
}

function aiFindColor(message) {
  return AI_COLORS.find((color) => aiHasAny(message, [color])) || null;
}

function aiFindSize(message) {
  if (aiHasAny(message, ["small", "small size"])) return "Small";
  if (aiHasAny(message, ["medium", "medium size"])) return "Medium";
  if (aiHasAny(message, ["large", "large size", "big"])) return "Large";
  return null;
}

function aiFindRecipient(message) {
  const recipients = [
    ["girlfriend", ["girlfriend", "girl friend", "gf"]],
    ["boyfriend", ["boyfriend", "boy friend", "bf"]],
    ["wife", ["wife", "my wife"]],
    ["husband", ["husband", "my husband"]],
    ["mother", ["mother", "mom", "mama", "nanay"]],
    ["father", ["father", "dad", "daddy", "tatay"]],
    ["friend", ["friend", "best friend", "bestie", "bff"]],
    ["sister", ["sister", "ate", "sis"]],
    ["brother", ["brother", "kuya", "bro"]],
    ["teacher", ["teacher", "professor", "sir", "maam", "mam"]],
    ["myself", ["myself", "me", "for me"]],
  ];

  const match = recipients.find(([, aliases]) => aiHasAny(message, aliases));
  return match ? match[0] : null;
}

function aiFindBudget(message) {
  const match = message.match(
    /(?:php|p)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:php|pesos)/i,
  );

  if (!match) return null;

  const amount = Number(match[1] || match[2]);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function aiIsRecommendationRequest(message) {
  return aiHasAny(message, [
    "recommend",
    "recommendation",
    "suggest",
    "suggestion",
    "what should i choose",
    "what should i get",
    "help me choose",
    "which should i choose",
    "which one should i get",
    "what bouquet should i",
    "what flower should i",
    "best bouquet",
    "best flower",
    "good bouquet",
    "good flower",
  ]);
}

function aiIsGreeting(message) {
  return aiHasAny(message, [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
  ]);
}

function aiIsThanks(message) {
  return aiHasAny(message, ["thank you", "thanks", "thank u"]);
}

function aiGetTopStyles(occasion, explicitStyle) {
  const scores = {};

  Object.keys(AI_PROFILES).forEach((style) => {
    scores[style] = 0;
  });

  if (occasion && AI_OCCASIONS[occasion]) {
    AI_OCCASIONS[occasion].styles.forEach((style, index) => {
      scores[style] += Math.max(1, 5 - index);
    });
  }

  if (explicitStyle && scores[explicitStyle] !== undefined) {
    scores[explicitStyle] += 8;
  }

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([style]) => style);
}

function aiGetFlowerRecommendation({
  occasion,
  style,
  color,
  preferredFlower,
}) {
  const scores = Object.keys(AI_FLOWER_DATA).map((key) => {
    const flower = AI_FLOWER_DATA[key];
    let score = 0;

    if (style && flower.styles.includes(style)) score += 6;
    if (occasion && flower.occasions.includes(occasion)) score += 5;

    if (
      color &&
      normalizeAIInput(flower.color).includes(normalizeAIInput(color))
    ) {
      score += 7;
    }

    if (preferredFlower === key) score += 12;

    return { key, score };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => AI_FLOWER_DATA[item.key].name);
}

function aiGetTemplateRecommendation({ occasion, style, color, budget }) {
  const scored = Object.keys(AI_TEMPLATES).map((key) => {
    const template = AI_TEMPLATES[key];
    let score = 0;

    if (occasion && template.occasions.includes(occasion)) score += 5;
    if (style && template.styles.includes(style)) score += 5;
    if (
      color &&
      template.colors.some((item) =>
        normalizeAIInput(item).includes(normalizeAIInput(color)),
      )
    ) {
      score += 4;
    }

    if (budget) {
      if (template.price <= budget) score += 3;
      else score -= 4;
    }

    return { key, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => AI_TEMPLATES[item.key]);
}

function aiGetWrapperRecommendation(style) {
  if (!style) return null;

  const matches = Object.values(AI_WRAPPERS)
    .map((wrapper) => ({
      wrapper,
      score: wrapper.styles.includes(style) ? 5 : 0,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches[0]?.wrapper || null;
}

function aiGetRecommendation({
  occasion,
  recipient,
  style,
  color,
  budget,
  preferredFlower,
}) {
  const styles = aiGetTopStyles(occasion, style);
  const chosenStyle = style || styles[0] || null;

  const flowers = aiGetFlowerRecommendation({
    occasion,
    style: chosenStyle,
    color,
    preferredFlower,
  });

  const templatesForContext = aiGetTemplateRecommendation({
    occasion,
    style: chosenStyle,
    color,
    budget,
  });

  const wrapper = aiGetWrapperRecommendation(chosenStyle);

  return {
    occasion,
    recipient,
    style: chosenStyle,
    color,
    budget,
    flowers,
    templates: templatesForContext,
    wrapper,
  };
}

function aiGetCurrentBouquetData({
  template,
  selectedPaperSize,
  selectedPaper,
  bouquetItems,
  greetingCard,
  plushToy,
}) {
  const flowers = bouquetItems.map((item) => ({
    name: item.name,
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
  }));

  return {
    template: template?.name || "Unknown template",
    templatePrice: template?.price || 0,
    paperSize: selectedPaperSize,
    wrapper: selectedPaper,
    flowers,
    greetingCard: Boolean(greetingCard),
    plushToy: Boolean(plushToy),
  };
}

function aiFormatFlowerList() {
  return flowerOptions
    .map((flower) => `• ${flower.name} — ₱${flower.price} each`)
    .join("\n");
}

function aiFormatWrapperList() {
  return bouquetWrappers
    .map((wrapper) => `• ${wrapper.name} — +₱${wrapper.price}`)
    .join("\n");
}

function aiFormatTemplateList() {
  return templates
    .map((item) => `• ${item.name} — ₱${item.price}`)
    .join("\n");
}

function aiFormatSizeList() {
  return paperSizes
    .map((size) =>
      size.price === 0
        ? `• ${size.name} — Included`
        : `• ${size.name} — +₱${size.price}`,
    )
    .join("\n");
}

function aiFormatColorList() {
  return Object.values(AI_FLOWER_DATA)
    .map((flower) => `• ${flower.name} — ${flower.color}`)
    .join("\n");
}

function aiGetTopicFlags(message) {
  const flowerKey = aiFindFlower(message);
  const flowerKeys = aiFindFlowers(message);
  const wrapperKey = aiFindWrapper(message);
  const templateKey = aiFindTemplate(message);
  const occasionKey = aiFindOccasion(message);
  const styleKey = aiFindStyle(message);
  const colorKey = aiFindColor(message);
  const sizeKey = aiFindSize(message);

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
      "do you have flowers",
      "do you have roses",
    ]) ||
    (aiHasAny(message, ["list"]) &&
      aiHasAny(message, ["flower", "flowers", "bloom", "blooms"]));

  const asksFlowerPrice =
    Boolean(flowerKey) &&
    aiHasAny(message, ["price", "cost", "how much", "per flower", "each"]);

  const asksFlowerColor =
    Boolean(flowerKey) &&
    aiHasAny(message, ["flower color", "flower colour", "what color", "what colour"]);

  const asksFlowerMeaning =
    Boolean(flowerKey) &&
    aiHasAny(message, [
      "meaning",
      "meanings",
      "symbolize",
      "symbolise",
      "represent",
      "what does",
      "what do",
      "signify",
    ]);

  const asksFlowerCare = aiHasAny(message, [
    "flower care",
    "care for flowers",
    "keep fresh",
    "keep them fresh",
    "preserve flowers",
    "how do i care",
  ]);

  const asksWrapperList = aiHasAny(message, [
    "wrappers",
    "wrapper options",
    "what wrappers",
    "what wrapper",
    "wrapping options",
    "what wrapping",
    "bouquet wrapper",
    "wrapper choices",
    "wrapping paper",
    "tissue paper",
    "kraft paper",
    "cellophane",
  ]);

  const asksWrapperPrice =
    Boolean(wrapperKey) &&
    aiHasAny(message, ["price", "cost", "how much"]);

  const asksWrapperColor =
    aiHasAny(message, [
      "wrapper color",
      "wrapper colour",
      "wrapper colors",
      "wrapper colours",
      "wrapping color",
      "wrapping colour",
      "what color is the wrapper",
      "what colours are the wrappers",
    ]);

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

  const asksSize =
    aiHasAny(message, [
      "paper size",
      "paper sizes",
      "size options",
      "what sizes",
      "sizes do you have",
      "size do you have",
      "paper size options",
      "bouquet size",
      "bouquet sizes",
    ]) ||
    (Boolean(sizeKey) && aiHasAny(message, ["size", "paper"]));

  const asksColors =
    aiHasAny(message, [
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
    ]) && !asksFlowerColor && !asksWrapperColor;

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

  const asksTotal = aiHasAny(message, [
    "my total",
    "total price",
    "current total",
    "how much is my bouquet",
    "how much will this cost",
    "total cost",
    "total amount",
  ]);

  const asksOrdering = aiHasAny(message, [
    "how do i order",
    "how to order",
    "how can i order",
    "ordering information",
    "place an order",
    "place order",
    "add to cart",
  ]);

  const asksDelivery = aiHasAny(message, [
    "delivery",
    "deliver",
    "shipping",
    "shipping fee",
    "delivery fee",
    "delivery time",
  ]);

  const asksAvailability = aiHasAny(message, [
    "available",
    "availability",
    "in stock",
    "stock",
    "do you have",
  ]);

  const asksRecommendation = aiIsRecommendationRequest(message);

  const asksColorCustomization =
    Boolean(flowerKey) &&
    aiHasAny(message, [
      "change color",
      "change colour",
      "make it",
      "make the",
      "can i get",
      "can i have",
      "available in",
    ]) &&
    Boolean(colorKey);

  const isGeneralDifference =
    aiHasAny(message, ["difference between", "difference of", "compare"]) &&
    flowerKeys.length >= 2;

  const isGeneralColorMeaning =
    !flowerKey &&
    !wrapperKey &&
    aiHasAny(message, [
      "color meaning",
      "colour meaning",
      "what does the color",
      "what does the colour",
      "what does blue symbolize",
      "what does red symbolize",
      "what does pink symbolize",
    ]);

  const asksSympathyGeneral =
    !flowerKey &&
    aiHasAny(message, [
      "funeral flowers",
      "sympathy flowers",
      "condolence flowers",
      "flowers for a funeral",
      "flowers for condolences",
    ]);

  return {
    flowerKey,
    flowerKeys,
    wrapperKey,
    templateKey,
    occasionKey,
    styleKey,
    colorKey,
    sizeKey,
    asksFlowerList,
    asksFlowerPrice,
    asksFlowerColor,
    asksFlowerMeaning,
    asksFlowerCare,
    asksWrapperList,
    asksWrapperPrice,
    asksWrapperColor,
    asksTemplateList,
    asksTemplatePrice,
    asksSize,
    asksColors,
    asksExtras,
    asksCurrentBouquet,
    asksTotal,
    asksOrdering,
    asksDelivery,
    asksAvailability,
    asksRecommendation,
    asksColorCustomization,
    isGeneralDifference,
    isGeneralColorMeaning,
    asksSympathyGeneral,
  };
}

/*
 * Convert a short follow-up such as "birthday", "something pink", or
 * "for my girlfriend" into usable recommendation context.
 *
 * This is intentionally conservative: context is reused only when the
 * previous conversation was already about recommendations.
 */
function aiApplyContextFollowUp(message, context) {
  const next = { ...context };

  if (context.topic !== "recommendation" && context.topic !== "recommendation_setup") {
    return next;
  }

  const occasion = aiFindOccasion(message);
  const style = aiFindStyle(message);
  const color = aiFindColor(message);
  const recipient = aiFindRecipient(message);
  const budget = aiFindBudget(message);
  const flowerKey = aiFindFlower(message);

  if (occasion) next.occasion = occasion;
  if (style) next.style = style;
  if (color) next.color = color;
  if (recipient) next.recipient = recipient;
  if (budget) next.budget = budget;
  if (flowerKey) next.preferredFlower = flowerKey;

  return next;
}

function aiBuildRecommendationResponse(recommendation) {
  const lines = ["✨ Here’s a focused BloomBox recommendation:"];

  if (recommendation.occasion) {
    lines.push(
      `Occasion: ${AI_OCCASIONS[recommendation.occasion]?.label || recommendation.occasion}`,
    );
  }

  if (recommendation.recipient) {
    lines.push(`For: ${recommendation.recipient}`);
  }

  if (recommendation.style) {
    lines.push(
      `Style: ${AI_PROFILES[recommendation.style]?.label || recommendation.style}`,
    );
  }

  if (recommendation.color) {
    lines.push(`Preferred color: ${recommendation.color}`);
  }

  if (recommendation.budget) {
    lines.push(`Budget reference: ₱${recommendation.budget.toLocaleString()}`);
  }

  if (recommendation.flowers.length) {
    lines.push(`Flowers: ${recommendation.flowers.join(", ")}`);
  }

  if (recommendation.templates.length) {
    const templateLines = recommendation.templates
      .map((item) => `${item.name} — ₱${item.price}`)
      .join("; ");
    lines.push(`Template options: ${templateLines}`);
  }

  if (recommendation.wrapper) {
    lines.push(`Wrapper: ${recommendation.wrapper.name} — +₱${recommendation.wrapper.price}`);
  }

  lines.push(
    "These suggestions use only the BloomBox options and flower information currently available.",
  );

  return lines.join("\n");
}

function aiGetGeneralFlowerMeaning(flowerKey) {
  const flower = AI_FLOWER_DATA[flowerKey];

  if (!flower) return null;

  return (
    `Generally, ${flower.name.toLowerCase()}s are commonly associated with ` +
    `${flower.meanings.join(", ")}. These are general flower meanings, not a BloomBox store policy.`
  );
}

function aiGetGeneralColorMeaning(color) {
  const meanings = {
    red: "love, passion, and strong emotion",
    pink: "affection, tenderness, and appreciation",
    blue: "calmness, trust, and serenity",
    yellow: "happiness, friendship, and positivity",
    white: "purity, peace, and remembrance",
    purple: "admiration, elegance, and mystery",
    orange: "energy, enthusiasm, and warmth",
    green: "growth, freshness, and renewal",
    black: "formality, mystery, and sophistication",
    brown: "warmth, stability, and earthiness",
    cream: "warmth, softness, and understated elegance",
    blush: "gentleness, affection, and softness",
  };

  return meanings[color]
    ? `Generally, ${color} is commonly associated with ${meanings[color]}. This is general flower/color symbolism, not a BloomBox store policy.`
    : null;
}

function aiGetFlowerDifference(flowerKeys) {
  if (flowerKeys.length < 2) return null;

  const first = AI_FLOWER_DATA[flowerKeys[0]];
  const second = AI_FLOWER_DATA[flowerKeys[1]];

  return (
    `Generally, ${first.name}s are associated with ${first.meanings[0]} and ${first.styles[0]} styles, ` +
    `while ${second.name}s are associated with ${second.meanings[0]} and ${second.styles[0]} styles. ` +
    `For BloomBox, ${first.name} is ₱${first.price} each and ${second.name} is ₱${second.price} each.`
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

  const [chatContext, setChatContext] = useState({
    topic: null,
    style: null,
    occasion: null,
    recipient: null,
    color: null,
    budget: null,
    preferredFlower: null,
    flower: null,
    wrapper: null,
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! 🌷 I’m Chloris 1.0. Tell me what you need help with, and I’ll keep my answer focused on your question.",
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

    let context = aiApplyContextFollowUp(message, chatContext);
    let response = "";

    const flags = aiGetTopicFlags(message);

    /*
     * ---------------------------------------------------------------
     * INTENT ROUTER
     * ---------------------------------------------------------------
     * Specific factual intents are checked before broad product intents.
     * Multiple sections are produced only when the message clearly asks
     * for more than one topic.
     */

    if (aiIsGreeting(message) && message.split(" ").length <= 5) {
      response =
        "Hi! 🌷 I can help with BloomBox flowers, prices, colors, wrappers, " +
        "sizes, templates, your current bouquet, and personalized recommendations.";
      context.topic = "welcome";
    }

    else if (aiIsThanks(message)) {
      response = "You’re welcome! 🌷";
      context.topic = "thanks";
    }

    /*
     * Explicit recommendation request.
     * This is allowed to combine relevant context because the client
     * is specifically asking Chloris to choose something.
     */
    else if (flags.asksRecommendation) {
      const detectedRecipient =
        aiFindRecipient(message) || context.recipient || null;
      const detectedOccasion =
        flags.occasionKey || context.occasion || null;
      const detectedStyle =
        flags.styleKey || context.style || null;
      const detectedColor =
        flags.colorKey || context.color || null;
      const detectedBudget =
        aiFindBudget(message) || context.budget || null;
      const preferredFlower =
        flags.flowerKey || context.preferredFlower || null;

      const recommendation = aiGetRecommendation({
        occasion: detectedOccasion,
        recipient: detectedRecipient,
        style: detectedStyle,
        color: detectedColor,
        budget: detectedBudget,
        preferredFlower,
      });

      /*
       * If the user gave a recipient/occasion but no actual recommendation
       * request details, the context is still retained for the next turn.
       */
      context = {
        ...context,
        topic: "recommendation",
        occasion: recommendation.occasion,
        recipient: recommendation.recipient,
        style: recommendation.style,
        color: recommendation.color,
        budget: recommendation.budget,
        preferredFlower,
      };

      response = aiBuildRecommendationResponse(recommendation);
    }

    /*
     * Contextual follow-up after a recommendation:
     * "birthday", "something pink", "for my girlfriend", "₱700", etc.
     */
    else if (
      (chatContext.topic === "recommendation" ||
        chatContext.topic === "recommendation_setup") &&
      (flags.occasionKey ||
        flags.styleKey ||
        flags.colorKey ||
        aiFindRecipient(message) ||
        aiFindBudget(message) ||
        flags.flowerKey) &&
      !flags.asksFlowerPrice &&
      !flags.asksFlowerColor &&
      !flags.asksFlowerMeaning &&
      !flags.asksWrapperPrice &&
      !flags.asksWrapperColor
    ) {
      const recommendation = aiGetRecommendation({
        occasion: flags.occasionKey || context.occasion || null,
        recipient: aiFindRecipient(message) || context.recipient || null,
        style: flags.styleKey || context.style || null,
        color: flags.colorKey || context.color || null,
        budget: aiFindBudget(message) || context.budget || null,
        preferredFlower:
          flags.flowerKey || context.preferredFlower || null,
      });

      context = {
        ...context,
        topic: "recommendation",
        occasion: recommendation.occasion,
        recipient: recommendation.recipient,
        style: recommendation.style,
        color: recommendation.color,
        budget: recommendation.budget,
        preferredFlower:
          flags.flowerKey || context.preferredFlower || null,
      };

      response =
        "Got it! 🌷 I updated the recommendation with your new detail.\n\n" +
        aiBuildRecommendationResponse(recommendation);
    }

    /*
     * Explicitly requested multiple topics.
     * Each section stays separate so information is not mixed together.
     */
    else {
      const sections = [];

      if (flags.asksFlowerList) {
        sections.push(`🌷 Flowers\n${aiFormatFlowerList()}`);
        context.topic = "flowers";
      }

      if (flags.asksFlowerPrice && flags.flowerKeys.length) {
        const priceLines = flags.flowerKeys.map((key) => {
          const flower = AI_FLOWER_DATA[key];
          return `• ${flower.name} — ₱${flower.price} each`;
        });

        sections.push(`💰 Flower Prices\n${priceLines.join("\n")}`);
        context.topic = "flower_price";
      }

      if (flags.asksFlowerColor && flags.flowerKeys.length) {
        const colorLines = flags.flowerKeys.map((key) => {
          const flower = AI_FLOWER_DATA[key];
          return `• ${flower.name} — ${flower.color}`;
        });

        sections.push(
          `🎨 Flower Colors\n${colorLines.join(
            "\n",
          )}\n\nBloomBox does not currently have a separate flower-color selector.`,
        );
        context.topic = "flower_color";
      }

      if (flags.asksColorCustomization && flags.flowerKey) {
        const flower = AI_FLOWER_DATA[flags.flowerKey];

        sections.push(
          `🎨 Flower Color Customization\n` +
            `Custom color selection is not available right now. ` +
            `${flower.name} is currently shown in ${flower.color}.`,
        );
        context.topic = "flower_color";
      }

      if (flags.asksFlowerMeaning && flags.flowerKeys.length) {
        const meaningLines = flags.flowerKeys.map((key) =>
          aiGetGeneralFlowerMeaning(key),
        );

        sections.push(`🌸 Flower Meanings\n${meaningLines.join("\n")}`);
        context.topic = "flower_meaning";
      }

      if (flags.isGeneralDifference) {
        sections.push(
          `🌸 General Comparison\n${aiGetFlowerDifference(flags.flowerKeys)}`,
        );
        context.topic = "general_flower";
      }

      if (
        !flags.asksFlowerList &&
        !flags.asksFlowerPrice &&
        !flags.asksFlowerColor &&
        !flags.asksFlowerMeaning &&
        !flags.isGeneralDifference &&
        flags.flowerKey &&
        !flags.asksAvailability
      ) {
        const flower = AI_FLOWER_DATA[flags.flowerKey];

        sections.push(
          `🌷 ${flower.name}\n` +
            `Available in BloomBox for ₱${flower.price} each. ` +
            `Its current displayed color is ${flower.color}.`,
        );

        context.topic = "flower";
        context.flower = flags.flowerKey;
      }

      if (flags.asksFlowerCare) {
        sections.push(
          "🌿 Flower Care\n" +
            "Keep fresh flowers away from direct sunlight and excessive heat. " +
            "Keep them hydrated and avoid letting the stems dry out.",
        );
        context.topic = "care";
      }

      if (flags.asksWrapperColor) {
        sections.push(
          "🎀 Wrapper Colors / Designs\n" +
            "The current BloomBox data lists wrapper types and prices, but it does not " +
            "provide separate wrapper color or design options. I don't want to invent them.",
        );
        context.topic = "wrapper_color";
      }

      if (
        flags.asksWrapperList &&
        !flags.asksWrapperColor
      ) {
        if (flags.wrapperKey) {
          const wrapper = AI_WRAPPERS[flags.wrapperKey];

          if (flags.asksWrapperPrice) {
            sections.push(
              `🎀 ${wrapper.name}\n+₱${wrapper.price}`,
            );
          } else {
            sections.push(
              `🎀 ${wrapper.name}\n+₱${wrapper.price}`,
            );
          }

          context.wrapper = flags.wrapperKey;
        } else {
          sections.push(`🎀 Wrappers\n${aiFormatWrapperList()}`);
        }

        context.topic = "wrapper";
      }

      if (flags.asksTemplateList || flags.templateKey) {
        if (flags.templateKey) {
          const templateInfo = AI_TEMPLATES[flags.templateKey];

          sections.push(
            `🌸 ${templateInfo.name}\n` +
              `₱${templateInfo.price}\n` +
              templateInfo.description,
          );
        } else {
          sections.push(`🌸 Templates\n${aiFormatTemplateList()}`);
        }

        context.topic = "templates";
      }

      if (flags.asksTemplatePrice && flags.templateKey) {
        /*
         * The template section above already contains the exact price,
         * so no duplicate section is added.
         */
        context.topic = "template_price";
      }

      if (flags.asksSize) {
        sections.push(`📏 Bouquet Paper Sizes\n${aiFormatSizeList()}`);
        context.topic = "paper_size";
      }

      if (flags.asksColors) {
        sections.push(
          `🎨 Current Flower Colors\n${aiFormatColorList()}\n\n` +
            "These are the colors currently shown for BloomBox flowers.",
        );
        context.topic = "colors";
      }

      if (flags.asksExtras) {
        sections.push(
          "🎁 Extras\n" +
            `• ${AI_EXTRAS.card.name} — ₱${AI_EXTRAS.card.price}\n` +
            `• ${AI_EXTRAS.plush.name} — ₱${AI_EXTRAS.plush.price}`,
        );
        context.topic = "extras";
      }

      if (flags.asksCurrentBouquet) {
        const current = aiGetCurrentBouquetData({
          template,
          selectedPaperSize,
          selectedPaper,
          bouquetItems,
          greetingCard,
          plushToy,
        });

        const flowerText = current.flowers.length
          ? current.flowers
              .map(
                (flower) =>
                  `${flower.name} × ${flower.quantity}`,
              )
              .join(", ")
          : "No additional flowers";

        sections.push(
          "💐 Current Bouquet\n" +
            `Template: ${current.template}\n` +
            `Paper size: ${current.paperSize}\n` +
            `Wrapper: ${current.wrapper}\n` +
            `Flowers: ${flowerText}\n` +
            `Extras: ${
              current.greetingCard || current.plushToy
                ? [
                    current.greetingCard ? "Greeting Card" : null,
                    current.plushToy ? "Mini Stuff Toy" : null,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "None"
            }`,
        );

        context.topic = "current_bouquet";
      }

      if (flags.asksTotal) {
        sections.push(
          `💰 Current Bouquet Total\n₱${total.toLocaleString()}`,
        );
        context.topic = "total";
      }

      if (flags.asksOrdering) {
        sections.push(
          "🛒 Ordering\n" +
            "Customize your bouquet, then select Add to Cart. " +
            "The current system sends the saved customization to the Shopping Cart.",
        );
        context.topic = "ordering";
      }

      if (flags.asksDelivery) {
        sections.push(
          "🚚 Delivery\n" +
            "I don't have delivery areas, delivery fees, or delivery schedules in the " +
            "BloomBox data available to me, so I don't want to guess.",
        );
        context.topic = "delivery";
      }

      if (flags.asksAvailability) {
        if (flags.flowerKeys.length) {
          sections.push(
            "📦 Flower Availability\n" +
              flags.flowerKeys
                .map(
                  (key) =>
                    `• ${AI_FLOWER_DATA[key].name} is listed as an available BloomBox option.`,
                )
                .join("\n") +
              "\n\nThis does not confirm real-time stock.",
          );
          context.topic = "availability";
        } else if (flags.wrapperKey) {
          sections.push(
            "📦 Wrapper Availability\n" +
              `• ${AI_WRAPPERS[flags.wrapperKey].name} is listed as a BloomBox wrapper option.\n\n` +
              "This does not confirm real-time stock.",
          );
          context.topic = "availability";
        } else {
          sections.push(
            "📦 Availability\n" +
              "I can confirm what products are listed in the current BloomBox data, " +
              "but I do not have a real-time inventory count.",
          );
          context.topic = "availability";
        }
      }

      /*
       * General knowledge is deliberately separated from store data.
       */
      if (flags.isGeneralColorMeaning && flags.colorKey) {
        const colorMeaning = aiGetGeneralColorMeaning(flags.colorKey);

        sections.push(
          `🌈 General Color Meaning\n${colorMeaning || "I don't have a reliable general meaning for that color."}`,
        );
        context.topic = "general_color";
      }

      if (flags.asksSympathyGeneral) {
        sections.push(
          "🌿 General Sympathy Flower Information\n" +
            "Common sympathy choices include lilies, carnations, roses, and chrysanthemums. " +
            "This is general floral knowledge; it does not mean those flowers are specifically " +
            "available from BloomBox unless they appear in the store's listed options.",
        );
        context.topic = "general_sympathy";
      }

      /*
       * Short, contextual recommendation setup:
       * "I want something for my girlfriend."
       * It does not force a full recommendation yet; it asks only for
       * the missing detail that will materially improve the recommendation.
       */
      if (
        !sections.length &&
        (flags.occasionKey ||
          aiFindRecipient(message) ||
          flags.styleKey ||
          flags.colorKey ||
          aiFindBudget(message))
      ) {
        context.topic = "recommendation_setup";
        context.occasion = flags.occasionKey || context.occasion;
        context.recipient = aiFindRecipient(message) || context.recipient;
        context.style = flags.styleKey || context.style;
        context.color = flags.colorKey || context.color;
        context.budget = aiFindBudget(message) || context.budget;

        response =
          "Sure! 🌷 I can help build a bouquet around that. " +
          "What occasion is it, and do you have a preferred budget?";
      }

      /*
       * If there are multiple requested sections, preserve their separation.
       */
      if (!response && sections.length) {
        response = sections.join("\n\n");
      }

      /*
       * General flower/color questions outside the store scope.
       */
      if (!response && flags.flowerKeys.length && !flags.asksRecommendation) {
        response =
          aiGetFlowerDifference(flags.flowerKeys) ||
          aiGetGeneralFlowerMeaning(flags.flowerKeys[0]) ||
          AI_UNAVAILABLE_RESPONSE;
        context.topic = "general_flower";
      }

      /*
       * If the user mentions a color without asking about a store product,
       * provide general information instead of pretending it is store data.
       */
      if (!response && flags.colorKey) {
        response =
          aiGetGeneralColorMeaning(flags.colorKey) ||
          AI_UNAVAILABLE_RESPONSE;
        context.topic = "general_color";
      }

      if (!response) {
        response = AI_UNAVAILABLE_RESPONSE;
        context.topic = "unknown";
      }
    }

    setChatContext(context);
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

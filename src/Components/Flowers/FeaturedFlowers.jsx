import { useState } from "react";
import "./FeaturedFlowers.css";

const flowers = [
  {
    id: 1,
    name: "Rose",
    description: "A timeless flower perfect for expressing love and appreciation.",
    category: "Anniversary",
  },
  {
    id: 2,
    name: "Tulip",
    description: "A cheerful and elegant bloom that brings warmth to every bouquet.",
    category: "Birthdays",
  },
  {
    id: 3,
    name: "Sunflower",
    description: "A bright and joyful flower that adds energy to every celebration.",
    category: "Grand Celebrations",
  },
  {
    id: 4,
    name: "Lily",
    description: "A graceful bloom that brings a sophisticated touch to any arrangement.",
    category: "Wedding",
  },
  {
    id: 5,
    name: "Daisy",
    description: "A simple and charming flower that brings a feeling of happiness.",
    category: "Birthdays",
  },
  {
    id: 6,
    name: "Orchid",
    description: "An elegant flower that creates a refined and memorable bouquet.",
    category: "Wedding",
  },
  {
    id: 7,
    name: "Carnation",
    description: "A beautiful long-lasting flower suited for meaningful occasions.",
    category: "Graduation",
  },
  {
    id: 8,
    name: "Peony",
    description: "A soft and romantic bloom that makes every bouquet feel special.",
    category: "Anniversary",
  },
];

const categories = [
  "All",
  "Birthdays",
  "Grand Celebrations",
  "Anniversary",
  "Wedding",
  "Graduation",
];

function FeaturedFlowers() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFlowers = flowers.filter((flower) => {
    const matchesSearch = flower.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      flower.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="featured-flowers">

      {/* HEADER */}
      <div className="featured-header">
        <p>Browse Flowers</p>
        <h2>Blooming Every Moment</h2>
      </div>

      {/* SEARCH + CATEGORY */}
      <div className="flower-controls">

        <div className="flower-search">
          <input
            type="text"
            placeholder="Search flowers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span>⌕</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

      </div>

      {/* FLOWER CARDS */}
      <div className="flower-grid">

        {filteredFlowers.map((flower) => (
          <div className="flower-card" key={flower.id}>

            <img
              alt={flower.name}
            />

            <div className="flower-card-body">

              <h3>{flower.name}</h3>

              <p>{flower.description}</p>

              <button>
                View Flower
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* NO RESULTS */}
      {filteredFlowers.length === 0 && (
        <p className="no-results">
          No flowers found.
        </p>
      )}

    </section>
  );
}

export default FeaturedFlowers;
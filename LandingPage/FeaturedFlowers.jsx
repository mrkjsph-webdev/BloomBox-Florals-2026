import { useState } from "react";
import "./FeaturedFlowers.css";

const flowers = [
  {
    id: 1,
    name: "Rose",
    description: "A timeless flower perfect for expressing love and appreciation.",
    category: "Anniversary",
    image:
      "https://cms.interiorcompany.com/wp-content/uploads/2024/01/lincoln-red-rose-bush-types.jpg",
  },
  {
    id: 2,
    name: "Tulip",
    description: "A cheerful and elegant bloom that brings warmth to every bouquet.",
    category: "Birthdays",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.ksz4la7Kq-Cg0oiJSS0MdQHaHA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 3,
    name: "Sunflower",
    description: "A bright and joyful flower that adds energy to every celebration.",
    category: "Grand Celebrations",
    image:
      "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Lily",
    description: "A graceful bloom that brings a sophisticated touch to any arrangement.",
    category: "Wedding",
    image:
      "https://www.thespruce.com/thmb/TlRZEo8_EOoaiSCXhGuZOkDkkAE=/3000x2000/filters:fill(auto,1)/Stargazer-lily-bloom-big-5a9f60fd43a1030037869efe.jpg",
  },
  {
    id: 5,
    name: "Daisy",
    description: "A simple and charming flower that brings a feeling of happiness.",
    category: "Birthdays",
    image:
      "https://cdn.pixabay.com/photo/2012/06/17/17/32/flower-50157_1280.jpg",
  },
  {
    id: 6,
    name: "Orchid",
    description: "An elegant flower that creates a refined and memorable bouquet.",
    category: "Wedding",
    image:
      "https://www.thespruce.com/thmb/jI1wd2IKAwN5wplPhRVikDIxpRU=/2122x1412/filters:no_upscale():max_bytes(150000):strip_icc()/CymbidiumOrchid-GettyImages-506065092-c5a8e2a0d48041ec8b91c6c245cb9461.jpg",
  },
  {
    id: 7,
    name: "Carnation",
    description: "A beautiful long-lasting flower suited for meaningful occasions.",
    category: "Graduation",
    image:
      "https://tse2.mm.bing.net/th/id/OIP.PNFuaSrHyUZW1KGMhVoW3QHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 8,
    name: "Peony",
    description: "A soft and romantic bloom that makes every bouquet feel special.",
    category: "Anniversary",
    image:
      "https://cdn.britannica.com/40/189540-050-1307654B/garden-peonies.jpg",
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
    <section className="featured-flowers" id="flowers">

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

            <img src={flower.image} alt={flower.name} />

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
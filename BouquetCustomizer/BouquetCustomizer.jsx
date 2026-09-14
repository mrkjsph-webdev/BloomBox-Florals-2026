import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./bouquet-customizer.css";

const templates = [
  { id: "blush", name: "Blush Garden", description: "Soft roses, carnations, and seasonal blooms.", price: 58, colors: ["#e7a5b5", "#f5d9c9", "#c56e85"] },
  { id: "sunshine", name: "Golden Sunshine", description: "Bright sunflowers with cheerful yellow blooms.", price: 49, colors: ["#f5c936", "#f28c38", "#83a85d"] },
  { id: "wildflower", name: "Wildflower Meadow", description: "A loose, colorful mix inspired by the countryside.", price: 67, colors: ["#9b83bb", "#e69caa", "#f4cf70"] },
];

const flowerOptions = [
  { id: "rose", name: "Rose", price: 8, color: "#d77991" },
  { id: "tulip", name: "Tulip", price: 7, color: "#ef9c63" },
  { id: "sunflower", name: "Sunflower", price: 7, color: "#f5c936" },
  { id: "lily", name: "Lily", price: 8, color: "#f5d9c9" },
  { id: "daisy", name: "Daisy", price: 6, color: "#f1eee7" },
  { id: "orchid", name: "Orchid", price: 9, color: "#9b83bb" },
  { id: "carnation", name: "Carnation", price: 6, color: "#e69caa" },
  { id: "peony", name: "Peony", price: 9, color: "#e7a5b5" },
];

function BouquetCustomizer() {
  const [templateId, setTemplateId] = useState("blush");
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [greetingCard, setGreetingCard] = useState(false);
  const [plushToy, setPlushToy] = useState(false);
  const [added, setAdded] = useState(false);
  const template = templates.find((item) => item.id === templateId);
  const total = useMemo(() => template.price + selectedFlowers.reduce((sum, id) => sum + flowerOptions.find((item) => item.id === id).price, 0) + (greetingCard ? 5 : 0) + (plushToy ? 12 : 0), [template, selectedFlowers, greetingCard, plushToy]);

  const toggleFlower = (id) => setSelectedFlowers((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main className="customizer-page">
      <header className="customizer-header"><Link to="/" className="customizer-brand">BloomBox <span>Florals</span></Link><Link to="/home" className="customizer-dashboard-link">Back to dashboard</Link></header>
      <section className="customizer-banner"><h1>Create Your Bouquet</h1><p><Link to="/home">Home</Link> / <strong>Bouquet Customizer</strong></p></section>
      <section className="customizer-layout">
        <div className="customizer-options">
          <section className="customizer-section"><p className="customizer-eyebrow">Step 1</p><h2>Choose a template</h2><div className="template-grid">{templates.map((item) => <button className={`template-card ${templateId === item.id ? "selected" : ""}`} type="button" key={item.id} onClick={() => setTemplateId(item.id)}><span className="template-art" style={{ "--template-one": item.colors[0], "--template-two": item.colors[1], "--template-three": item.colors[2] }} aria-hidden="true" /><strong>{item.name}</strong><span>{item.description}</span><b>${item.price}.00</b></button>)}</div></section>
          <section className="customizer-section"><p className="customizer-eyebrow">Step 2</p><h2>Add flowers</h2><div className="flower-grid">{flowerOptions.map((item) => <button className={`flower-option ${selectedFlowers.includes(item.id) ? "selected" : ""}`} type="button" key={item.id} onClick={() => toggleFlower(item.id)}><span className="flower-dot" style={{ background: item.color }} aria-hidden="true" /><span><strong>{item.name}</strong><small>+${item.price}.00</small></span><b>{selectedFlowers.includes(item.id) ? "Remove" : "Add"}</b></button>)}</div></section>
          <section className="customizer-section"><p className="customizer-eyebrow">Step 3</p><h2>Add something special</h2><div className="extras-grid"><label className={`extra-option ${greetingCard ? "selected" : ""}`}><input type="checkbox" checked={greetingCard} onChange={(event) => setGreetingCard(event.target.checked)} /><span><strong>Greeting card</strong><small>Include a handwritten message · +$5.00</small></span></label><label className={`extra-option ${plushToy ? "selected" : ""}`}><input type="checkbox" checked={plushToy} onChange={(event) => setPlushToy(event.target.checked)} /><span><strong>Mini stuff toy</strong><small>Add a cuddly little surprise · +$12.00</small></span></label></div></section>
        </div>
        <aside className="customizer-summary"><p className="customizer-eyebrow">Your design</p><div className="summary-art" style={{ "--template-one": template.colors[0], "--template-two": template.colors[1], "--template-three": template.colors[2] }} aria-label={`${template.name} color preview`} /><h2>{template.name}</h2><p>{template.description}</p><div className="summary-lines"><div><span>Base bouquet</span><strong>${template.price}.00</strong></div>{selectedFlowers.map((id) => { const item = flowerOptions.find((flower) => flower.id === id); return <div key={id}><span>{item.name}</span><strong>+${item.price}.00</strong></div>; })}{greetingCard && <div><span>Greeting card</span><strong>+$5.00</strong></div>}{plushToy && <div><span>Mini stuff toy</span><strong>+$12.00</strong></div>}</div><div className="summary-total"><span>Total</span><strong>${total}.00</strong></div><button className="add-cart-button" type="button" onClick={() => setAdded(true)}>{added ? "Added to cart" : "Add to cart"}</button>{added && <p className="cart-message" role="status">Your custom bouquet is ready for checkout.</p>}</aside>
      </section>
    </main>
  );
}

export default BouquetCustomizer;

      import React, { useEffect, useState } from "react";
      import { useNavigate } from 'react-router-dom';
      import './FlowerDetails.css';
      import Footer from './Footer';
      import Header from './Header';

      const mainImgPlaceholder =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600' fill='%23f5f0e8'><rect width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='28' fill='%23733646'>Image</text></svg>";

      const thumbImgPlaceholder =
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150' fill='%23eae3d2'><rect width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='14' fill='%23733646'>Thumb</text></svg>";

    export default function FlowerDetails() {
      const navigate = useNavigate();
      const [selectedImg, setSelectedImg] = useState(mainImgPlaceholder);
      const [quantity, setQuantity] = useState(1);
      const [selectedSize, setSelectedSize] = useState('Small');
      const [selectedMaterial, setSelectedMaterial] = useState('Ceramic');
      const [selectedColors, setSelectedColors] = useState([]);
      const [activeTab, setActiveTab] = useState('description');

      const [showChat, setShowChat] = useState(false);
      const [chatInput, setChatInput] = useState('');

      const [messages, setMessages] = useState([
        {
          sender: 'bot',
          text: 'Hello! I can help you choose the right plant, pot, or care routine.'
        }
      ]);

      const handleChat = () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();

        setMessages((prev) => [
          ...prev,
          { sender: 'user', text: userMessage }
        ]);

        let response =
          'The Flower is a great choice! It prefers indirect light and should be watered when the top soil feels dry.';

        const message = userMessage.toLowerCase();

        if (message.includes('light')) {
          response =
            'The Flower thrives in medium to low indirect light, making it perfect for indoor spaces.';
        } else if (message.includes('water')) {
          response =
            'Water your Flower when the top inch of soil feels dry. Avoid leaving it sitting in water.';
        } else if (message.includes('size')) {
          response =
            'For a desk or small room, I recommend the Small size. Medium is better for living rooms or offices.';
        } else if (message.includes('pot') || message.includes('material')) {
          response =
            'Ceramic pots are a great choice because they are stylish and provide good stability for indoor plants.';
        } else if (message.includes('care')) {
          response =
            'Keep your Flower in indirect light, water when the soil becomes dry, and wipe its leaves occasionally.';
        }

        setChatInput('');

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: response }
          ]);
        }, 500);
      };
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, []);

      const thumbnails = [
        mainImgPlaceholder,
        thumbImgPlaceholder,
        thumbImgPlaceholder,
        thumbImgPlaceholder
      ];
      const [selectedThumb, setSelectedThumb] = useState(0);

        return (
          <div className="bloombox-wrapper">
           <Header />
            <main className="container py-5">
              <div className="row g-5 align-items-start">
                <div className="col-lg-6">
                  <div className="main-image-wrapper mb-3 rounded-4 overflow-hidden shadow-sm">
                    <img
                      src={selectedImg}
                      alt="Flower"
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>

                  <div className="d-flex gap-3">
                  {thumbnails.map((img, idx) => (
      <button
        key={idx}
        onClick={() => {
          setSelectedImg(img);
          setSelectedThumb(idx);
        }}
        className={`thumb-btn rounded-3 p-0 ${
          selectedThumb === idx ? 'active-thumb' : ''
        }`}
      >
        <img
          src={img}
          alt=""
          className="w-100 h-100 object-fit-cover rounded-3"
        />
      </button>
    ))}
  </div>
  </div>



                <div className="col-lg-6">
                  <span className="text-uppercase text-muted fs-7 tracking-wide">
                    Bouquet
                  </span>

                  <h1 className="display-6 fw-serif my-1">
                    Flower  
                    <span className="stock-badge ms-2">In Stock</span>
                  </h1>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="text-warning">★★★★☆</span>
                    <span className="small text-muted">4.8 (120 reviews)</span>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="badge bg-danger px-2 py-1">50%</span>
                    <span className="fs-3 fw-bold">₱250.00</span>
                    <span className="text-decoration-line-through text-muted">
                      ₱500.00
                    </span>
                  </div>

                  <p className="text-secondary small leading-relaxed mb-4">
                    The Flower Is One Of The Most Popular sets for events, Loved
                    For Its Elegant Blooms And Glossy, Dark Green Leaves.
                  </p>

                  <div className="mb-3">
                    <label className="fw-semibold small d-block mb-2">
                      Plant Size
                    </label>

                    <div className="d-flex gap-2">
                      {['Small', 'Medium', 'Large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`btn btn-pill ${
                            selectedSize === size
                              ? 'btn-burgundy'
                              : 'btn-outline-custom'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="fw-semibold small d-block mb-2">
                      Pot Material
                    </label>

                    <div className="d-flex gap-2">
                      {['Ceramic', 'Plastic', 'Wood', 'Metal'].map((mat) => (
                        <button
                          key={mat}
                          onClick={() => setSelectedMaterial(mat)}
                          className={`btn btn-pill ${
                            selectedMaterial === mat
                              ? 'btn-burgundy'
                              : 'btn-outline-custom'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
      <label className="fw-semibold small d-block mb-2">
        Bouquet Colorways (Choose more than one)
      </label>

      <div className="d-flex gap-2">
        {[
          { name: 'Black', hex: '#000000' },
          { name: 'Green', hex: '#4caf50' },
          { name: 'Red', hex: '#f44336' },
          { name: 'Yellow', hex: '#ffc107' },
          { name: 'Blue', hex: '#0f156e' },
          { name: 'Pink', hex: '#f48fb1' },
        ].map((color) => (
          <button
            key={color.hex}
            onClick={() => {
              setSelectedColors((prev) =>
                prev.includes(color.hex)
                  ? prev.filter((c) => c !== color.hex)
                  : [...prev, color.hex]
              );
            }}
            className={`color-dot-btn ${
              selectedColors.includes(color.hex) ? 'selected' : ''
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
    </div>
                  <div>
                    <label className="fw-semibold small d-block mb-2">
                      Quantity
                    </label>

                    <div className="d-flex align-items-center gap-3">
                      <div className="qty-picker d-flex align-items-center gap-3 px-3 py-1 rounded-pill border">
                        <button
                          className="border-0 bg-transparent"
                          onClick={() =>
                            setQuantity(Math.max(1, quantity - 1))
                          }
                        >
                          -
                        </button>

                        <span className="fw-bold">{quantity}</span>

                        <button
                          className="border-0 bg-transparent"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button className="btn btn-success rounded-pill px-4" 
                          onClick={() => {
                          const product = {
                            id: Date.now(),
                            name: "Flower",
                            price: 250,
                            quantity: quantity,
                            image: selectedImg,
                            size: selectedSize,
                            material: selectedMaterial,
                            colors: selectedColors
                          };

                          const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                          const updatedCart = [...existingCart, product];

                          localStorage.setItem("cart", JSON.stringify(updatedCart));
                          navigate("/shopping-cart");
                        }}
  >
    Add to Cart
  </button>

                      <button className="btn btn-gold rounded-pill px-4">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <section className="ai-card my-5 p-4 rounded-4">
      <div className="d-flex gap-3 mb-3">
        <span className="fs-4">✨</span>

        <div>
          <h5 className="fw-serif m-0">Need Help Customizing?</h5>
          <p className="text-muted small m-0">
            Our AI assistant can recommend the best options for your arrangement.
          </p>
        </div>
      </div>

      {!showChat ? (
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-burgundy rounded-pill px-4">
            Apply Recommendation
          </button>

          <button
            className="btn btn-outline-custom rounded-pill px-4"
            onClick={() => setShowChat(true)}
          >
            Ask AI a Question About This Arrangement
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-2 mb-3">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat-bubble ${
            message.sender === 'user'
              ? 'user-bubble align-self-end'
              : 'bot-bubble align-self-start'
          }`}
        >
          {message.text}
        </div>
      ))}
    </div>

          <div className="input-group rounded-pill overflow-hidden border bg-white p-1">
            <input
      type="text"
      className="form-control border-0 ps-3 shadow-none"
      placeholder="Type your message here..."
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleChat();
      }}
    />

    <button
      className="btn btn-burgundy rounded-circle px-3"
      onClick={handleChat}
    >
      →
    </button>
          </div>
        </>
      )}
    </section>
    <section className="my-5">
      <div className="border-bottom d-flex gap-4 mb-3">
        <button
          className={`tab-btn pb-2 border-0 bg-transparent ${
            activeTab === 'description' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>

        <button
          className={`tab-btn pb-2 border-0 bg-transparent ${
            activeTab === 'details' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('details')}
        >
          Specifications
        </button>

        <button
          className={`tab-btn pb-2 border-0 bg-transparent ${
            activeTab === 'reviews' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews (120)
        </button>
      </div>

      <div className="tab-body text-secondary small">
        {activeTab === 'description' ? (
          <p>
            The Flower thrives in medium to low light and need watering
            only when the top soil is dry. They are low-maintenance,
            air-purifying, and perfect for residential or office
            environments.
          </p>
        ) : activeTab === 'details' ? (
          <table className="table table-bordered w-100">
            <tbody>
              <tr>
                <th className="bg-light w-25">Height</th>
                <td>12-15 inches</td>
              </tr>

              <tr>
                <th className="bg-light">Light Need</th>
                <td>Indirect Sunlight</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="reviews-preview">
            <div className="d-flex align-items-center gap-4 mb-4">
              <div>
                <h2 className="fw-bold mb-1">4.8</h2>
                <div className="text-warning fs-5">★★★★★</div>
                <span className="text-muted">120 reviews</span>
              </div>

              <div>
                <p className="mb-1">★★★★★ 92%</p>
                <p className="mb-1">★★★★☆ 6%</p>
                <p className="mb-0">★★★☆☆ 2%</p>
              </div>
            </div>

            <div className="border-top pt-3">
              <strong>Mark L.</strong>
              <span className="text-warning ms-3">★★★★★</span>

              <p className="mt-2 mb-1">
                Beautiful bouquet and arrived in perfect condition!
              </p>

              <small className="text-muted">
                Verified Purchase
              </small>
            </div>

            <div className="border-top mt-3 pt-3">
              <strong>Marcus L.</strong>
              <span className="text-warning ms-3">★★★★★</span>

              <p className="mt-2 mb-1">
                The Flower looks amazing in my birthday event. Highly recommended.
              </p>

              <small className="text-muted">
                Verified Purchase
              </small>
            </div>

            <button className="btn btn-outline-custom rounded-pill px-4 mt-4">
              View All Reviews
            </button>
          </div>
        )}
      </div>
    </section>

    <section className="my-5">
      <h3 className="fw-serif mb-4">Explore Similar Products</h3>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
        {[1].map((item) => (
              <div key={item} className="col">
                <div className="card border rounded-3 p-3 text-center h-100 shadow-sm">
                  <div className="placeholder-box rounded-2 mb-3"></div>
                  <h6 className="fw-bold mb-1">Bouquet Set</h6>
                  <p className="text-burgundy fw-bold small m-0">₱450.00</p>
                </div>
              </div>
            ))}

            {[2].map((item) => (
              <div key={item} className="col">
                <div className="card border rounded-3 p-3 text-center h-100 shadow-sm">
                  <div className="placeholder-box rounded-2 mb-3"></div>
                  <h6 className="fw-bold mb-1">Bouquet Set 2</h6>
                  <p className="text-burgundy fw-bold small m-0">₱450.00</p>
                </div>
              </div>
            ))}

            {[3].map((item) => (
              <div key={item} className="col">
                <div className="card border rounded-3 p-3 text-center h-100 shadow-sm">
                  <div className="placeholder-box rounded-2 mb-3"></div>
                  <h6 className="fw-bold mb-1">Bouquet Set 3</h6>
                  <p className="text-burgundy fw-bold small m-0">₱550.00</p>
                </div>
              </div>
            ))}

            {[4].map((item) => (
              <div key={item} className="col">
                <div className="card border rounded-3 p-3 text-center h-100 shadow-sm">
                  <div className="placeholder-box rounded-2 mb-3"></div>
                  <h6 className="fw-bold mb-1">Bouquet Set 4</h6>
                  <p className="text-burgundy fw-bold small m-0">₱650.00</p>
                </div>
              </div>
            ))}

      </div> 
    </section>

    </main>

    <Footer />
          </div>
        );
      }
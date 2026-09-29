import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FlowerDetails.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import "bootstrap/dist/css/bootstrap.min.css";

const mainImgPlaceholder =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600' fill='%23f5f0e8'><rect width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='28' fill='%23733646'>Image</text></svg>";

export default function FlowerDetails() {
  const navigate = useNavigate();
  const { flowerId } = useParams();

  const [selectedImg, setSelectedImg] = useState(mainImgPlaceholder);
  const [activeTab, setActiveTab] = useState("description");
  const [flower, setFlower] = useState(null);

  useEffect(() => {
    async function getFlower() {
      try {
        const response = await fetch(
          `http://localhost/bbf_inventorydb/get_flower.php?flower_id=${flowerId}`,
        );

        const data = await response.json();

        if (data.success) {
          setFlower(data.flower);

          if (data.flower.flower_image) {
            setSelectedImg(data.flower.flower_image);
          }
        } else {
          console.log(data.message);
        }
      } catch (error) {
        console.error("Failed to get flower:", error);
      }
    }

    if (flowerId) {
      getFlower();
    }
  }, [flowerId]);

  function handleDesignBouquet() {
    navigate("/login");
  }

  return (
    <div className="bloombox-wrapper">
      <Header />

      <main className="container py-5">
        <div className="row g-5 align-items-start">
          <div className="col-lg-6">
            <div className="main-image-wrapper mb-3 rounded-4 overflow-hidden shadow-sm">
              <img
                src={selectedImg}
                alt={flower?.flower_name || "Flower"}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>

          <div className="col-lg-6">
            <span className="text-uppercase text-muted fs-7 tracking-wide">
              Flower
            </span>

            <h1 className="display-6 fw-serif my-1">
              {flower?.flower_name || "Flower"}
            </h1>

            <p className="text-secondary small leading-relaxed mb-4">
              {flower?.flower_description ||
                "Flower description is not available."}
            </p>

            <button
              type="button"
              className="btn btn-design-bouquet rounded-pill px-4"
              onClick={handleDesignBouquet}
            >
              Design Your Bouquet
            </button>
          </div>
        </div>

        <section className="my-5">
          <div className="border-bottom d-flex gap-4 mb-3">
            <button
              type="button"
              className={`tab-btn pb-2 border-0 bg-transparent ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>

            <button
              type="button"
              className={`tab-btn pb-2 border-0 bg-transparent ${
                activeTab === "details" ? "active" : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Specifications
            </button>
          </div>

          <div className="tab-body text-secondary small">
            {activeTab === "description" ? (
              <p>
                The Flower thrives in medium to low light and need watering only
                when the top soil is dry. They are low-maintenance,
                air-purifying, and perfect for residential or office
                environments.
              </p>
            ) : (
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

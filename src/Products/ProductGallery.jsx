import { useState } from "react";

function ProductGallery({ images }) {
  // The first image should be the main image when the page opens.
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <section className="product-gallery">
      <div className="main-image-container">
        <img
        src={selectedImage}
        alt="Peace Lily"
    />
      </div>

      <div className="thumbnail-list">
        {/* Go through every image inside the images array */}
        {images.map((image, index) => (
          <button
            type="button"
            key={image}
            className={
              image === selectedImage ? "thumbnail selected" : "thumbnail"
            }
            onClick={() => setSelectedImage(image)}
            aria-label={`View Peace Lily image ${index + 1}`}
          >
            <img
              src={image}
              alt="Peace Lily"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default ProductGallery;
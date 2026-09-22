function FlowerOptions({
  selectedSize,
  onSizeChange,
  selectedMaterial,
  onMaterialChange,
}) {
  const sizes = ["Small", "Medium", "Large"];
  const materials = [
    "Kraft Paper",
    "Tissue Paper",
    "Wrapping Paper",
    "Cellophane",
  ];

  return (
    <div className="flower-options">
      <div className="option-group">
        <p className="option-label">Paper Size</p>

        <div className="option-buttons">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              className={
                size === selectedSize
                  ? "option-btn selected"
                  : "option-btn"
              }
              onClick={() => onSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <p className="option-label">Bouquet Paper</p>

        <div className="option-buttons">
          {materials.map((material) => (
            <button
              key={material}
              type="button"
              className={
                material === selectedMaterial
                  ? "option-btn selected"
                  : "option-btn"
              }
              onClick={() => onMaterialChange(material)}
            >
              {material}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlowerOptions;
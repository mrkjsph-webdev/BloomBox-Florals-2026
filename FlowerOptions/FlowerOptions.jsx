function FlowerOptions({
  selectedSize,
  onSizeChange,
  selectedMaterial,
  onMaterialChange,
  selectedColor,
  onColorChange,
}) {
  const sizes = ["Small", "Medium", "Large"];
  const materials = ["Ceramic", "Plastic", "Wood", "Metal"];
  const colors = ["#000000", "#4CAF50", "#F44336", "#FFC107"];

  return (
    <div className="flower-options">
      <div className="option-group">
        <p className="option-label">Plant Size</p>
        <div className="option-buttons">
          {sizes.map((size) => (
            <button
              key={size}
              className={size === selectedSize ? "option-btn selected" : "option-btn"}
              onClick={() => onSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <p className="option-label">Pot Material</p>
        <div className="option-buttons">
          {materials.map((material) => (
            <button
              key={material}
              className={material === selectedMaterial ? "option-btn selected" : "option-btn"}
              onClick={() => onMaterialChange(material)}
            >
              {material}
            </button>
          ))}
        </div>
      </div>

      <div className="option-group">
        <p className="option-label">Pot Color</p>
        <div className="option-colors">
          {colors.map((color) => (
            <button
              key={color}
              className={color === selectedColor ? "color-dot selected" : "color-dot"}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlowerOptions;
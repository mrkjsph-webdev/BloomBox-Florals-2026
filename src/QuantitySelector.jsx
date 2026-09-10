function QuantitySelector({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="quantity-selector">
      <p className="option-label">Quantity</p>

      <div className="quantity-controls">
        <button
          type="button"
          onClick={onDecrease}
          disabled={quantity <= 1}
        >
          −
        </button>

        <span>{quantity}</span>

        <button type="button" onClick={onIncrease}>
          +
        </button>
      </div>
    </div>
  );
}

export default QuantitySelector;
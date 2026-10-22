import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useFave } from '../context/FaveContext';
import './ProductModal.css';

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleFave, isFave } = useFave();
  const [qty, setQty] = useState(1);

  // Reset qty when a new product opens
  useEffect(() => {
    setQty(1);
  }, [product]);

  if (!product) return null;

  const favorited = isFave(product.id);

  const handleAdd = async () => {
    // 1. Temporarily disable the button while it processes
    if (window.isAddingToCart) return; 
    window.isAddingToCart = true;

    try {
      // 2. Add the item(s) to the cart
      for (let i = 0; i < qty; i++) {
        await addToCart(product);
      }
      // 3. Close the modal ONLY after all requests are done
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      // 4. Re-enable the button
      window.isAddingToCart = false;
    }
  };

  const handleFave = () => {
    toggleFave(product);
  };

  return (
    <>
      <div className="product-modal-backdrop" onClick={onClose} />

      <div className="product-modal">
        <button
          className="product-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="bx bx-x"></i>
        </button>

        {/* LEFT — IMAGE */}
        <div className="product-modal-image">
          <img src={product.image} alt={product.name} />
        </div>

        {/* RIGHT — DETAILS */}
        <div className="product-modal-info">
          <span className="product-modal-category">
            {product.group || 'Menu'}
          </span>

          <h2>{product.name}</h2>

          <div className="product-modal-rating">
            ⭐ {product.rating} <span>(124 reviews)</span>
          </div>

          <h3 className="product-modal-price">
            ₦{product.price.toFixed(2)}
          </h3>

          <p className="product-modal-desc">
            {product.description}
          </p>

          {/* QUANTITY */}
          <div className="product-modal-qty">
            <span>Quantity:</span>
            <div className="qty-stepper">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="product-modal-features">
            <div><i className="bx bx-package"></i> Free Shipping</div>
            <div><i className="bx bx-refresh"></i> 30-Day Returns</div>
            <div><i className="bx bx-lock"></i> Secure Payment</div>
            <div><i className="bx bx-star"></i> Premium Quality</div>
          </div>

          {/* ACTIONS */}
          <div className="product-modal-actions">
            <button className="product-modal-add" onClick={handleAdd}
            disabled={window.isAddingToCart}>
              <i className="bx bx-cart-add"></i> Add to Cart
            </button>

            <button
              className={`product-modal-fave ${favorited ? 'active' : ''}`}
              onClick={handleFave}
              aria-label="Toggle favorite"
            >
              <i className={favorited ? 'bx bxs-heart' : 'bx bx-heart'}></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductModal;
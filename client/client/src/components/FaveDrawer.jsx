import React from 'react';
import { useFave } from '../context/FaveContext';
import { useCart } from '../context/CartContext';
import './FaveDrawer.css';

function FaveDrawer({ isOpen, onClose }) {
  const { faveItems, removeFromFave } = useFave();
  const { addToCart } = useCart();

  return (
    <>
      <div
        className={`fave-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`fave-drawer ${isOpen ? 'open' : ''}`}>
        <div className="fave-header">
          <h2>Favorites</h2>
          <button className="fave-close-btn" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>

        {faveItems.length === 0 ? (
          <div className="fave-empty">
            <i className="bx bx-heart"></i>
            <p>No favorites yet</p>
          </div>
        ) : (
          <div className="fave-items">
            {faveItems.map((item) => (
              <div className="fave-item-card" key={item._id}>
                <img src={item.image} alt={item.name} />
                <div className="fave-item-info">
                  <h4>{item.name}</h4>
                  <span>₦{item.price.toFixed(2)}</span>
                  
                  <div className="fave-actions">
                    <button 
                      className="fave-add-btn" 
                      onClick={() => {
                        addToCart(item);
                        onClose(); // Optional: close drawer after adding
                      }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="fave-remove-btn" 
                      onClick={() => removeFromFave(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

export default FaveDrawer;
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './CartDrawer.css';

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, addToCart, removeFromCart, clearCart, updateQuantity } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  // Free delivery logic (e.g., free over ₦10,000)
  const FREE_DELIVERY_THRESHOLD = 10000;
  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - total;
  const hasFreeDelivery = total >= FREE_DELIVERY_THRESHOLD;

  return (
    <>
      <div
        className={`cart-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        
        {/* HEADER */}
        <div className="cart-drawer-header">
          <div>
            <h2>Your Bag</h2>
            <p className="cart-subtitle">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} from CraveHub
            </p>
          </div>
          
          <div className="cart-header-actions">
            {cartItems.length > 0 && (
              <button className="cart-clear-link" onClick={clearCart}>
                <i className="bx bx-trash"></i> Clear
              </button>
            )}
            <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <i className="bx bx-shopping-bag"></i>
            <p>Your bag is empty</p>
            <button className="cart-empty-btn" onClick={onClose}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* ITEMS LIST */}
            <div className="cart-drawer-items">
              {cartItems.map((item) => (
                <div className="refined-item-card" key={item._id}>
                  <img src={item.image} alt={item.name} />
                  
                  <div className="refined-item-details">
                    <div className="refined-item-top">
                      <h4>{item.name}</h4>
                      <button 
                        className="refined-trash-btn" 
                        onClick={() => removeFromCart(item._id)}
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                    
                    <p className="refined-item-desc">No onions, extra cheese</p>
                    
                    <div className="refined-item-bottom">
                      <span className="refined-price">₦{(item.price * item.quantity).toFixed(2)}</span>
                      
                      {/* YELLOW STEPPER */}
                      <div className="refined-qty-stepper">
                        <button onClick={() => {
                          if (item.quantity <= 1) removeFromCart(item._id);
                          else updateQuantity(item._id, item.quantity - 1);
                        }}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* FREE DELIVERY BANNER */}
              <div className="free-delivery-banner">
                <i className="bx bxs-truck"></i>
                {hasFreeDelivery ? (
                  <span>You've unlocked <strong>Free Delivery!</strong></span>
                ) : (
                  <span>Add <strong>₦{amountForFreeDelivery.toFixed(2)}</strong> more for Free Delivery!</span>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="cart-drawer-footer">
              <div className="refined-subtotal-row">
                <span>Subtotal</span>
                <strong>₦{total.toFixed(2)}</strong>
              </div>

              <Link to="/checkout" className="refined-checkout-btn" onClick={onClose}>
                Proceed to Checkout <i className="bx bx-right-arrow-alt"></i>
              </Link>
            </div>
          </>
        )}

      </aside>
    </>
  );
}

export default CartDrawer;
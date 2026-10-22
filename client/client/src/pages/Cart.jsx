import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// import './CartPage.css';

function Cart() {
  const { cartItems, removeFromCart, clearCart, addToCart } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty">
        <h2>Your cart is empty 🛒</h2>
        <Link to="/menu" className="browse-btn">
          Browse the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={item.image} alt={item.name} />

            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>₦{item.price.toFixed(2)}</p>
            </div>

            <div className="qty-controls">
              <button onClick={() => removeFromCart(item.id)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => addToCart(item)}>+</button>
            </div>

            <div className="item-total">
              ₦{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Total: ₦{total.toFixed(2)}</h2>
        <button className="checkout-btn">Checkout</button>
        <button className="clear-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>
    </div>
  );
}

export default Cart;
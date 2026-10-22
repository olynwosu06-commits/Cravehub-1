import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/CheckoutPage.css'

function CheckoutPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { cartItems } = useCart();

  // If the cart is empty, send them back to the menu
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <i className="bx bx-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Add some items before checking out.</p>
          <Link to="/menu" className="checkout-btn">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>How would you like to continue?</p>
      </div>

      <div className="checkout-cards">

        {/* GUEST */}
        <div className="checkout-card">
          <div className="checkout-card-icon">
            <i className="bx bx-user"></i>
          </div>
          <h2>Continue as Guest</h2>
          <p>No account needed. Just enter your delivery details.</p>
          <button
            className="checkout-card-btn"
            onClick={() => navigate('/checkout/guest')}
          >
            Continue as Guest
          </button>
        </div>

        {/* LOGIN */}
        <div className="checkout-card">
          <div className="checkout-card-icon">
            <i className="bx bx-log-in"></i>
          </div>
          <h2>{isLoggedIn ? 'Continue as ' + user.name : 'Log In'}</h2>
          <p>
            {isLoggedIn
              ? 'You are logged in. Continue to delivery details.'
              : 'Log in for faster checkout and order tracking.'}
          </p>
          <button
            className="checkout-card-btn primary"
            onClick={() => {
              if (isLoggedIn) {
                navigate('/checkout/guest');   // same form, but pre-filled
              } else {
                navigate('/login', { state: { from: '/checkout/guest' } });
              }
            }}
          >
            {isLoggedIn ? 'Continue' : 'Log In'}
          </button>
        </div>

      </div>

      <Link to="/menu" className="checkout-back">
        ← Back to menu
      </Link>
    </div>
  );
}

export default CheckoutPage;
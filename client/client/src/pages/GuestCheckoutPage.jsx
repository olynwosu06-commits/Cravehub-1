import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import '../styles/CheckoutPage.css';

function GuestCheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState('delivery');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee =
    orderType === 'delivery' && subtotal < 10000 ? 500 : 0;
  const total = subtotal + deliveryFee;

  // ---- Verify payment with server, then create the order ----
  const onPaystackSuccess = async (reference) => {
    setIsProcessing(true);
    try {
      const { data: verification } = await api.get(
        `/api/payments/verify/${reference.reference}`
      );

      if (!verification.verified) {
        showToast('Payment was not successful', 'error');
        setIsProcessing(false);
        return;
      }

      const { data: order } = await api.post('/api/orders', {
        customer: {
          name,
          email,
          phone,
          address: orderType === 'delivery' ? address : '',
        },
        notes,
        orderType,
        paymentReference: reference.reference,
      });

      await refreshCart();
      showToast('Order placed!', 'success');
      navigate(`/order/${order._id}`);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to place order';
      showToast(message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const onPaystackClose = () => {
    showToast('Payment cancelled', 'info');
    setIsProcessing(false);
  };

  // ---- Form submit -> open Paystack popup ----
  const handleSubmit = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!email) {
      showToast('Email is required', 'error');
      return;
    }

    if (orderType === 'delivery' && !address) {
      showToast('Address is required for delivery', 'error');
      return;
    }

    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      showToast('Paystack key missing', 'error');
      return;
    }

    setIsProcessing(true);

    // Paystack's own popup — call it directly
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(total * 100),      // kobo
      currency: 'NGN',
      ref: `crave-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: name,
          },
        ],
      },
      callback: function (response) {
        onPaystackSuccess({ reference: response.reference });
      },
      onClose: function () {
        onPaystackClose();
      },
    });

    handler.openIframe();
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add items before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Delivery Details</h1>
        <p>We'll use this information to deliver your order</p>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>

        <div className="order-type-choice">
          <label className={`order-type-option ${orderType === 'delivery' ? 'active' : ''}`}>
            <input
              type="radio"
              name="orderType"
              value="delivery"
              checked={orderType === 'delivery'}
              onChange={(e) => setOrderType(e.target.value)}
            />
            <div className="order-type-content">
              <i className="bx bx-cycling"></i>
              <div>
                <strong>Delivery</strong>
                <span>Bring it to my address</span>
              </div>
            </div>
          </label>

          <label className={`order-type-option ${orderType === 'pickup' ? 'active' : ''}`}>
            <input
              type="radio"
              name="orderType"
              value="pickup"
              checked={orderType === 'pickup'}
              onChange={(e) => setOrderType(e.target.value)}
            />
            <div className="order-type-content">
              <i className="bx bx-store"></i>
              <div>
                <strong>Pickup</strong>
                <span>I'll come and pick it up</span>
              </div>
            </div>
          </label>
        </div>

        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            required
          />
        </label>

        {orderType === 'delivery' && (
          <label>
            Delivery Address
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          </label>
        )}

        <label>
          Order Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Extra napkins, no onions, etc."
            rows={2}
          />
        </label>

        <div className="checkout-summary">
          <div className="checkout-summary-line">
            <span>Subtotal</span>
            <strong>₦{subtotal.toFixed(2)}</strong>
          </div>
          <div className="checkout-summary-line">
            <span>{orderType === 'delivery' ? 'Delivery Fee' : 'Pickup'}</span>
            <strong>
              {orderType === 'pickup'
                ? 'Free'
                : subtotal >= 10000
                ? 'Free'
                : '₦500.00'}
            </strong>
          </div>
          <div className="checkout-summary-line total">
            <span>Total</span>
            <strong>₦{total.toFixed(2)}</strong>
          </div>
        </div>

        <button
          type="submit"
          className="checkout-submit"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay ₦${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

export default GuestCheckoutPage;
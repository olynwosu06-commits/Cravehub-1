
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import EtaCountdown from '../components/EtaCountdown';
import OrderTimeline from '../components/OrderTimeline';
import '../styles/OrderConfirmationPage.css';

const formatMoney = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return '';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '';

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatus = (status) =>
  String(status || 'pending').toLowerCase().replace(/[\s_]+/g, '-');

function OrderConfirmationPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [canCancel, setCanCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/orders/${id}`);

        if (!cancelled) {
          setOrder(response.data);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this order. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!order?.createdAt) {
      setCanCancel(false);
      return;
    }

    const checkCancelWindow = () => {
      const minutesPassed =
        (Date.now() - new Date(order.createdAt).getTime()) / 60000;

      const status = getStatus(order.status);

      setCanCancel(
        ['pending', 'confirmed'].includes(status) &&
          minutesPassed >= 0 &&
          minutesPassed < 3
      );
    };

    checkCancelWindow();

    const interval = setInterval(checkCancelWindow, 10000);

    return () => clearInterval(interval);
  }, [order]);

  const handleCancelOrder = async () => {
    if (isCancelling || !canCancel) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      const response = await api.patch(`/api/orders/${id}/cancel`);

      setOrder(response.data);
      setCanCancel(false);

      showToast('Order cancelled successfully', 'success');
    } catch (err) {
      showToast(
        err.response?.data?.error || 'Failed to cancel order',
        'error'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <main className="order-confirmation-page">
        <div className="oc-state">
          <span className="oc-spinner" />
          <p>Getting your order details ready...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-confirmation-page">
        <div className="oc-state oc-error">
          <i className="bx bx-receipt" />
          <h1>Order not found</h1>
          <p>{error || 'We could not find this order.'}</p>

          <button
            type="button"
            className="oc-primary-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>

          <Link to="/menu" className="oc-text-link">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const status = getStatus(order.status);
  const isCancelled = status === 'cancelled';
  const isPickup = getStatus(order.orderType) === 'pickup';
  const customer = order.customer || {};
  const items = order.items || [];

  const itemCount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  const subtotal = order.subtotal ??
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

  const deliveryFee = Number(order.deliveryFee ?? order.shippingFee ?? 0);

  return (
    <main className="order-confirmation-page">
      <div className="oc-container">
        {/* PAGE HEADER */}
        <header className="oc-header">
          <Link to="/menu" className="oc-brand">
            <span className="oc-brand-icon">
              <i className="bx bx-bowl-hot" />
            </span>

            <span>
              <strong>CraveHub</strong>
              <small>GOOD FOOD. GOOD MOOD.</small>
            </span>
          </Link>

          <Link to="/orders" className="oc-orders-link">
            <i className="bx bx-receipt" />
            My orders
          </Link>
        </header>

        {/* CONFIRMATION BANNER */}
        <section
          className={`oc-confirmation-banner ${
            isCancelled ? 'oc-banner-cancelled' : ''
          }`}
        >
          <div className="oc-confirmation-icon">
            <i className={isCancelled ? 'bx bx-x' : 'bx bx-check'} />
          </div>

          <div className="oc-confirmation-copy">
            <span className="oc-eyebrow">
              {isCancelled ? 'ORDER UPDATE' : 'ORDER CONFIRMED'}
            </span>

            <h1>
              {isCancelled ? 'Order cancelled' : 'Your cravings are on the way!'}
            </h1>

            <p>
              {isCancelled
                ? 'This order has been cancelled and will not be processed.'
                : isPickup
                  ? 'Thanks for ordering! Your meal is being prepared for pickup.'
                  : "Thanks for ordering! We'll keep you updated as your meal makes its way to you."}
            </p>

            <div className="oc-order-reference">
              <span>
                ORDER #{String(order._id).slice(-6).toUpperCase()}
              </span>

              <span className="oc-reference-divider" />

              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <span className={`oc-status-pill oc-status-${status}`}>
            {status.replace(/-/g, ' ')}
          </span>
        </section>

        {/* ETA AND ORDER TIMELINE */}
        {!isCancelled && (
          <section className="oc-tracking-section">
            <div className="oc-section-heading">
              <div>
                <span className="oc-eyebrow">LIVE ORDER UPDATES</span>
                <h2>Your order journey</h2>
                <p>Follow your order from kitchen to your table.</p>
              </div>

              <span className="oc-tracking-icon">
                <i className="bx bx-time-five" />
              </span>
            </div>

            <div className="oc-eta-card">
              <div className="oc-eta-icon">
                <i className={isPickup ? 'bx bx-store' : 'bx bx-bicycle'} />
              </div>

              <div className="oc-eta-copy">
                <span>{isPickup ? 'PICKUP ORDER' : 'DELIVERY ORDER'}</span>
                <h3>
                  {isPickup ? 'Getting your pickup ready' : 'Preparing your delivery'}
                </h3>
                <p>
                  {isPickup
                    ? 'We’ll let you know when your food is ready.'
                    : 'Keep an eye on your estimated arrival time.'}
                </p>
              </div>
            </div>

            <div className="oc-tracking-components">
              <EtaCountdown
                createdAt={order.createdAt}
                orderType={order.orderType}
                status={order.status}
              />

              <OrderTimeline
                createdAt={order.createdAt}
                orderType={order.orderType}
                status={order.status}
              />
            </div>
          </section>
        )}

        {/* ORDER DETAILS AND SIDE CARD */}
        <section className="oc-details-grid">
          <article className="oc-summary-card">
            <div className="oc-card-heading">
              <div>
                <span className="oc-eyebrow">THE GOOD STUFF</span>
                <h2>Order summary</h2>
                <p>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in this order
                </p>
              </div>

              <span className="oc-receipt-icon">
                <i className="bx bx-receipt" />
              </span>
            </div>

            <div className="oc-items-list">
              {items.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                const unitPrice = Number(item.price) || 0;

                const image =
                  item.image ||
                  item.imageUrl ||
                  item.menuItem?.image ||
                  item.menuItem?.imageUrl;

                return (
                  <div className="oc-order-item" key={item._id || index}>
                    <div className="oc-item-image">
                      {image ? (
                        <img src={image} alt={item.name || 'Food item'} />
                      ) : (
                        <i className="bx bx-restaurant" />
                      )}
                    </div>

                    <span className="oc-item-quantity">{quantity}</span>

                    <div className="oc-item-description">
                      <h3>{item.name || 'Menu item'}</h3>
                      <p>
                        {quantity} × {formatMoney(unitPrice)}
                      </p>
                    </div>

                    <strong className="oc-item-price">
                      {formatMoney(unitPrice * quantity)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="oc-totals">
              <div className="oc-total-row">
                <span>Subtotal</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>

              <div className="oc-total-row">
                <span>Delivery fee</span>
                <strong>
                  {deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}
                </strong>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="oc-total-row">
                  <span>Discount</span>
                  <strong>
                    −{formatMoney(order.discount)}
                  </strong>
                </div>
              )}

              <div className="oc-total-row oc-grand-total">
                <span>Total</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>

            {canCancel && !isCancelled && (
              <div className="oc-cancel-notice">
                <i className="bx bx-info-circle" />
                <div>
                  <strong>Changed your mind?</strong>
                  <p>
                    You can cancel this order during the first three minutes
                    after placing it.
                  </p>
                </div>

                <button
                  type="button"
                  className="oc-cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel order'}
                </button>
              </div>
            )}
          </article>

          <aside className="oc-sidebar">
            <section className="oc-delivery-card">
              <div className="oc-sidebar-icon">
                <i className={isPickup ? 'bx bx-store' : 'bx bx-map-pin'} />
              </div>

              <span className="oc-eyebrow">
                {isPickup ? 'PICKUP DETAILS' : 'DELIVERY DETAILS'}
              </span>

              <h2>{isPickup ? 'Your pickup' : 'Delivering to'}</h2>

              <div className="oc-customer-details">
                <strong>{customer.name || 'Customer'}</strong>

                <p>
                  {customer.address ||
                    (isPickup
                      ? 'Pickup at the restaurant'
                      : 'Delivery address not available')}
                </p>

                {customer.phone && (
                  <p className="oc-customer-phone">
                    <i className="bx bx-phone" />
                    {customer.phone}
                  </p>
                )}
              </div>

              <div className="oc-delivery-divider" />

              <div className="oc-delivery-note">
                <i className="bx bx-heart" />
                <p>
                  {isPickup
                    ? 'Your freshly prepared food will be waiting for you.'
                    : 'We’re getting your order ready with care.'}
                </p>
              </div>
            </section>

            <section className="oc-dessert-card">
              <span className="oc-dessert-decoration">✦</span>
              <span className="oc-eyebrow">A LITTLE SOMETHING EXTRA</span>
              <h2>Still room for dessert?</h2>
              <p>
                Make your next craving a sweet one. There’s always something
                delicious waiting on the menu.
              </p>

              <Link to="/menu" className="oc-dessert-btn">
                Explore the menu
                <i className="bx bx-right-arrow-alt" />
              </Link>
            </section>
          </aside>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="oc-footer">
          <p>
            <i className="bx bx-heart" />
            Made for your cravings, powered by CraveHub.
          </p>

          <Link to="/menu">
            Back to menu <i className="bx bx-right-arrow-alt" />
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default OrderConfirmationPage;

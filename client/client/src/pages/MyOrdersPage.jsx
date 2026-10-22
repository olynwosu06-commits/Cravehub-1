
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';
import '../styles/MyOrdersPage.css';

const formatMoney = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (date) => {
  if (!date) return '';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  return parsedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeStatus = (status) =>
  String(status || 'pending').toLowerCase().replace(/[\s_]+/g, '-');

const statusLabel = (status) => {
  const labels = {
    'out-for-delivery': 'Out for delivery',
    'in-transit': 'In transit',
    'ready-for-pickup': 'Ready for pickup',
    'picked-up': 'Picked up',
  };

  const normalized = normalizeStatus(status);

  return labels[normalized] ||
    normalized.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const isActiveOrder = (order) =>
  !['delivered', 'cancelled', 'completed', 'picked-up'].includes(
    normalizeStatus(order.status)
  );

const getItemImage = (item) =>
  item.image ||
  item.imageUrl ||
  item.imageURL ||
  item.menuItem?.image ||
  item.menuItem?.imageUrl ||
  '';

function MyOrdersPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { items: menuItems } = useMenu();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reorderingId, setReorderingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { state: { from: '/orders' } });
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (authLoading || !isLoggedIn) {
      if (!authLoading && !isLoggedIn) setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get('/api/orders/mine');
        const fetchedOrders = Array.isArray(response.data)
          ? response.data
          : response.data?.orders || [];

        if (!cancelled) {
          setOrders(fetchedOrders);
          setSelectedOrderId((currentId) => {
            if (fetchedOrders.some((order) => order._id === currentId)) {
              return currentId;
            }

            return fetchedOrders[0]?._id || null;
          });
        }
      } catch {
        if (!cancelled) setError('Could not load your orders. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    if (activeFilter === 'active') {
      return sorted.filter(isActiveOrder);
    }

    return sorted;
  }, [orders, activeFilter]);

  const selectedOrder = filteredOrders.find(
    (order) => order._id === selectedOrderId
  ) || filteredOrders[0] || null;

  const totalOrders = orders.length;

  const lifetimeSpend = orders.reduce((sum, order) => {
    if (normalizeStatus(order.status) === 'cancelled') return sum;
    return sum + Number(order.total || 0);
  }, 0);

  // Use a points balance supplied by your user data, if one exists.
  const rewardsPoints = Number(
    user?.rewardsPoints ??
    user?.rewardPoints ??
    user?.points ??
    0
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSelectedOrderId(null);
  };

  const handleReorder = async (event, order) => {
    event.stopPropagation();

    if (!menuItems.length) {
      showToast('Menu is loading, try again.', 'error');
      return;
    }

    setReorderingId(order._id);

    try {
      let addedCount = 0;

      for (const pastItem of order.items || []) {
        const currentItem = menuItems.find(
          (menuItem) =>
            (pastItem.menuItemId &&
              menuItem._id === pastItem.menuItemId) ||
            menuItem.name === pastItem.name
        );

        if (currentItem) {
          const quantity = Math.max(
            0,
            Math.floor(Number(pastItem.quantity) || 1)
          );

          for (let i = 0; i < quantity; i += 1) {
            await addToCart(currentItem);
          }

          addedCount += quantity;
        }
      }

      if (addedCount > 0) {
        showToast(`Added ${addedCount} items to your cart!`, 'success');
        navigate('/checkout/guest');
      } else {
        showToast('Sorry, those items are no longer available.', 'error');
      }
    } catch {
      showToast('Could not reorder these items. Please try again.', 'error');
    } finally {
      setReorderingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="orders-loading">
        <span className="orders-spinner" />
        <p>Loading your cravings...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  if (error) {
    return (
      <div className="orders-message">
        <i className="bx bx-error-circle" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button
          className="orders-primary-btn"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="my-orders-page">
      <header className="my-orders-header">
        <div>
          <span className="orders-eyebrow">YOUR FOOD JOURNEY</span>
          <h1>My Cravings<span>.</span></h1>
          <p>
            Welcome back, {user?.name?.trim()?.split(/\s+/)[0] || 'Foodie'}.
            {' '}Here is your order history.
          </p>
        </div>

        <Link to="/menu" className="orders-browse-btn">
          <i className="bx bx-plus" />
          Order something
        </Link>
      </header>

      <section className="stats-row" aria-label="Order statistics">
        <article className="stat-card stat-red">
          <div className="stat-icon">
            <i className="bx bx-shopping-bag" />
          </div>
          <div className="stat-info">
            <p>Total Cravings</p>
            <h2>{totalOrders}</h2>
            <span>Orders placed</span>
          </div>
          <i className="bx bx-trending-up stat-decoration" />
        </article>

        <article className="stat-card stat-gold">
          <div className="stat-icon">
            <i className="bx bx-wallet" />
          </div>
          <div className="stat-info">
            <p>Lifetime Value</p>
            <h2>{formatMoney(lifetimeSpend)}</h2>
            <span>Excluding cancelled orders</span>
          </div>
          <i className="bx bx-receipt stat-decoration" />
        </article>

        <article className="stat-card stat-green">
          <div className="stat-icon">
            <i className="bx bx-star" />
          </div>
          <div className="stat-info">
            <p>Rewards</p>
            <h2>{rewardsPoints.toLocaleString('en-NG')} pts</h2>
            <span>Your available points</span>
          </div>
          <i className="bx bx-gift stat-decoration" />
        </article>
      </section>

      <section className="orders-dashboard">
        <div className="orders-list-panel">
          <div className="orders-section-header">
            <div>
              <h2>Past Orders</h2>
              <p>Every craving, all in one place.</p>
            </div>

            <div className="orders-filters" aria-label="Filter orders">
              <button
                type="button"
                className={activeFilter === 'all' ? 'active' : ''}
                aria-pressed={activeFilter === 'all'}
                onClick={() => handleFilterChange('all')}
              >
                All <span>{totalOrders}</span>
              </button>

              <button
                type="button"
                className={activeFilter === 'active' ? 'active' : ''}
                aria-pressed={activeFilter === 'active'}
                onClick={() => handleFilterChange('active')}
              >
                Active
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-orders-icon">
                <i className="bx bx-receipt" />
              </div>
              <h3>
                {activeFilter === 'active'
                  ? 'No active orders'
                  : 'Your cravings start here'}
              </h3>
              <p>
                {activeFilter === 'active'
                  ? 'You do not have any orders in progress right now.'
                  : 'Your next favourite meal is just a few clicks away.'}
              </p>

              {activeFilter === 'active' ? (
                <button
                  className="orders-primary-btn"
                  onClick={() => handleFilterChange('all')}
                >
                  View all orders
                </button>
              ) : (
                <Link to="/menu" className="orders-primary-btn">
                  Explore the menu
                </Link>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?._id === order._id;
                const items = order.items || [];
                const firstItem = items[0];
                const itemCount = items.reduce(
                  (sum, item) => sum + (Number(item.quantity) || 1),
                  0
                );

                return (
                  <button
                    type="button"
                    key={order._id}
                    className={`premium-order-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedOrderId(order._id)}
                    aria-pressed={isSelected}
                  >
                    <div className="order-card-main">
                      <div className="order-images-stack">
                        {items.slice(0, 3).map((item, index) => {
                          const image = getItemImage(item);

                          return (
                            <div
                              className="stacked-img"
                              key={`${order._id}-${index}`}
                              style={{ zIndex: 3 - index }}
                            >
                              {image ? (
                                <img src={image} alt="" />
                              ) : (
                                <i className="bx bx-restaurant" />
                              )}
                            </div>
                          );
                        })}

                        {items.length > 3 && (
                          <div className="stacked-img more">
                            +{items.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="order-info">
                        <div className="order-top-line">
                          <span className="order-id">
                            #{String(order._id).slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`badge status-${normalizeStatus(order.status)}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </div>

                        <h3>
                          {firstItem?.name || 'CraveHub order'}
                          {items.length > 1 && ` + ${items.length - 1} more`}
                        </h3>

                        <p>
                          {formatDate(order.createdAt)}
                          {formatTime(order.createdAt) &&
                            ` · ${formatTime(order.createdAt)}`}
                        </p>

                        <span className="order-item-count">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    <div className="order-card-right">
                      <strong className="order-price">
                        {formatMoney(order.total)}
                      </strong>
                      <span className="order-view-link">
                        View details <i className="bx bx-chevron-right" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="order-detail-panel">
          {!selectedOrder ? (
            <div className="detail-placeholder">
              <i className="bx bx-receipt" />
              <h3>Select an order</h3>
              <p>Choose an order to see its full details here.</p>
            </div>
          ) : (
            <>
              <div className="detail-hero">
                {getItemImage(selectedOrder.items?.[0]) ? (
                  <img
                    src={getItemImage(selectedOrder.items[0])}
                    alt={selectedOrder.items[0]?.name || 'Your order'}
                  />
                ) : (
                  <div className="detail-hero-fallback">
                    <i className="bx bx-bowl-hot" />
                  </div>
                )}

                <div className="detail-hero-overlay">
                  <span>
                    ORDER #{String(selectedOrder._id).slice(-6).toUpperCase()}
                  </span>
                  <h2>
                    {selectedOrder.items?.[0]?.name || 'Your CraveHub order'}
                  </h2>
                  <p>
                    {statusLabel(selectedOrder.status)} ·{' '}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="detail-content">
                <div className="detail-title-row">
                  <div>
                    <span className="orders-eyebrow">ORDER DETAILS</span>
                    <h3>Order summary</h3>
                  </div>
                  <span
                    className={`badge status-${normalizeStatus(selectedOrder.status)}`}
                  >
                    {statusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div className="detail-items">
                  {(selectedOrder.items || []).map((item, index) => {
                    const image = getItemImage(item);
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(item.price || item.unitPrice || 0);

                    return (
                      <div
                        className="detail-item"
                        key={`${selectedOrder._id}-detail-${index}`}
                      >
                        <div className="detail-item-image">
                          {image ? (
                            <img src={image} alt="" />
                          ) : (
                            <i className="bx bx-restaurant" />
                          )}
                        </div>

                        <div className="detail-item-info">
                          <h4>{item.name || 'Menu item'}</h4>
                          <p>
                            {quantity} × {formatMoney(price)}
                          </p>
                        </div>

                        <strong>{formatMoney(price * quantity)}</strong>
                      </div>
                    );
                  })}
                </div>

                <div className="detail-info-grid">
                  <div className="detail-info-box">
                    <span><i className="bx bx-map" /> FULFILMENT</span>
                    <strong>
                      {selectedOrder.deliveryMethod ||
                        selectedOrder.fulfillmentType ||
                        (selectedOrder.deliveryAddress ? 'Delivery' : 'Order fulfilment')}
                    </strong>
                    <p>
                      {typeof selectedOrder.deliveryAddress === 'string'
                        ? selectedOrder.deliveryAddress
                        : selectedOrder.deliveryAddress?.street ||
                          selectedOrder.deliveryAddress?.address ||
                          selectedOrder.shippingAddress?.street ||
                          'See your checkout details'}
                    </p>
                  </div>

                  <div className="detail-info-box">
                    <span><i className="bx bx-credit-card" /> PAYMENT</span>
                    <strong>
                      {selectedOrder.paymentMethod ||
                        selectedOrder.payment?.method ||
                        'Payment details'}
                    </strong>
                    <p>
                      {selectedOrder.paymentStatus ||
                        selectedOrder.payment?.status ||
                        'Check your payment confirmation'}
                    </p>
                  </div>
                </div>

                <div className="detail-totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatMoney(
                        selectedOrder.subtotal ??
                        selectedOrder.items?.reduce(
                          (sum, item) =>
                            sum +
                            (Number(item.price || item.unitPrice) || 0) *
                              (Number(item.quantity) || 1),
                          0
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Delivery fee</span>
                    <strong>
                      {Number(
                        selectedOrder.deliveryFee ??
                        selectedOrder.shippingFee ??
                        0
                      ) === 0
                        ? 'FREE'
                        : formatMoney(
                            selectedOrder.deliveryFee ??
                            selectedOrder.shippingFee
                          )}
                    </strong>
                  </div>

                  {Number(selectedOrder.discount || 0) > 0 && (
                    <div>
                      <span>Discount</span>
                      <strong>
                        −{formatMoney(selectedOrder.discount)}
                      </strong>
                    </div>
                  )}

                  <div className="detail-total">
                    <span>Total amount</span>
                    <strong>{formatMoney(selectedOrder.total)}</strong>
                  </div>
                </div>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="orders-primary-btn"
                    onClick={(event) => handleReorder(event, selectedOrder)}
                    disabled={reorderingId === selectedOrder._id}
                  >
                    <i className="bx bx-refresh" />
                    {reorderingId === selectedOrder._id
                      ? 'Adding items...'
                      : 'Reorder all'}
                  </button>

                  <button
                    type="button"
                    className="orders-secondary-btn"
                    onClick={() => navigate(`/order/${selectedOrder._id}`)}
                  >
                    View order
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}

export default MyOrdersPage;

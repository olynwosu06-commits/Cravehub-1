import React, { useEffect, useState } from 'react';
import '../styles/CheckoutPage.css'

function EtaCountdown({ createdAt, orderType, status }) {
  // Total delivery/pickup time in minutes
  const totalMinutes = orderType === 'pickup' ? 1 : 1;
  const totalMs = totalMinutes * 60 * 1000;

  // Calculate the target time once, based on order creation time
  const targetTime = new Date(createdAt).getTime() + totalMs;

  // Calculate initial remaining time
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, targetTime - Date.now())
  );

  // Tick every second
  useEffect(() => {
    const tick = () => {
      setRemaining(Math.max(0, targetTime - Date.now()));
    };
    tick(); // run immediately so there's no 1s delay on mount
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  // Format remaining time as "34m 12s"
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formatTime = () => {
    if (totalSeconds <= 0) return null;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  // If order is already delivered/cancelled, override display
  const isDone = status === 'delivered' || status === 'cancelled';
  const hasArrived = totalSeconds <= 0;

  // Main status
  let mainText = '';
  let subText = '';
  let emoji = '';
  let variant = '';

  if (status === 'cancelled') {
    mainText = 'Order cancelled';
    subText = 'This order was cancelled';
    emoji = '❌';
    variant = 'cancelled';
  } else if (isDone || hasArrived) {
    mainText = orderType === 'pickup' ? 'Ready for pickup!' : 'Arrived!';
    subText = orderType === 'pickup'
      ? 'Your order is waiting for you'
      : 'Your food is at your door';
    emoji = orderType === 'pickup' ? '🏪' : '🛵';
    variant = 'done';
  } else if (totalSeconds <= 300) {
    // 5 minutes or less
    mainText = `${formatTime()} left`;
    subText = 'Almost there!';
    emoji = orderType === 'pickup' ? '🏪' : '🛵';
    variant = 'soon';
  } else {
    mainText = `${formatTime()} left`;
    subText = orderType === 'pickup'
      ? 'We\'ll have it ready for you'
      : 'Your order is being prepared';
    emoji = orderType === 'pickup' ? '📦' : '🍔';
    variant = 'normal';
  }

  return (
    <div className={`eta-countdown eta-${variant}`}>
      <div className="eta-emoji">{emoji}</div>
      <div className="eta-text">
        <div className="eta-main">{mainText}</div>
        <div className="eta-sub">{subText}</div>
      </div>
    </div>
  );
}

export default EtaCountdown;
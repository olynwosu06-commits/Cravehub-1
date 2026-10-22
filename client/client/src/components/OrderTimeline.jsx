import React, { useEffect, useState } from 'react';

function OrderTimeline({ createdAt, orderType, status }) {
  // 👇 MUST MATCH the totalMinutes in EtaCountdown.jsx
  const totalMinutes = orderType === 'pickup' ? 1 : 1;
  const totalMs = totalMinutes * 60 * 1000;

  const [elapsedMs, setElapsedMs] = useState(() =>
    Math.max(0, Date.now() - new Date(createdAt).getTime())
  );

  // Tick every second so the timeline advances smoothly
  useEffect(() => {
    const tick = () => {
      setElapsedMs(Math.max(0, Date.now() - new Date(createdAt).getTime()));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // --- Determine step based on percentage of total time ---
  let currentStep = 0;
  if (status === 'cancelled') {
    currentStep = -1;
  } else if (status === 'delivered') {
    currentStep = 3;
  } else {
    const progress = elapsedMs / totalMs;
    if (progress >= 1) currentStep = 3;         // Delivered
    else if (progress >= 0.5) currentStep = 2;  // On the way (halfway)
    else if (progress >= 0.25) currentStep = 1; // Preparing (quarter way)
    else currentStep = 0;                       // Received
  }

  const steps = orderType === 'pickup'
    ? ['Received', 'Preparing', 'Ready', 'Picked up']
    : ['Received', 'Preparing', 'On the way', 'Delivered'];

  if (currentStep === -1) {
    return (
      <div className="order-timeline cancelled">
        <div className="timeline-cancelled-text">
          <i className="bx bx-x-circle"></i> Order Cancelled
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      <div className="timeline-track">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step}
              className={`timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="timeline-dot">
                {isDone ? (
                  <i className="bx bx-check"></i>
                ) : isActive ? (
                  <div className="timeline-pulse"></div>
                ) : null}
              </div>
              <div className="timeline-label">{step}</div>
            </div>
          );
        })}
      </div>

      <div className="timeline-progress-track">
        <div
          className="timeline-progress-fill"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default OrderTimeline;
import React from 'react';
import './MenuSkeleton.css';

function MenuSkeleton({ count = 6 }) {
  return (
    <div className="menu-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="menu-skeleton-card" key={i}>
          <div className="skeleton-block skeleton-image"></div>
          <div className="skeleton-block skeleton-title"></div>
          <div className="skeleton-block skeleton-line"></div>
          <div className="skeleton-block skeleton-line short"></div>
          <div className="skeleton-block skeleton-button"></div>
        </div>
      ))}
    </div>
  );
}

export default MenuSkeleton;
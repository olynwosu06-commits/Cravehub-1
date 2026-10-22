import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-emoji">🍔</div>
        <h1>404</h1>
        <h2>Oops! We couldn't find that page.</h2>
        <p>Looks like this dish isn't on our menu. It might have been moved, or you might have typed the URL wrong.</p>
        
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn primary">
            <i className="bx bx-home"></i> Back to Home
          </Link>
          <Link to="/menu" className="notfound-btn secondary">
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
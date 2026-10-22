import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFave } from '../context/FaveContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ onOpenCart, onOpenFavorites, searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { faveItems } = useFave();
  const { user, isLoggedIn, logout } = useAuth();

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsMenuDropdownOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* ============ LEFT: BRAND + SEARCH ============ */}
        <div className="brand-area">
          <div className="hamburger" onClick={toggleMenu}>
            <i className="bx bx-menu"></i>
          </div>

          <Link to="/" className="brand-name" onClick={closeAll}>
            <span className="brand-icon">
              <i className="bx bx-layer"></i>
            </span>
            <span className="brands">CRAVE<span>HUB</span></span>
          </Link>

          <div className="search-bar">
            <i className="bx bx-search"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/menu');
                }
              }}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* ============ RIGHT: LINKS + ICONS ============ */}
        <div className="navbar-right">

          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/menu" className="nav-link">Menu</Link>
          </div>

          <div className="navbar-icons">

            {/* MOBILE SEARCH ICON */}
            <button
              className="nav-icon mobile-search"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Open search"
            >
              <i className="bx bx-search"></i>
            </button>

              {/* FAVORITES ICON */}
            <button
              className="nav-icon fave-icon"
              onClick={onOpenFavorites}
              aria-label="Open favorites"
              style={{ position: 'relative' }}
            >
              <i className="bx bx-heart"></i>
              {faveItems.length > 0 && (
                <span className="cart-badge">{faveItems.length}</span>
              )}
            </button>

            {/* CART */}
            {/* <button
              className="nav-icon cart-icon"
              onClick={onOpenCart}
              aria-label="Open cart"
            >
              <i className="bx bx-shopping-bag"></i>
              {totalQty > 0 && (
                <span className="cart-badge">{totalQty}</span>
              )}
            </button> */}
              

            {/* CART */}
            <button
              className="nav-icon cart-icon"
              onClick={onOpenCart}
              aria-label="Open cart"
            >
              <i className="bx bx-shopping-bag"></i>
              {totalQty > 0 && (
                <span className="cart-badge">{totalQty}</span>
              )}
            </button>

            {/* <button
            className="mobile-fave"
            onClick={() => {
              closeAll();
              onOpenFavorites();
            }}
          >
            <i class="bx bx-heart" /> {faveItems.length > 0 && `(${faveItems.length})`}
          </button> */}

            {/* THREE-DOT MENU */}
            <div className="menu-dropdown">
              <button
                className="nav-icon"
                onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                aria-label="More"
              >
                <i className="bx bx-dots-vertical-rounded"></i>
              </button>

              {isMenuDropdownOpen && (
                <>
                  <div
                    className="dropdown-backdrop"
                    onClick={() => setIsMenuDropdownOpen(false)}
                  />
                  <div className="dropdown-panel">
                    {isLoggedIn && (
                      <p className="dropdown-greeting">Hi, {user.name}</p>
                    )}

                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={closeAll}
                    >
                      <i className="bx bx-receipt"></i> My Orders
                    </Link>

                    {user?.email === 'emmaprime@gmail.com' && (
                    <Link to="/admin" className="dropdown-item" onClick={closeAll}>
                      <i className="bx bx-shield"></i> Admin
                    </Link>
                  )}

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        onOpenFavorites();
                        setIsMenuDropdownOpen(false);
                      }}
                    >
                      <i className="bx bx-heart"></i> Favorites
                      {/* {faveItems.length > 0 && (
                        <span className="dropdown-badge">{faveItems.length}</span>
                      )} */}
                    </button>

                    {isLoggedIn ? (
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="bx bx-log-out"></i> Log Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="dropdown-item"
                        onClick={closeAll}
                      >
                        <i className="bx bx-log-in"></i> Log In
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ============ MOBILE MENU ============ */}
      {isMenuOpen && (
        <div className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={closeAll}>
            Home
          </Link>
          <Link to="/menu" className="mobile-nav-link" onClick={closeAll}>
            Menu
          </Link>
          <Link to="/orders" className="mobile-nav-link" onClick={closeAll}>
            My Orders
          </Link>

          {isLoggedIn ? (
            <button className="mobile-nav-link" onClick={handleLogout}>
              Log Out ({user.name})
            </button>
          ) : (
            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={closeAll}
            >
              Log In
            </Link>
          )}
        </div>
      )}

      {/* ============ MOBILE SEARCH OVERLAY ============ */}
      {isMobileSearchOpen && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-header">
            <button
              className="mobile-search-back"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Close search"
            >
              <i className="bx bx-arrow-back"></i>
            </button>

            <input
              type="text"
              placeholder="Search for food, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate('/menu');
                  setIsMobileSearchOpen(false);
                }
              }}
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
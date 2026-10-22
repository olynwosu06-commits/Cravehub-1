import React from 'react';
import { useCart } from '../context/CartContext';
import './FoodCard.css';
import { useFave } from '../context/FaveContext';

function FoodCard({_id, id, name, price, image, rating, description, onQuickView }) {
  const { addToCart } = useCart();

  const { addToFave, removeFromFave} = useFave();

  const { toggleFave, isFave } = useFave();
  const favorited = isFave(_id);

  const handleAdd = () => {
    addToCart({_id, id, name, price, image, rating, description });
  };

  const handleFave =() => {
    toggleFave({_id, id, name, price, image, rating, description})
  }

  return (
    <div className="food-card"> 
      <div className="food-image">
        <img src={image} alt={name}   onClick={() => onQuickView({ id, name, price, image, rating, description })}/>
        <div
          className="quick-view-overlay"
          onClick={() => onQuickView({ id, name, price, image, rating, description })}
          >
          <button className="quick-view-btn">
            <i className="bx bx-search"></i> Quick View
          </button>
        </div>
        <button
          className={`favorite-button ${favorited ? 'active' : ''}`}
          onClick={handleFave}
        >
          <i className={favorited ? 'bx bxs-heart' : 'bx bx-heart'}></i>
        </button>
      </div>

      <div className="food-info">
        <h3>{name}</h3>
        <p className="food-description">{description}</p>
        <span className="food-rating">⭐ {rating}</span>

        <div className="food-footer">
          <span className="food-price">₦{price.toFixed(2)}</span>
          <button
            className="add-to-cart-button"
            aria-label="Add to cart"
            onClick={handleAdd}
          >
            +
          </button>
        </div>

        <button
          className="cart-btn "
          aria-label={`Add ${name} to cart`}
          onClick={handleAdd}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
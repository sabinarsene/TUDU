import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingStars.css';

/**
 * RatingStars component for displaying and selecting star ratings
 * @param {Object} props - Component props
 * @param {number} props.initialRating - Initial rating value (1-5)
 * @param {Function} props.onRatingChange - Callback when rating changes
 * @param {boolean} props.readOnly - Whether the rating is read-only
 * @param {string} props.size - Size of stars ('small', 'medium', 'large')
 * @returns {JSX.Element} RatingStars component
 */
const RatingStars = ({ initialRating = 0, onRatingChange, readOnly = false, size = 'medium' }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (selectedRating) => {
    if (readOnly) return;
    
    setRating(selectedRating);
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const handleStarHover = (hoveredRating) => {
    if (readOnly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  // Determine star size based on prop
  const getStarSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20; // medium
    }
  };

  const starSize = getStarSize();

  return (
    <div 
      className={`rating-stars ${readOnly ? 'read-only' : 'interactive'} size-${size}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={starSize}
          fill={(hoverRating || rating) >= star ? '#FFD700' : 'none'}
          stroke={(hoverRating || rating) >= star ? '#FFD700' : '#CBD5E0'}
          strokeWidth={1.5}
          className={`star ${(hoverRating || rating) >= star ? 'filled' : 'empty'}`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        />
      ))}
    </div>
  );
};

export default RatingStars; 
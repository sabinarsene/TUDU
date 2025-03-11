import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from './RatingStars';
import { submitUserRating, fetchUserRatings } from '../services/serviceApi';
import { Loader, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import './UserRating.css';

/**
 * UserRating component for displaying and submitting user ratings
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user being rated
 * @returns {JSX.Element} UserRating component
 */
const UserRating = ({ userId }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [existingUserRating, setExistingUserRating] = useState(null);

  // Fetch user ratings when component mounts
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true);
        const ratingsData = await fetchUserRatings(userId);
        setRatings(ratingsData.ratings || []);
        
        // Calculate average rating
        if (ratingsData.ratings && ratingsData.ratings.length > 0) {
          const sum = ratingsData.ratings.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(sum / ratingsData.ratings.length);
        }
        
        // Check if current user has already rated
        if (user && ratingsData.ratings) {
          const userRating = ratingsData.ratings.find(r => r.ratedBy === user.id);
          if (userRating) {
            setUserHasRated(true);
            setExistingUserRating(userRating);
            setUserRating(userRating.rating);
          }
        }
      } catch (err) {
        console.error('Error loading ratings:', err);
        setError('Nu am putut încărca evaluările. Te rugăm să încerci din nou.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadRatings();
    }
  }, [userId, user]);

  const handleRatingChange = (rating) => {
    setUserRating(rating);
    setShowCommentInput(true);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Trebuie să fii autentificat pentru a evalua un utilizator.');
      return;
    }
    
    if (userRating === 0) {
      setError('Te rugăm să selectezi un rating înainte de a trimite.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await submitUserRating(userId, userRating, comment, user.token);
      
      setSuccess(true);
      setUserHasRated(true);
      
      // Refresh ratings after submission
      const ratingsData = await fetchUserRatings(userId);
      setRatings(ratingsData.ratings || []);
      
      // Recalculate average
      if (ratingsData.ratings && ratingsData.ratings.length > 0) {
        const sum = ratingsData.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating(sum / ratingsData.ratings.length);
      }
      
      // Clear comment
      setComment('');
      setShowCommentInput(false);
      
      // Show success message temporarily
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Nu am putut trimite evaluarea. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="user-rating-loading">
        <Loader size={20} className="spinner" />
        <span>Se încarcă evaluările...</span>
      </div>
    );
  }

  return (
    <div className="user-rating-container">
      <div className="rating-summary">
        <div className="average-rating">
          <div className="rating-value">{averageRating.toFixed(1)}</div>
          <RatingStars initialRating={averageRating} readOnly={true} size="medium" />
          <div className="rating-count">({ratings.length} {ratings.length === 1 ? 'evaluare' : 'evaluări'})</div>
        </div>
      </div>
      
      {!userHasRated ? (
        <div className="rating-form">
          <h3>Evaluează acest utilizator</h3>
          <form onSubmit={handleSubmit}>
            <div className="rating-selection">
              <label>Selectează un rating:</label>
              <RatingStars 
                initialRating={userRating} 
                onRatingChange={handleRatingChange} 
                size="large" 
              />
            </div>
            
            {showCommentInput && (
              <div className="comment-input">
                <div className="textarea-wrapper">
                  <MessageSquare size={16} className="textarea-icon" />
                  <textarea
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Adaugă un comentariu (opțional)"
                    rows={3}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-rating-btn"
                  disabled={isSubmitting || userRating === 0}
                >
                  {isSubmitting ? (
                    <Loader size={16} className="spinner" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Trimite evaluarea</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {error && (
              <div className="rating-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="rating-success">
                <span>Evaluarea a fost trimisă cu succes!</span>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="user-already-rated">
          <p>Ai evaluat deja acest utilizator cu {existingUserRating?.rating} {existingUserRating?.rating === 1 ? 'stea' : 'stele'}</p>
          {existingUserRating?.comment && (
            <div className="existing-comment">
              <p>"{existingUserRating.comment}"</p>
            </div>
          )}
        </div>
      )}
      
      {ratings.length > 0 && (
        <div className="ratings-list">
          <h3>Toate evaluările</h3>
          {ratings.map((rating) => (
            <div key={rating.id} className="rating-item">
              <div className="rating-header">
                <div className="rater-name">{rating.raterName || 'Utilizator'}</div>
                <div className="rating-date">{new Date(rating.createdAt).toLocaleDateString('ro-RO')}</div>
              </div>
              <RatingStars initialRating={rating.rating} readOnly={true} size="small" />
              {rating.comment && <div className="rating-comment">{rating.comment}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRating; 
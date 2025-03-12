import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RatingStars from './RatingStars';
import { submitUserRating, fetchUserRatings } from '../services/serviceApi';
import { Loader, AlertTriangle, MessageSquare, Send, Info } from 'lucide-react';
import './UserRating.css';

// Importăm API_URL din serviceApi.js
import { API_URL } from '../services/serviceApi';

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
  const [reviewCount, setReviewCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [existingUserRating, setExistingUserRating] = useState(null);
  const [apiNotAvailable, setApiNotAvailable] = useState(false);

  // Fetch user ratings when component mounts
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching ratings for user:", userId);
        console.log("API URL being used:", `${API_URL}/users/${userId}/ratings`);
        
        const ratingsData = await fetchUserRatings(userId);
        console.log("Ratings data:", ratingsData);
        
        // Set ratings data
        setRatings(ratingsData.ratings || []);
        setAverageRating(ratingsData.averageRating || 0);
        setReviewCount(ratingsData.reviewCount || 0);
        
        // Check if current user has already rated
        if (user && ratingsData.ratings) {
          const userRating = ratingsData.ratings.find(r => r.ratedBy === user.id);
          if (userRating) {
            setUserHasRated(true);
            setExistingUserRating(userRating);
            setUserRating(userRating.rating);
          }
        }
        
        setApiNotAvailable(false);
      } catch (err) {
        console.error('Error loading ratings:', err);
        
        // Check if the error is a 404 (API endpoint not found)
        if (err.message && (err.message.includes('404') || err.message.includes('Not Found'))) {
          console.log("API endpoint not available, setting apiNotAvailable to true");
          setApiNotAvailable(true);
        } else {
          setError('Nu am putut încărca evaluările. Te rugăm să încerci din nou.');
        }
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
      
      // Verificăm token-ul din localStorage
      const storedToken = localStorage.getItem('token');
      console.log("Token from localStorage:", storedToken);
      console.log("Token from user object:", user.token);
      
      // Folosim token-ul din localStorage în loc de cel din user object
      console.log("Submitting rating:", userRating, "for user:", userId);
      const result = await submitUserRating(userId, userRating, comment, storedToken);
      console.log("Rating submitted:", result);
      
      setSuccess(true);
      setUserHasRated(true);
      
      // Refresh ratings after submission
      const ratingsData = await fetchUserRatings(userId);
      setRatings(ratingsData.ratings || []);
      setAverageRating(ratingsData.averageRating || 0);
      setReviewCount(ratingsData.reviewCount || 0);
      
      // Find the user's rating in the updated ratings
      if (ratingsData.ratings) {
        const updatedUserRating = ratingsData.ratings.find(r => r.ratedBy === user.id);
        if (updatedUserRating) {
          setExistingUserRating(updatedUserRating);
        }
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
      setError(err.message || 'Nu am putut trimite evaluarea. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="user-rating-container">
        <div className="user-rating-loading">
          <Loader className="spinner" size={24} />
          <span>Se încarcă evaluările...</span>
        </div>
      </div>
    );
  }

  // If API is not available, show a message
  if (apiNotAvailable) {
    return (
      <div className="user-rating-container">
        <div className="user-rating-unavailable">
          <Info size={32} />
          <h3>Sistemul de evaluări nu este disponibil momentan</h3>
          <p>Lucrăm la implementarea sistemului de evaluări pentru utilizatori. Vă mulțumim pentru înțelegere!</p>
          <p className="technical-info">Detalii tehnice: Endpoint-ul API pentru evaluări nu este disponibil. Verificați consola pentru mai multe informații.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-rating-container">
      <div className="rating-summary">
        <div className="average-rating">
          <div className="rating-value">{averageRating.toFixed(1)}</div>
          <RatingStars initialRating={averageRating} readOnly={true} size="medium" />
          <div className="rating-count">({reviewCount} {reviewCount === 1 ? 'evaluare' : 'evaluări'})</div>
        </div>
      </div>
      
      {!userHasRated && user && user.id !== userId ? (
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
      ) : userHasRated && (
        <div className="user-already-rated">
          <p>Ai evaluat deja acest utilizator cu {existingUserRating?.rating} {existingUserRating?.rating === 1 ? 'stea' : 'stele'}</p>
          {existingUserRating?.comment && (
            <div className="existing-comment">
              <p>"{existingUserRating.comment}"</p>
            </div>
          )}
        </div>
      )}
      
      {ratings.length > 0 ? (
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
      ) : (
        <div className="no-ratings-message">
          <Info size={24} />
          <p>Acest utilizator nu a primit încă nicio evaluare.</p>
        </div>
      )}
    </div>
  );
};

export default UserRating; 
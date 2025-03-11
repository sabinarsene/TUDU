"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  Star,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  Share2,
  Heart,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Loader,
} from "lucide-react"
import "./ServiceDetailsPage.css"
import { fetchServiceById } from "../services/serviceApi"
import { useAuth } from "../contexts/AuthContext"
import { addServiceToFavorites, removeServiceFromFavorites, isServiceFavorited } from "../services/favoriteApi"
import { getImageUrl, handleImageError } from "../utils/imageUtils"

const ServiceDetailsPage = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch service data and favorite status when component mounts
  useEffect(() => {
    const getServiceDetails = async () => {
      try {
        setLoading(true)
        const data = await fetchServiceById(serviceId)
        setService(data)
        setError(null)

        // Check if service is favorited
        if (user) {
          const token = localStorage.getItem('token')
          const favorited = await isServiceFavorited(serviceId, token)
          setIsFavorite(favorited)
        }
      } catch (err) {
        console.error("Error fetching service details:", err)
        setError("Nu am putut încărca detaliile serviciului. Vă rugăm încercați din nou mai târziu.")
      } finally {
        setLoading(false)
      }
    }

    getServiceDetails()
  }, [serviceId, user])

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spinner" />
        <p>Se încarcă detaliile serviciului...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <h2>Eroare</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className="back-home-button">
          Înapoi la pagina principală
        </button>
      </div>
    )
  }

  // If service not found
  if (!service) {
    return (
      <div className="service-not-found">
        <AlertTriangle size={48} />
        <h2>Serviciu negăsit</h2>
        <p>Serviciul căutat nu există sau a fost șters.</p>
        <button onClick={() => navigate("/")} className="back-home-button">
          Înapoi la pagina principală
        </button>
      </div>
    )
  }

  // Handle image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1))
  }

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setIsTogglingFavorite(true)
      const token = localStorage.getItem('token')
      
      if (isFavorite) {
        await removeServiceFromFavorites(serviceId, token)
      } else {
        await addServiceToFavorites(serviceId, token)
      }
      
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  // Reviews to display - we'll implement this later when we have reviews API
  const displayedReviews = []

  return (
    <div className="service-details-page">
      <header className="service-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <div className="header-actions">
          <button
            className="action-button"
            onClick={() => window.navigator.share({ title: service.title, url: window.location.href })}
          >
            <Share2 size={20} />
          </button>
          <button 
            className={`action-button ${isFavorite ? "favorite" : ""}`} 
            onClick={toggleFavorite}
            disabled={isTogglingFavorite}
          >
            {isTogglingFavorite ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Heart size={20} fill={isFavorite ? "#ff1d68" : "none"} />
            )}
          </button>
        </div>
      </header>

      <div className="service-gallery">
        <div className="gallery-main">
          <img
            src={getImageUrl(service.image)}
            alt={service.title}
            className="main-image"
            onError={handleImageError}
          />
        </div>
      </div>

      <div className="service-content">
        <div className="service-header-info">
          <h1 className="service-title">{service.title}</h1>
          <div className="service-meta">
            <div className="service-category">{service.category}</div>
            <div className="service-rating">
              <Star size={16} fill="#ffc939" color="#ffc939" />
              <span>
                {service.rating || "N/A"} ({service.review_count || 0} recenzii)
              </span>
            </div>
            <div className="service-location">
              <MapPin size={16} />
              <span>{service.location}</span>
            </div>
          </div>
        </div>

        <div className="service-price-section">
          <div className="service-price">
            <span className="price-amount">
              {service.price} {service.currency}
            </span>
            <span className="price-type">{service.price_type || "pe oră"}</span>
          </div>
          <Link to={`/book/${service.id}`} className="book-button">
            Rezervă
          </Link>
        </div>

        <div className="service-description">
          <h2>Descriere</h2>
          <div className={`description-content ${showFullDescription ? "expanded" : ""}`}>
            <p>{service.description}</p>
          </div>
          {service.description && service.description.length > 300 && (
            <button
              className="show-more-button"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? "Arată mai puțin" : "Arată mai mult"}
              <ChevronDown size={16} className={showFullDescription ? "rotate" : ""} />
            </button>
          )}
        </div>

        <div className="service-provider-section">
          <h2>Despre prestator</h2>
          <div className="provider-card">
            <div className="provider-info">
              <img
                src={getImageUrl(service.provider?.image)}
                alt={service.provider?.name}
                className="provider-image"
                onError={handleImageError}
              />
              <div className="provider-details">
                <h3 className="provider-name">{service.provider?.name}</h3>
                <div className="provider-rating">
                  <Star size={16} fill="#ffc939" color="#ffc939" />
                  <span>
                    {service.provider?.rating || "N/A"} ({service.provider?.review_count || 0} recenzii)
                  </span>
                </div>
                <div className="provider-meta">
                  <div className="response-time">
                    <Clock size={14} />
                    <span>Răspunde {service.provider?.response_time || "în câteva ore"}</span>
                  </div>
                  <div className="member-since">
                    <Calendar size={14} />
                    <span>Membru din {new Date(service.created_at).toLocaleDateString('ro-RO', {month: 'long', year: 'numeric'})}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="provider-actions">
              <Link to={`/profile/${service.provider?.id}`} className="view-profile-button">
                Vezi profil
              </Link>
              <Link to={`/messages/${service.provider?.id}`} className="message-button">
                <MessageCircle size={18} />
                Trimite mesaj
              </Link>
            </div>
          </div>
        </div>

        {/* We'll implement reviews later when we have the API */}
        {displayedReviews.length > 0 && (
          <div className="service-reviews-section">
            <div className="section-header">
              <h2>Recenzii ({service.review_count || 0})</h2>
              <div className="overall-rating">
                <Star size={20} fill="#ffc939" color="#ffc939" />
                <span className="rating-value">{service.rating}</span>
              </div>
            </div>

            <div className="reviews-list">
              {displayedReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <img src={review.user.image} alt={review.user.name} className="reviewer-image" />
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">{review.user.name}</h4>
                        <span className="review-date">{review.date}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? "#ffc939" : "#e0e0e0"}
                          color={i < review.rating ? "#ffc939" : "#e0e0e0"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>

            {service.reviews && service.reviews.length > 2 && (
              <button
                className="show-all-reviews-button"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? "Arată mai puține recenzii" : "Arată toate recenziile"}
                <ChevronDown size={16} className={showAllReviews ? "rotate" : ""} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceDetailsPage


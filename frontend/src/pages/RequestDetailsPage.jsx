"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Share2,
  Heart,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Loader,
  DollarSign,
} from "lucide-react"
import "./RequestDetailsPage.css"
import { getRequestById } from '../services/requestApi'
import { useAuth } from "../contexts/AuthContext"
import { addRequestToFavorites, removeRequestFromFavorites, isRequestFavorited } from "../services/favoriteApi"
import { getImageUrl, handleImageError, getProfileImageUrl } from "../utils/imageUtils"
import { ChakraProvider, Avatar } from '@chakra-ui/react'

const RequestDetailsPage = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offerPrice, setOfferPrice] = useState("")
  const [offerDescription, setOfferDescription] = useState("")
  const [offerErrors, setOfferErrors] = useState({})
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  // Check if the current user is the owner of the request
  const isOwnRequest = user && request?.user?.id === user.id

  // Fetch request data and favorite status when component mounts
  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setLoading(true)
        const requestData = await getRequestById(requestId)
        setRequest(requestData)
        setError(null)

        // Check if request is favorited
        if (user) {
          try {
            const token = localStorage.getItem('token')
            const favorited = await isRequestFavorited(requestId, token)
            setIsFavorite(favorited)
          } catch (favoriteError) {
            console.error("Error checking favorite status:", favoriteError)
            // Don't set the main error, just log it
          }
        }
      } catch (error) {
        console.error('Error fetching request:', error)
        setError('Failed to load request details')
      } finally {
        setLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId, user])

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
        await removeRequestFromFavorites(requestId, token)
      } else {
        await addRequestToFavorites(requestId, token)
      }
      
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spinner" />
        <p>Se încarcă detaliile cererii...</p>
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
        <button onClick={() => navigate("/requests")} className="back-button">
          Înapoi la cereri
        </button>
      </div>
    )
  }

  // If request not found
  if (!request) {
    return (
      <div className="request-not-found">
        <AlertTriangle size={48} />
        <h2>Cerere negăsită</h2>
        <p>Cererea căutată nu există sau a fost ștearsă.</p>
        <button onClick={() => navigate("/requests")} className="back-button">
          Înapoi la cereri
        </button>
      </div>
    )
  }

  const nextImage = () => {
    if (request.images && request.images.length > 0) {
      setActiveImageIndex((prev) => (prev === request.images.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (request.images && request.images.length > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? request.images.length - 1 : prev - 1))
    }
  }

  const handleSubmitOffer = (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = {}
    if (!offerPrice.trim()) {
      errors.price = "Prețul este obligatoriu"
    } else if (isNaN(offerPrice) || Number(offerPrice) <= 0) {
      errors.price = "Prețul trebuie să fie un număr pozitiv"
    }
    
    if (!offerDescription.trim()) {
      errors.description = "Descrierea este obligatorie"
    } else if (offerDescription.length < 20) {
      errors.description = "Descrierea trebuie să aibă cel puțin 20 de caractere"
    }
    
    setOfferErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      setIsSubmittingOffer(true)
      
      // Here you would submit the offer to the API
      // For now, we'll just simulate a successful submission
      setTimeout(() => {
        alert("Oferta ta a fost trimisă cu succes!")
        setOfferPrice("")
        setOfferDescription("")
        setIsSubmittingOffer(false)
      }, 1000)
    }
  }

  return (
    <div className="request-details-page">
      <header className="request-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <div className="header-actions">
          <button
            className="action-button"
            onClick={() => window.navigator.share({ title: request.title, url: window.location.href })}
          >
            <Share2 size={20} />
          </button>
          {!isOwnRequest && (
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
          )}
        </div>
      </header>

      <div className="request-content">
        <div className="request-main">
          {request.images && request.images.length > 0 && (
            <div className="request-gallery">
              <div className="gallery-main">
                <img
                  src={getImageUrl(request.images[activeImageIndex].image_url)}
                  alt={request.title}
                  className="main-image"
                  onError={handleImageError}
                />

                {request.images.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={prevImage}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="gallery-nav next" onClick={nextImage}>
                      <ChevronRight size={24} />
                    </button>

                    <div className="gallery-indicators">
                      {request.images.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === activeImageIndex ? "active" : ""}`}
                          onClick={() => setActiveImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="request-header-info">
            <div className="request-meta-top">
              <span className="request-category">{request.category}</span>
              <span className="request-time">{request.postedAt}</span>
            </div>

            <h1 className="request-title">{request.title}</h1>

            <div className="request-meta">
              <div className="meta-item">
                <MapPin size={16} />
                <span>{request.location}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>Termen: {request.deadline}</span>
              </div>
              <div className="meta-item">
                <DollarSign size={16} />
                <span>
                  Buget: {request.budget} {request.currency}
                </span>
              </div>
            </div>
          </div>

          <div className="request-description">
            <h2>Descriere</h2>
            <div className={`description-content ${showFullDescription ? "expanded" : ""}`}>
              <p>{request.description}</p>
            </div>
            {request.description && request.description.length > 300 && (
              <button
                className="show-more-button"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Arată mai puțin" : "Arată mai mult"}
                <ChevronDown size={16} className={showFullDescription ? "rotate" : ""} />
              </button>
            )}
          </div>

          <div className="request-user-section">
            <h2>Despre solicitant</h2>
            <div className="user-card">
              <div className="user-info">
                <Avatar
                  src={getProfileImageUrl(request.user)}
                  name={request.user?.name}
                  size="xl"
                  bg={!getProfileImageUrl(request.user) ? "blue.500" : undefined}
                  color="white"
                  className="user-image"
                />
                <div className="user-details">
                  <div className="user-name-wrapper">
                    <h3>{request.user?.name}</h3>
                    {request.user?.verified && (
                      <span className="verified-badge" title="Utilizator verificat">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="user-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {request.user?.rating || "N/A"} ({request.user?.reviewCount || 0} recenzii)
                    </span>
                  </div>
                </div>
              </div>
              {!isOwnRequest && (
                <div className="user-actions">
                  <Link to={`/chat/${request.user?.id}`} className="contact-button">
                    <MessageCircle size={20} />
                    Contactează
                  </Link>
                  <Link to={`/profile/${request.user?.id}`} className="view-profile-button">
                    Vezi profil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isOwnRequest && (
          <div className="make-offer-section">
            <h2>Trimite o ofertă</h2>
            <form onSubmit={handleSubmitOffer} className="offer-form">
              <div className="form-group">
                <label htmlFor="offerPrice">Preț propus ({request.currency})</label>
                <div className="price-input">
                  <DollarSign size={20} />
                  <input
                    type="number"
                    id="offerPrice"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Introdu prețul propus"
                  />
                </div>
                {offerErrors.price && <span className="error">{offerErrors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="offerDescription">Descriere ofertă</label>
                <textarea
                  id="offerDescription"
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  placeholder="Descrie oferta ta..."
                  rows={4}
                />
                {offerErrors.description && <span className="error">{offerErrors.description}</span>}
              </div>

              <button type="submit" className="submit-offer" disabled={isSubmittingOffer}>
                {isSubmittingOffer ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Trimite oferta
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestDetailsPage


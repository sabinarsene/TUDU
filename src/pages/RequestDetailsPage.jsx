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
  FileText,
  DollarSign,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Loader,
} from "lucide-react"
import "./RequestDetailsPage.css"
import { fetchRequestById } from "../services/requestApi"

const RequestDetailsPage = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offerPrice, setOfferPrice] = useState("")
  const [offerDescription, setOfferDescription] = useState("")
  const [offerErrors, setOfferErrors] = useState({})
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  // Funcție pentru a obține URL-ul complet al imaginii
  const getImageUrl = (path) => {
    if (!path) return '/placeholder.svg';
    
    // Verificăm dacă este un URL absolut
    if (path.startsWith('http')) {
      return path;
    }
    
    // Altfel, construim URL-ul complet
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${API_URL}${path}`;
  };

  // Funcție pentru a gestiona erorile de încărcare a imaginilor
  const handleImageError = (e) => {
    e.target.src = '/placeholder.svg';
  };

  // Fetch request data when component mounts
  useEffect(() => {
    const getRequestDetails = async () => {
      try {
        setLoading(true)
        const data = await fetchRequestById(requestId)
        setRequest(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching request details:", err)
        setError("Nu am putut încărca detaliile cererii. Vă rugăm încercați din nou mai târziu.")
      } finally {
        setLoading(false)
      }
    }

    getRequestDetails()
  }, [requestId])

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
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
          <button className={`action-button ${isFavorite ? "favorite" : ""}`} onClick={toggleFavorite}>
            <Heart size={20} fill={isFavorite ? "#ff1d68" : "none"} />
          </button>
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
                <img
                  src={getImageUrl(request.user.image)}
                  alt={request.user.name}
                  className="user-image"
                  onError={handleImageError}
                />
                <div className="user-details">
                  <div className="user-name-wrapper">
                    <h3>{request.user.name}</h3>
                    {request.user.verified && (
                      <span className="verified-badge" title="Utilizator verificat">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="user-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {request.user.rating || "N/A"} ({request.user.reviewCount || 0} recenzii)
                    </span>
                  </div>
                </div>
              </div>
              <Link to={`/messages/${request.user.id}`} className="contact-button">
                <MessageCircle size={18} />
                <span>Contactează</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="request-sidebar">
          <div className="offer-card">
            <h3>Trimite o ofertă</h3>
            <form className="offer-form" onSubmit={handleSubmitOffer}>
              <div className="form-group">
                <label htmlFor="offerPrice">Prețul tău (RON) *</label>
                <input
                  type="number"
                  id="offerPrice"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Ex: 150"
                  min="0"
                  step="1"
                  className={offerErrors.price ? "error" : ""}
                />
                {offerErrors.price && <div className="error-message">{offerErrors.price}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="offerDescription">Descrierea ofertei *</label>
                <textarea
                  id="offerDescription"
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  placeholder="Descrie oferta ta, experiența relevantă, disponibilitatea, etc."
                  rows="4"
                  className={offerErrors.description ? "error" : ""}
                ></textarea>
                {offerErrors.description && <div className="error-message">{offerErrors.description}</div>}
              </div>

              <button type="submit" className="submit-offer-button" disabled={isSubmittingOffer}>
                {isSubmittingOffer ? "Se trimite..." : "Trimite oferta"}
              </button>
            </form>
          </div>

          <div className="contact-info-card">
            <h3>Preferință de contact</h3>
            <div className="contact-preference">
              {request.contactPreference === "orice" && <p>Orice metodă de contact</p>}
              {request.contactPreference === "mesaj" && <p>Doar prin mesaje</p>}
              {request.contactPreference === "telefon" && <p>Doar prin telefon</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailsPage


"use client"

import { useState } from "react"
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
} from "lucide-react"
import "./RequestDetailsPage.css"

// Sample service requests data
const SAMPLE_REQUESTS = {
  1: {
    id: 1,
    title: "Caut instalator pentru reparație urgentă",
    category: "Instalații",
    budget: {
      min: 100,
      max: 200,
      currency: "RON",
    },
    location: "București, Sector 3",
    deadline: "În 2 zile",
    postedAt: "Acum 3 ore",
    description: `Am o țeavă spartă în baie care trebuie reparată urgent. Disponibilitate imediată necesară.

    Problema a apărut ieri și am încercat să o repar singur, dar nu am reușit. Apa se scurge constant și am fost nevoit să închid robinetul principal.

    Caut un instalator profesionist care poate veni astăzi sau mâine să rezolve problema. Prefer persoane cu experiență și recenzii bune.
    
    Bugetul este negociabil pentru o intervenție rapidă.`,
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    user: {
      id: 101,
      name: "Andreea M.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.7,
      reviewCount: 8,
      memberSince: "Martie 2023",
      responseTime: "sub 1 oră",
      verified: true,
    },
    contactPreference: "orice",
    similarRequests: [2, 6],
  },
  2: {
    id: 2,
    title: "Curățenie generală apartament 3 camere",
    category: "Curățenie",
    budget: {
      min: 200,
      max: 300,
      currency: "RON",
    },
    location: "Cluj-Napoca",
    deadline: "Săptămâna viitoare",
    postedAt: "Acum 1 zi",
    description: "Caut serviciu de curățenie profesională pentru un apartament de 3 camere. Preferabil cu produse eco.",
    images: ["/placeholder.svg?height=400&width=600"],
    user: {
      id: 102,
      name: "Mihai D.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      reviewCount: 12,
      memberSince: "Ianuarie 2023",
      responseTime: "sub 2 ore",
      verified: true,
    },
    contactPreference: "mesaj",
    similarRequests: [1, 3],
  },
  3: {
    id: 3,
    title: "Montaj mobilă IKEA",
    category: "Mobilă",
    budget: {
      min: 150,
      max: 250,
      currency: "RON",
    },
    location: "Timișoara",
    deadline: "În weekend",
    postedAt: "Acum 2 zile",
    description:
      "Am nevoie de ajutor pentru montarea unui dulap și a unei canapele de la IKEA. Persoana trebuie să aibă scule proprii.",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    user: {
      id: 103,
      name: "Elena P.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.5,
      reviewCount: 5,
      memberSince: "Aprilie 2023",
      responseTime: "sub 3 ore",
      verified: false,
    },
    contactPreference: "telefon",
    similarRequests: [2, 6],
  },
  4: {
    id: 4,
    title: "Profesor de matematică pentru elev clasa a 8-a",
    category: "Educație",
    budget: {
      min: 70,
      max: 100,
      currency: "RON/oră",
    },
    location: "Online",
    deadline: "Permanent",
    postedAt: "Acum 5 zile",
    description:
      "Caut profesor pentru meditații la matematică pentru pregătirea examenului de capacitate. 2 ședințe pe săptămână.",
    images: [],
    user: {
      id: 104,
      name: "Cristian V.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 5.0,
      reviewCount: 15,
      memberSince: "Februarie 2023",
      responseTime: "sub 1 oră",
      verified: true,
    },
    contactPreference: "orice",
    similarRequests: [5],
  },
  5: {
    id: 5,
    title: "Transport mobilă la mutare",
    category: "Transport",
    budget: {
      min: 300,
      max: 500,
      currency: "RON",
    },
    location: "Brașov",
    deadline: "15 Iulie",
    postedAt: "Acum 3 zile",
    description:
      "Am nevoie de o dubă și ajutor pentru mutarea mobilierului dintr-un apartament cu 2 camere la o distanță de aproximativ 5 km.",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    user: {
      id: 105,
      name: "Alexandru T.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.6,
      reviewCount: 9,
      memberSince: "Decembrie 2022",
      responseTime: "sub 4 ore",
      verified: true,
    },
    contactPreference: "mesaj",
    similarRequests: [3, 6],
  },
  6: {
    id: 6,
    title: "Reparație frigider Samsung",
    category: "Electrocasnice",
    budget: {
      min: 100,
      max: 300,
      currency: "RON",
    },
    location: "Constanța",
    deadline: "Cât mai curând",
    postedAt: "Acum 12 ore",
    description: "Frigiderul nu mai răcește corespunzător. Model Samsung RB31FDRNDSA. Caut tehnician cu experiență.",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    user: {
      id: 106,
      name: "Maria N.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.8,
      reviewCount: 11,
      memberSince: "Octombrie 2022",
      responseTime: "sub 2 ore",
      verified: false,
    },
    contactPreference: "telefon",
    similarRequests: [1, 5],
  },
}

const RequestDetailsPage = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [offerMessage, setOfferMessage] = useState("")
  const [offerPrice, setOfferPrice] = useState("")
  const [offerErrors, setOfferErrors] = useState({})

  // Get request data
  const request = SAMPLE_REQUESTS[requestId]

  // If request not found
  if (!request) {
    return (
      <div className="request-not-found">
        <AlertTriangle size={48} />
        <h2>Cerere negăsită</h2>
        <p>Cererea căutată nu există sau a fost ștearsă.</p>
        <button onClick={() => navigate("/requests")} className="back-home-button">
          Înapoi la cereri
        </button>
      </div>
    )
  }

  // Get similar requests
  const similarRequests = request.similarRequests ? request.similarRequests.map((id) => SAMPLE_REQUESTS[id]) : []

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // Handle image navigation
  const nextImage = () => {
    if (request.images && request.images.length > 1) {
      setActiveImageIndex((prev) => (prev === request.images.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (request.images && request.images.length > 1) {
      setActiveImageIndex((prev) => (prev === 0 ? request.images.length - 1 : prev - 1))
    }
  }

  // Handle offer submission
  const handleSubmitOffer = (e) => {
    e.preventDefault()

    // Validate form
    const errors = {}
    if (!offerMessage.trim()) {
      errors.message = "Te rugăm să introduci un mesaj"
    }

    if (!offerPrice.trim()) {
      errors.price = "Te rugăm să introduci un preț"
    } else if (isNaN(Number.parseFloat(offerPrice)) || Number.parseFloat(offerPrice) <= 0) {
      errors.price = "Te rugăm să introduci un preț valid"
    }

    if (Object.keys(errors).length > 0) {
      setOfferErrors(errors)
      return
    }

    // Simulate sending offer
    setIsApplying(true)

    setTimeout(() => {
      console.log("Offer submitted:", { message: offerMessage, price: offerPrice })
      navigate(`/messages/new/${request.user.id}?requestId=${request.id}`)
    }, 1000)
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

      {request.images && request.images.length > 0 ? (
        <div className="request-gallery">
          <div className="gallery-main">
            <img
              src={request.images[activeImageIndex] || "/placeholder.svg"}
              alt={request.title}
              className="main-image"
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

          {request.images.length > 1 && (
            <div className="gallery-thumbnails">
              {request.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="request-no-image">
          <FileText size={48} />
          <p>Această cerere nu are imagini atașate</p>
        </div>
      )}

      <div className="request-content">
        <div className="request-main">
          <div className="request-header-info">
            <span className="request-category">{request.category}</span>
            <span className="request-time">{request.postedAt}</span>
          </div>

          <h1 className="request-title">{request.title}</h1>

          <div className="request-meta">
            <div className="meta-item">
              <MapPin size={18} />
              <span>{request.location}</span>
            </div>
            <div className="meta-item">
              <Clock size={18} />
              <span>Termen: {request.deadline}</span>
            </div>
          </div>

          <div className="request-budget">
            <DollarSign size={20} />
            <span className="budget-label">Buget:</span>
            <span className="budget-amount">
              {request.budget.min} - {request.budget.max} {request.budget.currency}
            </span>
          </div>

          <div className="request-description">
            <h2>Descriere</h2>
            <div className={`description-content ${showFullDescription ? "expanded" : ""}`}>
              {request.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {request.description.length > 200 && (
              <button className="show-more-button" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? "Arată mai puțin" : "Arată mai mult"}
                <ChevronDown size={18} className={showFullDescription ? "rotate" : ""} />
              </button>
            )}
          </div>

          <div className="request-client">
            <h2>Despre client</h2>
            <div className="client-card">
              <Link to={`/profile/${request.user.id}`} className="client-info">
                <img src={request.user.image || "/placeholder.svg"} alt={request.user.name} className="client-image" />
                <div className="client-details">
                  <div className="client-name-wrapper">
                    <h3>{request.user.name}</h3>
                    {request.user.verified && (
                      <span className="verified-badge" title="Utilizator verificat">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="client-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {request.user.rating} ({request.user.reviewCount} recenzii)
                    </span>
                  </div>
                  <div className="client-meta">
                    <span>Răspunde {request.user.responseTime}</span>
                    <span>•</span>
                    <span>Membru din {request.user.memberSince}</span>
                  </div>
                </div>
              </Link>

              <Link to={`/messages/new/${request.user.id}`} className="contact-button">
                <MessageCircle size={18} />
                <span>Contactează</span>
              </Link>

              <div className="contact-preference">
                <h4>Preferință de contact:</h4>
                <span className="preference-value">
                  {request.contactPreference === "orice" && "Orice metodă de contact"}
                  {request.contactPreference === "mesaj" && "Preferă mesaje"}
                  {request.contactPreference === "telefon" && "Preferă apeluri telefonice"}
                </span>
              </div>
            </div>
          </div>

          {similarRequests && similarRequests.length > 0 && (
            <div className="similar-requests">
              <h2>Cereri similare</h2>
              <div className="similar-requests-list">
                {similarRequests.map((similarRequest) => (
                  <Link to={`/request/${similarRequest.id}`} key={similarRequest.id} className="similar-request-card">
                    <div className="similar-request-image">
                      <img
                        src={(similarRequest.images && similarRequest.images[0]) || "/placeholder.svg"}
                        alt={similarRequest.title}
                      />
                    </div>
                    <div className="similar-request-content">
                      <h3>{similarRequest.title}</h3>
                      <div className="similar-request-meta">
                        <div className="similar-request-budget">
                          {similarRequest.budget.min} - {similarRequest.budget.max} {similarRequest.budget.currency}
                        </div>
                        <div className="similar-request-deadline">{similarRequest.deadline}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="request-sidebar">
          <div className="offer-card">
            <h3>Răspunde la această cerere</h3>

            {isApplying ? (
              <div className="applying-state">
                <div className="loader"></div>
                <p>Se trimite oferta ta...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="offer-form">
                <div className="form-group">
                  <label htmlFor="offerMessage">Mesajul tău</label>
                  <textarea
                    id="offerMessage"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Descrie cum poți ajuta și experiența ta relevantă..."
                    rows="4"
                    className={offerErrors.message ? "error" : ""}
                  ></textarea>
                  {offerErrors.message && <div className="error-message">{offerErrors.message}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="offerPrice">Prețul tău (RON)</label>
                  <input
                    type="number"
                    id="offerPrice"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Introdu prețul tău"
                    className={offerErrors.price ? "error" : ""}
                  />
                  {offerErrors.price && <div className="error-message">{offerErrors.price}</div>}
                </div>

                <button type="submit" className="submit-offer-button">
                  Trimite oferta
                </button>
              </form>
            )}

            <div className="offer-note">
              <p>Prin trimiterea ofertei, vei începe o conversație cu {request.user.name}.</p>
            </div>
          </div>

          <div className="client-mini-card">
            <Link to={`/profile/${request.user.id}`} className="client-mini-info">
              <img
                src={request.user.image || "/placeholder.svg"}
                alt={request.user.name}
                className="client-mini-image"
              />
              <div>
                <div className="client-mini-name">
                  {request.user.name}
                  {request.user.verified && (
                    <span className="verified-mini-badge">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div className="client-mini-rating">
                  <Star size={14} fill="#ffc939" color="#ffc939" />
                  <span>{request.user.rating}</span>
                </div>
              </div>
            </Link>
            <span className="response-time">Răspunde {request.user.responseTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailsPage


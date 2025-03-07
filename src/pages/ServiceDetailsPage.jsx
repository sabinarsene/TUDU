"use client"

import { useState } from "react"
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
  Check,
  AlertTriangle,
} from "lucide-react"
import "./ServiceDetailsPage.css"

// Sample service data
const SAMPLE_SERVICES = {
  1: {
    id: 1,
    title: "Reparații instalații sanitare",
    category: "Instalații",
    price: 150,
    currency: "RON",
    priceType: "pe oră",
    location: "București",
    rating: 4.8,
    reviewCount: 24,
    description: `Ofer servicii profesionale de reparații instalații sanitare pentru apartamente și case. 
    
    Serviciile includ:
    - Reparații robineți și baterii
    - Desfundare țevi și canalizare
    - Montaj și înlocuire obiecte sanitare
    - Detectare și reparare scurgeri
    - Înlocuire țevi și racorduri
    
    Experiență de peste 10 ani în domeniu. Disponibil pentru urgențe 7 zile din 7. Prețuri competitive și calitate garantată.`,
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    provider: {
      id: 101,
      name: "Alexandru Munteanu",
      image: "./profile-photos/alex.jpg", // Calea actualizată
      rating: 4.8,
      reviewCount: 42,
      responseTime: "sub 1 oră",
      memberSince: "Aprilie 2023",
      verified: true,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri"],
      hours: "08:00 - 18:00",
    },
    reviews: [
      {
        id: 1,
        user: {
          name: "Denis V.",
          image: "./profile-photos/denis.jpg", // Calea actualizată
        },
        rating: 5,
        date: "15 Iulie 2023",
        comment: "Serviciu excelent, a rezolvat problema rapid și profesionist. Recomand cu încredere!",
      },
      {
        id: 2,
        user: {
          name: "Florin P.",
          image: "./profile-photos/florin.jpg", // Calea actualizată
        },
        rating: 4,
        date: "3 Iunie 2023",
        comment: "Bun profesionist, a venit la timp și a rezolvat problema. Prețuri rezonabile.",
      },
      {
        id: 3,
        user: {
          name: "Stefan C.",
          image: "./profile-photos/stefan.jpg", // Calea actualizată
        },
        rating: 5,
        date: "22 Mai 2023",
        comment:
          "Am avut o problemă urgentă cu o țeavă spartă și a venit în mai puțin de o oră. Foarte mulțumită de servicii!",
      },
    ],
    similarServices: [2, 6],
  },
  2: {
    id: 2,
    title: "Curățenie apartament",
    category: "Curățenie",
    price: 100,
    currency: "RON",
    priceType: "pe ședință",
    location: "Cluj-Napoca",
    rating: 4.6,
    reviewCount: 18,
    description:
      "Servicii profesionale de curățenie pentru apartamente și case. Folosesc produse eco-friendly și echipamente profesionale. Experiență de peste 5 ani în domeniu.",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    provider: {
      id: 102,
      name: "Maria Dumitrescu",
      image: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      reviewCount: 31,
      responseTime: "sub 2 ore",
      memberSince: "Ianuarie 2023",
      verified: true,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"],
      hours: "09:00 - 17:00",
    },
    reviews: [],
    similarServices: [1, 3],
  },
  3: {
    id: 3,
    title: "Montaj mobilă",
    category: "Mobilă",
    price: 200,
    currency: "RON",
    priceType: "pe serviciu",
    location: "Timișoara",
    rating: 4.9,
    reviewCount: 32,
    description:
      "Servicii de montaj mobilă la domiciliu. Montez orice tip de mobilier, inclusiv IKEA, Dedeman, Jysk etc. Experiență și profesionalism.",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    provider: {
      id: 103,
      name: "Mihai Popescu",
      image: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      reviewCount: 47,
      responseTime: "sub 1 oră",
      memberSince: "Martie 2022",
      verified: true,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"],
      hours: "08:00 - 20:00",
    },
    reviews: [],
    similarServices: [2, 6],
  },
  4: {
    id: 4,
    title: "Lecții de pian",
    category: "Educație",
    price: 80,
    currency: "RON",
    priceType: "pe oră",
    location: "Iași",
    rating: 5.0,
    reviewCount: 15,
    description:
      "Ofer lecții de pian pentru toate nivelurile, de la începători la avansați. Absolventă a Conservatorului, cu experiență de predare de peste 8 ani.",
    images: ["/placeholder.svg?height=400&width=600"],
    provider: {
      id: 104,
      name: "Andreea Constantinescu",
      image: "/placeholder.svg?height=100&width=100",
      rating: 5.0,
      reviewCount: 22,
      responseTime: "sub 3 ore",
      memberSince: "Septembrie 2022",
      verified: true,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri"],
      hours: "14:00 - 20:00",
    },
    reviews: [],
    similarServices: [5],
  },
  5: {
    id: 5,
    title: "Transport marfă",
    category: "Transport",
    price: 250,
    currency: "RON",
    priceType: "pe serviciu",
    location: "Brașov",
    rating: 4.7,
    reviewCount: 41,
    description:
      "Transport marfă și mutări în Brașov și împrejurimi. Dubă spațioasă, servicii rapide și sigure. Disponibil și pentru transporturi în afara orașului.",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    provider: {
      id: 105,
      name: "Cristian Vasilescu",
      image: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      reviewCount: 53,
      responseTime: "sub 2 ore",
      memberSince: "Iulie 2022",
      verified: true,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"],
      hours: "07:00 - 19:00",
    },
    reviews: [],
    similarServices: [3, 6],
  },
  6: {
    id: 6,
    title: "Reparații electrocasnice",
    category: "Electrocasnice",
    price: 120,
    currency: "RON",
    priceType: "pe oră",
    location: "Constanța",
    rating: 4.5,
    reviewCount: 28,
    description:
      "Reparații pentru toate tipurile de electrocasnice: frigidere, mașini de spălat, cuptoare, plite etc. Deplasare la domiciliu în Constanța și împrejurimi.",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    provider: {
      id: 106,
      name: "Bogdan Tomescu",
      image: "/placeholder.svg?height=100&width=100",
      rating: 4.5,
      reviewCount: 36,
      responseTime: "sub 4 ore",
      memberSince: "Octombrie 2022",
      verified: false,
    },
    availability: {
      days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri"],
      hours: "09:00 - 18:00",
    },
    reviews: [],
    similarServices: [1, 5],
  },
}

const ServiceDetailsPage = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Get service data
  const service = SAMPLE_SERVICES[serviceId]

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

  // Get similar services
  const similarServices = service.similarServices.map((id) => SAMPLE_SERVICES[id])

  // Handle image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1))
  }

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // Reviews to display
  const displayedReviews = showAllReviews ? service.reviews || [] : (service.reviews || []).slice(0, 2)

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
          <button className={`action-button ${isFavorite ? "favorite" : ""}`} onClick={toggleFavorite}>
            <Heart size={20} fill={isFavorite ? "#ff1d68" : "none"} />
          </button>
        </div>
      </header>

      <div className="service-gallery">
        <div className="gallery-main">
          <img
            src={service.images[activeImageIndex] || "/placeholder.svg"}
            alt={service.title}
            className="main-image"
          />

          {service.images.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prevImage}>
                <ChevronLeft size={24} />
              </button>
              <button className="gallery-nav next" onClick={nextImage}>
                <ChevronRight size={24} />
              </button>

              <div className="gallery-indicators">
                {service.images.map((_, index) => (
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

        {service.images.length > 1 && (
          <div className="gallery-thumbnails">
            {service.images.map((image, index) => (
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

      <div className="service-content">
        <div className="service-main">
          <div className="service-header-info">
            <span className="service-category">{service.category}</span>
            <div className="service-rating">
              <Star size={18} fill="#ffc939" color="#ffc939" />
              <span>
                {service.rating} ({service.reviewCount} recenzii)
              </span>
            </div>
          </div>

          <h1 className="service-title">{service.title}</h1>

          <div className="service-location">
            <MapPin size={18} />
            <span>{service.location}</span>
          </div>

          <div className="service-price">
            <span className="price-amount">
              {service.price} {service.currency}
            </span>
            <span className="price-type">{service.priceType}</span>
          </div>

          <div className="service-description">
            <h2>Descriere</h2>
            <div className={`description-content ${showFullDescription ? "expanded" : ""}`}>
              {service.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {service.description.length > 200 && (
              <button className="show-more-button" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? "Arată mai puțin" : "Arată mai mult"}
                <ChevronDown size={18} className={showFullDescription ? "rotate" : ""} />
              </button>
            )}
          </div>

          <div className="service-availability">
            <h2>Disponibilitate</h2>
            <div className="availability-details">
              <div className="availability-item">
                <Calendar size={18} />
                <span>{service.availability.days.join(", ")}</span>
              </div>
              <div className="availability-item">
                <Clock size={18} />
                <span>{service.availability.hours}</span>
              </div>
            </div>
          </div>

          <div className="service-provider">
            <h2>Despre prestator</h2>
            <div className="provider-card">
              <Link to={`/profile/${service.provider.id}`} className="provider-info">
                <img
                  src={service.provider.image || "/placeholder.svg"}
                  alt={service.provider.name}
                  className="provider-image"
                />
                <div className="provider-details">
                  <div className="provider-name-wrapper">
                    <h3>{service.provider.name}</h3>
                    {service.provider.verified && (
                      <span className="verified-badge" title="Prestator verificat">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="provider-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {service.provider.rating} ({service.provider.reviewCount} recenzii)
                    </span>
                  </div>
                  <div className="provider-meta">
                    <span>Răspunde {service.provider.responseTime}</span>
                    <span>•</span>
                    <span>Membru din {service.provider.memberSince}</span>
                  </div>
                </div>
              </Link>

              <Link to={`/messages/new/${service.provider.id}`} className="contact-button">
                <MessageCircle size={18} />
                <span>Contactează</span>
              </Link>
            </div>
          </div>

          {service.reviews && service.reviews.length > 0 && (
            <div className="service-reviews">
              <div className="reviews-header">
                <h2>Recenzii ({service.reviews.length})</h2>
                <div className="reviews-rating">
                  <Star size={18} fill="#ffc939" color="#ffc939" />
                  <span>{service.rating}</span>
                </div>
              </div>

              <div className="reviews-list">
                {displayedReviews &&
                  displayedReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <img
                            src={review.user.image || "/placeholder.svg"}
                            alt={review.user.name}
                            className="reviewer-image"
                          />
                          <div>
                            <div className="reviewer-name">{review.user.name}</div>
                            <div className="review-date">{review.date}</div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < review.rating ? "#ffc939" : "transparent"}
                              color={i < review.rating ? "#ffc939" : "#ccc"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
              </div>

              {service.reviews.length > 2 && (
                <button className="show-all-reviews" onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? "Arată mai puține recenzii" : "Arată toate recenziile"}
                </button>
              )}
            </div>
          )}

          {similarServices && similarServices.length > 0 && (
            <div className="similar-services">
              <h2>Servicii similare</h2>
              <div className="similar-services-list">
                {similarServices.map((similarService) => (
                  <Link to={`/service/${similarService.id}`} key={similarService.id} className="similar-service-card">
                    <div className="similar-service-image">
                      <img src={similarService.images[0] || "/placeholder.svg"} alt={similarService.title} />
                    </div>
                    <div className="similar-service-content">
                      <h3>{similarService.title}</h3>
                      <div className="similar-service-meta">
                        <div className="similar-service-rating">
                          <Star size={14} fill="#ffc939" color="#ffc939" />
                          <span>{similarService.rating}</span>
                        </div>
                        <div className="similar-service-price">
                          {similarService.price} {similarService.currency}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="service-sidebar">
          <div className="booking-card">
            <h3>Rezervă acest serviciu</h3>
            <div className="booking-price">
              <span className="price-amount">
                {service.price} {service.currency}
              </span>
              <span className="price-type">{service.priceType}</span>
            </div>

            <div className="booking-availability">
              <div className="availability-item">
                <Calendar size={18} />
                <span>{service.availability.days.join(", ")}</span>
              </div>
              <div className="availability-item">
                <Clock size={18} />
                <span>{service.availability.hours}</span>
              </div>
            </div>

            <Link to={`/booking/${service.id}`} className="book-button">
              Rezervă acum
            </Link>

            <Link to={`/messages/new/${service.provider.id}`} className="contact-provider-button">
              <MessageCircle size={18} />
              <span>Contactează prestatorul</span>
            </Link>
          </div>

          <div className="provider-mini-card">
            <Link to={`/profile/${service.provider.id}`} className="provider-mini-info">
              <img
                src={service.provider.image || "/placeholder.svg"}
                alt={service.provider.name}
                className="provider-mini-image"
              />
              <div>
                <div className="provider-mini-name">
                  {service.provider.name}
                  {service.provider.verified && (
                    <span className="verified-mini-badge">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div className="provider-mini-rating">
                  <Star size={14} fill="#ffc939" color="#ffc939" />
                  <span>{service.provider.rating}</span>
                </div>
              </div>
            </Link>
            <span className="response-time">Răspunde {service.provider.responseTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetailsPage


"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, Star, Settings, Edit, MapPin, Calendar, MessageCircle, Clock, CheckCircle } from "lucide-react"
import "./ProfilePage.css"

// Update SAMPLE_USER to use real profile photo
const SAMPLE_USER = {
  id: 1,
  name: "Alexandru Munteanu",
  image: "./profile-photos/alex.jpg", // Calea actualizată
  location: "București, România",
  memberSince: "Aprilie 2023",
  rating: 4.8,
  reviewCount: 24,
  bio: "Instalator profesionist cu peste 10 ani de experiență în domeniu. Specializat în reparații și instalații sanitare pentru apartamente și case.",
  services: [
    {
      id: 1,
      title: "Reparații instalații sanitare",
      category: "Instalații",
      price: 150,
      currency: "RON",
      image: "/placeholder.svg?height=80&width=120",
    },
    {
      id: 2,
      title: "Montaj centrale termice",
      category: "Instalații",
      price: 350,
      currency: "RON",
      image: "/placeholder.svg?height=80&width=120",
    },
  ],
  bookedServices: [
    {
      id: 101,
      title: "Curățenie apartament",
      category: "Curățenie",
      price: 200,
      currency: "RON",
      image: "/placeholder.svg?height=80&width=120",
      provider: {
        name: "Denis V.",
        rating: 4.9,
      },
      status: "completed",
      date: "15 Iunie 2023",
    },
    {
      id: 102,
      title: "Transport mobilă",
      category: "Transport",
      price: 300,
      currency: "RON",
      image: "/placeholder.svg?height=80&width=120",
      provider: {
        name: "Vlad T.",
        rating: 4.7,
      },
      status: "scheduled",
      date: "25 Iulie 2023",
    },
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: "Florin P.",
        image: "./profile-photos/florin.jpg", // Calea actualizată
      },
      rating: 5,
      date: "15 Iulie 2023",
      comment: "Serviciu excelent, a rezolvat problema rapid și profesionist. Recomand cu încredere!",
    },
    {
      id: 2,
      user: {
        name: "Stefan C.",
        image: "./profile-photos/stefan.jpg", // Calea actualizată
      },
      rating: 4,
      date: "3 Iunie 2023",
      comment: "Bun profesionist, a venit la timp și a rezolvat problema. Prețuri rezonabile.",
    },
  ],
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("services")

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="back-button">
          <ChevronLeft size={24} />
        </Link>
        <h1>Profil</h1>
        <Link to="/settings" className="settings-button">
          <Settings size={24} />
        </Link>
      </header>

      <div className="profile-hero">
        <div className="profile-image-container">
          <img src={SAMPLE_USER.image || "/placeholder.svg"} alt={SAMPLE_USER.name} className="profile-image" />
          <button className="edit-profile-button">
            <Edit size={16} />
          </button>
        </div>

        <h2 className="profile-name">{SAMPLE_USER.name}</h2>

        <div className="profile-rating">
          <Star size={20} fill="#ffc939" color="#ffc939" />
          <span>
            {SAMPLE_USER.rating} ({SAMPLE_USER.reviewCount} recenzii)
          </span>
        </div>

        <div className="profile-meta">
          <div className="meta-item">
            <MapPin size={16} />
            <span>{SAMPLE_USER.location}</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>Membru din {SAMPLE_USER.memberSince}</span>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/messages" className="action-button message-button">
            <MessageCircle size={20} />
            <span>Mesaj</span>
          </Link>
        </div>
      </div>

      <div className="profile-bio">
        <h3>Despre mine</h3>
        <p>{SAMPLE_USER.bio}</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Servicii oferite
        </button>
        <button
          className={`tab-button ${activeTab === "booked" ? "active" : ""}`}
          onClick={() => setActiveTab("booked")}
        >
          Servicii rezervate
        </button>
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Recenzii
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "services" && (
          <div className="services-list">
            {SAMPLE_USER.services.map((service) => (
              <Link to={`/service/${service.id}`} key={service.id} className="service-item">
                <img src={service.image || "/placeholder.svg"} alt={service.title} className="service-thumbnail" />
                <div className="service-details">
                  <h4>{service.title}</h4>
                  <span className="service-category">{service.category}</span>
                  <span className="service-price">
                    {service.price} {service.currency}
                  </span>
                </div>
              </Link>
            ))}
            <Link to="/post-service" className="add-service-button">
              + Adaugă un serviciu nou
            </Link>
          </div>
        )}

        {activeTab === "booked" && (
          <div className="booked-services-list">
            {SAMPLE_USER.bookedServices.map((service) => (
              <div key={service.id} className="booked-service-item">
                <img src={service.image || "/placeholder.svg"} alt={service.title} className="service-thumbnail" />
                <div className="service-details">
                  <h4>{service.title}</h4>
                  <span className="service-category">{service.category}</span>
                  <div className="service-provider">
                    <span>Prestator: {service.provider.name}</span>
                    <div className="provider-rating">
                      <Star size={14} fill="#ffc939" color="#ffc939" />
                      <span>{service.provider.rating}</span>
                    </div>
                  </div>
                  <div className="service-booking-details">
                    <div className="booking-date">
                      <Calendar size={14} />
                      <span>{service.date}</span>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${service.status}`}>
                        {service.status === "completed" ? (
                          <>
                            <CheckCircle size={14} /> Finalizat
                          </>
                        ) : (
                          <>
                            <Clock size={14} /> Programat
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="service-price">
                    {service.price} {service.currency}
                  </span>
                </div>
                <div className="booked-service-actions">
                  <Link to={`/messages`} className="action-link">
                    Contactează
                  </Link>
                  {service.status === "completed" && (
                    <Link to={`/review/${service.id}`} className="action-link">
                      Lasă o recenzie
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <Link to="/" className="find-service-button">
              Caută servicii noi
            </Link>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-list">
            {SAMPLE_USER.reviews.map((review) => (
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
                    {[...Array(5)].map((_, i) => (
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
        )}
      </div>
    </div>
  )
}

export default ProfilePage


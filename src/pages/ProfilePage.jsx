"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, Star, Settings, Edit, MapPin, Calendar, MessageCircle } from "lucide-react"
import "./ProfilePage.css"

const SAMPLE_USER = {
  id: 1,
  name: "Alexandru Munteanu",
  image: "/placeholder.svg?height=120&width=120",
  location: "București, România",
  memberSince: "Aprilie 2023",
  rating: 4.8,
  reviewCount: 24, // Renamed from 'reviews' to 'reviewCount'
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
  reviews: [
    {
      id: 1,
      user: {
        name: "Maria D.",
        image: "/placeholder.svg?height=50&width=50",
      },
      rating: 5,
      date: "15 Iulie 2023",
      comment: "Serviciu excelent, a rezolvat problema rapid și profesionist. Recomand cu încredere!",
    },
    {
      id: 2,
      user: {
        name: "Andrei P.",
        image: "/placeholder.svg?height=50&width=50",
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
          Servicii
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


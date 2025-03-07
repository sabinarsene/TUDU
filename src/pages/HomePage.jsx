"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Filter, MapPin, Star, Plus, Check, ChevronDown } from "lucide-react"
import "./HomePage.css"
import Header from "../components/Header"

// Actualizăm SAMPLE_SERVICES pentru a folosi calea corectă spre imaginile de profil
const SAMPLE_SERVICES = [
  {
    id: 1,
    title: "Reparații instalații sanitare",
    category: "Instalații",
    price: 150,
    currency: "RON",
    location: "București",
    rating: 4.8,
    reviews: 24,
    provider: {
      name: "Alexandru M.",
      image: "./profile-photos/alex.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Curățenie apartament",
    category: "Curățenie",
    price: 100,
    currency: "RON",
    location: "Cluj-Napoca",
    rating: 4.6,
    reviews: 18,
    provider: {
      name: "Denis V.",
      image: "./profile-photos/denis.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Montaj mobilă",
    category: "Mobilă",
    price: 200,
    currency: "RON",
    location: "Timișoara",
    rating: 4.9,
    reviews: 32,
    provider: {
      name: "Florin P.",
      image: "./profile-photos/florin.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Lecții de pian",
    category: "Educație",
    price: 80,
    currency: "RON",
    location: "Iași",
    rating: 5.0,
    reviews: 15,
    provider: {
      name: "Stefan C.",
      image: "./profile-photos/stefan.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Transport marfă",
    category: "Transport",
    price: 250,
    currency: "RON",
    location: "Brașov",
    rating: 4.7,
    reviews: 41,
    provider: {
      name: "Vlad T.",
      image: "./profile-photos/vlad.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Reparații electrocasnice",
    category: "Electrocasnice",
    price: 120,
    currency: "RON",
    location: "Constanța",
    rating: 4.5,
    reviews: 28,
    provider: {
      name: "Alexandru M.",
      image: "./profile-photos/alex.jpg", // Calea actualizată
    },
    image: "/placeholder.svg?height=200&width=300",
  },
]

// Modifică array-ul CATEGORIES pentru a separa categoriile principale de cele secundare
const MAIN_CATEGORIES = ["Toate", "Instalații", "Curățenie", "Mobilă", "Educație", "Transport"]

const OTHER_CATEGORIES = [
  "Electrocasnice",
  "Grădinărit",
  "IT & Tech",
  "Design",
  "Construcții",
  "Sănătate",
  "Meditații",
  "Frumusețe",
  "Auto",
  "Juridic",
  "Contabilitate",
  "Alte servicii",
]

const PRICE_RANGES = [
  { label: "Sub 100 RON", min: 0, max: 100 },
  { label: "100 - 200 RON", min: 100, max: 200 },
  { label: "200 - 500 RON", min: 200, max: 500 },
  { label: "Peste 500 RON", min: 500, max: Number.POSITIVE_INFINITY },
]

const RATINGS = [
  { label: "4.5+ ⭐", value: 4.5 },
  { label: "4.0+ ⭐", value: 4.0 },
  { label: "3.5+ ⭐", value: 3.5 },
]

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Toate")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Adaugă un nou state pentru a controla afișarea categoriilor suplimentare
  const [showOtherCategories, setShowOtherCategories] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: null,
    minRating: null,
    location: "",
  })

  // Modifică funcția de filtrare pentru a include și categoriile suplimentare
  // Filter services based on all criteria
  const filteredServices = SAMPLE_SERVICES.filter((service) => {
    // Category filter
    if (selectedCategory !== "Toate" && service.category !== selectedCategory) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      if (service.price < filters.priceRange.min || service.price > filters.priceRange.max) {
        return false
      }
    }

    // Rating filter
    if (filters.minRating && service.rating < filters.minRating) {
      return false
    }

    // Location filter
    if (filters.location && !service.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    return true
  })

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      priceRange: null,
      minRating: null,
      location: "",
    })
  }

  return (
    <div className="home-page">
      <Header />

      {/* Înlocuiește secțiunea de filtre de categorii cu noua implementare */}
      <div className="category-filters">
        {MAIN_CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

        <button
          className={`category-button more-categories ${showOtherCategories ? "active" : ""}`}
          onClick={() => setShowOtherCategories(!showOtherCategories)}
        >
          {showOtherCategories ? "Mai puține" : "Altele"}
          <ChevronDown size={16} className={showOtherCategories ? "rotate" : ""} />
        </button>

        <button
          className={`filter-button ${isFilterOpen ? "active" : ""}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={18} />
          <span>Filtre</span>
        </button>
      </div>

      {/* Categorii suplimentare - afișate doar când showOtherCategories este true */}
      {showOtherCategories && (
        <div className="other-categories">
          {OTHER_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(category)
                // Opțional: închide panoul de categorii suplimentare după selectare
                // setShowOtherCategories(false);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filtre</h3>
            <button className="clear-filters" onClick={clearFilters}>
              Șterge filtrele
            </button>
          </div>

          <div className="filter-section">
            <h4>Preț</h4>
            <div className="filter-options">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  className={`filter-option ${filters.priceRange === range ? "active" : ""}`}
                  onClick={() => handleFilterChange("priceRange", filters.priceRange === range ? null : range)}
                >
                  {filters.priceRange === range && <Check size={16} />}
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Rating minim</h4>
            <div className="filter-options">
              {RATINGS.map((rating) => (
                <button
                  key={rating.value}
                  className={`filter-option ${filters.minRating === rating.value ? "active" : ""}`}
                  onClick={() =>
                    handleFilterChange("minRating", filters.minRating === rating.value ? null : rating.value)
                  }
                >
                  {filters.minRating === rating.value && <Check size={16} />}
                  {rating.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Locație</h4>
            <input
              type="text"
              placeholder="Introdu orașul..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="location-filter-input"
            />
          </div>
        </div>
      )}

      <main className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="no-results">
            <p>Nu am găsit servicii care să corespundă criteriilor selectate.</p>
            <button
              className="reset-filters"
              onClick={() => {
                setSelectedCategory("Toate")
                clearFilters()
              }}
            >
              Resetează filtrele
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Link to={`/service/${service.id}`} key={service.id} className="service-card">
              <div className="service-image-container">
                <img src={service.image || "/placeholder.svg"} alt={service.title} className="service-image" />
                <span className="service-category">{service.category}</span>
              </div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <div className="service-meta">
                  <div className="service-location">
                    <MapPin size={16} />
                    <span>{service.location}</span>
                  </div>
                  <div className="service-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {service.rating} ({service.reviews})
                    </span>
                  </div>
                </div>
                <div className="service-provider">
                  <img
                    src={service.provider.image || "/placeholder.svg"}
                    alt={service.provider.name}
                    className="provider-image"
                  />
                  <span className="provider-name">{service.provider.name}</span>
                </div>
                <div className="service-price">
                  <span className="price-amount">
                    {service.price} {service.currency}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>

      <Link to="/post-service" className="post-service-button">
        <Plus size={24} />
      </Link>
    </div>
  )
}

export default HomePage


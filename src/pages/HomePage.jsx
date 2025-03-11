"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Filter, MapPin, Star, Plus, Check, ChevronDown, AlertTriangle } from "lucide-react"
import "./HomePage.css"
import Header from "../components/Header"
import { fetchServices } from "../services/serviceApi"
import { Loader } from "lucide-react"
import { getImageUrl, handleImageError } from "../utils/imageUtils"

// Categoriile principale care vor fi afișate mereu
const MAIN_CATEGORIES = ["Toate", "Instalații", "Curățenie", "Mobilă", "Transport", "Educație"]

// Categorii suplimentare care vor fi afișate doar când se apasă pe "Altele"
const OTHER_CATEGORIES = [
  "Electrocasnice",
  "Grădinărit",
  "IT & Tech",
  "Meditații",
  "Construcții",
  "Design",
  "Sănătate",
  "Frumusețe",
  "Animale",
  "Auto",
  "Evenimente",
]

// Opțiuni pentru filtrarea după preț
const PRICE_RANGES = [
  { label: "Sub 50 RON", min: 0, max: 50 },
  { label: "50-100 RON", min: 50, max: 100 },
  { label: "100-200 RON", min: 100, max: 200 },
  { label: "200-500 RON", min: 200, max: 500 },
  { label: "Peste 500 RON", min: 500, max: 10000 },
]

// Opțiuni pentru filtrarea după rating
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
  // State pentru servicii
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch services from API when component mounts
  useEffect(() => {
    const getServices = async () => {
      try {
        setLoading(true)
        const data = await fetchServices()
        console.log('Fetched services:', data) // Log fetched services
        setServices(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching services:", err)
        setError("Nu am putut încărca serviciile. Vă rugăm încercați din nou mai târziu.")
      } finally {
        setLoading(false)
      }
    }

    getServices()
  }, [])

  // Modifică funcția de filtrare pentru a include și categoriile suplimentare
  // Filter services based on all criteria
  const filteredServices = services.filter((service) => {
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
        {loading ? (
          <div className="loading-container">
            <Loader size={48} className="spinner" />
            <p>Se încarcă serviciile...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <AlertTriangle size={48} />
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Încearcă din nou
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
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
            <div key={service.id} className="service-card">
              <div className="service-image-container">
                <img 
                  src={getImageUrl(service.image)} 
                  alt={service.title} 
                  className="service-image"
                  onError={handleImageError}
                />
                <span className="service-category">{service.category}</span>
              </div>
              <div className="service-content">
                <Link to={`/services/${service.id}`} className="service-title-link">
                  <h3 className="service-title">{service.title}</h3>
                </Link>
                <div className="service-meta">
                  <div className="service-location">
                    <MapPin size={16} />
                    <span>{service.location}</span>
                  </div>
                  <div className="service-rating">
                    <Star size={16} fill="#ffc939" color="#ffc939" />
                    <span>
                      {service.rating || "N/A"} ({service.review_count || 0})
                    </span>
                  </div>
                </div>
                <div className="service-provider">
                  <img
                    src={getImageUrl(service.provider?.image)}
                    alt={service.provider?.name}
                    className="provider-image"
                    onError={handleImageError}
                  />
                  <Link to={`/profile/${service.provider?.id}`} className="provider-name">
                    {service.provider?.name}
                  </Link>
                </div>
                <div className="service-price">
                  <span className="price-amount">
                    {service.price} {service.currency}
                  </span>
                </div>
              </div>
            </div>
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


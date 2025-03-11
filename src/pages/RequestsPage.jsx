"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Filter, MapPin, Clock, Plus, Check, ChevronDown, Loader, AlertTriangle, Star } from "lucide-react"
import "./RequestsPage.css"
import Header from "../components/Header"
import { fetchRequests } from "../services/requestApi"
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

// Opțiuni pentru filtrarea după buget
const BUDGET_RANGES = [
  { label: "Sub 100 RON", min: 0, max: 100 },
  { label: "100-300 RON", min: 100, max: 300 },
  { label: "300-500 RON", min: 300, max: 500 },
  { label: "500-1000 RON", min: 500, max: 1000 },
  { label: "Peste 1000 RON", min: 1000, max: 100000 },
]

// Opțiuni pentru filtrarea după termen
const DEADLINE_OPTIONS = [
  { label: "Astăzi", value: "Astăzi" },
  { label: "Mâine", value: "Mâine" },
  { label: "Această săptămână", value: "În" },
  { label: "Fără termen", value: "Fără termen" },
]

const RequestsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Toate")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showOtherCategories, setShowOtherCategories] = useState(false)
  const [filters, setFilters] = useState({
    budgetRange: null,
    deadline: null,
    location: "",
  })
  // State pentru cereri
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch requests from API when component mounts
  useEffect(() => {
    const getRequests = async () => {
      try {
        setLoading(true)
        const data = await fetchRequests()
        
        if (!data || data.length === 0) {
          console.log("No requests found or empty array returned")
          setRequests([])
          // Nu setăm eroare, doar afișăm un mesaj în UI
        } else {
          setRequests(data)
        }
        
        setError(null)
      } catch (err) {
        console.error("Error fetching requests:", err)
        setError("Nu am putut încărca cererile. Vă rugăm încercați din nou mai târziu.")
        setRequests([]) // Asigurăm că avem un array gol în caz de eroare
      } finally {
        setLoading(false)
      }
    }

    getRequests()
  }, [])

  // Filter requests based on all criteria
  const filteredRequests = requests.filter((request) => {
    // Category filter
    if (selectedCategory !== "Toate" && request.category !== selectedCategory) {
      return false
    }

    // Budget range filter
    if (filters.budgetRange) {
      const requestBudget = parseFloat(request.budget)
      if (requestBudget < filters.budgetRange.min || requestBudget > filters.budgetRange.max) {
        return false
      }
    }

    // Deadline filter
    if (filters.deadline && !request.deadline.includes(filters.deadline.value)) {
      return false
    }

    // Location filter
    if (filters.location && !request.location.toLowerCase().includes(filters.location.toLowerCase())) {
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
      budgetRange: null,
      deadline: null,
      location: "",
    })
  }

  return (
    <div className="requests-page">
      <Header />

      <div className="page-header">
        <h1>Cereri de servicii</h1>
        <p>Găsește cereri de servicii și oferă-ți expertiza</p>
      </div>

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
            <h4>Buget</h4>
            <div className="filter-options">
              {BUDGET_RANGES.map((range) => (
                <button
                  key={range.label}
                  className={`filter-option ${filters.budgetRange === range ? "active" : ""}`}
                  onClick={() => handleFilterChange("budgetRange", filters.budgetRange === range ? null : range)}
                >
                  {filters.budgetRange === range && <Check size={16} />}
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Termen limită</h4>
            <div className="filter-options">
              {DEADLINE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  className={`filter-option ${filters.deadline === option ? "active" : ""}`}
                  onClick={() => handleFilterChange("deadline", filters.deadline === option ? null : option)}
                >
                  {filters.deadline === option && <Check size={16} />}
                  {option.label}
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

      <main className="requests-grid">
        {loading ? (
          <div className="loading-container">
            <Loader size={48} className="spinner" />
            <p>Se încarcă cererile...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <AlertTriangle size={48} />
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Încearcă din nou
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="no-results">
            <p>Nu am găsit cereri care să corespundă criteriilor selectate.</p>
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
          filteredRequests.map((request) => (
            <Link to={`/request/${request.id}`} key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-category">{request.category}</div>
                <div className="request-time">
                  <Clock size={14} />
                  <span>{request.postedAt}</span>
                </div>
              </div>

              <h3 className="request-title">{request.title}</h3>

              <div className="request-location">
                <MapPin size={16} />
                <span>{request.location}</span>
              </div>

              <p className="request-description">{request.description}</p>

              <div className="request-footer">
                <div className="request-budget">
                  <span className="budget-amount">
                    {request.budget} {request.currency}
                  </span>
                </div>

                <div className="request-deadline">
                  <span>Termen: {request.deadline}</span>
                </div>
              </div>

              <div className="request-user">
                <img 
                  src={getImageUrl(request.user.image)} 
                  alt={request.user.name}
                  onError={handleImageError}
                  className="user-avatar"
                />
                <span className="user-name">{request.user.name}</span>
                {request.user.rating && (
                  <div className="user-rating">
                    <Star size={14} fill="#FFD700" />
                    <span>{request.user.rating.toFixed(1)}</span>
                    <span className="review-count">({request.user.reviewCount})</span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </main>

      <Link to="/post-request" className="post-request-button">
        <Plus size={24} />
      </Link>
    </div>
  )
}

export default RequestsPage


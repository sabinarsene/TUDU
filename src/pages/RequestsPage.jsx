"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Filter, MapPin, Clock, MessageCircle, Plus, Check, ChevronDown } from "lucide-react"
import "./RequestsPage.css"
import Header from "../components/Header"

// Sample service requests data
const SAMPLE_REQUESTS = [
  {
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
    description: "Am o țeavă spartă în baie care trebuie reparată urgent. Disponibilitate imediată necesară.",
    user: {
      id: 101,
      name: "Andreea M.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.7,
      reviewCount: 8,
    },
  },
  {
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
    user: {
      id: 102,
      name: "Mihai D.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      reviewCount: 12,
    },
  },
  {
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
    user: {
      id: 103,
      name: "Elena P.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.5,
      reviewCount: 5,
    },
  },
  {
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
    user: {
      id: 104,
      name: "Cristian V.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 5.0,
      reviewCount: 15,
    },
  },
  {
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
    user: {
      id: 105,
      name: "Alexandru T.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.6,
      reviewCount: 9,
    },
  },
  {
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
    user: {
      id: 106,
      name: "Maria N.",
      image: "/placeholder.svg?height=50&width=50",
      rating: 4.8,
      reviewCount: 11,
    },
  },
]

// Categorii pentru filtrare
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

// Opțiuni pentru filtrare după buget
const BUDGET_RANGES = [
  { label: "Sub 100 RON", min: 0, max: 100 },
  { label: "100 - 300 RON", min: 100, max: 300 },
  { label: "300 - 500 RON", min: 300, max: 500 },
  { label: "Peste 500 RON", min: 500, max: Number.POSITIVE_INFINITY },
]

// Opțiuni pentru filtrare după termen limită
const DEADLINES = [
  { label: "Urgent (24h)", value: "urgent" },
  { label: "Această săptămână", value: "week" },
  { label: "Această lună", value: "month" },
  { label: "Flexibil", value: "flexible" },
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

  // Filtrarea anunțurilor în funcție de criteriile selectate
  const filteredRequests = SAMPLE_REQUESTS.filter((request) => {
    // Filtrare după categorie
    if (selectedCategory !== "Toate" && request.category !== selectedCategory) {
      return false
    }

    // Filtrare după buget
    if (filters.budgetRange) {
      const requestMaxBudget = request.budget.max
      if (requestMaxBudget < filters.budgetRange.min || request.budget.min > filters.budgetRange.max) {
        return false
      }
    }

    // Filtrare după locație
    if (filters.location && !request.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    // Filtrare după termen limită (simplificată pentru demo)
    if (filters.deadline) {
      // Implementare simplificată - în realitate ar trebui o logică mai complexă
      if (
        filters.deadline.value === "urgent" &&
        !request.deadline.includes("urgent") &&
        !request.deadline.includes("curând") &&
        !request.deadline.includes("zile")
      ) {
        return false
      }
      if (
        filters.deadline.value === "week" &&
        !request.deadline.includes("săptămână") &&
        !request.deadline.includes("weekend")
      ) {
        return false
      }
      if (
        filters.deadline.value === "month" &&
        !request.deadline.includes("lună") &&
        !request.deadline.includes("Iulie")
      ) {
        return false
      }
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

      <div className="page-title-container">
        <h1 className="page-title">Cereri de servicii</h1>
        <p className="page-description">
          Anunțuri postate de persoane care caută servicii. Răspunde pentru a oferi serviciile tale.
        </p>
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

      {/* Categorii suplimentare */}
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

      {/* Panoul de filtre */}
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
              {DEADLINES.map((deadline) => (
                <button
                  key={deadline.value}
                  className={`filter-option ${filters.deadline === deadline ? "active" : ""}`}
                  onClick={() => handleFilterChange("deadline", filters.deadline === deadline ? null : deadline)}
                >
                  {filters.deadline === deadline && <Check size={16} />}
                  {deadline.label}
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
        {filteredRequests.length === 0 ? (
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
            <div key={request.id} className="request-card">
              <div className="request-header">
                <span className="request-category">{request.category}</span>
                <span className="request-time">{request.postedAt}</span>
              </div>

              <h3 className="request-title">
                <Link to={`/request/${request.id}`}>{request.title}</Link>
              </h3>

              <div className="request-budget">
                <span className="budget-label">Buget:</span>
                <span className="budget-amount">
                  {request.budget.min} - {request.budget.max} {request.budget.currency}
                </span>
              </div>

              <div className="request-meta">
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{request.location}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{request.deadline}</span>
                </div>
              </div>

              <p className="request-description">{request.description}</p>

              <div className="request-user">
                <img src={request.user.image || "/placeholder.svg"} alt={request.user.name} className="user-avatar" />
                <div className="user-info">
                  <span className="user-name">{request.user.name}</span>
                  <div className="user-rating">
                    <span className="rating-value">{request.user.rating}</span>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(request.user.rating) ? "filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="review-count">({request.user.reviewCount})</span>
                  </div>
                </div>
              </div>

              <div className="request-actions">
                <Link to={`/messages/new/${request.user.id}?requestId=${request.id}`} className="action-button primary">
                  <MessageCircle size={16} />
                  <span>Contactează</span>
                </Link>
                <Link to={`/request/${request.id}`} className="action-button secondary">
                  Vezi detalii
                </Link>
              </div>
            </div>
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


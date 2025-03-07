"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Bell, Menu, X, MessageCircle, FileText } from "lucide-react"
import "./Header.css"
import logoImage from "../assets/images/favicon.png"

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src={logoImage || "/placeholder.svg"} alt="Logo" className="logo-image" />
            <span className="logo-text">TUDU</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className={`header-search ${isSearchFocused ? "focused" : ""}`}>
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Caută servicii..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/requests" className="nav-icon-link requests-link" title="Cereri">
            <FileText size={24} />
          </Link>
          <Link to="/messages" className="nav-icon-link" title="Mesaje">
            <MessageCircle size={24} />
            <span className="notification-badge">3</span>
          </Link>
          <Link to="/notifications" className="nav-icon-link" title="Notificări">
            <Bell size={24} />
            <span className="notification-badge">5</span>
          </Link>
          <Link to="/profile" className="profile-link">
            <img src="./profile-photos/alex.jpg" alt="Profile" className="profile-image" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img src="./profile-photos/alex.jpg" alt="Profile" className="mobile-profile-image" />
            <div className="mobile-profile-info">
              <h3>Alexandru Munteanu</h3>
              <p>Vezi profilul tău</p>
            </div>
          </div>

          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Acasă
            </Link>
            <Link to="/requests" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Cereri de servicii
            </Link>
            <Link to="/profile" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Profilul meu
            </Link>
            <Link to="/messages" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Mesaje
              <span className="mobile-badge">3</span>
            </Link>
            <Link to="/notifications" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Notificări
              <span className="mobile-badge">5</span>
            </Link>
            <Link to="/my-services" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Serviciile mele
            </Link>
            <Link to="/orders" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Comenzile mele
            </Link>
            <Link to="/settings" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Setări
            </Link>
            <Link to="/help" className="mobile-nav-item" onClick={toggleMobileMenu}>
              Ajutor și suport
            </Link>
          </nav>

          <div className="mobile-menu-footer">
            <Link to="/logout" className="logout-button">
              Deconectare
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
    </header>
  )
}

export default Header


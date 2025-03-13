"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Bell, Menu, X, MessageCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getProfileImageUrl, handleImageError } from "../utils/imageUtils"
import "./Header.css"
import logoImage from "../assets/images/favicon.png"

const Header = () => {
  const { user, logoutUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Function for logout
  const handleLogout = (e) => {
    e.preventDefault()
    logoutUser()
    toggleMobileMenu() // Close mobile menu if open
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
            Cereri
          </Link>
          <Link to="/chat" className="nav-icon-link" title="Mesaje">
            <MessageCircle size={24} />
            <span className="notification-badge">3</span>
          </Link>
          <Link to="/notifications" className="nav-icon-link" title="Notificări">
            <Bell size={24} />
            <span className="notification-badge">5</span>
          </Link>
          <Link to="/profile" className="profile-link">
            <img 
              src={getProfileImageUrl(user)} 
              alt="Profile" 
              className="profile-image" 
              onError={handleImageError}
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img 
              src={getProfileImageUrl(user)} 
              alt="Profile" 
              className="mobile-profile-image" 
              onError={handleImageError}
            />
            <div className="mobile-profile-info">
              <h3>{user ? `${user.firstName} ${user.lastName}` : 'Utilizator'}</h3>
              <p>Vezi profilul tău</p>
            </div>
          </div>
          <nav className="mobile-nav">
            <Link to="/profile" onClick={toggleMobileMenu}>Profilul meu</Link>
            <Link to="/settings" onClick={toggleMobileMenu}>Setări</Link>
            <button onClick={handleLogout} className="logout-button">
              Deconectare
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
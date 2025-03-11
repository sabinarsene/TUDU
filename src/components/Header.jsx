"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Bell, Menu, X, MessageCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
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

  // Function to get profile image URL
  const getProfileImageUrl = () => {
    if (!user || !user.profileImage) {
      return "/placeholder.svg"
    }
    
    // Verificăm dacă este un URL temporar (blob:)
    if (user.profileImage.startsWith('blob:')) {
      return user.profileImage;
    }
    
    // Verificăm dacă este un URL absolut
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    
    // Verificăm dacă path începe cu '/'
    const path = user.profileImage.startsWith('/') ? user.profileImage : '/' + user.profileImage;
    
    // Altfel, construim URL-ul complet
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${API_URL}${path}`;
  }

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg"
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
          <Link to="/messages" className="nav-icon-link" title="Mesaje">
            <MessageCircle size={24} />
            <span className="notification-badge">3</span>
          </Link>
          <Link to="/notifications" className="nav-icon-link" title="Notificări">
            <Bell size={24} />
            <span className="notification-badge">5</span>
          </Link>
          <Link to="/profile" className="profile-link">
            <img 
              src={getProfileImageUrl()} 
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
              src={getProfileImageUrl()} 
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
            <button onClick={handleLogout} className="logout-button">
              <X size={18} />
              <span>Deconectare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
    </header>
  )
}

export default Header
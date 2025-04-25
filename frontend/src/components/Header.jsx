"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Bell, Menu, X, MessageCircle, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useMessages } from "../contexts/MessageContext"
import { getProfileImageUrl, handleImageError, getImageUrl } from "../utils/imageUtils"
import "./Header.css"
import logoImage from "../assets/images/favicon.png"
import { Avatar } from '@chakra-ui/react'
import defaultProfileImage from '../assets/default-profile.jpg'

const Header = () => {
  const { user, logoutUser } = useAuth()
  const { unreadCount: unreadMessages } = useMessages()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Debug the profile image
  console.log("User in Header:", user);
  console.log("User profile image properties:", {
    profileImage: user?.profileImage,
    profile_image: user?.profile_image,
    image: user?.image
  });
  
  // Get user's display name - use different property combinations based on what's available
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.name) {
      return user.name;
    } else {
      return 'User';
    }
  };

  // Direct function to get the user's profile image URL
  const getUserProfileImage = () => {
    // No user = no image
    if (!user) {
      console.log("No user object found");
      return null;
    }
    
    console.log("USER OBJECT STRUCTURE:", JSON.stringify(user, null, 2));
    
    // Check ALL possible properties where the image path might be stored
    const imagePath = 
      // Backend uses snake_case
      user.profile_image || 
      // Frontend might use camelCase
      user.profileImage || 
      // Simple property name
      user.image ||
      // Sometimes stored directly in the user object
      (user.user && (user.user.profile_image || user.user.profileImage || user.user.image));
    
    console.log("PROFILE IMAGE PATH FOUND:", imagePath);
    
    // If no image path found, return null to display initials
    if (!imagePath) {
      console.log("No image path found in user object");
      return null;
    }
    
    // If path is already a complete URL (starts with http)
    if (imagePath.startsWith('http')) {
      console.log("Complete URL found:", imagePath);
      return imagePath;
    }
    
    // If it's a blob URL (from file input)
    if (imagePath.startsWith('blob:')) {
      console.log("Blob URL found:", imagePath);
      return imagePath;
    }
    
    // Get API base URL - ensure it doesn't end with a slash
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    
    // If it includes the uploads path or is an absolute path
    if (imagePath.includes('/uploads/') || imagePath.startsWith('/')) {
      // Make sure path starts with /
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      const fullUrl = `${baseUrl}${normalizedPath}`;
      console.log("Server full image URL:", fullUrl);
      return fullUrl;
    }
    
    // Last resort - just try to use the path as is with the API URL
    const fullUrl = `${baseUrl}/${imagePath}`;
    console.log("Last resort URL:", fullUrl);
    return fullUrl;
  };

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
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
            )}
          </Link>
          <Link to="/notifications" className="nav-icon-link" title="Notificări">
            <Bell size={24} />
            <span className="notification-badge">5</span>
          </Link>
          <Link to="/profile" className="profile-link">
            <Avatar 
              src={getUserProfileImage()}
              name={getUserName()}
              size="sm"
              bg={!getUserProfileImage() ? "blue.500" : undefined}
              color="white"
              className="profile-image" 
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
            <Avatar 
              src={getUserProfileImage()}
              name={getUserName()}
              size="md"
              bg={!getUserProfileImage() ? "blue.500" : undefined}
              color="white"
              className="mobile-profile-image" 
            />
            <div className="mobile-profile-info">
              <h3>{getUserName()}</h3>
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
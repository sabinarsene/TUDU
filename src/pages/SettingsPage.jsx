"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, User, Bell, Lock, Eye, EyeOff, Shield, Trash2, Camera } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import "./SettingsPage.css"

const SettingsPage = () => {
  const { user, loginUser } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [activeSection, setActiveSection] = useState("profile")
  const [isUploading, setIsUploading] = useState(false)
  const [userSettings, setUserSettings] = useState({
    notifications: {
      email: true,
      push: true,
      messages: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: "all",
      showPhone: false,
      showEmail: false,
    },
  })

  // Funcție pentru a obține URL-ul imaginii de profil
  const getProfileImageUrl = () => {
    if (!user || !user.profileImage) {
      return "/placeholder.svg"
    }
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
    return `${API_URL}${user.profileImage}`
  }

  // Funcție pentru a gestiona erorile de încărcare a imaginii
  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg"
  }

  useEffect(() => {
    // Here you would typically fetch user settings from your backend
    // For now, we'll use the default settings
  }, [])

  const handleNotificationChange = (key) => {
    setUserSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
  }

  const handlePrivacyChange = (key, value) => {
    setUserSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificăm dimensiunea fișierului (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert("Imaginea trebuie să fie mai mică de 5MB")
      return
    }

    // Verificăm tipul fișierului
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert("Te rugăm să încarci o imagine în format JPG, PNG sau WebP")
      return
    }

    try {
      setIsUploading(true)
      
      // Creăm un URL temporar pentru previzualizare
      const tempImageUrl = URL.createObjectURL(file)
      
      // Actualizăm temporar imaginea de profil pentru feedback vizual imediat
      const tempUser = { ...user, profileImage: tempImageUrl }
      loginUser(tempUser)
      
      const formData = new FormData()
      formData.append('image', file)

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
      const apiEndpoint = `${API_URL}/api/profile/upload-image`
      
      console.log('API URL pentru încărcare imagine:', apiEndpoint)

      const token = localStorage.getItem('token')
      // Eliminăm header-ul Content-Type pentru că FormData îl va seta automat cu boundary corect
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Server error:', errorData)
        throw new Error(errorData || 'Încărcarea imaginii a eșuat')
      }

      const data = await response.json()
      
      if (!data.user || !data.imageUrl) {
        throw new Error('Răspunsul serverului nu conține datele necesare')
      }

      // Update user context with new user data
      const updatedUser = {
        ...user,
        profileImage: data.imageUrl
      }
      loginUser(updatedUser)

      // Eliberăm URL-ul temporar
      URL.revokeObjectURL(tempImageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Încărcarea imaginii a eșuat. Te rugăm să încerci din nou.')
      
      // Revert to original user data if there was an error
      if (user) {
        loginUser(user)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    // Here you would typically send the password change request to your backend
    console.log("Password change requested:", passwordForm)
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Link to="/profile" className="back-button">
          <ChevronLeft size={24} />
          Back to Profile
        </Link>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <button
            className={`sidebar-button ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <User size={20} />
            Profile
          </button>
          <button
            className={`sidebar-button ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            <Bell size={20} />
            Notifications
          </button>
          <button
            className={`sidebar-button ${activeSection === "security" ? "active" : ""}`}
            onClick={() => setActiveSection("security")}
          >
            <Lock size={20} />
            Security
          </button>
          <button
            className={`sidebar-button ${activeSection === "privacy" ? "active" : ""}`}
            onClick={() => setActiveSection("privacy")}
          >
            <Shield size={20} />
            Privacy
          </button>
          <button
            className={`sidebar-button ${activeSection === "delete" ? "active" : ""}`}
            onClick={() => setActiveSection("delete")}
          >
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>

        <div className="settings-main">
          {activeSection === "profile" && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <div className="profile-image-section">
                <div className={`profile-image-container ${isUploading ? 'uploading' : ''}`}>
                  <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="profile-image"
                    onError={handleImageError}
                  />
                  {isUploading && <div className="upload-overlay">Încărcare...</div>}
                </div>
                <label className="image-upload-button">
                  <Camera size={20} />
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={`${user?.firstName || ""} ${user?.lastName || ""}`}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email || ""} readOnly />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.email}
                      onChange={() => handleNotificationChange("email")}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.push}
                      onChange={() => handleNotificationChange("push")}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Message Notifications</h3>
                    <p>Get notified about new messages</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.messages}
                      onChange={() => handleNotificationChange("messages")}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Marketing Emails</h3>
                    <p>Receive marketing and promotional emails</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.notifications.marketing}
                      onChange={() => handleNotificationChange("marketing")}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="submit-button">
                  Change Password
                </button>
              </form>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Profile Visibility</h3>
                    <p>Control who can see your profile</p>
                  </div>
                  <select
                    value={userSettings.privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                  >
                    <option value="all">Everyone</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show Phone Number</h3>
                    <p>Display your phone number on your profile</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.privacy.showPhone}
                      onChange={() => handlePrivacyChange("showPhone", !userSettings.privacy.showPhone)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show Email</h3>
                    <p>Display your email on your profile</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={userSettings.privacy.showEmail}
                      onChange={() => handlePrivacyChange("showEmail", !userSettings.privacy.showEmail)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "delete" && (
            <div className="settings-section">
              <h2>Delete Account</h2>
              <div className="delete-account-content">
                <p>
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <button className="delete-button">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage


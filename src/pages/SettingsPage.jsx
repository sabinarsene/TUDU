"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, User, Bell, Lock, Eye, EyeOff, Shield, Trash2, Camera } from "lucide-react"
import "./SettingsPage.css"

const SAMPLE_USER = {
  name: "Alexandru Munteanu",
  email: "alex.munteanu@example.com",
  phone: "+40 712 345 678",
  image: "/placeholder.svg?height=120&width=120",
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
}

const SettingsPage = () => {
  const [user, setUser] = useState(SAMPLE_USER)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [activeSection, setActiveSection] = useState("profile")

  const handleNotificationChange = (key) => {
    setUser((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
  }

  const handlePrivacyChange = (key, value) => {
    setUser((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUser((prev) => ({
          ...prev,
          image: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    // Implement password change logic here
    console.log("Password form:", passwordForm)
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Ești sigur că vrei să ștergi contul? Această acțiune nu poate fi anulată.")) {
      // Implement account deletion logic here
      console.log("Delete account")
    }
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <Link to="/profile" className="back-button">
          <ChevronLeft size={24} />
        </Link>
        <h1>Setări</h1>
      </header>

      <div className="settings-container">
        <nav className="settings-nav">
          <button
            className={`nav-button ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <User size={20} />
            <span>Profil</span>
          </button>
          <button
            className={`nav-button ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            <Bell size={20} />
            <span>Notificări</span>
          </button>
          <button
            className={`nav-button ${activeSection === "security" ? "active" : ""}`}
            onClick={() => setActiveSection("security")}
          >
            <Lock size={20} />
            <span>Securitate</span>
          </button>
          <button
            className={`nav-button ${activeSection === "privacy" ? "active" : ""}`}
            onClick={() => setActiveSection("privacy")}
          >
            <Shield size={20} />
            <span>Confidențialitate</span>
          </button>
        </nav>

        <div className="settings-content">
          {activeSection === "profile" && (
            <div className="settings-section">
              <h2>Informații profil</h2>

              <div className="profile-image-upload">
                <div className="image-container">
                  <img src={user.image || "/placeholder.svg"} alt="Profile" className="profile-image" />
                  <label className="image-upload-button">
                    <Camera size={20} />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nume complet</label>
                <input
                  type="text"
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="settings-section">
              <h2>Preferințe notificări</h2>

              <div className="notification-options">
                <div className="notification-option">
                  <div>
                    <h3>Notificări email</h3>
                    <p>Primește actualizări și notificări pe email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.email}
                      onChange={() => handleNotificationChange("email")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <h3>Notificări push</h3>
                    <p>Primește notificări push în browser</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.push}
                      onChange={() => handleNotificationChange("push")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <h3>Mesaje noi</h3>
                    <p>Primește notificări pentru mesaje noi</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.messages}
                      onChange={() => handleNotificationChange("messages")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div>
                    <h3>Marketing</h3>
                    <p>Primește noutăți și oferte speciale</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.marketing}
                      onChange={() => handleNotificationChange("marketing")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="settings-section">
              <h2>Securitate cont</h2>

              <form className="password-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Parola actuală</label>
                  <div className="password-input">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
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
                  <label htmlFor="newPassword">Parola nouă</label>
                  <div className="password-input">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
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
                  <label htmlFor="confirmPassword">Confirmă parola nouă</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
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

                <button type="submit" className="save-button">
                  Schimbă parola
                </button>
              </form>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="settings-section">
              <h2>Setări de confidențialitate</h2>

              <div className="privacy-options">
                <div className="privacy-option">
                  <div>
                    <h3>Vizibilitate profil</h3>
                    <p>Cine poate să îți vadă profilul</p>
                  </div>
                  <select
                    value={user.privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                  >
                    <option value="all">Toată lumea</option>
                    <option value="authenticated">Utilizatori autentificați</option>
                    <option value="contacts">Doar contactele mele</option>
                  </select>
                </div>

                <div className="privacy-option">
                  <div>
                    <h3>Afișare număr de telefon</h3>
                    <p>Permite altora să îți vadă numărul de telefon</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.privacy.showPhone}
                      onChange={() => handlePrivacyChange("showPhone", !user.privacy.showPhone)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-option">
                  <div>
                    <h3>Afișare email</h3>
                    <p>Permite altora să îți vadă adresa de email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.privacy.showEmail}
                      onChange={() => handlePrivacyChange("showEmail", !user.privacy.showEmail)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="danger-zone">
            <h3>Zonă periculoasă</h3>
            <button className="delete-account" onClick={handleDeleteAccount}>
              <Trash2 size={20} />
              Șterge contul
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage


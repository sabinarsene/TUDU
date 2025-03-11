"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import "./ProfileSetupPage.css"

const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { user, loginUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    occupation: "",
    education: "",
    age: "",
    location: "",
    bio: "",
    isProvider: true,
    specialization: "",
    experience: "",
    languages: "",
    availability: "full-time", // full-time, part-time, weekends
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
    const apiEndpoint = `${API_URL}/profile/setup`
    
    console.log('API URL:', apiEndpoint)
    console.log('Form Data:', formData)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Configurarea profilului a eșuat")
      }

      const data = await response.json()
      loginUser({ ...user, ...data.user }) // Actualizăm datele utilizatorului în context
      navigate("/profile")
    } catch (err) {
      setError(err.message || "A apărut o eroare. Te rugăm să încerci din nou.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="profile-setup-page">
      <header className="setup-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <h1>Configurare profil prestator</h1>
      </header>

      <div className="setup-content">
        <form onSubmit={handleSubmit} className="setup-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>Informații personale</h2>
            
            <div className="form-group">
              <label htmlFor="occupation">Ocupație</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Ex: Instalator, Electrician, etc."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="education">Studii</label>
              <input
                type="text"
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Ex: Liceu Tehnic, Facultatea de Inginerie, etc."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Vârstă</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Locație</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: București, Sector 1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Detalii profesionale</h2>

            <div className="form-group">
              <label htmlFor="specialization">Specializare</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Ex: Instalații sanitare, Reparații electrocasnice"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experiență</label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Ex: 5 ani în domeniu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="languages">Limbi vorbite</label>
              <input
                type="text"
                id="languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="Ex: Română, Engleză"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="availability">Disponibilitate</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
              >
                <option value="full-time">Program complet</option>
                <option value="part-time">Part-time</option>
                <option value="weekends">Weekend</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Descriere</h2>
            
            <div className="form-group">
              <label htmlFor="bio">Despre tine</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Descrie experiența ta, serviciile oferite și ce te face special..."
                rows={5}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Se salvează..." : "Salvează profilul"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetupPage 
"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, Upload, X, Info, Calendar } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./PostRequestPage.css"
import { createRequest } from "../services/requestApi"
import { useAuth } from "../contexts/AuthContext"

const CATEGORIES = [
  "Instalații",
  "Curățenie",
  "Mobilă",
  "Educație",
  "Transport",
  "Electrocasnice",
  "Grădinărit",
  "IT & Tech",
  "Design",
  "Construcții",
  "Sănătate",
  "Meditații",
  "Frumusețe",
  "Animale",
  "Auto",
  "Evenimente",
]

const DEADLINES = [
  "Urgent (24h)",
  "În 2-3 zile",
  "Această săptămână",
  "Săptămâna viitoare",
  "În 2 săptămâni",
  "În această lună",
  "Flexibil",
]

const PostRequestPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    navigate("/login")
  }

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    budget: "",
    currency: "RON",
    location: "",
    deadline: null,
    description: "",
    images: [],
    contactPreference: "orice",
  })

  const [errors, setErrors] = useState({})
  const [previewImages, setPreviewImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      deadline: date,
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + previewImages.length > 5) {
      setErrors({
        ...errors,
        images: "Poți încărca maximum 5 imagini",
      })
      return
    }

    const newPreviewImages = [...previewImages]

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviewImages.push({
          file,
          preview: e.target.result,
        })
        setPreviewImages([...newPreviewImages])
      }
      reader.readAsDataURL(file)
    })

    setFormData({
      ...formData,
      images: [...(formData.images || []), ...files],
    })

    // Clear error when images are added
    if (errors.images) {
      setErrors({
        ...errors,
        images: null,
      })
    }
  }

  const removeImage = (index) => {
    const newPreviewImages = [...previewImages]
    newPreviewImages.splice(index, 1)
    setPreviewImages(newPreviewImages)

    // Also remove from formData
    const newImages = [...(formData.images || [])]
    newImages.splice(index, 1)
    setFormData({
      ...formData,
      images: newImages,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Titlul este obligatoriu"
    } else if (formData.title.length < 5) {
      newErrors.title = "Titlul trebuie să aibă cel puțin 5 caractere"
    }

    if (!formData.category) {
      newErrors.category = "Categoria este obligatorie"
    }

    if (!formData.budget) {
      newErrors.budget = "Bugetul este obligatoriu"
    } else if (isNaN(formData.budget) || Number(formData.budget) <= 0) {
      newErrors.budget = "Bugetul trebuie să fie un număr pozitiv"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Locația este obligatorie"
    }

    if (!formData.deadline) {
      newErrors.deadline = "Termenul limită este obligatoriu"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrierea este obligatorie"
    } else if (formData.description.length < 20) {
      newErrors.description = "Descrierea trebuie să aibă cel puțin 20 de caractere"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector(".error-message")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setIsSubmitting(true)
    setErrors({ ...errors, submit: null })

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Nu ești autentificat')
      }

      // Create FormData object for the API call
      const requestFormData = new FormData()
      requestFormData.append('title', formData.title)
      requestFormData.append('category', formData.category)
      requestFormData.append('description', formData.description)
      requestFormData.append('budget', formData.budget)
      requestFormData.append('currency', formData.currency)
      requestFormData.append('location', formData.location)
      
      if (formData.deadline) {
        requestFormData.append('deadline', formData.deadline.toISOString())
      }
      
      requestFormData.append('contactPreference', formData.contactPreference)
      
      // Nu mai încărcăm imaginile în această versiune
      // Vom implementa încărcarea imaginilor după ce rezolvăm problema cu Supabase

      // Afișăm datele trimise pentru debugging
      console.log("Sending request data:")
      console.log("title:", formData.title)
      console.log("category:", formData.category)
      console.log("description:", formData.description)
      console.log("budget:", formData.budget)
      console.log("currency:", formData.currency)
      console.log("location:", formData.location)
      console.log("deadline:", formData.deadline ? formData.deadline.toISOString() : null)
      console.log("contactPreference:", formData.contactPreference)

      try {
        // Call the API to create the request
        const response = await createRequest(requestFormData, token)
        
        console.log("Request created:", response)
  
        // Redirect to success page
        navigate("/success?type=request")
      } catch (apiError) {
        console.error("API error posting request:", apiError)
        
        // Verificăm dacă eroarea este legată de un câmp specific
        if (apiError.field) {
          setErrors({
            ...errors,
            [apiError.field]: apiError.message,
            submit: `Eroare: Verifică câmpul ${apiError.field}`
          })
          
          // Scroll to the specific field error
          const fieldError = document.querySelector(`[name="${apiError.field}"]`)
          if (fieldError) {
            fieldError.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        } else {
          setErrors({
            ...errors,
            submit: `Eroare: ${apiError.message || 'A apărut o eroare la crearea cererii. Te rugăm să încerci din nou.'}`
          })
          
          // Scroll to the top to show the error
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    } catch (error) {
      console.error("Error posting request:", error)
      
      // Afișăm un mesaj de eroare mai specific dacă este disponibil
      if (error.message) {
        setErrors({
          ...errors,
          submit: `Eroare: ${error.message}`,
        })
      } else {
        setErrors({
          ...errors,
          submit: "A apărut o eroare. Te rugăm să încerci din nou.",
        })
      }
      
      // Scroll to the top to show the error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="post-request-page">
      <header className="page-header">
        <Link to="/requests" className="back-button">
          <ChevronLeft size={24} />
        </Link>
        <h1>Adaugă o cerere nouă</h1>
      </header>

      <form className="request-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Titlul cererii *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Caut instalator pentru reparație urgentă"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? "error" : ""}
            >
              <option value="">Selectează o categorie</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Buget (RON) *</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Ex: 200"
                min="0"
                step="1"
                className={errors.budget ? "error" : ""}
              />
              {errors.budget && <div className="error-message">{errors.budget}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Locație *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: București, Sector 3"
                className={errors.location ? "error" : ""}
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Termen limită</label>
            <DatePicker
              selected={formData.deadline}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText="Selectează o dată"
              className="date-picker"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descriere *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrie în detaliu ce servicii cauți, ce așteptări ai, etc."
              rows="6"
              className={errors.description ? "error" : ""}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Imagini</label>
            <div className="image-upload-container">
              <div className="image-upload-area">
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="image-input"
                />
                <div className="upload-placeholder">
                  <Upload size={32} />
                  <p>Trage imaginile aici sau click pentru a încărca</p>
                  <span>Poți încărca până la 5 imagini (JPG, PNG)</span>
                </div>
              </div>

              {errors.images && <div className="error-message">{errors.images}</div>}

              {previewImages.length > 0 && (
                <div className="image-previews">
                  {previewImages.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={image.preview || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                      <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Preferință de contact</label>
            <div className="contact-options">
              <label className="contact-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="orice"
                  checked={formData.contactPreference === "orice"}
                  onChange={handleChange}
                />
                <span>Orice metodă</span>
              </label>
              <label className="contact-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="mesaj"
                  checked={formData.contactPreference === "mesaj"}
                  onChange={handleChange}
                />
                <span>Doar mesaj</span>
              </label>
              <label className="contact-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="telefon"
                  checked={formData.contactPreference === "telefon"}
                  onChange={handleChange}
                />
                <span>Doar telefon</span>
              </label>
            </div>
          </div>

          <div className="form-notice">
            <Info size={18} />
            <p>
              Prin postarea acestei cereri, confirmi că respectă
              <Link to="/terms" className="notice-link">
                {" "}
                Termenii și Condițiile
              </Link>{" "}
              platformei.
            </p>
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <Link to="/requests" className="cancel-button">
              Anulează
            </Link>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Se postează..." : "Publică cererea"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PostRequestPage


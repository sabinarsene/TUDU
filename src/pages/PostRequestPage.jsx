"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, Upload, X, Info, Calendar } from "lucide-react"
import "./PostRequestPage.css"

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
  "Alte servicii",
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

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    location: {
      county: "",
      city: "",
      street: "",
      number: "",
    },
    deadline: "",
    description: "",
    images: [],
    contactPreference: "orice",
  })

  const [errors, setErrors] = useState({})
  const [previewImages, setPreviewImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    // Verifică dacă este un câmp de locație
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
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
      images: [...formData.images, ...files],
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

    const newImages = [...formData.images]
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

    if (!formData.budgetMin) {
      newErrors.budgetMin = "Bugetul minim este obligatoriu"
    } else if (isNaN(formData.budgetMin) || Number.parseFloat(formData.budgetMin) < 0) {
      newErrors.budgetMin = "Bugetul minim trebuie să fie un număr pozitiv"
    }

    if (!formData.budgetMax) {
      newErrors.budgetMax = "Bugetul maxim este obligatoriu"
    } else if (isNaN(formData.budgetMax) || Number.parseFloat(formData.budgetMax) <= 0) {
      newErrors.budgetMax = "Bugetul maxim trebuie să fie un număr pozitiv"
    } else if (Number.parseFloat(formData.budgetMax) < Number.parseFloat(formData.budgetMin)) {
      newErrors.budgetMax = "Bugetul maxim trebuie să fie mai mare decât bugetul minim"
    }

    // Validare pentru câmpurile de locație
    if (!formData.location.county.trim()) {
      newErrors["location.county"] = "Județul este obligatoriu"
    }

    if (!formData.location.city.trim()) {
      newErrors["location.city"] = "Localitatea este obligatorie"
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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Request posted:", formData)

      // Redirect to requests page
      navigate("/requests")
    } catch (error) {
      console.error("Error posting request:", error)
      setErrors({
        ...errors,
        submit: "A apărut o eroare. Te rugăm să încerci din nou.",
      })
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
        <h1>Adaugă o cerere de servicii</h1>
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
              <label htmlFor="budgetMin">Buget minim (RON) *</label>
              <input
                type="number"
                id="budgetMin"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                placeholder="Ex: 100"
                min="0"
                step="1"
                className={errors.budgetMin ? "error" : ""}
              />
              {errors.budgetMin && <div className="error-message">{errors.budgetMin}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="budgetMax">Buget maxim (RON) *</label>
              <input
                type="number"
                id="budgetMax"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                placeholder="Ex: 200"
                min="0"
                step="1"
                className={errors.budgetMax ? "error" : ""}
              />
              {errors.budgetMax && <div className="error-message">{errors.budgetMax}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Locație *</label>
            <div className="location-fields">
              <div className="location-field">
                <label htmlFor="county">Județ *</label>
                <input
                  type="text"
                  id="county"
                  name="location.county"
                  value={formData.location.county}
                  onChange={handleChange}
                  placeholder="Ex: București"
                  className={errors["location.county"] ? "error" : ""}
                />
                {errors["location.county"] && <div className="error-message">{errors["location.county"]}</div>}
              </div>

              <div className="location-field">
                <label htmlFor="city">Localitate *</label>
                <input
                  type="text"
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="Ex: Sector 1"
                  className={errors["location.city"] ? "error" : ""}
                />
                {errors["location.city"] && <div className="error-message">{errors["location.city"]}</div>}
              </div>

              <div className="location-field">
                <label htmlFor="street">Stradă</label>
                <input
                  type="text"
                  id="street"
                  name="location.street"
                  value={formData.location.street}
                  onChange={handleChange}
                  placeholder="Ex: Strada Victoriei"
                />
              </div>

              <div className="location-field">
                <label htmlFor="number">Număr</label>
                <input
                  type="text"
                  id="number"
                  name="location.number"
                  value={formData.location.number}
                  onChange={handleChange}
                  placeholder="Ex: 10"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Termen limită *</label>
            <div className="deadline-input">
              <Calendar size={18} className="deadline-icon" />
              <select
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={errors.deadline ? "error" : ""}
              >
                <option value="">Selectează termenul limită</option>
                {DEADLINES.map((deadline) => (
                  <option key={deadline} value={deadline}>
                    {deadline}
                  </option>
                ))}
              </select>
            </div>
            {errors.deadline && <div className="error-message">{errors.deadline}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descriere *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrie în detaliu ce servicii cauți, cerințe specifice, detalii importante, etc."
              rows="6"
              className={errors.description ? "error" : ""}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Imagini (opțional)</label>
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
                <span>Doar mesaje</span>
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


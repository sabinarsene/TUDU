"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, Upload, MapPin, X, Info } from "lucide-react"
import "./PostServicePage.css"

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

const PostServicePage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    location: "",
    description: "",
    images: [],
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

    if (!formData.price) {
      newErrors.price = "Prețul este obligatoriu"
    } else if (isNaN(formData.price) || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Prețul trebuie să fie un număr pozitiv"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Locația este obligatorie"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrierea este obligatorie"
    } else if (formData.description.length < 20) {
      newErrors.description = "Descrierea trebuie să aibă cel puțin 20 de caractere"
    }

    if (formData.images.length === 0) {
      newErrors.images = "Trebuie să încarci cel puțin o imagine"
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

      console.log("Service posted:", formData)

      // Redirect to home page or service details page
      navigate("/")
    } catch (error) {
      console.error("Error posting service:", error)
      setErrors({
        ...errors,
        submit: "A apărut o eroare. Te rugăm să încerci din nou.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="post-service-page">
      <header className="page-header">
        <Link to="/" className="back-button">
          <ChevronLeft size={24} />
        </Link>
        <h1>Adaugă un serviciu nou</h1>
      </header>

      <form className="service-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">Titlul serviciului *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Reparații instalații sanitare"
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
              <label htmlFor="price">Preț (RON) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 150"
                min="0"
                step="1"
                className={errors.price ? "error" : ""}
              />
              {errors.price && <div className="error-message">{errors.price}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Locație *</label>
              <div className="location-input">
                <MapPin size={18} className="location-icon" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: București"
                  className={errors.location ? "error" : ""}
                />
              </div>
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descriere *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrie serviciul tău în detaliu. Include informații despre experiența ta, ce oferă serviciul, durata, etc."
              rows="6"
              className={errors.description ? "error" : ""}
            ></textarea>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Imagini *</label>
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

          <div className="form-notice">
            <Info size={18} />
            <p>
              Prin postarea acestui serviciu, confirmi că respectă
              <Link to="/terms" className="notice-link">
                {" "}
                Termenii și Condițiile
              </Link>{" "}
              platformei.
            </p>
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <Link to="/" className="cancel-button">
              Anulează
            </Link>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Se postează..." : "Publică serviciul"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PostServicePage


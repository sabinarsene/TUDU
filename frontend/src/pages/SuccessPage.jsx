import { Link, useLocation } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import "./SuccessPage.css"

const SuccessPage = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const type = searchParams.get('type') || 'service'

  // Define different success messages based on type
  const successMessages = {
    service: {
      title: "Serviciu publicat cu succes!",
      message: "Serviciul tău a fost publicat și este acum vizibil pentru toți utilizatorii.",
      buttonText: "Vezi serviciile tale",
      buttonLink: "/profile"
    },
    request: {
      title: "Cerere publicată cu succes!",
      message: "Cererea ta a fost publicată și este acum vizibilă pentru toți utilizatorii.",
      buttonText: "Vezi cererile tale",
      buttonLink: "/profile"
    },
    booking: {
      title: "Rezervare efectuată cu succes!",
      message: "Rezervarea ta a fost înregistrată. Vei primi o confirmare în curând.",
      buttonText: "Vezi rezervările tale",
      buttonLink: "/profile"
    },
    payment: {
      title: "Plată efectuată cu succes!",
      message: "Plata ta a fost procesată cu succes. Mulțumim pentru încredere!",
      buttonText: "Vezi istoricul plăților",
      buttonLink: "/profile"
    }
  }

  // Get the appropriate message based on type
  const { title, message, buttonText, buttonLink } = successMessages[type] || successMessages.service

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={80} />
        </div>
        <h1 className="success-title">{title}</h1>
        <p className="success-message">{message}</p>
        <div className="success-actions">
          <Link to={buttonLink} className="success-button">
            {buttonText}
          </Link>
          <Link to="/" className="success-button secondary">
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage


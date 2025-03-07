import { Link } from "react-router-dom"
import { CheckCircle } from "lucide-react"
import "./SuccessPage.css"

const SuccessPage = () => {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={80} />
        </div>
        <h1 className="success-title">Serviciu publicat cu succes!</h1>
        <p className="success-message">Serviciul tău a fost publicat și este acum vizibil pentru toți utilizatorii.</p>
        <Link to="/" className="success-button">
          OK
        </Link>
      </div>
    </div>
  )
}

export default SuccessPage


import { Link } from "react-router-dom"
import SignUpForm from "../components/SignUpForm"
import logoImage from "../assets/images/favicon.png"
import "./SignUpPage.css"

const SignUpPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrapper">
          <img src={logoImage || "/placeholder.svg"} alt="Logo" className="auth-logo" />
        </div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Enter your information to get started</p>

        <SignUpForm />

        <p className="auth-footer">
          Ai deja cont?{" "}
          <Link to="/login" className="auth-link">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage


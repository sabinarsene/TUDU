import { Link } from "react-router-dom"
import LoginForm from "../components/LoginForm"
import logoImage from "../assets/images/favicon.png"
import "./LoginPage.css"

const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrapper">
          <img src={logoImage || "/placeholder.svg"} alt="Logo" className="auth-logo" />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Enter your credentials to access your account</p>

        <LoginForm />

        <p className="auth-footer">
          Nu ai cont?{" "}
          <Link to="/signup" className="auth-link">
            Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage


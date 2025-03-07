"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./SignUpForm.css"
import { Eye } from "lucide-react"
import { register } from "../services/authService"

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }
    
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy")
      return
    }
    
    setIsLoading(true)
    
    try {
      await register({
        firstName,
        lastName,
        email,
        password
      })
      navigate("/") // Redirecționare către pagina principală după înregistrare
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-field">
        <label htmlFor="firstName">First name</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="lastName">Last name</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            <Eye size={20} />
          </button>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-input-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      <div className="checkbox-field">
        <input type="checkbox" id="terms" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} required />
        <label htmlFor="terms">
          I agree to the{" "}
          <a href="/terms" className="link">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="link">
            Privacy Policy
          </a>
        </label>
      </div>

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      <div className="or-divider">
        <span>Or continue with</span>
      </div>

      <div className="social-login">
        <button type="button" className="social-button">
          Google
        </button>
        <button type="button" className="social-button">
          GitHub
        </button>
      </div>
    </form>
  )
}

export default SignUpForm


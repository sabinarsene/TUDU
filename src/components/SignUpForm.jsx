"use client"

import { useState } from "react"
import "./SignUpForm.css"
import { Eye } from "lucide-react"

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    if (!agreeTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy")
      return
    }
    console.log("First Name:", firstName)
    console.log("Last Name:", lastName)
    console.log("Email:", email)
    console.log("Password:", password)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
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

      <button type="submit" className="auth-button">
        Create Account
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


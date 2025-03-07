"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginForm.css"
import { Eye } from "lucide-react"
import { login } from "../services/authService"
import { useAuth } from "../contexts/AuthContext"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const response = await login(email, password)
      loginUser(response.user)
      navigate("/") // Redirecționare către pagina principală după login
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
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

      <div className="form-field password-field">
        <div className="password-label-row">
          <label htmlFor="password">Password</label>
          <a href="/forgot-password" className="forgot-link">
            Forgot password?
          </a>
        </div>
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

      <div className="checkbox-field">
        <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
        <label htmlFor="remember">Remember me</label>
      </div>

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? "Loading..." : "Login"}
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

export default LoginForm


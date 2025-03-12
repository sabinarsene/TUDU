import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { setAuthToken } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Încarcă datele utilizatorului din localStorage la inițializare
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser)
        // Procesăm datele de tip dată
        if (userData.memberSince) {
          userData.memberSince = new Date(userData.memberSince).toISOString()
        }
        // Adăugăm token-ul în obiectul user
        userData.token = token
        setUser(userData)
        // Setăm token-ul în header-ele axios
        setAuthToken(token)
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const loginUser = (userData) => {
    console.log('Actualizare date utilizator:', userData);
    // Procesăm datele de tip dată înainte de salvare
    const processedData = {
      ...userData,
      memberSince: userData.memberSince ? new Date(userData.memberSince).toISOString() : null
    };
    
    // Ne asigurăm că avem token-ul în userData
    if (userData.token) {
      // Salvăm token-ul separat în localStorage
      localStorage.setItem('token', userData.token)
      // Setăm token-ul în header-ele axios
      setAuthToken(userData.token)
    }
    setUser(processedData)
    // Salvează datele utilizatorului în localStorage
    localStorage.setItem('user', JSON.stringify(processedData))
  }

  const updateUserProfile = (profileData) => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      ...profileData,
      memberSince: profileData.memberSince ? new Date(profileData.memberSince).toISOString() : user.memberSince
    };
    console.log('Actualizare profil utilizator:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Ștergem token-ul din header-ele axios
    setAuthToken(null)
    navigate('/login')
  }

  const value = {
    user,
    loginUser,
    updateUserProfile,
    logoutUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
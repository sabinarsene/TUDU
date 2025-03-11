import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const loginUser = (userData) => {
    console.log('Actualizare date utilizator:', userData);
    setUser(userData)
    // Salvează datele utilizatorului în localStorage
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const updateUserProfile = (profileData) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...profileData };
    console.log('Actualizare profil utilizator:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }

  const logoutUser = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
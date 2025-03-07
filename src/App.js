import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import PostServicePage from "./pages/PostServicePage"
import NotificationsPage from "./pages/NotificationsPage"
import MessagesPage from "./pages/MessagesPage"
import ServiceDetailsPage from "./pages/ServiceDetailsPage"
import SettingsPage from "./pages/SettingsPage"
import RequestsPage from "./pages/RequestsPage"
import PostRequestPage from "./pages/PostRequestPage"
import RequestDetailsPage from "./pages/RequestDetailsPage"
import "./App.css"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/post-service" element={<ProtectedRoute><PostServicePage /></ProtectedRoute>} />
          <Route path="/post-request" element={<PostRequestPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
          <Route path="/service/:serviceId" element={<ServiceDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/request/:requestId" element={<RequestDetailsPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


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
import ProfileSetupPage from "./pages/ProfileSetupPage"
import SuccessPage from "./pages/SuccessPage"
import LandingPage from "./pages/LandingPage"
import "./App.css"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ChatPage from './pages/ChatPage';
import { ChakraProvider } from '@chakra-ui/react';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ChakraProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/post-service" element={<ProtectedRoute><PostServicePage /></ProtectedRoute>} />
              <Route path="/post-request" element={<ProtectedRoute><PostRequestPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
              <Route path="/request/:requestId" element={<ProtectedRoute><RequestDetailsPage /></ProtectedRoute>} />
              <Route path="/requests/:requestId" element={<ProtectedRoute><RequestDetailsPage /></ProtectedRoute>} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/chat/:userId" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </ChakraProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App


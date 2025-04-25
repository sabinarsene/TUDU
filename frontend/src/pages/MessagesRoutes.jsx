import { Routes, Route, Navigate } from "react-router-dom"
import ChatPage from "./ChatPage"

const MessagesRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/:conversationId" element={<Navigate to={params => `/chat/${params.conversationId}`} replace />} />
    </Routes>
  )
}

export default MessagesRoutes


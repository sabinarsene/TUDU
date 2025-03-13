import { Routes, Route } from "react-router-dom"
import MessagesPage from "./MessagesPage"

const MessagesRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MessagesPage />} />
      <Route path="/:conversationId" element={<MessagesPage />} />
    </Routes>
  )
}

export default MessagesRoutes


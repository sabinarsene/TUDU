"use client"

import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Search, Send, Image, MapPin, MoreVertical, ArrowLeft, Phone, Info } from "lucide-react"
import "./MessagesPage.css"

// Sample conversations data
const SAMPLE_CONVERSATIONS = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Alexandru Munteanu",
      image: "/placeholder.svg?height=50&width=50",
      isOnline: true,
      lastSeen: "Acum",
    },
    lastMessage: {
      text: "Bună ziua! Aș dori să știu dacă sunteți disponibil pentru o lucrare de instalații sanitare săptămâna viitoare?",
      time: "10:30",
      isRead: false,
      sender: "them",
    },
    unreadCount: 1,
    service: {
      id: 201,
      title: "Reparații instalații sanitare",
    },
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Maria Dumitrescu",
      image: "/placeholder.svg?height=50&width=50",
      isOnline: false,
      lastSeen: "1 oră în urmă",
    },
    lastMessage: {
      text: "Mulțumesc pentru serviciile oferite! Totul arată perfect.",
      time: "Ieri",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
    service: {
      id: 202,
      title: "Curățenie apartament",
    },
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Andrei Popescu",
      image: "/placeholder.svg?height=50&width=50",
      isOnline: true,
      lastSeen: "Acum",
    },
    lastMessage: {
      text: "Da, pot să ajung mâine la ora 14:00. Este ok pentru dvs?",
      time: "Luni",
      isRead: true,
      sender: "you",
    },
    unreadCount: 0,
    service: {
      id: 203,
      title: "Montaj mobilă",
    },
  },
  {
    id: 4,
    user: {
      id: 104,
      name: "Cristina Ionescu",
      image: "/placeholder.svg?height=50&width=50",
      isOnline: false,
      lastSeen: "3 ore în urmă",
    },
    lastMessage: {
      text: "Vă mulțumesc pentru ofertă. Voi reveni cu un răspuns în curând.",
      time: "28 Iun",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
    service: {
      id: 204,
      title: "Lecții de pian",
    },
  },
  {
    id: 5,
    user: {
      id: 105,
      name: "Mihai Vasile",
      image: "/placeholder.svg?height=50&width=50",
      isOnline: false,
      lastSeen: "Ieri",
    },
    lastMessage: {
      text: "Am trimis plata pentru serviciul de transport. Vă rog să confirmați primirea.",
      time: "25 Iun",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
    service: {
      id: 205,
      title: "Transport marfă",
    },
  },
]

// Sample messages for a conversation
const SAMPLE_MESSAGES = {
  1: [
    {
      id: 1,
      text: "Bună ziua! Am văzut anunțul dvs. pentru reparații instalații sanitare.",
      time: "Ieri 10:15",
      sender: "them",
      isRead: true,
    },
    {
      id: 2,
      text: "Bună ziua! Cu ce vă pot ajuta?",
      time: "Ieri 10:20",
      sender: "you",
      isRead: true,
    },
    {
      id: 3,
      text: "Am o problemă cu robinetul din bucătărie care curge. Ați putea veni să îl reparați?",
      time: "Ieri 10:22",
      sender: "them",
      isRead: true,
    },
    {
      id: 4,
      text: "Sigur, pot să vă ajut. Când ați dori să vin?",
      time: "Ieri 10:25",
      sender: "you",
      isRead: true,
    },
    {
      id: 5,
      text: "Bună ziua! Aș dori să știu dacă sunteți disponibil pentru o lucrare de instalații sanitare săptămâna viitoare?",
      time: "Azi 10:30",
      sender: "them",
      isRead: false,
    },
  ],
  2: [
    {
      id: 1,
      text: "Bună ziua! Aș dori să rezerv serviciul dvs. de curățenie pentru apartamentul meu.",
      time: "Acum 2 zile",
      sender: "them",
      isRead: true,
    },
    {
      id: 2,
      text: "Bună ziua! Sigur, vă pot ajuta. Ce suprafață are apartamentul?",
      time: "Acum 2 zile",
      sender: "you",
      isRead: true,
    },
    {
      id: 3,
      text: "Este un apartament de 2 camere, aproximativ 60mp.",
      time: "Acum 2 zile",
      sender: "them",
      isRead: true,
    },
    {
      id: 4,
      text: "Perfect. Prețul ar fi 150 RON pentru curățenie completă. Când ați dori să vin?",
      time: "Acum 2 zile",
      sender: "you",
      isRead: true,
    },
    {
      id: 5,
      text: "Aș dori pentru mâine dacă este posibil.",
      time: "Acum 2 zile",
      sender: "them",
      isRead: true,
    },
    {
      id: 6,
      text: "Mâine sunt disponibil după ora 14:00. Este ok?",
      time: "Acum 2 zile",
      sender: "you",
      isRead: true,
    },
    {
      id: 7,
      text: "Da, este perfect. Vă aștept la ora 14:00.",
      time: "Acum 2 zile",
      sender: "them",
      isRead: true,
    },
    {
      id: 8,
      text: "Mulțumesc pentru serviciile oferite! Totul arată perfect.",
      time: "Ieri",
      sender: "them",
      isRead: true,
    },
  ],
}

const MessagesPage = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS)

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.service.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current conversation
  const currentConversation = conversationId
    ? conversations.find((c) => c.id === Number.parseInt(conversationId))
    : null

  // Get messages for current conversation
  const messages = conversationId ? SAMPLE_MESSAGES[conversationId] || [] : []

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    // In a real app, you would send this message to your backend
    console.log("Sending message:", newMessage)

    // Clear the input
    setNewMessage("")
  }

  // Mark conversation as read when opened
  if (currentConversation && currentConversation.unreadCount > 0) {
    const updatedConversations = conversations.map((conv) =>
      conv.id === currentConversation.id
        ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
        : conv,
    )
    setConversations(updatedConversations)
  }

  return (
    <div className="messages-page">
      {!conversationId ? (
        // Conversations list view
        <>
          <header className="page-header">
            <Link to="/" className="back-button">
              <ChevronLeft size={24} />
            </Link>
            <h1>Mesaje</h1>
          </header>

          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Caută conversații..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-state">
                <Send size={48} />
                <h3>Nu ai conversații</h3>
                <p>Când vei începe o conversație cu un prestator sau client, va apărea aici.</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <Link
                  to={`/messages/${conversation.id}`}
                  key={conversation.id}
                  className={`conversation-item ${conversation.unreadCount > 0 ? "unread" : ""}`}
                >
                  <div className="conversation-avatar">
                    <img
                      src={conversation.user.image || "/placeholder.svg"}
                      alt={conversation.user.name}
                      className="user-avatar"
                    />
                    {conversation.user.isOnline && <span className="online-indicator"></span>}
                  </div>

                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h3 className="user-name">{conversation.user.name}</h3>
                      <span className="message-time">{conversation.lastMessage.time}</span>
                    </div>

                    <p className="service-title">{conversation.service.title}</p>

                    <div className="last-message">
                      {conversation.lastMessage.sender === "you" && <span>Tu: </span>}
                      {conversation.lastMessage.text}
                    </div>
                  </div>

                  {conversation.unreadCount > 0 && <span className="unread-badge">{conversation.unreadCount}</span>}
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        // Conversation detail view
        <>
          <header className="chat-header">
            <button className="back-button" onClick={() => navigate("/messages")}>
              <ArrowLeft size={24} />
            </button>

            {currentConversation && (
              <div className="chat-user-info">
                <img
                  src={currentConversation.user.image || "/placeholder.svg"}
                  alt={currentConversation.user.name}
                  className="user-avatar"
                />
                <div className="user-details">
                  <h2 className="user-name">{currentConversation.user.name}</h2>
                  <p className="user-status">
                    {currentConversation.user.isOnline ? "Online" : currentConversation.user.lastSeen}
                  </p>
                </div>
              </div>
            )}

            <div className="chat-actions">
              <button className="action-button" title="Apel">
                <Phone size={20} />
              </button>
              <button className="action-button" title="Informații">
                <Info size={20} />
              </button>
              <button className="action-button" title="Mai multe">
                <MoreVertical size={20} />
              </button>
            </div>
          </header>

          <div className="service-banner">
            <p>
              Conversație despre: <strong>{currentConversation?.service.title}</strong>
            </p>
          </div>

          <div className="messages-container">
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className={`message-bubble ${message.sender === "you" ? "sent" : "received"}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {message.time}
                      {message.sender === "you" && (
                        <span className={`read-status ${message.isRead ? "read" : ""}`}>
                          {message.isRead ? "Citit" : "Livrat"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form className="message-input-container" onSubmit={handleSendMessage}>
              <button type="button" className="attachment-button" title="Atașează imagine">
                <Image size={20} />
              </button>
              <button type="button" className="attachment-button" title="Trimite locație">
                <MapPin size={20} />
              </button>

              <input
                type="text"
                placeholder="Scrie un mesaj..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
              />

              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default MessagesPage


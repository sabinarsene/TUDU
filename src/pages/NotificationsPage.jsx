"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, MessageCircle, CreditCard, Star, Bell, Check, Trash2, CheckCheck } from "lucide-react"
import "./NotificationsPage.css"

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: "message",
    title: "Mesaj nou",
    content: "Alexandru M. ți-a trimis un mesaj despre serviciul tău de reparații.",
    time: "10 minute în urmă",
    isRead: false,
    actionLink: "/messages/1",
    sender: {
      id: 101,
      name: "Alexandru M.",
      image: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 2,
    type: "booking",
    title: "Rezervare nouă",
    content: "Maria D. a rezervat serviciul tău de curățenie pentru data de 15 Iulie.",
    time: "2 ore în urmă",
    isRead: false,
    actionLink: "/bookings/2",
    sender: {
      id: 102,
      name: "Maria D.",
      image: "/placeholder.svg?height=50&width=50",
    },
  },
  {
    id: 3,
    type: "payment",
    title: "Plată primită",
    content: "Ai primit o plată de 150 RON pentru serviciul de reparații.",
    time: "Ieri",
    isRead: true,
    actionLink: "/payments/3",
  },
  {
    id: 4,
    type: "review",
    title: "Recenzie nouă",
    content: "Andrei P. ți-a lăsat o recenzie de 5 stele pentru serviciul tău.",
    time: "2 zile în urmă",
    isRead: true,
    actionLink: "/reviews/4",
    sender: {
      id: 103,
      name: "Andrei P.",
      image: "/placeholder.svg?height=50&width=50",
    },
    rating: 5,
  },
  {
    id: 5,
    type: "system",
    title: "Actualizare platformă",
    content: "Am lansat noi funcționalități pentru prestatorii de servicii. Verifică acum!",
    time: "1 săptămână în urmă",
    isRead: true,
    actionLink: "/announcements/5",
  },
  {
    id: 6,
    type: "booking",
    title: "Rezervare confirmată",
    content: "Rezervarea ta pentru serviciul de transport a fost confirmată.",
    time: "1 săptămână în urmă",
    isRead: true,
    actionLink: "/bookings/6",
  },
  {
    id: 7,
    type: "message",
    title: "Mesaj nou",
    content: "Cristina L. ți-a trimis un mesaj despre serviciul tău de montaj mobilă.",
    time: "2 săptămâni în urmă",
    isRead: true,
    actionLink: "/messages/7",
    sender: {
      id: 104,
      name: "Cristina L.",
      image: "/placeholder.svg?height=50&width=50",
    },
  },
]

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const [filter, setFilter] = useState("all")

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.isRead
    return notification.type === filter
  })

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageCircle size={20} />
      case "booking":
        return <Bell size={20} />
      case "payment":
        return <CreditCard size={20} />
      case "review":
        return <Star size={20} />
      case "system":
        return <Bell size={20} />
      default:
        return <Bell size={20} />
    }
  }

  return (
    <div className="notifications-page">
      <header className="page-header">
        <Link to="/" className="back-button">
          <ChevronLeft size={24} />
        </Link>
        <h1>Notificări</h1>
        {unreadCount > 0 && (
          <button className="mark-all-read" onClick={markAllAsRead} title="Marchează toate ca citite">
            <CheckCheck size={20} />
          </button>
        )}
      </header>

      <div className="notifications-filters">
        <button className={`filter-button ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          Toate
        </button>
        <button className={`filter-button ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
          Necitite {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
        <button
          className={`filter-button ${filter === "message" ? "active" : ""}`}
          onClick={() => setFilter("message")}
        >
          Mesaje
        </button>
        <button
          className={`filter-button ${filter === "booking" ? "active" : ""}`}
          onClick={() => setFilter("booking")}
        >
          Rezervări
        </button>
        <button
          className={`filter-button ${filter === "payment" ? "active" : ""}`}
          onClick={() => setFilter("payment")}
        >
          Plăți
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h3>Nu ai notificări</h3>
            <p>Notificările vor apărea aici când primești mesaje, rezervări sau actualizări.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${!notification.isRead ? "unread" : ""}`}>
              <div className="notification-content">
                <div className={`notification-icon ${notification.type}`}>{getNotificationIcon(notification.type)}</div>

                <div className="notification-details">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{notification.time}</span>
                  </div>

                  <p className="notification-text">{notification.content}</p>

                  {notification.sender && (
                    <div className="notification-sender">
                      <img
                        src={notification.sender.image || "/placeholder.svg"}
                        alt={notification.sender.name}
                        className="sender-image"
                      />
                      <span className="sender-name">{notification.sender.name}</span>

                      {notification.rating && (
                        <div className="rating">
                          {[...Array(notification.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#ffc939" color="#ffc939" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="notification-actions">
                    <Link to={notification.actionLink} className="action-button">
                      Vezi detalii
                    </Link>

                    {!notification.isRead && (
                      <button
                        className="action-icon-button"
                        onClick={() => markAsRead(notification.id)}
                        title="Marchează ca citit"
                      >
                        <Check size={18} />
                      </button>
                    )}

                    <button
                      className="action-icon-button delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Șterge notificarea"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsPage


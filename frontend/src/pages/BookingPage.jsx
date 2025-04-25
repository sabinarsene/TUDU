"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MessageCircle, 
  AlertTriangle,
  Loader,
  Check
} from "lucide-react";
import { getServiceById } from "../services/serviceApi";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, getProfileImageUrl } from "../utils/imageUtils";
import "./BookingPage.css";
import { Avatar } from '@chakra-ui/react';

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    notes: "",
    duration: 1, // în ore
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const getServiceDetails = async () => {
      try {
        setLoading(true);
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
        
        // Verificăm dacă utilizatorul încearcă să-și rezerve propriul serviciu
        if (user && serviceData.provider && user.id === serviceData.provider.id) {
          setError("Nu poți rezerva propriul serviciu.");
        }
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Nu am putut încărca detaliile serviciului. Vă rugăm încercați din nou mai târziu.");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      navigate('/login');
      return;
    }

    getServiceDetails();
  }, [serviceId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };

  const calculateTotalPrice = () => {
    if (!service) return 0;
    return parseFloat(service.price) * bookingData.duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!bookingData.date || !bookingData.time) {
      alert("Te rugăm să selectezi data și ora.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Implementarea API-ului pentru rezervare va fi adăugată ulterior
      // În acest moment, simulăm un răspuns de succes
      console.log("Booking data:", {
        serviceId,
        providerId: service.provider.id,
        userId: user.id,
        ...bookingData
      });
      
      // Simulăm un delay pentru a arăta loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBookingSuccess(true);
    } catch (error) {
      console.error("Error making booking:", error);
      alert("A apărut o eroare la rezervare. Te rugăm să încerci din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spinner" />
        <p>Se încarcă pagina de rezervare...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <h2>Eroare</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Înapoi la serviciu
        </button>
      </div>
    );
  }

  // If service not found
  if (!service) {
    return (
      <div className="service-not-found">
        <AlertTriangle size={48} />
        <h2>Serviciu negăsit</h2>
        <p>Serviciul căutat nu există sau a fost șters.</p>
        <button onClick={() => navigate("/")} className="back-home-button">
          Înapoi la pagina principală
        </button>
      </div>
    );
  }

  // Afișăm confirmarea rezervării
  if (bookingSuccess) {
    return (
      <div className="booking-success-container">
        <div className="booking-success-card">
          <div className="success-icon">
            <Check size={48} color="#30c979" />
          </div>
          <h2>Rezervare realizată cu succes!</h2>
          <p>Ți-am trimis un email cu detaliile rezervării.</p>
          <p>Prestatorul de servicii te va contacta în curând pentru a confirma rezervarea.</p>
          
          <div className="booking-details">
            <div className="booking-detail-item">
              <h3>Serviciu:</h3>
              <p>{service.title}</p>
            </div>
            <div className="booking-detail-item">
              <h3>Prestator:</h3>
              <p>{service.provider.name}</p>
            </div>
            <div className="booking-detail-item">
              <h3>Data și ora:</h3>
              <p>{bookingData.date} la ora {bookingData.time}</p>
            </div>
            <div className="booking-detail-item">
              <h3>Durată:</h3>
              <p>{bookingData.duration} {bookingData.duration === 1 ? 'oră' : 'ore'}</p>
            </div>
            <div className="booking-detail-item">
              <h3>Preț total:</h3>
              <p>{calculateTotalPrice()} {service.currency}</p>
            </div>
          </div>
          
          <div className="booking-actions">
            <Link to="/" className="home-button">
              Pagina principală
            </Link>
            <Link to="/bookings" className="view-bookings-button">
              Vezi rezervările mele
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <h1>Rezervă serviciul</h1>
      </header>

      <div className="booking-content">
        <div className="service-summary">
          <div className="service-image">
            <img
              src={getImageUrl(service.image)}
              alt={service.title}
              className="service-thumbnail"
            />
          </div>
          <div className="service-info">
            <h2 className="service-title">{service.title}</h2>
            <div className="service-provider">
              <Avatar
                src={getProfileImageUrl(service.provider)}
                name={service.provider?.name}
                size="sm"
                bg={!getProfileImageUrl(service.provider) ? "blue.500" : undefined}
                color="white"
              />
              <span>{service.provider?.name}</span>
            </div>
            <div className="service-price">
              <span className="price-amount">
                {service.price} {service.currency}
              </span>
              <span className="price-type">{service.price_type || "pe oră"}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="date">
              <Calendar size={18} />
              Data
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={bookingData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">
              <Clock size={18} />
              Ora
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={bookingData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">
              <Clock size={18} />
              Durată (ore)
            </label>
            <select
              id="duration"
              name="duration"
              value={bookingData.duration}
              onChange={handleChange}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                <option key={h} value={h}>{h} {h === 1 ? 'oră' : 'ore'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">
              <MessageCircle size={18} />
              Notă pentru prestator (opțional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              placeholder="Adaugă detalii suplimentare care ar putea fi utile prestatorului..."
              rows="4"
            />
          </div>

          <div className="price-summary">
            <div className="price-detail">
              <span>Preț pe oră:</span>
              <span>{service.price} {service.currency}</span>
            </div>
            <div className="price-detail">
              <span>Durată:</span>
              <span>{bookingData.duration} {bookingData.duration === 1 ? 'oră' : 'ore'}</span>
            </div>
            <div className="price-total">
              <span>Total:</span>
              <span>{calculateTotalPrice()} {service.currency}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="book-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={20} className="spinner" />
                Se procesează...
              </>
            ) : (
              'Confirmă rezervarea'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage; 
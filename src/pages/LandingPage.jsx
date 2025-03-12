import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Clock, Shield, MessageCircle, FileText, CheckCircle } from 'react-feather';
import logo from '../assets/images/logo_wide_white.png';
import './LandingPage.css';

const LandingPage = () => {
  const featuredServices = [
    {
      id: 1,
      title: "Meditații Matematică Clasele 9-12",
      category: "Educație",
      provider: {
        name: "Prof. Maria Popescu",
        rating: 4.9,
        reviews: 127,
        image: "/avatars/teacher1.svg"
      },
      price: "150 RON",
      image: "/images/math-tutoring.svg"
    },
    {
      id: 2,
      title: "Instalator Autorizat - Reparații",
      category: "Instalații",
      provider: {
        name: "Ioan Munteanu",
        rating: 4.8,
        reviews: 243,
        image: "/avatars/plumber1.svg"
      },
      price: "100 RON",
      image: "/images/plumbing.svg"
    },
    {
      id: 3,
      title: "Curățenie Apartamente și Case",
      category: "Curățenie",
      provider: {
        name: "Elena Dumitrescu",
        rating: 4.9,
        reviews: 189,
        image: "/avatars/cleaner1.svg"
      },
      price: "80 RON",
      image: "/images/cleaning.svg"
    }
  ];

  const benefits = [
    {
      icon: <Users size={24} />,
      title: "Profesioniști Verificați",
      description: "Toți prestatorii sunt verificați și evaluați de comunitate"
    },
    {
      icon: <Shield size={24} />,
      title: "Siguranță Garantată",
      description: "Plăți securizate și garanție pentru serviciile prestate"
    },
    {
      icon: <Clock size={24} />,
      title: "Economisești Timp",
      description: "Găsești rapid serviciul potrivit pentru nevoile tale"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src={logo} alt="Tudu Logo" className="hero-logo" />
          <h1>Servicii de încredere, la un click distanță</h1>
          <p>Conectăm profesioniști de încredere cu persoanele care au nevoie de serviciile lor</p>
          <div className="hero-buttons">
            <Link to="/signup" className="primary-button">
              Înregistrează-te Gratuit <ArrowRight size={20} />
            </Link>
            <Link to="/home" className="secondary-button">
              Explorează Servicii
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">Profesioniști</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50,000+</span>
            <span className="stat-label">Clienți Mulțumiți</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.8/5</span>
            <span className="stat-label">Rating Mediu</span>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-services">
        <h2>Servicii Populare</h2>
        <div className="services-showcase">
          {featuredServices.map(service => (
            <div key={service.id} className="featured-service-card">
              <div className="service-image">
                <img src={service.image} alt={service.title} />
                <span className="service-category">{service.category}</span>
              </div>
              <div className="service-details">
                <h3>{service.title}</h3>
                <div className="provider-info">
                  <img src={service.provider.image} alt={service.provider.name} className="provider-avatar" />
                  <div className="provider-details">
                    <span className="provider-name">{service.provider.name}</span>
                    <div className="provider-rating">
                      <Star size={14} fill="#ffc939" color="#ffc939" />
                      <span>{service.provider.rating}</span>
                      <span className="review-count">({service.provider.reviews} review-uri)</span>
                    </div>
                  </div>
                </div>
                <div className="service-price">
                  <span className="price">{service.price}</span>
                  <span className="price-label">/oră</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>De ce să alegi Tudu?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Communication Section */}
      <section className="communication-section">
        <div className="communication-content">
          <div className="communication-text">
            <h2>Comunicare Directă cu Prestatorii</h2>
            <p>Discută detaliile serviciului direct cu prestatorul și primește răspunsuri rapide la întrebările tale.</p>
            <ul className="feature-list">
              <li>
                <MessageCircle size={24} />
                <span>Chat în timp real cu prestatorii</span>
              </li>
              <li>
                <FileText size={24} />
                <span>Trimite detalii specifice despre nevoile tale</span>
              </li>
              <li>
                <CheckCircle size={24} />
                <span>Confirmă și programează serviciul direct în aplicație</span>
              </li>
            </ul>
          </div>
          <div className="communication-image">
            <img src="/images/communication.svg" alt="Comunicare cu prestatorii" />
          </div>
        </div>
      </section>

      {/* Request Service Section */}
      <section className="request-service-section">
        <div className="request-service-content">
          <h2>Solicită un Serviciu în 3 Pași Simpli</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Descrie Nevoile Tale</h3>
              <p>Completează un formular simplu cu detaliile serviciului de care ai nevoie</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Primește Oferte</h3>
              <p>Prestatorii calificați îți vor trimite oferte personalizate</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Alege și Programează</h3>
              <p>Selectează oferta potrivită și stabilește detaliile cu prestatorul</p>
            </div>
          </div>
          <div className="request-cta">
            <Link to="/request-service" className="primary-button">
              Solicită un Serviciu Acum <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Începe să folosești Tudu astăzi</h2>
          <p>Alătură-te comunității noastre și găsește serviciile perfecte pentru tine</p>
          <Link to="/signup" className="cta-button">
            Creează Cont Gratuit <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 
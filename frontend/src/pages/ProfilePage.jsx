"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Star, Settings, Edit, MapPin, Calendar, MessageCircle, Loader, AlertTriangle, Trash2, LogOut, Briefcase, User, Clock } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import "./ProfilePage.css"
import { deleteService, getUserServices } from "../services/serviceApi"
import { fetchUserRequests, deleteRequest } from "../services/requestApi"
import { FaMapMarkerAlt, FaClock, FaEye } from 'react-icons/fa'
import defaultProfileImage from '../assets/default-profile.jpg'
import UserRating from "../components/UserRating"
import { getImageUrl, handleImageError } from "../utils/imageUtils"
import { getFavoriteServices, getFavoriteRequests } from "../services/favoriteApi"

const ProfilePage = () => {
  const { user, logoutUser, loginUser } = useAuth()
  const navigate = useNavigate()
  const { userId } = useParams()
  const [activeTab, setActiveTab] = useState("services")
  const [services, setServices] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const [profileData, setProfileData] = useState({
    occupation: '',
    education: '',
    age: '',
    location: '',
    bio: '',
    specialization: '',
    experience: '',
    languages: '',
    availability: ''
  })
  const [profileUser, setProfileUser] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const isOwnProfile = !userId || (user && userId === String(user.id))
  const [requests, setRequests] = useState([])
  const [favoriteServices, setFavoriteServices] = useState([])
  const [favoriteRequests, setFavoriteRequests] = useState([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingServiceId, setDeletingServiceId] = useState(null)
  const [deletingRequestId, setDeletingRequestId] = useState(null)

  // Set default tab based on whether it's own profile or not
  useEffect(() => {
    if (!isOwnProfile) {
      setActiveTab("about")
    } else {
      setActiveTab("services")
    }
  }, [isOwnProfile])

  const formatMemberDate = (date) => {
    if (!date) return 'Dată necunoscută';
    
    try {
      const memberDate = new Date(date);
      if (isNaN(memberDate.getTime())) {
        return 'Dată necunoscută';
      }
      return memberDate.toLocaleDateString('ro-RO', {
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Dată necunoscută';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Dată necunoscută';
    
    try {
      const postDate = new Date(date);
      if (isNaN(postDate.getTime())) {
        return 'Dată necunoscută';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - postDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Astăzi';
      } else if (diffDays === 1) {
        return 'Ieri';
      } else if (diffDays < 7) {
        return `Acum ${diffDays} zile`;
      } else {
        return postDate.toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Dată necunoscută';
    }
  };

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        console.log("Fetching profile data, userId:", userId, "isOwnProfile:", isOwnProfile);
        
        if (userId) {
          // Fetch other user's profile
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
          console.log("Fetching profile from:", `${API_URL}/profile/${userId}`);
          
          const response = await fetch(`${API_URL}/profile/${userId}`)
          
          if (!response.ok) {
            console.error("Error response:", response.status, response.statusText);
            throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log('Profile data received:', data)
          setProfileUser(data)
          
          // Verificăm dacă există servicii în răspunsul API-ului
          console.log('Services in profile data:', data.services);
          
          // Folosim noua funcție fetchUserServices pentru a obține serviciile utilizatorului
          try {
            const servicesData = await getUserServices(userId);
            console.log('User services data received:', servicesData);
            setServices(servicesData || []);
            console.log('Services state after setting:', servicesData || []);
          } catch (error) {
            console.error(`Error fetching services for user ${userId}:`, error);
          }

          // Fetch user's requests
          console.log("Fetching requests from:", `${API_URL}/requests/user/${userId}`);
          try {
            const requestsData = await fetchUserRequests(userId);
            console.log('Requests data received:', requestsData);
            setRequests(requestsData || []);
          } catch (error) {
            console.error(`Error fetching requests for user ${userId}:`, error);
          }
        } else {
          // Set current user's profile
          console.log("Using current user's profile:", user);
          setProfileUser(user)
          setProfileData({
            occupation: user.occupation || '',
            education: user.education || '',
            age: user.age || '',
            location: user.location || '',
            bio: user.bio || '',
            specialization: user.specialization || '',
            experience: user.experience || '',
            languages: user.languages || '',
            availability: user.availability || ''
          })

          // Fetch current user's services and requests
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
          console.log("Fetching own services from:", `${API_URL}/services/user/${user.id}`);
          
          try {
            // Folosim noua funcție fetchUserServices
            const servicesData = await getUserServices(user.id);
            console.log('Own services data received:', servicesData);
            setServices(servicesData || []);
            console.log('Services state after setting (own profile):', servicesData || []);
          } catch (error) {
            console.error('Error fetching own services:', error);
          }

          try {
            // Folosim noua funcție fetchUserRequests
            const requestsData = await fetchUserRequests(user.id);
            console.log('Own requests data received:', requestsData);
            setRequests(requestsData || []);
          } catch (error) {
            console.error(`Error fetching requests for user ${user.id}:`, error);
          }
          
          // Fetch favorite services and requests if it's the user's own profile
          if (isOwnProfile) {
            setIsLoadingFavorites(true)
            try {
              const token = localStorage.getItem('token')
              const [favoriteServices, favoriteRequests] = await Promise.all([
                getFavoriteServices(token),
                getFavoriteRequests(token)
              ])
              console.log('Favorite services:', favoriteServices)
              console.log('Favorite requests:', favoriteRequests)
              setFavoriteServices(favoriteServices || [])
              setFavoriteRequests(favoriteRequests || [])
            } catch (error) {
              console.error('Error fetching favorites:', error)
            } finally {
              setIsLoadingFavorites(false)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Nu am putut încărca profilul. Vă rugăm încercați din nou mai târziu.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [userId, user, isOwnProfile])

  const handleSignOut = () => {
    logoutUser()
    navigate('/login')
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert("Imaginea trebuie să fie mai mică de 5MB")
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert("Te rugăm să încarci o imagine în format JPG, PNG sau WebP")
      return
    }

    let tempImageUrl = null;
    
    try {
      setIsUploading(true)
      setError(null)
      
      // Creăm un URL temporar pentru previzualizare
      tempImageUrl = URL.createObjectURL(file)
      
      console.log('Pregătire încărcare imagine:', {
        nume: file.name,
        tip: file.type,
        dimensiune: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      const formData = new FormData()
      formData.append('image', file)

      // Folosim URL-ul corect pentru API
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
      const apiEndpoint = `${API_URL}/profile/upload-image`
      
      console.log('API URL pentru încărcare imagine:', apiEndpoint)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Nu ești autentificat. Te rugăm să te autentifici din nou.')
      }
      
      console.log('Trimit cerere către server...');
      
      // Eliminăm header-ul Content-Type pentru că FormData îl va seta automat cu boundary corect
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Răspuns primit de la server:', {
        status: response.status,
        statusText: response.statusText
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Răspuns JSON:', data);
      } else {
        const text = await response.text();
        console.error('Răspuns non-JSON:', text);
        throw new Error('Răspuns neașteptat de la server');
      }

      if (!response.ok) {
        console.error('Eroare server:', data);
        throw new Error(data.message || data.error || 'Încărcarea imaginii a eșuat');
      }
      
      if (!data.user || !data.user.profileImage) {
        console.error('Răspuns invalid:', data);
        throw new Error('Răspunsul serverului nu conține datele necesare');
      }
      
      // Actualizăm utilizatorul cu noua imagine de profil primită de la server
      const updatedUser = { ...user, profileImage: data.user.profileImage };
      loginUser(updatedUser);
      
      // Afișăm un mesaj de succes
      alert('Imaginea de profil a fost actualizată cu succes!');

    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Eroare la încărcarea imaginii: ${error.message}`);
      setError(`Eroare la încărcarea imaginii: ${error.message}`);
    } finally {
      setIsUploading(false);
      
      // Revocăm URL-ul temporar pentru a elibera memoria
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error('Actualizarea profilului a eșuat')
      }

      const data = await response.json()
      loginUser(data.user)
      setProfileUser(data.user)
      alert('Profilul a fost actualizat cu succes!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveError('Actualizarea profilului a eșuat. Te rugăm să încerci din nou.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest serviciu? Această acțiune nu poate fi anulată.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeletingServiceId(serviceId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu ești autentificat');
      }
      
      await deleteService(serviceId, token);
      
      // Actualizăm lista de servicii după ștergere
      setServices(services.filter(service => service.id !== serviceId));
      
      // Afișăm un mesaj de succes temporar
      alert('Serviciul a fost șters cu succes!');
      
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('A apărut o eroare la ștergerea serviciului. Te rugăm să încerci din nou.');
    } finally {
      setIsDeleting(false);
      setDeletingServiceId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această cerere? Această acțiune nu poate fi anulată.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeletingRequestId(requestId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu ești autentificat');
      }
      
      await deleteRequest(requestId, token);
      
      // Actualizăm lista de cereri după ștergere
      setRequests(requests.filter(request => request.id !== requestId));
      
      // Afișăm un mesaj de succes temporar
      alert('Cererea a fost ștearsă cu succes!');
      
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('A apărut o eroare la ștergerea cererii. Te rugăm să încerci din nou.');
    } finally {
      setIsDeleting(false);
      setDeletingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="spinner" />
        <p>Se încarcă profilul...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Încearcă din nou
        </button>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="error-container">
        <AlertTriangle size={48} />
        <h2>Profil negăsit</h2>
        <p>Profilul căutat nu există sau a fost șters.</p>
        <button onClick={() => navigate("/")} className="back-home-button">
          Înapoi la pagina principală
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          {isOwnProfile ? (
            <div className="profile-image-container" onClick={handleImageClick}>
              {isUploading ? (
                <div className="uploading-overlay">
                  <Loader size={24} className="spinner" />
                </div>
              ) : (
                <div className="edit-overlay">
                  <Edit size={20} />
                </div>
              )}
              <img
                src={getImageUrl(profileUser.profileImage) || defaultProfileImage}
                alt={`${profileUser.firstName} ${profileUser.lastName}`}
                className="profile-image"
                onError={handleImageError}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="profile-image-container">
              <img
                src={getImageUrl(profileUser.profileImage) || defaultProfileImage}
                alt={`${profileUser.firstName} ${profileUser.lastName}`}
                className="profile-image"
                onError={handleImageError}
              />
            </div>
          )}
          
          <div className="profile-details">
            <h1 className="profile-name">{`${profileUser.firstName} ${profileUser.lastName}`}</h1>
            <div className="profile-meta">
              {profileUser.location && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{profileUser.location}</span>
                </div>
              )}
              <div className="meta-item">
                <Calendar size={16} />
                <span>Membru din {formatMemberDate(profileUser.memberSince)}</span>
              </div>
              {profileUser.rating && (
                <div className="meta-item">
                  <Star size={16} fill="#ffc939" color="#ffc939" />
                  <span>{profileUser.rating} ({profileUser.reviewCount || 0} recenzii)</span>
                </div>
              )}
            </div>
          </div>
          
          {isOwnProfile ? (
            <div className="profile-actions">
              <Link to="/settings" className="settings-button">
                <Settings size={20} />
              </Link>
              <button className="logout-button" onClick={handleSignOut}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="profile-actions">
              <Link to="/chat" state={{ receiverId: profileUser.id, receiverName: `${profileUser.firstName} ${profileUser.lastName}` }} className="message-button">
                <MessageCircle size={18} />
                <span>Trimite mesaj</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs diferite pentru profil propriu vs. profil altcuiva */}
      {isOwnProfile ? (
        // Tabs pentru propriul profil
        <div className="profile-tabs own-profile-tabs">
          <button
            className={`tab-button ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            <Briefcase size={20} />
            <span>Serviciile mele</span>
          </button>
          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <MessageCircle size={20} />
            <span>Cererile mele</span>
          </button>
          <button
            className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} />
            <span>Editare profil</span>
          </button>
          <button
            className={`tab-button ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            <Star size={20} />
            <span>Favorite</span>
          </button>
        </div>
      ) : (
        // Tabs pentru profilul altcuiva
        <div className="profile-tabs other-profile-tabs">
          <button
            className={`tab-button ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            <User size={20} />
            <span>Despre</span>
          </button>
          <button
            className={`tab-button ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            <Briefcase size={20} />
            <span>Servicii</span>
          </button>
          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <MessageCircle size={20} />
            <span>Cereri</span>
          </button>
          <button
            className={`tab-button ${activeTab === "ratings" ? "active" : ""}`}
            onClick={() => setActiveTab("ratings")}
          >
            <Star size={20} />
            <span>Evaluări</span>
          </button>
        </div>
      )}

      <div className="profile-content">
        {activeTab === "services" && (
          <div className="services-section">
            <div className="section-header">
              <h2>{isOwnProfile ? "Serviciile mele" : `Servicii oferite de ${profileUser.firstName}`}</h2>
              {isOwnProfile && (
                <Link to="/post-service" className="add-button">
                  Adaugă serviciu
                </Link>
              )}
            </div>

            {console.log("Rendering services section, services:", services)}
            
            {loading ? (
              <div className="loading-container">
                <Loader size={48} className="spinner" />
                <p>Se încarcă serviciile...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <AlertTriangle size={48} />
                <p>{error}</p>
                <button className="retry-button" onClick={() => window.location.reload()}>
                  Încearcă din nou
                </button>
              </div>
            ) : !services || services.length === 0 ? (
              <div className="empty-state">
                <p>{isOwnProfile ? "Nu ai publicat niciun serviciu încă." : "Acest utilizator nu a publicat niciun serviciu încă."}</p>
                {isOwnProfile && (
                  <Link to="/post-service" className="add-button">
                    Adaugă primul tău serviciu
                  </Link>
                )}
              </div>
            ) : (
              <div className="services-grid">
                {console.log("Mapping through services:", services)}
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-image-container">
                      <img
                        src={getImageUrl(service.image)}
                        alt={service.title}
                        className="service-image"
                        onError={handleImageError}
                      />
                      <span className="service-category">{service.category}</span>
                    </div>
                    <div className="service-content">
                      <Link to={`/services/${service.id}`} className="service-title-link">
                        <h3 className="service-title">{service.title}</h3>
                      </Link>
                      <div className="service-meta">
                        <div className="service-location">
                          <FaMapMarkerAlt />
                          <span>{service.location}</span>
                        </div>
                        <div className="service-rating">
                          <Star size={16} fill="#ffc939" color="#ffc939" />
                          <span>
                            {service.rating || "N/A"} ({service.review_count || 0})
                          </span>
                        </div>
                      </div>
                      {!isOwnProfile && service.provider && (
                        <div className="service-provider">
                          <img
                            src={getImageUrl(service.provider.image)}
                            alt={service.provider.name}
                            className="provider-image"
                            onError={handleImageError}
                          />
                          <Link to={`/profile/${service.provider.id}`} className="provider-name">
                            {service.provider.name}
                          </Link>
                        </div>
                      )}
                      <div className="service-price">
                        <span className="price-amount">
                          {service.price} {service.currency}
                        </span>
                      </div>
                      <div className="service-actions">
                        <Link to={`/services/${service.id}`} className="view-button">
                          <FaEye /> Vezi detalii
                        </Link>
                        {isOwnProfile && (
                          <>
                            <Link to={`/edit-service/${service.id}`} className="edit-button">
                              <Edit size={16} /> Editează
                            </Link>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteService(service.id)}
                              disabled={isDeleting && deletingServiceId === service.id}
                            >
                              {isDeleting && deletingServiceId === service.id ? (
                                <Loader size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Șterge
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="requests-section">
            <div className="section-header">
              <h2>{isOwnProfile ? "Cererile mele" : `Cereri postate de ${profileUser.firstName}`}</h2>
              {isOwnProfile && (
                <Link to="/post-request" className="add-button">
                  Adaugă cerere
                </Link>
              )}
            </div>

            {loading ? (
              <div className="loading-container">
                <Loader size={48} className="spinner" />
                <p>Se încarcă cererile...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <AlertTriangle size={48} />
                <p>{error}</p>
                <button className="retry-button" onClick={() => window.location.reload()}>
                  Încearcă din nou
                </button>
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="empty-state">
                <p>{isOwnProfile ? "Nu ai postat nicio cerere încă." : "Acest utilizator nu a postat nicio cerere încă."}</p>
                {isOwnProfile && (
                  <Link to="/post-request" className="add-button">
                    Adaugă prima ta cerere
                  </Link>
                )}
              </div>
            ) : (
              <div className="requests-grid">
                {requests.map((request) => (
                  <div key={request.id} className="request-card">
                    <Link to={`/request/${request.id}`} className="request-content">
                      <div className="request-header">
                        <div className="request-category">{request.category}</div>
                        <div className="request-time">
                          <Clock size={14} />
                          <span>{request.postedAt || formatDate(request.created_at)}</span>
                        </div>
                      </div>

                      <h3 className="request-title">{request.title}</h3>

                      <div className="request-location">
                        <MapPin size={16} />
                        <span>{request.location}</span>
                      </div>

                      <p className="request-description">{request.description}</p>

                      <div className="request-footer">
                        <div className="request-budget">
                          <span className="budget-amount">
                            {request.budget} {request.currency || 'RON'}
                          </span>
                        </div>

                        <div className="request-deadline">
                          <Clock size={16} />
                          <span>Termen: {request.deadline}</span>
                        </div>
                      </div>
                    </Link>

                    {isOwnProfile && (
                      <div className="request-actions">
                        <Link to={`/edit-request/${request.id}`} className="edit-button">
                          <Edit size={16} />
                          <span>Editează</span>
                        </Link>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={isDeleting && deletingRequestId === request.id}
                        >
                          {isDeleting && deletingRequestId === request.id ? (
                            <Loader size={16} className="spinner" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          <span>Șterge</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ratings" && !isOwnProfile && (
          <div className="ratings-tab">
            <h2>Evaluări pentru {profileUser.firstName} {profileUser.lastName}</h2>
            <UserRating userId={userId} />
          </div>
        )}

        {activeTab === "about" && !isOwnProfile && (
          <div className="about-tab">
            <div className="section-header">
              <h2>Despre {profileUser.firstName} {profileUser.lastName}</h2>
            </div>
            
            <div className="about-content">
              {profileUser.bio && (
                <div className="about-section">
                  <h3>Biografie</h3>
                  <p>{profileUser.bio}</p>
                </div>
              )}
              
              <div className="about-details">
                {profileUser.occupation && (
                  <div className="detail-item">
                    <h4>Ocupație</h4>
                    <p>{profileUser.occupation}</p>
                  </div>
                )}
                
                {profileUser.education && (
                  <div className="detail-item">
                    <h4>Educație</h4>
                    <p>{profileUser.education}</p>
                  </div>
                )}
                
                {profileUser.age && (
                  <div className="detail-item">
                    <h4>Vârstă</h4>
                    <p>{profileUser.age} ani</p>
                  </div>
                )}
                
                {profileUser.location && (
                  <div className="detail-item">
                    <h4>Locație</h4>
                    <p>{profileUser.location}</p>
                  </div>
                )}
                
                {profileUser.specialization && (
                  <div className="detail-item">
                    <h4>Specializare</h4>
                    <p>{profileUser.specialization}</p>
                  </div>
                )}
                
                {profileUser.experience && (
                  <div className="detail-item">
                    <h4>Experiență</h4>
                    <p>{profileUser.experience}</p>
                  </div>
                )}
                
                {profileUser.languages && (
                  <div className="detail-item">
                    <h4>Limbi vorbite</h4>
                    <p>{profileUser.languages}</p>
                  </div>
                )}
                
                {profileUser.availability && (
                  <div className="detail-item">
                    <h4>Disponibilitate</h4>
                    <p>{profileUser.availability}</p>
                  </div>
                )}
              </div>
              
              {!profileUser.bio && 
               !profileUser.occupation && 
               !profileUser.education && 
               !profileUser.age && 
               !profileUser.specialization && 
               !profileUser.experience && 
               !profileUser.languages && 
               !profileUser.availability && (
                <div className="empty-state">
                  <p>Acest utilizator nu a adăugat încă informații despre el.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && isOwnProfile && (
          <div className="profile-edit-section">
            <div className="section-header">
              <h2>Editare Profil</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="occupation">Ocupație</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={profileData.occupation}
                  onChange={handleProfileChange}
                  placeholder="Ex: Instalator, Profesor, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Educație</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={profileData.education}
                  onChange={handleProfileChange}
                  placeholder="Ex: Licență în Inginerie"
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Vârstă</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profileData.age}
                  onChange={handleProfileChange}
                  min="18"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Locație</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  placeholder="Ex: București, Sector 1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Descriere</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Spune-ne mai multe despre tine..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specializare</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleProfileChange}
                  placeholder="Ex: Instalații electrice, Matematică"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experiență</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleProfileChange}
                  placeholder="Ex: 5 ani în domeniu"
                />
              </div>

              <div className="form-group">
                <label htmlFor="languages">Limbi vorbite</label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={profileData.languages}
                  onChange={handleProfileChange}
                  placeholder="Ex: Română, Engleză"
                />
              </div>

              <div className="form-group">
                <label htmlFor="availability">Disponibilitate</label>
                <select
                  id="availability"
                  name="availability"
                  value={profileData.availability}
                  onChange={handleProfileChange}
                >
                  <option value="">Selectează disponibilitatea</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekend">Weekend</option>
                  <option value="flexible">Program flexibil</option>
                </select>
              </div>

              {saveError && (
                <div className="error-message">
                  {saveError}
                </div>
              )}

              <button type="submit" className="save-button" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader size={16} className="spinner" />
                    Se salvează...
                  </>
                ) : (
                  'Salvează modificările'
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === "favorites" && isOwnProfile && (
          <div className="favorites-section">
            <div className="section-header">
              <h2>Servicii favorite</h2>
            </div>
            {isLoadingFavorites ? (
              <div className="loading-container">
                <Loader size={48} className="spinner" />
                <p>Se încarcă favoritele...</p>
              </div>
            ) : !favoriteServices || !favoriteServices.services || favoriteServices.services.length === 0 ? (
              <div className="empty-state">
                <p>Nu ai niciun serviciu favorit momentan.</p>
              </div>
            ) : (
              <div className="services-grid">
                {favoriteServices.services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-image-container">
                      <img 
                        src={getImageUrl(service.image)} 
                        alt={service.title || 'Service image'} 
                        onError={handleImageError} 
                      />
                      {service.category && (
                        <span className="service-category">{service.category}</span>
                      )}
                    </div>
                    <div className="service-content">
                      <h3 className="service-title">{service.title}</h3>
                      {service.description && (
                        <p className="service-description">{service.description}</p>
                      )}
                      <div className="service-meta">
                        {service.location && (
                          <div className="service-location">
                            <FaMapMarkerAlt />
                            <span>{service.location}</span>
                          </div>
                        )}
                        {service.rating && (
                          <div className="service-rating">
                            <Star size={16} fill="#ffc939" color="#ffc939" />
                            <span>{service.rating} ({service.review_count || 0})</span>
                          </div>
                        )}
                      </div>
                      <div className="service-price">
                        <span className="price-amount">
                          {service.price} {service.currency}
                        </span>
                      </div>
                      <div className="service-actions">
                        <Link to={`/services/${service.id}`} className="view-button">
                          <FaEye /> Vezi serviciul
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section-header">
              <h2>Cereri favorite</h2>
            </div>
            {isLoadingFavorites ? (
              <div className="loading-container">
                <Loader size={48} className="spinner" />
                <p>Se încarcă favoritele...</p>
              </div>
            ) : !favoriteRequests || !favoriteRequests.requests || favoriteRequests.requests.length === 0 ? (
              <div className="empty-state">
                <p>Nu ai nicio cerere favorită momentan.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {favoriteRequests.requests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-image-container">
                      <img 
                        src={request.images && request.images.length > 0 
                          ? getImageUrl(request.images[0].image_url) 
                          : defaultProfileImage}
                        alt={request.title}
                        className="request-image"
                        onError={handleImageError}
                      />
                      <span className="request-category">{request.category}</span>
                    </div>
                    <div className="request-content">
                      <h3 className="request-title">{request.title}</h3>
                      <div className="request-meta">
                        <div className="request-location">
                          <FaMapMarkerAlt />
                          <span>{request.location}</span>
                        </div>
                        <div className="request-deadline">
                          <FaClock />
                          <span>{request.deadline}</span>
                        </div>
                      </div>
                      <div className="request-budget">
                        <span className="budget-amount">
                          {request.budget} {request.currency}
                        </span>
                      </div>
                      <div className="request-actions">
                        <Link to={`/requests/${request.id}`} className="view-request-button">
                          <FaEye /> Vezi cererea
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
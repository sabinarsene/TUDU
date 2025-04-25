import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Avatar } from '@chakra-ui/react';
import { getImageUrl, getProfileImageUrl, handleImageError } from '../utils/imageUtils';

const ServiceCard = ({ service }) => {
  return (
    <div className="service-card">
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
            <MapPin size={16} />
            <span>{service.location}</span>
          </div>
          <div className="service-rating">
            <Star size={16} fill="#ffc939" color="#ffc939" />
            <span>
              {service.rating || "N/A"} ({service.review_count || 0})
            </span>
          </div>
        </div>
        {service.provider && (
          <div className="service-provider">
            <Avatar
              src={getProfileImageUrl(service.provider)}
              name={service.provider.name || `${service.provider.firstName || ''} ${service.provider.lastName || ''}`}
              size="sm"
              bg={!getProfileImageUrl(service.provider) ? "blue.500" : undefined}
              color="white"
              className="provider-avatar"
            />
            <Link to={`/profile/${service.provider.id}`} className="provider-name">
              {service.provider.name || `${service.provider.firstName || ''} ${service.provider.lastName || ''}`}
            </Link>
          </div>
        )}
        <div className="service-price">
          <span className="price-amount">
            {service.price} {service.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 
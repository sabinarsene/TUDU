import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Avatar } from '@chakra-ui/react';
import { getImageUrl, getProfileImageUrl, handleImageError } from '../utils/imageUtils';

const RequestCard = ({ request }) => {
  const firstImage = request.images && request.images.length > 0 ? request.images[0].image_url : null;
  
  return (
    <div className="request-card">
      <div className="request-image-container">
        <img 
          src={getImageUrl(firstImage)} 
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
            <MapPin size={16} />
            <span>{request.location}</span>
          </div>
          <div className="request-deadline">
            <Clock size={16} />
            <span>{request.deadline}</span>
          </div>
        </div>
        <div className="request-budget">
          <span className="budget-amount">
            {request.budget} {request.currency}
          </span>
        </div>
        {request.user && (
          <div className="request-user">
            <Avatar
              src={getProfileImageUrl(request.user)}
              name={request.user.name || `${request.user.firstName || ''} ${request.user.lastName || ''}`}
              size="sm"
              bg={!getProfileImageUrl(request.user) ? "blue.500" : undefined}
              color="white"
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{request.user.name || `${request.user.firstName || ''} ${request.user.lastName || ''}`}</span>
            </div>
          </div>
        )}
        <div className="request-actions">
          <Link to={`/requests/${request.id}`} className="view-request-button">
            Vezi cererea
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestCard; 
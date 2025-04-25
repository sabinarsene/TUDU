import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@chakra-ui/react';
import { getProfileImageUrl } from '../utils/imageUtils';

const UserCard = ({ user, isLink = true }) => {
  if (!user) return null;
  
  const UserImage = () => (
    <Avatar
      src={getProfileImageUrl(user)}
      name={user.name || `${user.firstName || ''} ${user.lastName || ''}`}
      size="md"
      bg={!getProfileImageUrl(user) ? "blue.500" : undefined}
      color="white"
    />
  );
  
  if (isLink) {
    return (
      <Link to={`/profile/${user.id}`} className="user-card-link">
        <div className="user-card">
          <UserImage />
          <div className="user-info">
            <h3>{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</h3>
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <div className="user-card">
      <UserImage />
      <div className="user-info">
        <h3>{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</h3>
      </div>
    </div>
  );
};

export default UserCard; 
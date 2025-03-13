import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/users/search?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="user-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Caută utilizatori..."
      />
      <button onClick={handleSearch}>Caută</button>
      <ul>
        {results.map((user) => (
          <li key={user.id}>
            <Link to={`/profile/${user.id}`}>
              <img src={user.profileImage || '/placeholder.svg'} alt={user.firstName} />
              <span>{user.firstName} {user.lastName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch; 
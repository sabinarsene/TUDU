-- Mai întâi ștergem indexurile existente (pentru a evita erori)
DROP INDEX IF EXISTS idx_services_user_id;
DROP INDEX IF EXISTS idx_requests_user_id;
DROP INDEX IF EXISTS idx_favorite_services_user_id;
DROP INDEX IF EXISTS idx_favorite_requests_user_id;
DROP INDEX IF EXISTS idx_messages_sender_receiver;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_user_ratings_user_id;

-- Ștergem trigger-urile existente
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Ștergem constrângerile existente
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS valid_rating;
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS valid_booking_status;
ALTER TABLE IF EXISTS requests DROP CONSTRAINT IF EXISTS valid_request_status;
ALTER TABLE IF EXISTS request_offers DROP CONSTRAINT IF EXISTS valid_offer_status;

-- Ștergem tabelele în ordine inversă (pentru a evita probleme cu referințele)
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS request_offers;
DROP TABLE IF EXISTS request_images;
DROP TABLE IF EXISTS service_images;
DROP TABLE IF EXISTS favorite_requests;
DROP TABLE IF EXISTS favorite_services;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS user_status;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_ratings;
DROP TABLE IF EXISTS users;

-- Acum recreăm totul în ordinea corectă
-- Crearea tabelei users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255),
  is_provider BOOLEAN DEFAULT FALSE,
  occupation VARCHAR(100),
  education VARCHAR(255),
  age INTEGER,
  location VARCHAR(255),
  bio TEXT,
  specialization VARCHAR(255),
  experience VARCHAR(255),
  languages VARCHAR(255),
  availability VARCHAR(50),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_status table
CREATE TABLE IF NOT EXISTS user_status (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'offline',
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Crearea tabelei services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RON',
  location VARCHAR(255),
  image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_type VARCHAR(50) DEFAULT 'pe oră',
  availability TEXT,
  response_time VARCHAR(100)
);

-- Crearea tabelei requests
CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  budget DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'RON',
  location VARCHAR(255),
  deadline TIMESTAMP,
  image VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  contact_preference VARCHAR(50) DEFAULT 'orice',
  offers_count INTEGER DEFAULT 0
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  read_at TIMESTAMP,
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  file_url VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restul tabelelor
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_images (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_images (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request_offers (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(request_id, provider_id)
);

-- Crearea tabelei favorite_services
CREATE TABLE IF NOT EXISTS favorite_services (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

-- Crearea tabelei favorite_requests
CREATE TABLE IF NOT EXISTS favorite_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, request_id)
);

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rated_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_rating UNIQUE(user_id, rated_by)
);

-- Acum adăugăm indexurile
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_favorite_services_user_id ON favorite_services(user_id);
CREATE INDEX idx_favorite_requests_user_id ON favorite_requests(user_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_rated_by ON user_ratings(rated_by);

-- Funcția pentru actualizarea timestamp-ului
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger-urile
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for syncing profiles with users
CREATE OR REPLACE FUNCTION sync_profile_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, profile_image)
  VALUES (NEW.id, NEW.first_name, NEW.last_name, NEW.profile_image)
  ON CONFLICT (id) DO UPDATE
  SET first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      profile_image = EXCLUDED.profile_image,
      updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profile_after_user_insert_update
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_user();

-- Create trigger for user status
CREATE OR REPLACE FUNCTION init_user_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_status (user_id, status, last_seen)
  VALUES (NEW.id, 'offline', CURRENT_TIMESTAMP)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER init_user_status_after_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_status();

-- Constrângerile
ALTER TABLE reviews
ADD CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE bookings
ADD CONSTRAINT valid_booking_status CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled'));

ALTER TABLE requests
ADD CONSTRAINT valid_request_status CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE request_offers
ADD CONSTRAINT valid_offer_status CHECK (status IN ('pending', 'accepted', 'rejected')); 
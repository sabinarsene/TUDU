-- Crearea tabelei user_ratings pentru evaluările utilizatorilor
CREATE TABLE IF NOT EXISTS user_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rated_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, rated_by)
);

-- Adăugăm un index pentru a optimiza căutările
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);

-- Adăugăm un index pentru a optimiza căutările după utilizatorul care a evaluat
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_by ON user_ratings(rated_by);

-- Trigger pentru actualizarea timestamp-ului
CREATE TRIGGER update_user_ratings_updated_at
    BEFORE UPDATE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funcție pentru calcularea ratingului mediu al unui utilizator
CREATE OR REPLACE FUNCTION update_user_average_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
    total_reviews INTEGER;
BEGIN
    -- Calculăm ratingul mediu pentru utilizator
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, total_reviews
    FROM user_ratings
    WHERE user_id = NEW.user_id;
    
    -- Actualizăm ratingul și numărul de recenzii în tabela users
    UPDATE users
    SET rating = COALESCE(avg_rating, 0),
        review_count = total_reviews
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru actualizarea ratingului mediu la adăugarea, actualizarea sau ștergerea unei evaluări
CREATE TRIGGER update_user_rating_after_insert
    AFTER INSERT ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_average_rating();

CREATE TRIGGER update_user_rating_after_update
    AFTER UPDATE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_average_rating();

CREATE TRIGGER update_user_rating_after_delete
    AFTER DELETE ON user_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_average_rating(); 
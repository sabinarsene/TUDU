const { supabase } = require('../db');

/**
 * Model pentru evaluările utilizatorilor
 */
class UserRating {
  /**
   * Adaugă sau actualizează o evaluare pentru un utilizator
   * @param {number} userId - ID-ul utilizatorului evaluat
   * @param {number} ratedBy - ID-ul utilizatorului care face evaluarea
   * @param {number} rating - Valoarea evaluării (1-5)
   * @param {string} comment - Comentariul opțional
   * @returns {Promise<Object>} - Evaluarea adăugată sau actualizată
   */
  static async addOrUpdateRating(userId, ratedBy, rating, comment) {
    try {
      console.log(`Adăugare/actualizare evaluare pentru utilizatorul ${userId} de către ${ratedBy}`);
      
      // Verificăm dacă utilizatorul se evaluează pe sine
      if (userId === ratedBy) {
        console.log('Utilizatorul încearcă să se evalueze pe sine');
        throw new Error('Nu îți poți evalua propriul profil');
      }

      // Verificăm dacă există deja o evaluare
      console.log('Verificare evaluare existentă...');
      const { data: existingRating, error: existingError } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', userId)
        .eq('rated_by', ratedBy)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Eroare la verificarea evaluării existente:', existingError);
        throw existingError;
      }

      let result;

      if (existingRating) {
        console.log('Actualizare evaluare existentă:', existingRating.id);
        // Actualizăm evaluarea existentă
        const { data, error } = await supabase
          .from('user_ratings')
          .update({
            rating,
            comment,
            updated_at: new Date()
          })
          .eq('id', existingRating.id)
          .select()
          .single();

        if (error) {
          console.error('Eroare la actualizarea evaluării:', error);
          throw error;
        }
        
        console.log('Evaluare actualizată cu succes:', data);
        result = data;
      } else {
        console.log('Adăugare evaluare nouă');
        // Adăugăm o evaluare nouă
        const { data, error } = await supabase
          .from('user_ratings')
          .insert({
            user_id: userId,
            rated_by: ratedBy,
            rating,
            comment
          })
          .select()
          .single();

        if (error) {
          console.error('Eroare la adăugarea evaluării:', error);
          throw error;
        }
        
        console.log('Evaluare adăugată cu succes:', data);
        result = data;
      }

      // Actualizăm ratingul mediu al utilizatorului
      console.log('Actualizare rating mediu pentru utilizatorul', userId);
      await this.updateUserAverageRating(userId);

      return result;
    } catch (error) {
      console.error('Error in addOrUpdateRating:', error);
      throw error;
    }
  }

  /**
   * Obține toate evaluările pentru un utilizator
   * @param {number} userId - ID-ul utilizatorului
   * @returns {Promise<Array>} - Lista de evaluări
   */
  static async getRatingsForUser(userId) {
    try {
      console.log(`Obținere evaluări pentru utilizatorul ${userId}`);
      
      // Obținem evaluările utilizatorului
      const { data: ratings, error } = await supabase
        .from('user_ratings')
        .select(`
          *,
          rated_by_user:users!rated_by(id, first_name, last_name, profile_image)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Eroare la obținerea evaluărilor:', error);
        throw error;
      }
      
      console.log(`S-au găsit ${ratings.length} evaluări pentru utilizatorul ${userId}`);

      // Formatăm datele pentru a fi mai ușor de utilizat în frontend
      const formattedRatings = ratings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.created_at,
        updatedAt: rating.updated_at,
        ratedBy: rating.rated_by,
        raterName: `${rating.rated_by_user.first_name} ${rating.rated_by_user.last_name}`,
        raterImage: rating.rated_by_user.profile_image
      }));

      return formattedRatings;
    } catch (error) {
      console.error('Error in getRatingsForUser:', error);
      throw error;
    }
  }

  /**
   * Obține ratingul mediu pentru un utilizator
   * @param {number} userId - ID-ul utilizatorului
   * @returns {Promise<Object>} - Ratingul mediu și numărul de evaluări
   */
  static async getAverageRating(userId) {
    try {
      console.log(`Calculare rating mediu pentru utilizatorul ${userId}`);
      
      // Obținem toate evaluările utilizatorului
      const { data: ratings, error } = await supabase
        .from('user_ratings')
        .select('rating')
        .eq('user_id', userId);

      if (error) {
        console.error('Eroare la obținerea evaluărilor pentru calculul mediei:', error);
        throw error;
      }

      // Calculăm ratingul mediu
      let averageRating = 0;
      const reviewCount = ratings.length;

      if (reviewCount > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        averageRating = sum / reviewCount;
      }
      
      console.log(`Rating mediu pentru utilizatorul ${userId}: ${averageRating} (${reviewCount} evaluări)`);

      return {
        averageRating,
        reviewCount
      };
    } catch (error) {
      console.error('Error in getAverageRating:', error);
      throw error;
    }
  }

  /**
   * Actualizează ratingul mediu al unui utilizator
   * @param {number} userId - ID-ul utilizatorului
   * @returns {Promise<void>}
   */
  static async updateUserAverageRating(userId) {
    try {
      console.log(`Actualizare rating mediu în tabela users pentru utilizatorul ${userId}`);
      
      // Obținem ratingul mediu și numărul de evaluări
      const { averageRating, reviewCount } = await this.getAverageRating(userId);

      // Actualizăm utilizatorul
      const { error } = await supabase
        .from('users')
        .update({
          rating: averageRating,
          review_count: reviewCount
        })
        .eq('id', userId);

      if (error) {
        console.error('Eroare la actualizarea ratingului utilizatorului:', error);
        throw error;
      }
      
      console.log(`Rating mediu actualizat cu succes pentru utilizatorul ${userId}`);
    } catch (error) {
      console.error('Error in updateUserAverageRating:', error);
      throw error;
    }
  }

  /**
   * Șterge o evaluare
   * @param {number} ratingId - ID-ul evaluării
   * @param {number} userId - ID-ul utilizatorului care a făcut evaluarea
   * @returns {Promise<boolean>} - true dacă ștergerea a reușit
   */
  static async deleteRating(ratingId, userId) {
    try {
      console.log(`Ștergere evaluare ${ratingId} de către utilizatorul ${userId}`);
      
      // Verificăm dacă utilizatorul are dreptul să șteargă evaluarea
      const { data: rating, error: fetchError } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('id', ratingId)
        .eq('rated_by', userId)
        .single();

      if (fetchError) {
        console.error('Eroare la verificarea permisiunii de ștergere:', fetchError);
        throw fetchError;
      }

      if (!rating) {
        console.log('Utilizatorul nu are permisiunea să șteargă această evaluare');
        throw new Error('Nu ai permisiunea să ștergi această evaluare');
      }

      // Salvăm ID-ul utilizatorului evaluat pentru a actualiza ratingul mediu
      const ratedUserId = rating.user_id;
      console.log(`Utilizatorul evaluat: ${ratedUserId}`);

      // Ștergem evaluarea
      const { error } = await supabase
        .from('user_ratings')
        .delete()
        .eq('id', ratingId);

      if (error) {
        console.error('Eroare la ștergerea evaluării:', error);
        throw error;
      }
      
      console.log(`Evaluarea ${ratingId} a fost ștearsă cu succes`);

      // Actualizăm ratingul mediu al utilizatorului
      await this.updateUserAverageRating(ratedUserId);

      return true;
    } catch (error) {
      console.error('Error in deleteRating:', error);
      throw error;
    }
  }
}

module.exports = UserRating; 
const { supabase, supabaseAdmin } = require('./db');

async function checkAndCreateRatingsTable() {
  try {
    console.log('Verificare tabel user_ratings...');
    
    // Verificăm dacă tabelul user_ratings există
    const { data, error } = await supabase
      .from('user_ratings')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Tabelul user_ratings nu există. Încercăm să-l creăm...');
      
      // Creăm tabelul user_ratings
      const createTableSql = `
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
      `;
      
      try {
        // Încercăm să executăm SQL-ul direct
        console.log('Executare SQL pentru crearea tabelului...');
        await supabaseAdmin.rpc('exec_sql', { sql: createTableSql });
        console.log('Tabelul user_ratings a fost creat cu succes!');
        
        // Creăm indexurile
        const createIndexSql = `
          CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_by ON user_ratings(rated_by);
        `;
        
        await supabaseAdmin.rpc('exec_sql', { sql: createIndexSql });
        console.log('Indexurile au fost create cu succes!');
        
        return true;
      } catch (sqlError) {
        console.error('Eroare la crearea tabelului:', sqlError);
        return false;
      }
    } else if (error) {
      console.error('Eroare la verificarea tabelului:', error);
      return false;
    } else {
      console.log('Tabelul user_ratings există deja.');
      return true;
    }
  } catch (error) {
    console.error('Eroare la verificarea tabelului user_ratings:', error);
    return false;
  }
}

// Rulăm funcția
checkAndCreateRatingsTable()
  .then(success => {
    if (success) {
      console.log('Verificarea și crearea tabelului user_ratings s-a finalizat cu succes.');
    } else {
      console.log('A apărut o eroare la verificarea sau crearea tabelului user_ratings.');
    }
  })
  .catch(error => {
    console.error('Eroare neașteptată:', error);
  }); 
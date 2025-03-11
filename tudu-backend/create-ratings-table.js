const { supabase, supabaseAdmin } = require('./db');

async function createRatingsTable() {
  try {
    console.log('Creare tabel user_ratings...');
    
    // Verificăm dacă tabelul există deja
    const { error: checkError } = await supabase
      .from('user_ratings')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Tabelul user_ratings nu există. Îl vom crea...');
      
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
        
        CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_by ON user_ratings(rated_by);
        
        -- Trigger pentru actualizarea timestamp-ului
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_user_ratings_updated_at ON user_ratings;
        CREATE TRIGGER update_user_ratings_updated_at
        BEFORE UPDATE ON user_ratings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `;
      
      try {
        await supabaseAdmin.rpc('exec_sql', { sql: createTableSql });
        console.log('Tabelul user_ratings a fost creat cu succes!');
      } catch (sqlError) {
        console.error('Eroare la crearea tabelului:', sqlError);
        return false;
      }
    } else if (checkError) {
      console.error('Eroare la verificarea tabelului:', checkError);
      return false;
    } else {
      console.log('Tabelul user_ratings există deja.');
    }
    
    // Adăugăm câteva evaluări de test
    console.log('\nAdăugare evaluări de test...');
    
    // Verificăm dacă există utilizatori în baza de date
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(10);
    
    if (usersError) {
      console.error('Eroare la obținerea utilizatorilor:', usersError);
      return false;
    }
    
    if (!users || users.length === 0) {
      console.log('Nu există utilizatori în baza de date. Nu putem adăuga evaluări de test.');
      return false;
    }
    
    console.log(`S-au găsit ${users.length} utilizatori.`);
    
    // Adăugăm evaluări de test
    const testRatings = [];
    
    // Utilizatorul 1 primește evaluări de la ceilalți utilizatori
    for (let i = 1; i < Math.min(users.length, 5); i++) {
      if (users[i] && users[i].id !== 1) {
        testRatings.push({
          user_id: 1,
          rated_by: users[i].id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `Aceasta este o evaluare de test de la utilizatorul ${users[i].id}.`
        });
      }
    }
    
    // Utilizatorul 2 primește evaluări de la ceilalți utilizatori
    if (users.length > 1) {
      for (let i = 0; i < Math.min(users.length, 5); i++) {
        if (users[i] && users[i].id !== 2) {
          testRatings.push({
            user_id: 2,
            rated_by: users[i].id,
            rating: Math.floor(Math.random() * 5) + 1,
            comment: `Aceasta este o evaluare de test de la utilizatorul ${users[i].id}.`
          });
        }
      }
    }
    
    if (testRatings.length > 0) {
      console.log(`Se adaugă ${testRatings.length} evaluări de test...`);
      
      const { data: insertedRatings, error: insertError } = await supabase
        .from('user_ratings')
        .upsert(testRatings, { onConflict: 'user_id,rated_by' })
        .select();
      
      if (insertError) {
        console.error('Eroare la adăugarea evaluărilor de test:', insertError);
        return false;
      }
      
      console.log(`S-au adăugat ${insertedRatings.length} evaluări de test.`);
    } else {
      console.log('Nu s-au putut genera evaluări de test.');
    }
    
    return true;
  } catch (error) {
    console.error('Eroare la crearea tabelului user_ratings:', error);
    return false;
  }
}

// Rulăm funcția
createRatingsTable()
  .then(success => {
    if (success) {
      console.log('\nCrearea tabelului user_ratings și adăugarea evaluărilor de test s-a finalizat cu succes.');
    } else {
      console.log('\nA apărut o eroare la crearea tabelului user_ratings sau la adăugarea evaluărilor de test.');
    }
  })
  .catch(error => {
    console.error('Eroare neașteptată:', error);
  }); 
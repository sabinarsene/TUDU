const fs = require('fs');
const path = require('path');
const { supabase, supabaseAdmin } = require('./db');

async function initRatings() {
  try {
    console.log('Inițializare tabel evaluări utilizatori...');
    
    // Verificăm dacă tabelul users există
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('Eroare la verificarea tabelului users:', usersError);
      console.log('Asigurați-vă că tabelul users există înainte de a crea tabelul user_ratings.');
      return;
    }
    
    // Citim fișierul SQL
    const sqlFilePath = path.join(__dirname, 'user_ratings.sql');
    console.log('Citire fișier SQL:', sqlFilePath);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('Fișierul SQL nu există:', sqlFilePath);
      return;
    }
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('Conținut SQL:', sql.substring(0, 100) + '...');
    
    // Executăm SQL-ul direct
    try {
      console.log('Executare SQL direct...');
      
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
      
      const { error: createTableError } = await supabase.rpc('exec_sql', { sql: createTableSql });
      
      if (createTableError) {
        console.error('Eroare la crearea tabelului user_ratings:', createTableError);
        
        // Încercăm să executăm SQL-ul direct
        const { error: directError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSql });
        
        if (directError) {
          console.error('Eroare la executarea directă a SQL-ului:', directError);
          return;
        }
      }
      
      // Creăm indexurile
      const createIndexSql = `
        CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_by ON user_ratings(rated_by);
      `;
      
      const { error: createIndexError } = await supabase.rpc('exec_sql', { sql: createIndexSql });
      
      if (createIndexError) {
        console.error('Eroare la crearea indexurilor:', createIndexError);
      }
      
      console.log('Tabelul de evaluări a fost creat cu succes!');
    } catch (sqlError) {
      console.error('Eroare la executarea SQL-ului:', sqlError);
    }
  } catch (error) {
    console.error('Eroare la inițializarea tabelului de evaluări:', error);
  }
}

// Verificăm dacă tabelul există deja
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Tabelul nu există
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Eroare la verificarea existenței tabelului:', error);
    return false;
  }
}

// Rulăm funcția
async function main() {
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    console.log('Tabelul user_ratings există deja.');
  } else {
    await initRatings();
  }
  
  console.log('Procesul de inițializare a fost finalizat.');
}

main().catch((error) => {
  console.error('Eroare în procesul de inițializare:', error);
}); 
const { supabase } = require('./db');

async function checkDatabaseTables() {
  try {
    console.log('Verificare tabele în baza de date...');
    
    // Verificăm tabelul users
    console.log('\nVerificare tabel users:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (usersError) {
      console.error('Eroare la verificarea tabelului users:', usersError);
    } else {
      console.log('Tabelul users există și conține date.');
      console.log('Număr de utilizatori:', users.count);
    }
    
    // Verificăm tabelul user_ratings
    console.log('\nVerificare tabel user_ratings:');
    const { data: ratings, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('count')
      .single();
    
    if (ratingsError) {
      if (ratingsError.code === '42P01') {
        console.error('Tabelul user_ratings nu există!');
      } else {
        console.error('Eroare la verificarea tabelului user_ratings:', ratingsError);
      }
    } else {
      console.log('Tabelul user_ratings există și conține date.');
      console.log('Număr de evaluări:', ratings.count);
    }
    
    // Verificăm structura tabelului user_ratings
    console.log('\nVerificare structură tabel user_ratings:');
    try {
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'user_ratings' });
      
      if (columnsError) {
        console.error('Eroare la obținerea structurii tabelului user_ratings:', columnsError);
      } else if (columns && columns.length > 0) {
        console.log('Structura tabelului user_ratings:');
        columns.forEach(column => {
          console.log(`- ${column.column_name} (${column.data_type})`);
        });
      } else {
        console.log('Nu s-au putut obține informații despre structura tabelului user_ratings.');
      }
    } catch (error) {
      console.error('Eroare la verificarea structurii tabelului:', error);
    }
    
    // Verificăm dacă există funcția RPC get_table_columns
    console.log('\nCreare funcție RPC pentru obținerea structurii tabelelor:');
    try {
      const createRpcSql = `
        CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
        RETURNS TABLE(column_name text, data_type text)
        LANGUAGE sql
        SECURITY DEFINER
        AS $$
          SELECT column_name::text, data_type::text
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        $$;
      `;
      
      await supabase.rpc('exec_sql', { sql: createRpcSql });
      console.log('Funcția RPC get_table_columns a fost creată cu succes.');
    } catch (error) {
      console.error('Eroare la crearea funcției RPC:', error);
    }
  } catch (error) {
    console.error('Eroare la verificarea tabelelor:', error);
  }
}

// Rulăm funcția
checkDatabaseTables()
  .then(() => {
    console.log('\nVerificarea tabelelor s-a finalizat.');
  })
  .catch(error => {
    console.error('Eroare neașteptată:', error);
  }); 
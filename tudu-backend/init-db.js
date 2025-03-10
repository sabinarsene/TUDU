const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initDb() {
  try {
    // Citește fișierul schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execută schema SQL
    await pool.query(schema);
    console.log('Database schema initialized successfully');

    // Închide conexiunea la baza de date
    await pool.end();
  } catch (error) {
    console.error('Error initializing database schema:', error);
    process.exit(1);
  }
}

// Rulează funcția de inițializare
initDb(); 
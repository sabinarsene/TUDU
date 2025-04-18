const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Configured' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Configured' : 'Missing');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Configured' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

// Common Supabase client options
const commonOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'tudu-backend'
    }
  }
};

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  ...commonOptions
});

// Create admin client with service role key for administrative tasks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey, {
  ...commonOptions
});

// Verificăm dacă putem crea bucket-urile necesare
const requiredBuckets = ['service-uploads', 'user-uploads'];

// Initialize storage buckets
async function initializeStorage() {
  try {
    console.log('Checking storage buckets...');
    
    for (const bucketName of requiredBuckets) {
      try {
        console.log(`Checking bucket: ${bucketName}`);
        const { data: bucket, error: getBucketError } = await supabaseAdmin.storage.getBucket(bucketName);
        
        if (getBucketError) {
          console.log(`Bucket ${bucketName} not found, attempting to create...`);
          console.log('Error details:', getBucketError);
          
          try {
            // Create bucket with public access
            console.log(`Creating bucket ${bucketName} with public access...`);
            const { data, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
              public: true
            });
            
            if (createError) {
              console.error(`Error creating bucket ${bucketName}:`, createError);
              console.log(`Continuing without storage bucket ${bucketName}. Image uploads to this bucket will not work.`);
            } else {
              console.log(`Storage bucket ${bucketName} created successfully:`, data);
              
              // Update bucket configuration
              console.log(`Updating bucket ${bucketName} configuration...`);
              const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
              });
              
              if (updateError) {
                console.error(`Error updating bucket ${bucketName} configuration:`, updateError);
              } else {
                console.log(`Bucket ${bucketName} configuration updated successfully`);
              }
              
              // Set up a simple public policy
              console.log(`Setting up policy for ${bucketName}...`);
              try {
                const { error: policyError } = await supabaseAdmin.storage.from(bucketName).createPolicy('allow-all', {
                  name: `${bucketName}_allow_all`,
                  definition: {
                    role: '*',
                    statement: '*',
                    check: "true"
                  }
                });
                
                if (policyError) {
                  console.error(`Error setting up policy for ${bucketName}:`, policyError);
                } else {
                  console.log(`Policy created successfully for ${bucketName}`);
                }
              } catch (policyError) {
                console.error(`Exception setting up policy for ${bucketName}:`, policyError);
              }
            }
          } catch (createBucketError) {
            console.error(`Exception creating bucket ${bucketName}:`, createBucketError);
            console.log(`Continuing without storage bucket ${bucketName}. Image uploads to this bucket will not work.`);
          }
        } else {
          console.log(`Storage bucket ${bucketName} already exists:`, bucket);
          
          // Update existing bucket configuration
          try {
            console.log(`Updating existing bucket ${bucketName} configuration...`);
            const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
              public: true,
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
              fileSizeLimit: 5242880 // 5MB
            });
            
            if (updateError) {
              console.error(`Error updating bucket ${bucketName}:`, updateError);
            } else {
              console.log(`Storage bucket ${bucketName} updated successfully`);
            }
          } catch (updateError) {
            console.error(`Exception updating bucket ${bucketName}:`, updateError);
          }
        }
      } catch (bucketError) {
        console.error(`Exception checking bucket ${bucketName}:`, bucketError);
      }
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
    console.log('Continuing without storage buckets. Image uploads will not work.');
  }
}

// Initialize storage on startup but don't throw errors that would stop the server
initializeStorage().catch(error => {
  console.error('Failed to initialize storage, but continuing server startup:', error);
});

// Test the connection and check database schema
async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (error) {
      if (error.code === 'PGRST204') {
        console.log('Connected to Supabase, but users table is empty');
      } else {
        console.error('Database connection error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        // Check if the error is related to missing tables
        if (error.code === '42P01') {
          console.error('Required tables are missing. Please run the database schema setup SQL.');
        }
      }
    } else {
      console.log('Successfully connected to Supabase');
    }

    // Test admin connection
    const { error: adminError } = await supabaseAdmin
      .from('users')
      .select('count')
      .single();

    if (adminError) {
      console.error('Admin client connection error:', {
        code: adminError.code,
        message: adminError.message
      });
    } else {
      console.log('Admin client successfully connected');
    }

  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    
    // If this is a critical error, you might want to exit the process
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Critical database connection error. Exiting process.');
      process.exit(1);
    }
  }
}

// Test connection on startup
testConnection();

// Adăugăm o funcție pentru a executa SQL direct
async function createExecSqlFunction() {
  try {
    console.log('Crearea funcției exec_sql...');
    
    // Verificăm dacă funcția există deja
    try {
      const { data: existingFunction } = await supabaseAdmin.rpc('exec_sql', { sql: 'SELECT 1' });
      if (existingFunction) {
        console.log('Funcția exec_sql există deja.');
        return;
      }
    } catch (checkError) {
      // Funcția nu există, continuăm cu crearea ei
    }
    
    // Creăm funcția exec_sql
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    try {
      const { error } = await supabaseAdmin.from('_exec_sql').select('*').limit(1);
      
      if (error) {
        // Dacă tabela nu există, încercăm să creăm funcția
        try {
          await supabaseAdmin.rpc('exec_sql_direct', { sql: createFunctionSql });
          console.log('Funcția exec_sql a fost creată cu succes folosind RPC.');
        } catch (rpcError) {
          // Dacă RPC eșuează, încercăm REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql_direct`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: createFunctionSql })
          });
          
          if (!response.ok) {
            throw new Error(`Failed to create exec_sql function: ${response.statusText}`);
          }
          console.log('Funcția exec_sql a fost creată cu succes folosind REST API.');
        }
      } else {
        console.log('Tabela _exec_sql există deja.');
      }
    } catch (error) {
      console.error('Eroare la verificarea/crearea tabelei _exec_sql:', error);
      throw error;
    }
  } catch (error) {
    console.error('Eroare la crearea funcției exec_sql:', error);
    // Nu aruncăm eroarea mai departe pentru a permite serverului să pornească
  }
}

// Inițializăm funcția exec_sql
createExecSqlFunction();

// Export configured clients
module.exports = {
  supabase,
  supabaseAdmin,
  testConnection, // Export for manual testing if needed
  initializeStorage
};

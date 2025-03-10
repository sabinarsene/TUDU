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
          try {
            const { data, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
              public: true,
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
              fileSizeLimit: 5242880 // 5MB
            });
            
            if (createError) {
              console.error(`Error creating bucket ${bucketName}:`, createError);
              console.log(`Continuing without storage bucket ${bucketName}. Image uploads to this bucket will not work.`);
            } else {
              console.log(`Storage bucket ${bucketName} created successfully`);
            }
          } catch (createBucketError) {
            console.error(`Error creating bucket ${bucketName}:`, createBucketError);
            console.log(`Continuing without storage bucket ${bucketName}. Image uploads to this bucket will not work.`);
          }
        } else {
          console.log(`Storage bucket ${bucketName} already exists`);
        }
      } catch (bucketError) {
        console.error(`Error checking bucket ${bucketName}:`, bucketError);
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

// Export configured clients
module.exports = {
  supabase,
  supabaseAdmin,
  testConnection, // Export for manual testing if needed
  initializeStorage
};

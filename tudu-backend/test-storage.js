const fs = require('fs');
const path = require('path');
const { supabase, supabaseAdmin } = require('./db');

async function testStorage() {
  console.log('Testing Supabase storage...');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Supabase Key:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');
  console.log('Supabase Service Key:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Not set');
  
  try {
    // Check if the bucket exists
    console.log('Checking if bucket exists...');
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket('user-uploads');
    
    if (bucketError) {
      console.error('Error checking bucket:', bucketError);
      
      // Try to create the bucket
      console.log('Attempting to create bucket...');
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('user-uploads', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      
      console.log('Bucket created successfully:', createData);
    } else {
      console.log('Bucket exists:', bucket);
    }
    
    // List all buckets
    console.log('Listing all buckets...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Buckets:', buckets);
    }
    
    // Create a test image file (1x1 pixel transparent PNG)
    const testFilePath = path.join(__dirname, 'test-image.png');
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(testFilePath, imageBuffer);
    
    // Upload the test file
    console.log('Uploading test image...');
    const fileContent = fs.readFileSync(testFilePath);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('user-uploads')
      .upload('test-folder/test-image.png', fileContent, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return;
    }
    
    console.log('File uploaded successfully:', uploadData);
    
    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('user-uploads')
      .getPublicUrl('test-folder/test-image.png');
    
    console.log('Public URL:', urlData?.publicUrl);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
    // Delete the test file from storage
    console.log('Deleting test file from storage...');
    const { data: deleteData, error: deleteError } = await supabaseAdmin.storage
      .from('user-uploads')
      .remove(['test-folder/test-image.png']);
    
    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return;
    }
    
    console.log('File deleted successfully:', deleteData);
    
    console.log('Storage test completed successfully!');
  } catch (error) {
    console.error('Error testing storage:', error);
  }
}

// Run the test
testStorage(); 
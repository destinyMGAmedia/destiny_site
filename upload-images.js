const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadImage(imagePath, publicId, folder) {
  try {
    console.log(`Uploading ${imagePath} to ${folder}/${publicId}...`);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: folder,
      resource_type: 'image',
      overwrite: true,
      quality: 'auto',
    });

    console.log(`✅ Successfully uploaded: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Error uploading ${imagePath}:`, error);
    throw error;
  }
}

async function uploadAllImages() {
  try {
    console.log('🚀 Starting image upload to Cloudinary...\n');

    // Define the uploads
    const uploads = [
      {
        // Founder (Primate) - full body image
        path: 'public/images/primate.png',
        publicId: 'primate',
        folder: 'dmga/global/leadership',
        description: 'Archbishop (Prof) Cletus Bassy - Primate'
      },
      {
        // Presbyter - headshot
        path: 'public/images/presbyter.JPG.jpeg',
        publicId: 'presbyter',
        folder: 'dmga/global/leadership',
        description: 'Bishop (Mrs) Blessing Bassey - Presbyter'
      },
      {
        // Favicon
        path: 'public/images/favicon.png',
        publicId: 'favicon',
        folder: 'dmga/global/branding',
        description: 'DMGA Favicon'
      },
      {
        // Gallery images
        path: 'public/images/gallery/gImage1.jpg',
        publicId: 'gallery-1',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 1'
      },
      {
        path: 'public/images/gallery/gImage2.jpg',
        publicId: 'gallery-2',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 2'
      },
      {
        path: 'public/images/gallery/gImage3.jpg',
        publicId: 'gallery-3',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 3'
      },
      {
        path: 'public/images/gallery/gImage4.jpg',
        publicId: 'gallery-4',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 4'
      },
      {
        path: 'public/images/gallery/gImage5.jpg',
        publicId: 'gallery-5',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 5'
      },
      {
        path: 'public/images/gallery/gImage6.jpg',
        publicId: 'gallery-6',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 6'
      },
      {
        path: 'public/images/gallery/gImage7.jpg',
        publicId: 'gallery-7',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 7'
      },
      {
        path: 'public/images/gallery/gImage21.jpg',
        publicId: 'gallery-21',
        folder: 'dmga/global/gallery',
        description: 'Gallery Image 21'
      },
      {
        path: 'public/images/userPlaceHolder.jpg',
        publicId: 'user-placeholder',
        folder: 'dmga/global/ui',
        description: 'User Placeholder Image'
      }
    ];

    const results = {};

    for (const upload of uploads) {
      if (fs.existsSync(upload.path)) {
        const result = await uploadImage(upload.path, upload.publicId, upload.folder);
        results[upload.publicId] = {
          url: result.secure_url,
          public_id: result.public_id,
          description: upload.description
        };
      } else {
        console.log(`⚠️  File not found: ${upload.path} - Please ensure the image is saved to the project root`);
      }
    }

    console.log('\n📋 Upload Results Summary:');
    console.log('================================');
    
    Object.entries(results).forEach(([key, data]) => {
      console.log(`${data.description}:`);
      console.log(`  URL: ${data.url}`);
      console.log(`  Public ID: ${data.public_id}\n`);
    });

    // Save results to a file for easy reference
    fs.writeFileSync('cloudinary-urls.json', JSON.stringify(results, null, 2));
    console.log('💾 URLs saved to cloudinary-urls.json');

    return results;

  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadAllImages()
    .then(() => {
      console.log('\n🎉 All uploads completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Upload process failed:', error);
      process.exit(1);
    });
}

module.exports = uploadAllImages;
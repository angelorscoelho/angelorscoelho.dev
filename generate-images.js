import sharp from 'sharp';

async function generateResponsiveImages() {
  const sizes = [
    { name: 'small', width: 600 },   // High quality base
    { name: 'medium', width: 1200 }, // Very high quality
    { name: 'large', width: 2400 }   // Ultra high quality
  ];

  try {
    for (const size of sizes) {
      await sharp('src/assets/profile_photo.png')
        .resize(size.width, null, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(`src/assets/profile_photo_${size.name}.webp`);
      
      console.log(`Created profile_photo_${size.name}.webp (${size.width}px)`);
    }
    console.log('✅ All responsive images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
  }
}

generateResponsiveImages();
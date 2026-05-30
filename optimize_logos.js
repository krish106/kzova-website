const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logos = ['klogo.png'];

async function optimizeLogos() {
  for (const logo of logos) {
    const filePath = path.join(__dirname, logo);
    if (fs.existsSync(filePath)) {
      console.log(`Optimizing ${logo}...`);
      const tempPath = path.join(__dirname, `temp_${logo}`);
      
      try {
        await sharp(filePath)
          .resize({ width: 600, withoutEnlargement: true }) // Max width 600px
          .png({ quality: 75, compressionLevel: 9 }) // High compression PNG
          .toFile(tempPath);
        
        // Overwrite original
        fs.renameSync(tempPath, filePath);
        console.log(`✅ Successfully optimized ${logo}`);
      } catch (err) {
        console.error(`❌ Failed to optimize ${logo}:`, err);
      }
    } else {
      console.log(`File ${logo} not found.`);
    }
  }
}

optimizeLogos();

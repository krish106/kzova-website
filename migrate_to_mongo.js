const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Please set MONGODB_URI in your .env file.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db('kzova');

    // 1. Upload data.json
    const dataFile = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      await db.collection('siteData').updateOne(
        { _id: 'kzova_data' },
        { $set: { data: data } },
        { upsert: true }
      );
      console.log("✅ Successfully migrated data.json to MongoDB.");
    }

    // 2. Upload reviews.json
    const reviewsFile = path.join(__dirname, 'reviews.json');
    if (fs.existsSync(reviewsFile)) {
      const reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
      if (reviews.length > 0) {
        // Clear existing reviews just in case to prevent duplicates on rerun
        await db.collection('reviews').deleteMany({});
        await db.collection('reviews').insertMany(reviews);
        console.log(`✅ Successfully migrated ${reviews.length} reviews to MongoDB.`);
      } else {
        console.log("No reviews to migrate.");
      }
    }

  } catch (error) {
    console.error("Migration Failed:", error);
  } finally {
    await client.close();
  }
}

run();

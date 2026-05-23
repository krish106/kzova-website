const { MongoClient } = require('mongodb');
const uri = "mongodb://krishp5777:202lucifer@ac-pnlce2p-shard-00-00.9mwwhcq.mongodb.net:27017,ac-pnlce2p-shard-00-01.9mwwhcq.mongodb.net:27017,ac-pnlce2p-shard-00-02.9mwwhcq.mongodb.net:27017/?ssl=true&replicaSet=atlas-pnlce2-shard-0&authSource=admin&retryWrites=true&w=majority&appName=KzovaLabs";

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  try {
    await client.connect();
    console.log("SUCCESS: Connected to MongoDB!");
    await client.close();
  } catch (err) {
    console.error("FAIL: Error connecting to MongoDB:", err.message);
  }
}
run();

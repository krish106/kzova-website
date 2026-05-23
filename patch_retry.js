const fs = require('fs');

let serverJs = fs.readFileSync('server.js', 'utf8');

// Fix the connection retry logic in server.js
serverJs = serverJs.replace(
  "  if (!client) {\n    client = new MongoClient(uri);\n    await client.connect();\n    db = client.db('kzova');\n    console.log('✅ Connected to MongoDB');\n  }\n  return db;",
  "  if (!db) {\n    try {\n      client = new MongoClient(uri.replace(/\\s+/g, '')); // Remove accidentally pasted spaces/newlines\n      await client.connect();\n      db = client.db('kzova');\n      console.log('✅ Connected to MongoDB');\n    } catch (err) {\n      console.error('MongoDB Connection Error:', err.message);\n      client = null;\n      throw err; // Force the API to catch and return this error\n    }\n  }\n  return db;"
);

fs.writeFileSync('server.js', serverJs);
console.log('Patched server.js with robust MongoDB retry logic');

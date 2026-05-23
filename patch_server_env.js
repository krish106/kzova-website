const fs = require('fs');

let serverJs = fs.readFileSync('server.js', 'utf8');

// Change `const uri = process.env.MONGODB_URI;` to accept fallback and log env keys
serverJs = serverJs.replace(
  "const uri = process.env.MONGODB_URI;",
  "const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI;\nconsole.log('Available Env Keys:', Object.keys(process.env).join(', '));"
);

// In connectDB(), return the exact reason it failed
serverJs = serverJs.replace(
  "if (!uri) {\n    console.warn('⚠️ MONGODB_URI is not set. Database features will fail.');\n    return null;\n  }",
  "if (!uri) {\n    console.warn('⚠️ MONGODB_URI is not set. Database features will fail.');\n    return { isConfigError: true, msg: 'MONGODB_URI is literally missing from Render environment variables.' };\n  }"
);

// In the API route, handle the new config error
serverJs = serverJs.replace(
  "if (!database) return res.status(500).json({ error: 'No database connection' });",
  "if (!database) return res.status(500).json({ error: 'No database connection' });\n    if (database.isConfigError) return res.status(500).json({ error: database.msg });"
);

fs.writeFileSync('server.js', serverJs);
console.log('Patched server.js for better debugging and fallback URI handling');

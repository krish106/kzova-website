const fs = require('fs');
const files = ['index.html', 'apps.html', 'about.html', 'contact.html', 'tech.html', 'privacy.html', 'terms.html', 'admin.html'];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  html = html.replace(/href="index\.html"/g, 'href="/"');
  html = html.replace(/href="about\.html"/g, 'href="/about"');
  html = html.replace(/href="apps\.html"/g, 'href="/apps"');
  html = html.replace(/href="tech\.html"/g, 'href="/tech"');
  html = html.replace(/href="contact\.html"/g, 'href="/contact"');
  html = html.replace(/href="privacy\.html"/g, 'href="/privacy"');
  html = html.replace(/href="terms\.html"/g, 'href="/terms"');

  fs.writeFileSync(f, html);
  console.log('Fixed URLs in', f);
});

let serverJs = fs.readFileSync('server.js', 'utf8');
serverJs = serverJs.replace(
  "app.use(express.static(__dirname));",
  "app.use(express.static(__dirname, { extensions: ['html'] }));"
);
fs.writeFileSync('server.js', serverJs);
console.log('Fixed server.js');

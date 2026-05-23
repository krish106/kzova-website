const fs = require('fs');
const files = ['index.html', 'apps.html', 'about.html', 'contact.html', 'tech.html'];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Lock viewport scaling to prevent accidental zooming on mobile
  html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
  );

  fs.writeFileSync(f, html);
  console.log('Fixed viewport in', f);
});

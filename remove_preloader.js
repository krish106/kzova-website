const fs = require('fs');

const files = ['index.html', 'about.html', 'apps.html', 'tech.html', 'contact.html', 'privacy.html', 'terms.html'];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove Preloader HTML block
  const htmlRegex = /<!-- Preloader -->[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/g;
  content = content.replace(htmlRegex, '');
  
  // Also clean up any simpler/alternative matches
  content = content.replace(/<div id="preloader">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');
  content = content.replace(/<div id="preloader">[\s\S]*?<\/div>/g, ''); // fallback

  // 2. Remove Preloader CSS block
  const cssRegex = /\/\* Preloader \*\/[\s\S]*?@keyframes preText[\s\S]*?\n}/g;
  content = content.replace(cssRegex, '');

  // 3. Remove Preloader JS block
  const jsRegex = /\/\/ Smart Preloader[\s\S]*?\}\);\s*\n/g;
  content = content.replace(jsRegex, '');
  
  // also clean up any legacy preloader scripts
  content = content.replace(/\/\/ Preloader[\s\S]*?\}\);\s*\n/g, '');

  fs.writeFileSync(file, content);
}

console.log('Preloader successfully removed from all HTML files! The website will now load instantly.');

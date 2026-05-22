const fs = require('fs');

const files = ['index.html', 'about.html', 'apps.html', 'tech.html', 'contact.html', 'privacy.html', 'terms.html'];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace links
  content = content.replace(/href="#product"/g, 'href="apps.html"');
  content = content.replace(/href="#tech"/g, 'href="tech.html"');
  content = content.replace(/href="#github"/g, 'href="apps.html#github"');
  content = content.replace(/href="#about"/g, 'href="about.html"');
  content = content.replace(/href="#contact"/g, 'href="contact.html"');
  content = content.replace(/href="#hero"/g, 'href="index.html"');

  fs.writeFileSync(file, content);
}

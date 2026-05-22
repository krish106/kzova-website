const fs = require('fs');

const files = ['index.html', 'about.html', 'apps.html', 'tech.html', 'contact.html'];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove from nav-links
  content = content.replace(/<li><a href="apps\.html#github">Working Projects<\/a><\/li>\n/g, '');
  content = content.replace(/<li><a href="apps\.html#github">Working Projects<\/a><\/li>/g, '');

  // 2. Remove from mobile-menu
  content = content.replace(/<a href="apps\.html#github">Working Projects<\/a>\n/g, '');
  content = content.replace(/<a href="apps\.html#github">Working Projects<\/a>/g, '');

  // 3. Remove from footer
  content = content.replace(/<a href="apps\.html#github">Working Projects<\/a>\n/g, '');
  content = content.replace(/<a href="apps\.html#github">Working Projects<\/a>/g, '');

  fs.writeFileSync(file, content);
}

console.log('Successfully removed Working Projects options from all navigation and footers!');

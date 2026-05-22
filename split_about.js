const fs = require('fs');

if (fs.existsSync('index.html')) {
  // Create about.html from index.html template
  let html = fs.readFileSync('index.html', 'utf8');
  
  // Extract sections
  let heroStart = html.indexOf('<!-- HERO -->');
  let statsStart = html.indexOf('<!-- STATS BELT -->');
  let aboutStart = html.indexOf('<!-- ABOUT -->');
  let footerStart = html.indexOf('<!-- FOOTER -->');
  
  // Create about.html
  // about.html needs to REMOVE Hero, but KEEP Stats and About.
  let aboutHtml = html.substring(0, heroStart) + html.substring(statsStart);
  // Wait, no. Hero has a specific CSS and global BG. Just deleting the Hero section is enough.
  fs.writeFileSync('about.html', aboutHtml);
  
  // Trim index.html
  // index.html needs to REMOVE Stats and About, keep Hero.
  let indexHtml = html.substring(0, statsStart) + html.substring(footerStart);
  fs.writeFileSync('index.html', indexHtml);
}

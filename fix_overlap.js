const fs = require('fs');
const files = ['index.html', 'apps.html', 'about.html', 'contact.html', 'tech.html'];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Fix 1: Section padding on mobile (prevent content from sliding under the top nav)
  html = html.replace(
    '.section{padding:60px 20px}',
    '.section{padding:120px 20px 60px}' // 120px top padding ensures it clears the 74px nav bar
  );

  // Fix 2: Hero section on mobile (prevent vertical centering from pushing content under the nav on short screens)
  // Find where .section{padding:60px 20px} or .hero-btns is to inject hero fix
  if (html.includes('.hero-btns{flex-direction:column;')) {
    html = html.replace(
      '.hero-btns{flex-direction:column;',
      '#hero{align-items:flex-start;padding-top:140px;padding-bottom:60px;min-height:auto}\n  .hero-btns{flex-direction:column;'
    );
  }

  fs.writeFileSync(f, html);
  console.log('Fixed overlap in', f);
});

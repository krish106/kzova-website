const fs = require('fs');
const files = ['index.html', 'apps.html', 'about.html', 'contact.html', 'tech.html'];

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Fix 1: Top Nav (Reduce logo size slightly to prevent overload/cutting)
  html = html.replace('.nav-logo-img{width:50px;height:50px;', '.nav-logo-img{width:42px;height:42px;');
  html = html.replace('.nav-brand-name{font-size:24px;', '.nav-brand-name{font-size:22px;');
  html = html.replace('.nav-brand{display:flex;align-items:center;gap:3px;', '.nav-brand{display:flex;align-items:center;gap:3px;padding-left:6px;');

  // Fix 2: App Page links spacing & Centering product info on mobile
  html = html.replace(
    '<div style="margin-top:20px;display:flex;gap:18px;font-size:13px;color:var(--muted);">',
    '<div style="margin-top:28px;display:flex;gap:24px;font-size:13px;color:var(--muted);flex-wrap:wrap;justify-content:center;width:100%;">'
  );

  // Fix 3: Footer Mobile Layout (2 columns instead of vertical stack, center the brand)
  html = html.replace(
    '.footer-grid{grid-template-columns:1fr;gap:30px}',
    '.footer-grid{grid-template-columns:1fr 1fr;gap:40px}\n  .footer-brand{grid-column:1/-1;text-align:center;display:flex;flex-direction:column;align-items:center}\n  .footer-brand p{margin:0 auto 20px}'
  );
  
  // Fix 4: Center the product info text on mobile so it looks balanced
  html = html.replace(
    '.phone-mockup{width:180px;height:360px}',
    '.phone-mockup{width:180px;height:360px}\n  .product-info{display:flex;flex-direction:column;align-items:center;text-align:center}'
  );

  fs.writeFileSync(f, html);
  console.log('Fixed', f);
});

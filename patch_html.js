const fs = require('fs');

const files = ['index.html', 'about.html', 'apps.html', 'tech.html', 'contact.html'];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Wrap the page content in <main id="main-content">
  // We want to wrap from the end of </nav> to the start of <footer id="footer">
  let navEndIdx = content.indexOf('</nav>');
  let footerStartIdx = content.indexOf('<footer');

  if (navEndIdx !== -1 && footerStartIdx !== -1) {
    let before = content.substring(0, navEndIdx + 6);
    let mainContent = content.substring(navEndIdx + 6, footerStartIdx);
    let after = content.substring(footerStartIdx);

    // Only wrap if not already wrapped
    if (!mainContent.includes('<main id="main-content">')) {
      content = before + '\n<main id="main-content">\n' + mainContent + '\n</main>\n' + after;
    }
  }

  // 2. Inject the router.js script tag before </body>
  if (!content.includes('router.js')) {
    content = content.replace('</body>', '<script src="router.js"></script>\n</body>');
  }

  // 3. Make preloader session-smart so it doesn't show up on every subpage click
  const oldPreloader = `// Preloader
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('preloader').classList.add('done'),2000)});`;

  const newPreloader = `// Smart Preloader (only runs once per session)
window.addEventListener('load', () => {
  const loader = document.getElementById('preloader');
  if (loader) {
    if (sessionStorage.getItem('visited')) {
      loader.classList.add('done');
    } else {
      sessionStorage.setItem('visited', 'true');
      setTimeout(() => loader.classList.add('done'), 1200); // slightly faster premium transition
    }
  }
});`;

  content = content.replace(oldPreloader, newPreloader);

  fs.writeFileSync(file, content);
}
console.log('All HTML files patched successfully!');

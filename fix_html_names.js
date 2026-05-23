const fs = require('fs');
const path = require('path');

const targetStr1 = `<input type="text" placeholder="Your Name" required>
      <input type="text" placeholder="App Name" required>
      <input type="email" placeholder="Your Email (Optional)" class="full">`;

const replacementStr1 = `<input type="text" name="name" placeholder="Your Name" required>
      <input type="text" name="appName" placeholder="App Name" required>
      <input type="email" name="email" placeholder="Your Email (Optional)" class="full">`;

const targetStr2 = `<textarea placeholder="Your review..." class="full" rows="5" required></textarea>`;
const replacementStr2 = `<textarea name="review" placeholder="Your review..." class="full" rows="5" required></textarea>`;

const files = ['about.html', 'apps.html', 'contact.html', 'tech.html', 'index.html'];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;
    
    if (content.includes(targetStr1)) {
      content = content.replace(targetStr1, replacementStr1);
      changed = true;
    }
    if (content.includes(targetStr2)) {
      content = content.replace(targetStr2, replacementStr2);
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(p, content, 'utf8');
      console.log('Fixed input names in', f);
    }
  }
});

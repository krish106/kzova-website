const fs = require('fs');

const files = ['index.html', 'about.html', 'apps.html', 'tech.html', 'contact.html', 'privacy.html', 'terms.html'];

const safeLoadDynamicData = `async function loadDynamicData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Failed to load API data');
    const data = await res.json();
    
    function setHTML(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = val; }
    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function setHref(id, val) { const el = document.getElementById(id); if (el) el.href = val; }

    if (data.hero) {
      setHTML('dynamic-hero-tag', '<span class="pulse-dot"></span>' + data.hero.tag);
      setText('dynamic-hero-h1-white', data.hero.h1_white);
      setText('dynamic-hero-h1-grad', data.hero.h1_gradient);
      setText('dynamic-hero-p', data.hero.p);
    }
    
    if (data.about) {
      setText('dynamic-about-p1', data.about.p1);
      setText('dynamic-about-p2', data.about.p2);
    }

    if (data.product) {
      const p = data.product;
      setText('dynamic-product-badge', p.badge || '');
      setHTML('dynamic-product-h2', \`\${p.name || ''} <span>\${p.name_highlight || ''}</span>\`);
      setText('dynamic-product-desc', p.description || '');
      setText('dynamic-product-platforms', p.platforms || '');
      setHref('dynamic-dl-android', p.download_android_url || '#');
      setHref('dynamic-dl-windows', p.download_windows_url || '#');
      setHref('dynamic-privacy-link', p.privacy_url || 'privacy.html');
      setHref('dynamic-terms-link', p.terms_url || 'terms.html');
    }

    const featGrid = document.getElementById('dynamic-features-grid');
    if (featGrid && data.features && data.features.length > 0) {
      featGrid.innerHTML = data.features.map(f => \`
        <div class="feature-card reveal visible">
          <div class="feat-icon" style="background:\${f.icon_bg || 'rgba(14,165,233,.12)'}">\${f.icon || '⚡'}</div>
          <h3>\${f.title || ''}</h3>
          <p>\${f.description || ''}</p>
        </div>
      \`).join('');
    }

    const statsBelt = document.getElementById('stats-belt');
    if (statsBelt && data.stats && data.stats.length > 0) {
      statsBelt.style.display = '';
      statsBelt.className = '';
      statsBelt.setAttribute('id', 'stats-belt');
      statsBelt.style.background = 'linear-gradient(135deg,rgba(14,165,233,.06),rgba(16,185,129,.03))';
      statsBelt.style.borderTop = '1px solid rgba(14,165,233,0.35)';
      statsBelt.style.borderBottom = '1px solid rgba(14,165,233,0.35)';
      statsBelt.style.padding = '60px';
      statsBelt.style.overflow = 'hidden';
      const statsGrid = document.getElementById('dynamic-stats-grid');
      if (statsGrid) {
        statsGrid.innerHTML = data.stats.map(s => \`
          <div class="stat-item">
            <div class="stat-num" data-target="\${s.value}" data-suffix="\${s.suffix || '+'}">\${s.value}\${s.suffix || '+'}</div>
            <div class="stat-label">\${s.label || ''}</div>
          </div>
        \`).join('');
        if (typeof co !== 'undefined') document.querySelectorAll('#dynamic-stats-grid .stat-num').forEach(el => co.observe(el));
      }
    }

    const techGrid = document.getElementById('dynamic-tech-grid');
    if (techGrid && data.tech && data.tech.length > 0) {
      techGrid.innerHTML = data.tech.map(t => \`
        <div class="tech-card reveal visible">
          <div class="t-icon">\${t.icon || '🔧'}</div>
          <h4>\${t.name || ''}</h4>
          <p>\${t.description || ''}</p>
        </div>
      \`).join('');
    }

    const grid = document.getElementById('reposGrid');
    if (grid) {
      if (data.projects && data.projects.length > 0) {
        grid.innerHTML = data.projects.map(r => \`
          <div class="repo-card reveal visible">
            <h3>📁 \${r.name}</h3>
            <p>\${r.description}</p>
            <div class="repo-meta">
              <span><span class="repo-lang" style="background:\${r.color || '#0EA5E9'}"></span> \${r.lang}</span>
            </div>
            <a href="\${r.url}" target="_blank" rel="noopener" class="repo-link">View Source →</a>
          </div>
        \`).join('');
      } else {
        grid.innerHTML = '<p>No projects found.</p>';
      }
    }

    if (data.footer) {
      const ft = data.footer;
      setText('dynamic-footer-desc', ft.description);
      setHref('dynamic-footer-github', ft.github_url);
      setHref('dynamic-footer-github2', ft.github_url);
      setHref('dynamic-footer-email', ft.email ? 'mailto:' + ft.email : '#');
      setText('dynamic-footer-copyright', ft.copyright);
      const ftBuilt = document.getElementById('dynamic-footer-built');
      if (ftBuilt && ft.built_by_text) ftBuilt.innerHTML = \`\${ft.built_by_text} <a href="\${ft.built_by_url || '#'}" target="_blank">\${ft.built_by_name || ''}</a>\`;
      
      const ftProjCol = document.getElementById('dynamic-footer-projects-col');
      if (ftProjCol && data.projects) {
        ftProjCol.innerHTML = '<h4>Projects</h4>' + data.projects.map(p => 
          \`<a href="\${p.url}" target="_blank">\${p.name}</a>\`
        ).join('');
      }
    }
  } catch(e) {
    console.error(e);
  }
}`;

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the whole loadDynamicData function
  let startIdx = content.indexOf('async function loadDynamicData() {');
  let endIdx = content.indexOf('loadDynamicData();');
  if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + safeLoadDynamicData + '\n' + content.substring(endIdx);
  }

  // Update nav bar to include about.html
  content = content.replace(/<li><a href="index.html#about">About<\/a><\/li>/g, '<li><a href="about.html">About</a></li>');
  content = content.replace(/<a href="index.html#about">About<\/a>/g, '<a href="about.html">About</a>');

  fs.writeFileSync(file, content);
}

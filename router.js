// Premium PJAX Router for Kzova Labs
document.addEventListener('DOMContentLoaded', () => {
  // Add CSS for transition dynamically to avoid breaking existing styles
  const style = document.createElement('style');
  style.textContent = `
    #main-content {
      transition: opacity 0.25s ease, transform 0.25s ease;
      opacity: 1;
      transform: translateY(0);
    }
    #main-content.router-fade {
      opacity: 0;
      transform: translateY(8px);
    }
  `;
  document.head.appendChild(style);

  // Initialize page components
  initPageFunctions();

  // Intercept navigation clicks
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Check if it's an internal HTML link
    if (href.endsWith('.html') || (href.includes('.html#') && !href.startsWith('http'))) {
      e.preventDefault();
      
      const targetUrl = href.split('#')[0];
      const targetHash = href.split('#')[1];

      // If we are already on that page, just scroll to the hash
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const targetPath = targetUrl || 'index.html';

      if (currentPath === targetPath) {
        if (targetHash) {
          scrollToHash(targetHash);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      navigate(targetUrl, targetHash);
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    loadPage(window.location.pathname.split('/').pop() || 'index.html', window.location.hash.substring(1));
  });
});

// Navigate to a new page
async function navigate(url, hash) {
  const main = document.getElementById('main-content');
  if (main) main.classList.add('router-fade');

  setTimeout(async () => {
    try {
      const success = await loadPage(url, hash);
      if (success) {
        window.history.pushState(null, '', url + (hash ? '#' + hash : ''));
      } else {
        // Fallback to normal navigation if fetch fails
        window.location.href = url + (hash ? '#' + hash : '');
      }
    } catch (err) {
      window.location.href = url + (hash ? '#' + hash : '');
    }
  }, 250);
}

// Fetch and load page content
async function loadPage(url, hash) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Update Title
    document.title = doc.title;

    // Update Content
    const newMain = doc.getElementById('main-content');
    const currentMain = document.getElementById('main-content');
    
    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      
      // Update Navigation Active Links
      updateNavActive(url);
      
      // Remove fade effect
      setTimeout(() => {
        currentMain.classList.remove('router-fade');
      }, 50);

      // Re-initialize dynamic data and scripts
      await loadDynamicData();
      initPageFunctions();

      // Scroll to hash or top
      if (hash) {
        setTimeout(() => scrollToHash(hash), 100);
      } else {
        window.scrollTo({ top: 0 });
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Routing failed', e);
    return false;
  }
}

// Scroll to hash element
function scrollToHash(hash) {
  const el = document.getElementById(hash);
  if (el) {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  }
}

// Update Active Nav Link
function updateNavActive(url) {
  const cleanUrl = url.split('/').pop() || 'index.html';
  document.querySelectorAll('#nav a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith(cleanUrl)) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// Re-initialize Page Specific Elements
function initPageFunctions() {
  // Mobile menu auto-close
  const hb = document.getElementById('hamburger');
  const mm = document.getElementById('mobileMenu');
  if (hb && mm) {
    // Clean old listeners by cloning
    const newHb = hb.cloneNode(true);
    hb.parentNode.replaceChild(newHb, hb);
    newHb.addEventListener('click', () => mm.classList.toggle('open'));
  }

  // Auto close mobile menu on click
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      const mm = document.getElementById('mobileMenu');
      if (mm) mm.classList.remove('open');
    });
  });

  // Re-observe Reveal Elements
  if (typeof ro !== 'undefined' && ro) {
    document.querySelectorAll('.reveal, [class*="reveal-"]').forEach(el => ro.observe(el));
  }

  // Re-observe Stats Elements
  if (typeof co !== 'undefined' && co) {
    document.querySelectorAll('.stat-num').forEach(el => co.observe(el));
  }

  // Re-hook hover effect on interactive elements for the custom cursor
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring) {
    document.querySelectorAll('a, button, .feature-card, .repo-card, .tech-card, .privacy-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '52px';
        ring.style.height = '52px';
        ring.style.borderColor = 'rgba(255,255,255,.9)';
        dot.style.background = '#FFF';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(14,165,233,.5)';
        dot.style.background = '#0EA5E9';
      });
    });
  }
}

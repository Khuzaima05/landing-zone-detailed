// IBM Cloud Landing Zone - Custom JavaScript

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#__consent' && href !== '#__toc') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ============================================
  // Add Copy Button to Code Blocks
  // ============================================
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre > code');
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (!pre.querySelector('.copy-button')) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = '📋 Copy';
        button.addEventListener('click', () => {
          const code = codeBlock.textContent;
          navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '✅ Copied!';
            setTimeout(() => {
              button.innerHTML = '📋 Copy';
            }, 2000);
          });
        });
        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  }

  // ============================================
  // Animate Elements on Scroll
  // ============================================
  function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .module-card, .learning-step');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  // ============================================
  // Statistics Counter Animation
  // ============================================
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target') || counter.textContent);
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const updateCounter = () => {
            current += increment;
            if (current < target) {
              counter.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target;
            }
          };

          updateCounter();
          observer.unobserve(counter);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  // ============================================
  // Add External Link Icons
  // ============================================
  function addExternalLinkIcons() {
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      if (!link.hostname.includes(window.location.hostname)) {
        link.classList.add('external-link');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // ============================================
  // Table of Contents Highlighting
  // ============================================
  function highlightTOC() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          document.querySelectorAll('.md-nav__link').forEach(link => {
            link.classList.remove('active');
          });
          const activeLink = document.querySelector(`.md-nav__link[href="#${id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -80% 0px'
    });

    document.querySelectorAll('h2[id], h3[id]').forEach(heading => {
      observer.observe(heading);
    });
  }

  // ============================================
  // Search Enhancement
  // ============================================
  function enhanceSearch() {
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.setAttribute('placeholder', 'Search IBM Cloud Landing Zone docs...');
    }
  }

  // ============================================
  // Add Reading Time Estimate
  // ============================================
  function addReadingTime() {
    const article = document.querySelector('.md-content__inner');
    if (article) {
      const text = article.textContent;
      const wordsPerMinute = 200;
      const wordCount = text.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);
      
      const readingTimeElement = document.createElement('div');
      readingTimeElement.className = 'reading-time';
      readingTimeElement.innerHTML = `📖 ${readingTime} min read`;
      readingTimeElement.style.cssText = `
        color: var(--md-default-fg-color--light);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        background: var(--md-code-bg-color);
        border-radius: 0.5rem;
        display: inline-block;
      `;
      
      const title = article.querySelector('h1');
      if (title && title.nextSibling) {
        title.parentNode.insertBefore(readingTimeElement, title.nextSibling);
      }
    }
  }

  // ============================================
  // Add Last Updated Info
  // ============================================
  function addLastUpdated() {
    const footer = document.querySelector('.md-content__inner');
    const gitRevisionDate = document.querySelector('.git-revision-date-localized-plugin');
    
    if (footer && gitRevisionDate) {
      const lastUpdated = document.createElement('div');
      lastUpdated.className = 'last-updated';
      lastUpdated.innerHTML = `
        <hr>
        <p style="color: var(--md-default-fg-color--light); font-size: 0.9rem;">
          📅 ${gitRevisionDate.textContent}
        </p>
      `;
      footer.appendChild(lastUpdated);
    }
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.md-search__input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to close search
      if (e.key === 'Escape') {
        const searchInput = document.querySelector('.md-search__input');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
      }
    });
  }

  // ============================================
  // Progress Bar for Long Pages
  // ============================================
  function addProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--ibm-blue-60), var(--ibm-cyan));
      z-index: 1000;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      progressBar.style.width = `${progress}%`;
    });
  }

  // ============================================
  // Back to Top Button
  // ============================================
  function addBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: var(--ibm-blue-60);
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      box-shadow: 0 4px 12px rgba(15, 98, 254, 0.3);
    `;
    
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    });

    document.body.appendChild(button);
  }

  // ============================================
  // Initialize All Features
  // ============================================
  function init() {
    addCopyButtons();
    animateOnScroll();
    animateCounters();
    addExternalLinkIcons();
    highlightTOC();
    enhanceSearch();
    addReadingTime();
    addLastUpdated();
    setupKeyboardShortcuts();
    addProgressBar();
    addBackToTop();
  }

  // Run initialization
  init();

  // Re-run on instant loading navigation
  if (typeof app !== 'undefined') {
    app.document$.subscribe(() => {
      setTimeout(init, 100);
    });
  }
});

// ============================================
// Print Optimization
// ============================================
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.md-sidebar').forEach(el => {
    el.style.display = 'none';
  });
});

window.addEventListener('afterprint', () => {
  document.querySelectorAll('.md-sidebar').forEach(el => {
    el.style.display = '';
  });
});

// Made with Bob

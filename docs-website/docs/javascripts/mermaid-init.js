// Mermaid initialization for Netflix dark theme
document.addEventListener('DOMContentLoaded', function() {
  // Wait for mermaid to be available
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#141414',
        primaryColor: '#E50914',
        primaryTextColor: '#fff',
        primaryBorderColor: '#E50914',
        lineColor: '#666',
        secondaryColor: '#1f1f1f',
        tertiaryColor: '#2a2a2a',
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      securityLevel: 'loose'
    });
    
    // Re-render mermaid diagrams when theme changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-md-color-scheme') {
          mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
  }
});

// Made with Bob

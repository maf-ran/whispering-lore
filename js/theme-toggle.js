;(function() {
  var themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  var storedTheme = localStorage.getItem('theme');

  var getPreferredTheme = function() {
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  var applyTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Theme already set by inline script in <head> — only handle toggle clicks
  themeToggle.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    themeToggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
  });
})();
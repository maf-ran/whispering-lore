(function () {
  'use strict'
  const themeToggle = document.getElementById('theme-toggle')
  if (!themeToggle) return

  const applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  // Theme already set by inline script in <head> — only handle toggle clicks
  themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    themeToggle.setAttribute(
      'aria-pressed',
      next === 'light' ? 'true' : 'false'
    )
  })
})()

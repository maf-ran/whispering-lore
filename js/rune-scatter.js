(function () {
  'use strict'
  const runes = [
    'ᚠ',
    'ᚢ',
    'ᚦ',
    'ᚨ',
    'ᚱ',
    'ᚲ',
    'ᚷ',
    'ᚹ',
    'ᚺ',
    'ᚾ',
    'ᛁ',
    'ᛃ',
    'ᛇ',
    'ᛈ',
    'ᛉ',
    'ᛊ',
    'ᛏ',
    'ᛒ',
    'ᛖ',
    'ᛗ',
    'ᛚ',
    'ᛝ',
    'ᛟ',
    'ᛞ',
    'ᚁ',
    'ᚂ',
    'ᚃ',
    'ᚄ',
    'ᚅ',
    'ᚆ',
    'ᚇ',
    'ᚈ',
    'ᚉ',
    'ᚊ',
    'α',
    'β',
    'γ',
    'δ',
    'ε',
    'ζ',
    'η',
    'θ',
    'ι',
    'κ',
    'λ',
    'μ',
    'ν',
    'ξ',
    'ο',
    'π',
    'ρ',
    'σ',
    'τ',
    'υ',
    'φ',
    'χ',
    'ψ',
    'ω',
    '𓃀',
    '𓃭',
    '𓃵',
    '𓃾',
    '𓄿',
    '𓅓',
    '𓅱',
    '𓆑',
    '𓆓',
    '𓆗',
  ]
  function initRuneScatter() {
    const canvas = document.getElementById('rune-canvas')
    const hero =
      document.querySelector('.hero') || document.querySelector('.page-hero')
    if (!canvas || !hero) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    function draw() {
      const w = hero.offsetWidth,
        h = hero.offsetHeight
      ;(canvas.width = w), (canvas.height = h)
      ctx.clearRect(0, 0, w, h)
      const isLight =
        document.documentElement.getAttribute('data-theme') === 'light'
      const shuffled = runes.slice()
      for (let si = shuffled.length - 1; si > 0; si--) {
        const sj = Math.floor(Math.random() * (si + 1))
        const tmp = shuffled[si]
        shuffled[si] = shuffled[sj]
        shuffled[sj] = tmp
      }
      const selected = shuffled.slice(0, 16 + Math.floor(Math.random() * 8))
      selected.forEach(function (rune) {
        let x = Math.random(),
          y = Math.random()
        if (x > 0.25 && x < 0.75 && y > 0.2 && y < 0.8) {
          x =
            Math.random() < 0.5
              ? Math.random() * 0.2
              : 0.8 + Math.random() * 0.2
          y =
            Math.random() < 0.5
              ? Math.random() * 0.15
              : 0.85 + Math.random() * 0.15
        }
        ctx.font = 16 + Math.random() * 28 + 'px serif'
        ctx.fillStyle = isLight
          ? 'rgba(153, 27, 27, ' + (0.06 + Math.random() * 0.18) + ')'
          : 'rgba(255, 255, 255, ' + (0.06 + Math.random() * 0.16) + ')'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(rune, x * w, y * h)
      })
    }
    draw()
    window.addEventListener('resize', draw, { passive: true })
  }
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  )
    initRuneScatter()
  else document.addEventListener('DOMContentLoaded', initRuneScatter)
})()

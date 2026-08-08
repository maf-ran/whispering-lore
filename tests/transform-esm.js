// tests/transform-esm.js
/* eslint-env node */
// Minimal ESM -> CJS transform for the viewer modules so Jest can load them
// in jsdom tests. Deliberately tiny: only handles the exact syntax the
// viewer files use (import { X } from '...'; export class X / export function X).
// Files without ESM syntax pass through untouched (safe for the existing CJS tests).

function transformSync(source, _filename) {
  if (typeof source !== 'string') return { code: source }

  const hasEsSyntax =
    /^import\s/m.test(source) || /^export\s/m.test(source)

  if (!hasEsSyntax) return { code: source }

  const importRe = /^import\s*\{([^}]+)\}\s*from\s*(['"])([^'"]+)\2\s*;?$/gm
  let out = source.replace(
    importRe,
    function (m, names, _q, mod) {      const trimmed = names.split(',').map(function (n) { return n.trim() }).filter(Boolean)
      return 'const { ' + trimmed.join(', ') + ' } = require(' + JSON.stringify(mod) + ');'
    }
  )

  // import X from '...' (default import)
  out = out.replace(
    /^import\s+([A-Za-z_$][\w$]*)\s*from\s*(['"])([^'"]+)\2\s*;?$/gm,
    function (m, name, _q, mod) {
      return 'const ' + name + ' = require(' + JSON.stringify(mod) + ').default || require(' + JSON.stringify(mod) + ');'
    }
  )

  // export class X { -> class X {
  const exported = []
  out = out.replace(
    /^export\s+class\s+([A-Za-z_$][\w$]*)/gm,
    function (m, name) {
      exported.push(name)
      return 'class ' + name
    }
  )

  // export function X( -> function X(
  out = out.replace(
    /^export\s+function\s+([A-Za-z_$][\w$]*)/gm,
    function (m, name) {
      exported.push(name)
      return 'function ' + name
    }
  )

  // export { A, B } / export default X
  out = out.replace(/^export\s+default\s+/gm, '')
  out = out.replace(
    /^export\s+\{([^}]*)\}\s*;?$/gm,
    function (m, names) {
      names
        .split(',')
        .map(function (n) { return n.trim().split(/\s+as\s+/)[0].trim() })
        .filter(Boolean)
        .forEach(function (n) {
          if (exported.indexOf(n) === -1) exported.push(n)
        })
      return ''
    }
  )

  if (exported.length > 0) {
    out += '\nmodule.exports = { ' + exported.join(', ') + ' };\n'
  }

  return { code: out }
}

module.exports = { process: transformSync }

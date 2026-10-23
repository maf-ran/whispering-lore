/* eslint-env node */
'use strict'

// Netlify Function: server-side Gemini translation proxy.
//
// SECURITY INVARIANT: the GEMINI_API_KEY is read ONLY here, from the Netlify
// environment. It must never be embedded in client code, the repo, or the
// deploy bundle. Set it in Netlify: Site > Environment variables.
//
// Usage: POST / .netlify/functions/translate
//   { "source": "en", "target": "fr", "strings": ["Hello", "World"] }
// Response: { "translations": ["Bonjour", "Monde"] }  (aligned 1:1 with input)

const SUPPORTED = /^[a-z]{2}(-[A-Z]{2})?$/ // matches menu language codes (zh-CN etc.)
const MAX_STRINGS = 30
const MAX_TOTAL_CHARS = 8000
const MODEL = 'gemini-3.6-flash'
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(whisperinglore\.com|netlify\.app)$/

// Cheap abuse barrier: browsers always send Origin on the same-origin POST this
// function serves, so a missing/foreign Origin means a script, not the site.
function originAllowed(origin) {
  if (!origin) return false
  if (origin === 'http://localhost:3000' || origin === 'http://localhost:8888') return true
  return ALLOWED_ORIGIN.test(origin)
}

function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  }
}

async function callGemini(apiKey, source, target, strings) {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    MODEL +
    ':generateContent?key=' +
    encodeURIComponent(apiKey)

  const joined = strings.map(function (s) { return s.replace(/\n/g, ' \\n ') })

  const prompt =
    'You are a faithful folklore/localization translator. Translate each string ' +
    'from ' + source + ' to ' + target + '. Keep proper nouns (names of creatures, ' +
    'places, artifacts), numbers, units and any markup/attribute tokens EXACTLY as-is. ' +
    'Preserve the meaning and cultural register; do not add notes. Return ONLY a valid ' +
    'JSON array of strings of the SAME length in the SAME order as the input. Input: ' +
    JSON.stringify(joined)

  const controller = new AbortController()
  const timer = setTimeout(function () { controller.abort() }, 25000)
  let r
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        }
      })
    })
  } finally {
    clearTimeout(timer)
  }

  if (!r.ok) {
    const t = await r.text()
    throw new Error('gemini ' + r.status + ': ' + t.slice(0, 300))
  }
  const data = await r.json()
  const text = data.candidates && data.candidates[0] && data.candidates[0].content &&
    data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
  if (!text) throw new Error('gemini empty response')
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== strings.length) {
    throw new Error('gemini reply length mismatch: got ' + arr.length + ' want ' + strings.length)
  }
  return arr.map(function (s) { return String(s).replace(/ \\n /g, '\n') })
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  const origin = event.headers && (event.headers.origin || event.headers.Origin)
  if (!originAllowed(origin)) {
    return json(403, { error: 'forbidden_origin' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return json(503, { error: 'not_configured' })
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch (e) { return json(400, { error: 'bad_json' }) }

  const target = body.target
  if (!target || !SUPPORTED.test(target)) return json(400, { error: 'bad_target' })
  const source = body.source || 'en'
  if (!SUPPORTED.test(source)) return json(400, { error: 'bad_source' })
  const strings = body.strings
  if (!Array.isArray(strings) || strings.length === 0 || strings.length > MAX_STRINGS) {
    return json(400, { error: 'bad_strings', max: MAX_STRINGS })
  }
  const total = strings.reduce(function (n, s) { return n + String(s).length }, 0)
  if (total > MAX_TOTAL_CHARS) return json(400, { error: 'too_large', max: MAX_TOTAL_CHARS })

  try {
    const translations = await callGemini(apiKey, source, target, strings)
    return json(200, { translations: translations })
  } catch (err) {
    const msg = String(err && err.message || err)
    // Upstream detail stays in the function log; never echoed to the client.
    console.error('translate function:', msg)
    if (/401|403/.test(msg)) {
      return json(500, { error: 'gemini_unauthorized' })
    }
    return json(502, { error: 'gemini_upstream' })
  }
}

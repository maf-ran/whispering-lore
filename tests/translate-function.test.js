/* eslint-env node */
const { handler } = require('../netlify/functions/translate')

function call(overrides) {
  return handler({
    httpMethod: 'POST',
    headers: { origin: 'https://whisperinglore.com' },
    body: JSON.stringify({ source: 'en', target: 'de', strings: ['Hello'] }),
    ...overrides
  })
}

const body = (res) => JSON.parse(res.body)

describe('translate function guards', () => {
  beforeEach(() => { process.env.GEMINI_API_KEY = 'test-key' })
  afterEach(() => { delete process.env.GEMINI_API_KEY })

  test('rejects non-POST', async () => {
    expect((await call({ httpMethod: 'GET' })).statusCode).toBe(405)
  })

  test('rejects a missing or foreign origin before spending quota', async () => {
    expect((await call({ headers: {} })).statusCode).toBe(403)
    expect((await call({ headers: { origin: 'https://evil.example' } })).statusCode).toBe(403)
    expect((await call({ headers: { origin: 'http://localhost:3000' } })).statusCode).not.toBe(403)
  })

  test('validates both source and target codes', async () => {
    const badSource = await call({ body: JSON.stringify({ source: 'en; drop', target: 'de', strings: ['x'] }) })
    expect(badSource.statusCode).toBe(400)
    expect(body(badSource).error).toBe('bad_source')
    const badTarget = await call({ body: JSON.stringify({ source: 'en', target: 'not a code', strings: ['x'] }) })
    expect(badTarget.statusCode).toBe(400)
    expect(body(badTarget).error).toBe('bad_target')
  })

  test('returns 503 when the key is not configured', async () => {
    delete process.env.GEMINI_API_KEY
    expect((await call({})).statusCode).toBe(503)
  })
})

import core from '../lib/translate-core.cjs'

// Functions v2 config: rate limits are only read from modern default-export
// functions, not from legacy `exports.handler` functions or netlify.toml.
export const config = {
  path: '/.netlify/functions/translate',
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain']
  }
}

export default async function translate(request) {
  const result = await core.handler({
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers),
    body: await request.text()
  })

  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers
  })
}

/* eslint-env node */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

describe('no secrets in git tree', function () {
  let tracked

  beforeAll(function () {
    tracked = execFileSync('git', ['ls-files'], { cwd: process.cwd() })
      .toString('utf-8')
      .split('\n')
      .filter(Boolean)
  }, 15000)

  test('.env is never tracked', function () {
    expect(tracked.filter((f) => f === '.env' || f.startsWith('.env.'))).toEqual([])
  })

  test('no tracked file contains an API key pattern', function () {
    const re = /AIza[0-9A-Za-z_-]{30,}|sk-[0-9A-Za-z]{20,}/g
    const offenders = []
    tracked.forEach(function (file) {
      if (!/\.(js|mjs|json|html|py|toml|yml|yaml|md|sh|mjs)$/.test(file)) return
      const full = path.join(process.cwd(), file)
      if (!fs.existsSync(full)) return
      if (re.test(fs.readFileSync(full, 'utf-8'))) offenders.push(file)
    })
    expect(offenders).toEqual([])
  })
})
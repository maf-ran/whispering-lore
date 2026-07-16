const fs = require('fs');
const path = require('path');

describe('Rune scatter requirements', () => {
  it('rune-scatter.js exists and exports setupRuneScatter', () => {
    const filePath = path.join(__dirname, '..', 'js', 'rune-scatter.js');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/setupRuneScatter|runeScatter|initRunes|function/);
  });

  it('references rune-canvas element id', () => {
    const filePath = path.join(__dirname, '..', 'js', 'rune-scatter.js');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/rune-canvas/);
  });

  it('references canvas 2d context', () => {
    const filePath = path.join(__dirname, '..', 'js', 'rune-scatter.js');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/getContext\('2d'\)/);
  });
});

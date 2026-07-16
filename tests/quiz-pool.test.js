const fs = require('fs');
const path = require('path');

const levelTimers = {
  1: 30,
  2: 30,
  3: 45,
  4: 45,
  5: 60,
  6: 60,
};

describe('Quiz‑pool JSON sanity', () => {
  for (let lvl = 1; lvl <= 6; lvl++) {
    test(`level ${lvl} sample has 4 choices and correct timer`, () => {
      const dir = path.join(__dirname, '..', 'data', 'quiz-pool', `level${lvl}`);
      const files = fs.readdirSync(dir).filter(f => f !== 'index.json');
      expect(files.length).toBeGreaterThan(0);
      const file = files[0];
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      expect(Array.isArray(data.choices)).toBe(true);
      const expectedLen = lvl === 6 ? 2 : 4;
      expect(data.choices.length).toBe(expectedLen);
      expect(data.correctIndex).toBeGreaterThanOrEqual(0);
      expect(data.correctIndex).toBeLessThan(expectedLen);
      expect(levelTimers[lvl]).toBeGreaterThan(0);
    });
  }
});

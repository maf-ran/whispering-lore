const { getQuestion } = require('../questionFactory');

test('getQuestion returns correct shape for each level', async () => {
  for (let lvl = 1; lvl <= 6; lvl++) {
    const q = await getQuestion(lvl);
    expect(q).toHaveProperty('prompt');
    expect(Array.isArray(q.choices)).toBe(true);
    const expectedLen = lvl === 6 ? 2 : 4;
    expect(q.choices.length).toBe(expectedLen);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(expectedLen);
    expect(q.timer).toBeDefined();
    if (lvl === 6) {
      expect(q.extra).toHaveProperty('trueFalse');
    }
  }
});

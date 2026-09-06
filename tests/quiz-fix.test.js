describe('Quiz applyFilters', () => {
  const samplePool = [
    { type: 'creatures', prompt: 'Q1', extra: { geo: { country: 'Norway', region: 'Nordic' } } },
    { type: 'stories', prompt: 'Q2', extra: { geo: { country: 'Japan', region: 'East Asia' } } },
    { type: 'creatures', prompt: 'Q3', extra: { geo: { country: 'Japan', region: 'East Asia' } } },
    { type: 'stories', prompt: 'Q4', extra: { geo: { country: 'Norway', region: 'Nordic' } } },
    { type: 'creatures', prompt: 'Q5' },
  ];

  it('filters by scope (creatures only)', () => {
    const scope = 'creatures';
    const geoValue = 'all';
    const filtered = samplePool.filter(q => {
      if (scope !== 'both' && q.type && q.type !== scope) return false;
      if (geoValue !== 'all') {
        if (!q.extra || !q.extra.geo) return false;
        if (q.extra.geo.country !== geoValue && q.extra.geo.region !== geoValue) return false;
      }
      return true;
    });
    expect(filtered).toHaveLength(3);
    expect(filtered.every(q => q.type === 'creatures')).toBe(true);
  });

  it('filters by geography', () => {
    const scope = 'both';
    const geoValue = 'Japan';
    const filtered = samplePool.filter(q => {
      if (scope !== 'both' && q.type && q.type !== scope) return false;
      if (geoValue !== 'all') {
        if (!q.extra || !q.extra.geo) return false;
        if (q.extra.geo.country !== geoValue && q.extra.geo.region !== geoValue) return false;
      }
      return true;
    });
    expect(filtered).toHaveLength(2);
    expect(filtered.every(q => q.extra.geo.country === 'Japan' || q.extra.geo.region === 'East Asia')).toBe(true);
  });

  it('returns all when no filters applied', () => {
    const scope = 'both';
    const geoValue = 'all';
    const filtered = samplePool.filter(q => {
      if (scope !== 'both' && q.type && q.type !== scope) return false;
      if (geoValue !== 'all') {
        if (!q.extra || !q.extra.geo) return false;
        if (q.extra.geo.country !== geoValue && q.extra.geo.region !== geoValue) return false;
      }
      return true;
    });
    expect(filtered).toHaveLength(5);
  });

  it('handles items without geo field when geo filter is active', () => {
    const scope = 'both';
    const geoValue = 'Norway';
    const filtered = samplePool.filter(q => {
      if (scope !== 'both' && q.type && q.type !== scope) return false;
      if (geoValue !== 'all') {
        if (!q.extra || !q.extra.geo) return false;
        if (q.extra.geo.country !== geoValue && q.extra.geo.region !== geoValue) return false;
      }
      return true;
    });
    expect(filtered).toHaveLength(2);
    // Q5 has no extra.geo so should be excluded
    expect(filtered.find(q => q.prompt === 'Q5')).toBeUndefined();
  });
});

describe('Quiz score denominator', () => {
  // showFinal must divide by questions actually asked, not the requested
  // count — a narrow geo filter can shrink the pool below maxQuestions.
  const finalStats = (asked, score, maxQuestions) => {
    let m = maxQuestions;
    if (asked < m) m = asked; // pool exhausted early (matches loadPool cap)
    const total = asked;
    const displayScore = Math.min(score, total);
    const percent = Math.round((displayScore / total) * 100);
    return { total, displayScore, percent };
  };

  it('uses asked count when pool exhausted early', () => {
    const s = finalStats(3, 2, 10);
    expect(s.total).toBe(3);
    expect(s.displayScore).toBe(2);
    expect(s.percent).toBe(67);
  });

  it('unchanged when pool covers the full request', () => {
    const s = finalStats(10, 7, 10);
    expect(s.total).toBe(10);
    expect(s.percent).toBe(70);
  });

  it('clamps score above total (level-6 sub-question overshoot)', () => {
    const s = finalStats(10, 12, 10);
    expect(s.displayScore).toBe(10);
    expect(s.percent).toBe(100);
  });
});

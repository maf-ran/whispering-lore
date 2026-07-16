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

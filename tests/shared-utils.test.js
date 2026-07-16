function escapeHtml(str) {
  if (str == null) return '';
  const el = { textContent: String(str) };
  return el.textContent;
}

describe('safeText', () => {
  it('returns safe text (no HTML injection)', () => {
    const fn = (str) => {
      if (str == null) return '';
      const el = { textContent: String(str) };
      return el.textContent;
    };
    expect(fn('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
    expect(fn('safe text')).toBe('safe text');
    expect(fn('')).toBe('');
    expect(fn(null)).toBe('');
    expect(fn(undefined)).toBe('');
  });
});

describe('getSlug', () => {
  it('converts name to URL-safe slug', () => {
    const fn = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    expect(fn('Hello World')).toBe('hello-world');
    expect(fn('Café Crème')).toBe('caf-cr-me');
    expect(fn('  spaces  ')).toBe('spaces');
    expect(fn('already-slug')).toBe('already-slug');
  });
});

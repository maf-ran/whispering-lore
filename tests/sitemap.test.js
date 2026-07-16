const fs = require('fs');
const path = require('path');

describe('Static files', () => {
  const root = path.resolve(__dirname, '..');
  const files = ['index.html', 'about.html', 'bestiary.html', 'stories.html', 'world.html', 'quiz.html', 'mylore.html', 'methodology.html'];
  const sitemapExcluded = ['404.html'];

  [...files, ...sitemapExcluded].forEach(f => {
    it(`${f} exists and has basic structure`, () => {
      const content = fs.readFileSync(path.join(root, f), 'utf-8');
      expect(content).toMatch(/<!DOCTYPE html>/i);
      expect(content).toMatch(/<html lang="en">/);
      expect(content).toMatch(/<title>/);
      expect(content).toMatch(/<link rel="stylesheet" href="css\/styles.css"/);
    });
  });

  it('sitemap.xml lists all public pages', () => {
    const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf-8');
    files.forEach(f => {
      const page = f === 'index.html' ? '/' : f.replace('.html', '');
      expect(sitemap).toContain(page);
    });
    expect(sitemap).not.toContain('404');
  });

  it('robots.txt exists', () => {
    expect(fs.existsSync(path.join(root, 'robots.txt'))).toBe(true);
  });

  it('favicon.svg exists', () => {
    expect(fs.existsSync(path.join(root, 'favicon.svg'))).toBe(true);
  });
});

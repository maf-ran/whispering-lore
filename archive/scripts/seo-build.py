"""Prerender crawlable entity pages + write the full sitemap for the deploy.

Emits <out>/creature/<slug>/index.html, <out>/story/<slug>/index.html and
<out>/item/<slug>/index.html from the canonical masters, and overwrites
<out>/sitemap.xml with the complete URL list (site pages + every entity).

Entity pages are self-contained static HTML (semantic article + JSON-LD +
canonical + meta), English-only, linking back to the interactive app deep
links. Generators live under archive/ (gitignored) and run at deploy time,
so the committed repo stays free of ~6.5k generated files.

Usage: python3 archive/scripts/seo-build.py /tmp/wl-deploy-stage
"""
import html
import json
import os
import re
import sys
from datetime import date

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTERS = {
    'creature': ('data', 'datasets', 'creatures.json'),
    'story': ('data', 'datasets', 'stories.json'),
    'item': ('data', 'items.json'),
}
NAME_KEYS = {'creature': 'name', 'story': 'title', 'item': 'name'}
BODY_KEYS = {'creature': 'description', 'story': 'summary', 'item': 'description'}
SITE = 'https://whisperinglore.com'
APP_URL = {
    'creature': 'bestiary.html?creature=',
    'story': 'stories.html?story=',
    'item': 'items.html?item=',
}


def esc(s):
    return html.escape(str(s), quote=True)


def get_json_ld(kind, name, description, url):
    if kind == 'creature':
        schema_type = 'DefinedTerm'
    elif kind == 'story':
        schema_type = 'Article'
    else:
        schema_type = 'Thing'
    
    return json.dumps({
        "@context": "https://schema.org",
        "@type": schema_type,
        "name": name,
        "description": description[:300],
        "url": url,
        "mainEntityOfPage": url
    }, indent=2)


def page(kind, item):
    slug = item.get('slug')
    name = item.get(NAME_KEYS[kind])
    body = item.get(BODY_KEYS[kind]) or ''
    text = re.sub(r'\s+', ' ', body).strip()
    meta_desc = text[:160]
    url = '%s/%s/%s/' % (SITE, kind, slug)
    app = SITE + '/' + APP_URL[kind] + slug
    meta = [x for x in [item.get('type'), item.get('country'), item.get('region')] if x]
    extra = '<p class="entity-meta">%s</p>' % (' &middot; '.join(esc(m) for m in meta))
    json_ld_str = get_json_ld(kind, name, meta_desc, url)
    return ('<!DOCTYPE html>\n'
            '<html lang="en">\n'
            '<head>\n'
            '  <meta charset="UTF-8" />\n'
            '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
            '  <title>%s | Whispering Lore</title>\n'
            '  <meta name="description" content="%s" />\n'
            '  <link rel="canonical" href="%s" />\n'
            '  <meta property="og:type" content="website" />\n'
            '  <meta property="og:title" content="%s | Whispering Lore" />\n'
            '  <meta property="og:description" content="%s" />\n'
            '  <meta property="og:image" content="%s/og-image.png" />\n'
            '  <meta property="og:url" content="%s" />\n'
            '  <meta name="twitter:card" content="summary_large_image" />\n'
            '  <script type="application/ld+json">\n'
            '%s\n'
            '  </script>\n'
            '  <link rel="stylesheet" href="%s/css/styles.css" />\n'
            '</head>\n'
            '<body>\n'
            '  <main class="entity-page">\n'
            '    <nav aria-label="Breadcrumb"><a href="%s/">Whispering Lore</a> &rsaquo; <a href="%s/%ss.html">%ss</a></nav>\n'
            '    <article>\n'
            '      <h1>%s</h1>\n'
            '      %s\n'
            '      <p>%s</p>\n'
            '      <p><a href="%s">Open in the interactive archive &rarr;</a></p>\n'
            '    </article>\n'
            '  </main>\n'
            '  <footer>\n'
            '    <div class="ko-fi-support" aria-label="Support Whispering Lore on Ko-fi">\n'
            '      <p class="ko-fi-label">Help keep the archive alive</p>\n'
            '      <a class="monero-btn" href="monero:48fFYGMhUbiBvjoGB61bJQ4brmmQqmanKa1Z5rwLFjhxbHSS1yyqZZXMdVqG6pdXWETKi8kWX3T4mfg3xa8MKkFZ62BygAm" aria-label="Support Whispering Lore with Monero (XMR)">\n'
            '        <img src="%s/assets/monero-heart.png" alt="" aria-hidden="true" />\n'
            '        <span>Support with Monero</span>\n'
            '      </a>\n'
            '      <script type="text/javascript">\n'
            '      (function () {\n'
            '        function loadKoFi() {\n'
            '          if (window.kofiwidget2) {\n'
            '            kofiwidget2.init("Support me on Ko-fi", "#fa9417", "X7B3253Q7T");\n'
            '            var el = document.querySelector(".ko-fi-support");\n'
            '            if (el && !el.querySelector(".kofi-button")) {\n'
            '              el.insertAdjacentHTML("beforeend", kofiwidget2.getHTML());\n'
            '            }\n'
            '            return;\n'
            '          }\n'
            '          var s = document.createElement("script");\n'
            '          s.src = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";\n'
            '          s.async = true;\n'
            '          s.onload = loadKoFi;\n'
            '          document.body.appendChild(s);\n'
            '        }\n'
            '        if (document.readyState === "complete") loadKoFi();\n'
            '        else window.addEventListener("load", loadKoFi);\n'
            '      })();\n'
            '      </script>\n'
            '    </div>\n'
            '    <p class="text-small text-center"><a href="%s/">Whispering Lore</a> &middot; <a href="%s/about.html">About</a></p>\n'
            '  </footer>\n'
            '</body>\n'
            '</html>\n') % (
                esc(name), esc(meta_desc), esc(url), esc(name), esc(meta_desc),
                SITE, esc(url), json_ld_str,
                SITE, SITE, SITE, '%ss' % kind, '%ss' % kind, esc(name), extra,
                esc(text[:600]), esc(app), SITE, SITE, SITE)


def main():
    if len(sys.argv) < 2:
        raise SystemExit('usage: python3 archive/scripts/seo-build.py <stage-dir>')
    out = os.path.abspath(sys.argv[1])
    urls = [
        ('', 'weekly', '1.0'),
        ('bestiary.html', 'weekly', '0.9'),
        ('stories.html', 'weekly', '0.8'),
        ('items.html', 'weekly', '0.8'),
        ('world.html', 'monthly', '0.7'),
        ('quiz.html', 'monthly', '0.6'),
        ('about.html', 'monthly', '0.5'),
        ('mylore.html', 'weekly', '0.7'),
        ('methodology.html', 'monthly', '0.5'),
        ('search.html', 'weekly', '0.7'),
    ]
    today = date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
             '  <url><loc>%s/</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>'
             % (SITE, today, 'daily', '1.0')]
    for path, freq, prio in urls[1:]:
        lines.append('  <url><loc>%s/%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>'
                     % (SITE, path, today, freq, prio))
    for kind, rel in MASTERS.items():
        with open(os.path.join(BASE, *rel)) as f:
            items = json.load(f)
        for item in items:
            slug = item.get('slug')
            lines.append('  <url><loc>%s/%s/%s/</loc><lastmod>%s</lastmod></url>'
                         % (SITE, kind, slug, today))
            d = os.path.join(out, kind, slug)
            os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, 'index.html'), 'w') as g:
                g.write(page(kind, item))
            print('wrote', kind, slug)
    lines.append('</urlset>')
    with open(os.path.join(out, 'sitemap.xml'), 'w') as f:
        f.write('\n'.join(lines) + '\n')
    print('sitemap written: %d urls' % (len(lines) - 3))


if __name__ == '__main__':
    main()
'use strict';
/* Casa Nungwi static site generator. Run:  node scripts/build.js
   Reads lang/*.json + data/site.json, writes real HTML for every page in every language
   (English at the root, others in /de/ /it/ /fr/ /ru/), plus sitemap.xml.
   No dependencies. Commit the generated files; hosting needs no build step. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://casanungwi.com';
const EMAIL = 'casanungwi@gmail.com';
const LANGS = [
  { code: 'en', name: 'English', locale: 'en_US' },
  { code: 'de', name: 'Deutsch', locale: 'de_DE' },
  { code: 'it', name: 'Italiano', locale: 'it_IT' },
  { code: 'fr', name: 'Français', locale: 'fr_FR' },
  { code: 'ru', name: 'Русский', locale: 'ru_RU' }
];
const PAGES = ['home', 'apartments', 'gallery', 'location', 'contact', 'privacy'];
const SLUG = { home: '', apartments: 'apartments/', gallery: 'gallery/', location: 'location/', contact: 'contact/', privacy: 'privacy/' };
const NAV = [['home', 'nav.home'], ['apartments', 'nav.apartments'], ['gallery', 'nav.gallery'], ['location', 'nav.location'], ['contact', 'nav.contact']];

const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const site = readJSON('data/site.json');
const dicts = Object.fromEntries(LANGS.map(l => [l.code, readJSON(`lang/${l.code}.json`)]));
const en = dicts.en;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlPath = (lang, page) => (lang === 'en' ? '/' : `/${lang}/`) + SLUG[page];
const outFile = (lang, page) => path.join(ROOT, lang === 'en' ? '' : lang, SLUG[page], 'index.html');

// warn about missing translation keys (fallback to English is used)
for (const l of LANGS) {
  const missing = Object.keys(en).filter(k => dicts[l.code][k] === undefined);
  if (missing.length) console.warn(`[warn] ${l.code}.json missing ${missing.length} key(s): ${missing.slice(0, 5).join(', ')}…`);
}

function render(lang, page) {
  const d = dicts[lang];
  const t = (k) => (d[k] !== undefined ? d[k] : (en[k] !== undefined ? en[k] : k));
  // text with [TODO …] fragments highlighted
  const tx = (k) => esc(t(k)).replace(/\[TODO[^\]]*\]/g, '<mark class="todo">$&</mark>');
  const alt = (p) => d['alt.' + p.id] || t('alt.default');
  const img = (p, sizes = '100vw', eager = false) => {
    const src = '/' + p.src;
    const m = /^(.*)\.(\w+)$/.exec(src);
    const srcset = p.widths && p.widths.length && m
      ? ` srcset="${p.widths.map(w => `${m[1]}-${w}.${m[2]} ${w}w`).join(', ')}" sizes="${esc(sizes)}"` : '';
    return `<img src="${esc(src)}"${srcset} width="${p.w || ''}" height="${p.h || ''}" alt="${esc(alt(p))}" ` +
      (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">';
  };
  const u = (pg) => urlPath(lang, pg);
  const body = require('./pages.js')({ t, tx, esc, img, alt, site, u, email: EMAIL })[page];

  const title = t(`meta.${page}.title`), desc = t(`meta.${page}.description`);
  const self = BASE + urlPath(lang, page);
  const alternates = LANGS.map(l => `<link rel="alternate" hreflang="${l.code}" href="${BASE + urlPath(l.code, page)}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${BASE + urlPath('en', page)}">`).join('\n');
  const ogAlt = LANGS.filter(l => l.code !== lang).map(l => `<meta property="og:locale:alternate" content="${l.locale}">`).join('\n');
  const cur = LANGS.find(l => l.code === lang);
  const ld = page === 'home' ? `\n<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: 'Casa Nungwi', url: self, email: EMAIL,
    address: { '@type': 'PostalAddress', addressLocality: 'Nungwi', addressRegion: 'Zanzibar', addressCountry: 'TZ' }
  })}</script>` : '';
  const nav = NAV.map(([pg, key]) => `<a href="${u(pg)}"${pg === page ? ' aria-current="page"' : ''}>${esc(t(key))}</a>`).join('\n      ');
  const langItems = LANGS.map(l => `<li><a href="${urlPath(l.code, page)}" hreflang="${l.code}" lang="${l.code}" data-lang="${l.code}"${l.code === lang ? ' aria-current="true"' : ''}>${l.name}</a></li>`).join('\n        ');
  const note = lang !== 'en' && t('lang.note') ? `\n  <div class="lang-note">${esc(t('lang.note'))}</div>` : '';

  const wa = site.whatsapp;
  const waLink = wa ? `<a class="wa-float" href="https://wa.me/${esc(wa.number)}" target="_blank" rel="noopener" aria-label="${esc(t('whatsapp.label'))}">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.7 8.3c.3-.6.7-.6 1-.3l.9 1.3c.2.3.1.6-.1.9l-.5.6c.8 1.5 1.9 2.4 3.4 3.1l.7-.7c.3-.3.6-.3.9-.1l1.3.9c.3.3.3.7-.2 1.2-.7.8-1.7 1-3 .5-2.6-1-4.6-3-5.4-5.5-.2-.8-.1-1.5.5-2.1z" fill="currentColor"/></svg>
  <span>${esc(t('whatsapp.label'))}</span></a>\n` : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b6580">
<link rel="canonical" href="${self}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Casa Nungwi">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${self}">
<meta property="og:image" content="${BASE}/slike/og-image.jpg"><!-- TODO: add a 1200x630 photo as slike/og-image.jpg -->
<meta property="og:locale" content="${cur.locale}">
${ogAlt}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/slike/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">${ld}
<script src="/js/main.js" defer></script>
</head>
<body data-page="${page}">
<a class="skip" href="#main">${esc(t('skip'))}</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${u('home')}">Casa <span>Nungwi</span></a>
    <nav class="nav" id="nav" aria-label="Main">
      ${nav}
    </nav>
    <details class="lang" id="lang">
      <summary class="icon-btn" aria-label="${esc(t('lang.label'))}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>
        <span>${lang.toUpperCase()}</span>
      </summary>
      <ul class="lang-menu">
        ${langItems}
      </ul>
    </details>
    <button type="button" class="icon-btn menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="${esc(t('nav.menu'))}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>${note}
</header>
<main id="main">${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p><strong>Casa Nungwi</strong> &middot; ${esc(t('footer.tag'))}</p>
    <p><a href="mailto:${EMAIL}">${EMAIL}</a> &middot; <a href="${u('privacy')}">${esc(t('footer.privacy'))}</a></p>
    <p>${esc(t('footer.rights'))}</p>
  </div>
</footer>
${waLink}</body>
</html>
`;
}

let count = 0;
for (const l of LANGS) for (const pg of PAGES) {
  const f = outFile(l.code, pg);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, render(l.code, pg), 'utf8');
  count++;
}

const urls = PAGES.flatMap(pg => LANGS.map(l => {
  const links = LANGS.map(x => `    <xhtml:link rel="alternate" hreflang="${x.code}" href="${BASE + urlPath(x.code, pg)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE + urlPath('en', pg)}"/>`).join('\n');
  return `  <url>\n    <loc>${BASE + urlPath(l.code, pg)}</loc>\n${links}\n  </url>`;
}));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

console.log(`Built ${count} pages + sitemap.xml (${urls.length} URLs).`);

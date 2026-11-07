'use strict';
/* Page bodies. Receives helpers from build.js; returns HTML strings per page key.
   Edit the layout/structure here, texts live in lang/*.json, photos in data/site.json. */
module.exports = function bodies(c) {
  const { t, tx, esc, img, site, u } = c;

  const card = (a) => `
    <article class="card">
      ${a.photos && a.photos[0] ? img(a.photos[0], '(min-width:980px) 360px, (min-width:640px) 50vw, 100vw') : ''}
      <div class="card-body">
        <h3>${tx(`apt.${a.id}.name`)}</h3>
        <p>${tx(`apt.${a.id}.desc`)}</p>
        <p class="price">${esc(t('apt.price'))}</p>
        <a class="btn ocean" href="${u('contact')}?apt=${encodeURIComponent(a.id)}">${esc(t('apt.inquire'))}</a>
      </div>
    </article>`;

  const head = (titleKey, leadKey) => `
<section class="page-head"><div class="wrap">
  <h1>${esc(t(titleKey))}</h1>
  <p class="lead">${tx(leadKey)}</p>
</div></section>`;

  const attractions = [1, 2, 3, 4, 5].map(i => `<li>${esc(t('loc.a' + i))}</li>`).join('\n      ');
  const aptOptions = site.apartments.map(a => `<option value="${esc(a.id)}">${esc(t(`apt.${a.id}.name`))}</option>`).join('');
  const msg = (k) => esc(t(k));

  return {
    home: `
<section class="hero">
  ${img(site.hero, '100vw', true)}
  <div class="wrap">
    <h1>${esc(t('hero.title'))}</h1>
    <p>${esc(t('hero.sub'))}</p>
    <div class="btn-row">
      <a class="btn" href="${u('contact')}">${esc(t('hero.cta'))}</a>
      <a class="btn ghost" href="${u('apartments')}">${esc(t('hero.cta2'))}</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2>${esc(t('intro.title'))}</h2>
    <p class="lead">${tx('intro.text')}</p>
  </div>
</section>
<section class="section alt">
  <div class="wrap">
    <h2>${esc(t('featured.title'))}</h2>
    <div class="grid three">${site.apartments.filter(a => a.featured).map(card).join('')}</div>
    <p class="more"><a class="btn" href="${u('apartments')}">${esc(t('featured.link'))}</a></p>
  </div>
</section>`,

    apartments: `${head('apartments.title', 'apartments.lead')}
<section class="section"><div class="wrap">
  <div class="grid three">${site.apartments.map(card).join('')}</div>
</div></section>`,

    gallery: `${head('gallery.title', 'gallery.lead')}
<section class="section"><div class="wrap">
  <div class="gallery" id="gallery">
    ${site.gallery.map(p => `<button type="button" data-src="${esc('/' + p.src)}" aria-label="${esc(c.alt(p))}">${img(p, '(min-width:860px) 360px, 50vw')}</button>`).join('\n    ')}
  </div>
  <dialog id="lightbox" aria-label="${msg('gallery.title')}">
    <img src="" alt="">
    <button type="button" class="icon-btn" id="lightbox-close">${msg('gallery.close')}</button>
  </dialog>
</div></section>`,

    location: `${head('location.title', 'location.lead')}
<section class="section"><div class="wrap two-col">
  <div>
    <h2>${esc(t('location.nungwi.h'))}</h2>
    <p>${tx('location.nungwi.p')}</p>
    <h2>${esc(t('location.beaches.h'))}</h2>
    <p>${tx('location.beaches.p')}</p>
    <h2>${esc(t('location.attractions.h'))}</h2>
    <p>${tx('location.attractions.lead')}</p>
    <ul class="list">
      ${attractions}
    </ul>
  </div>
  <div>
    <h2>${esc(t('location.airport.h'))}</h2>
    <p>${tx('location.airport.p')}</p>
    <div class="map-box">${tx('location.map')}</div>
  </div>
</div></section>`,

    privacy: `${head('privacy.title', 'privacy.lead')}
<section class="section"><div class="wrap prose">
  <h2>${esc(t('privacy.controller.h'))}</h2>
  <p>${tx('privacy.controller.p')}</p>
  <h2>${esc(t('privacy.data.h'))}</h2>
  <p>${tx('privacy.data.p')}</p>
  <ul class="list">${[1, 2, 3, 4, 5].map(i => `<li>${esc(t('privacy.d' + i))}</li>`).join('')}</ul>
  <p>${tx('privacy.data.note')}</p>
  <h2>${esc(t('privacy.send.h'))}</h2>
  <p>${tx('privacy.send.p')}</p>
  <h2>${esc(t('privacy.purpose.h'))}</h2>
  <p>${tx('privacy.purpose.p')}</p>
  <h2>${esc(t('privacy.retention.h'))}</h2>
  <p>${tx('privacy.retention.p')}</p>
  <h2>${esc(t('privacy.rights.h'))}</h2>
  <p>${tx('privacy.rights.p')}</p>
  <ul class="list">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<li>${esc(t('privacy.r' + i))}</li>`).join('')}</ul>
  <p>${tx('privacy.rights.note')}</p>
  <h2>${esc(t('privacy.tech.h'))}</h2>
  <p>${tx('privacy.tech.p')}</p>
  <h2>${esc(t('privacy.contact.h'))}</h2>
  <p>${esc(t('privacy.contact.p'))} <a href="mailto:${c.email}">${c.email}</a></p>
  <p>${tx('privacy.updated')}</p>
</div></section>`,

    contact: `${head('contact.title', 'contact.lead')}
<section class="section"><div class="wrap">
  <form id="inquiry" action="https://formspree.io/f/xoeezndl" method="POST"
    data-msg-sending="${msg('form.sending')}" data-msg-success="${msg('form.success')}" data-msg-error="${msg('form.error')}"
    data-msg-todo="${msg('form.todo')}" data-msg-dates="${msg('form.dates')}">
    <input type="hidden" name="_subject" value="Casa Nungwi inquiry">
    <div class="hp" aria-hidden="true"><label>Leave this field empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
    <div class="row">
      <div><label for="name">${msg('form.name')}</label><input id="name" name="name" type="text" required autocomplete="name"></div>
      <div><label for="email">${msg('form.email')}</label><input id="email" name="email" type="email" required autocomplete="email"></div>
    </div>
    <div class="row">
      <div><label for="arrival">${msg('form.arrival')}</label><input id="arrival" name="arrival" type="date"></div>
      <div><label for="departure">${msg('form.departure')}</label><input id="departure" name="departure" type="date"></div>
    </div>
    <div class="row">
      <div><label for="guests">${msg('form.guests')}</label><input id="guests" name="guests" type="number" min="1" max="20" inputmode="numeric"></div>
      <div><label for="apartment">${msg('form.apartment')}</label><select id="apartment" name="apartment"><option value="">${msg('form.any')}</option>${aptOptions}</select></div>
    </div>
    <div><label for="message">${msg('form.message')}</label><textarea id="message" name="message"></textarea></div>
    <div id="form-status" class="status" role="status" aria-live="polite"></div>
    <div><button type="submit" class="btn">${msg('form.send')}</button></div>
  </form>
  <p class="email-line">${msg('contact.email')} <a href="mailto:${c.email}">${c.email}</a></p>
  ${site.whatsapp ? `<p class="email-line wa-line">${msg('whatsapp.contact')} <a href="https://wa.me/${esc(site.whatsapp.number)}" target="_blank" rel="noopener">${esc(site.whatsapp.display)}</a></p>` : ''}
</div></section>`
  };
};

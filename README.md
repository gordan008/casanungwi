# Casa Nungwi – spletna stran

Statična stran (HTML/CSS/JS, brez ogrodij). Vsak jezik ima **svoje statične strani**, da jih iskalniki lahko indeksirajo:

| Jezik | Naslov |
|---|---|
| English (privzeto) | `/`, `/apartments/`, `/gallery/`, `/location/`, `/contact/` |
| Deutsch | `/de/`, `/de/apartments/` … |
| Italiano | `/it/` … |
| Français | `/fr/` … |
| Русский | `/ru/` … |

## Struktura

```
index.html, apartments/, gallery/, location/, contact/   angleške strani (GENERIRANE)
de/  it/  fr/  ru/                                       prevedene strani (GENERIRANE)
scripts/build.js     generator strani (ukaz: node scripts/build.js)
scripts/pages.js     zgradba (HTML) posameznih strani
lang/*.json          vsa besedila po jezikih (en, de, it, fr, ru)
data/site.json       seznam apartmajev in fotografij
css/style.css        videz
js/main.js           meni, lightbox, obrazec, pomnjenje jezika
slike/               fotografije (zdaj začasne SVG slike)
sitemap.xml          GENERIRAN (vsebuje hreflang za vse jezike)
robots.txt  _headers
```

> **Pomembno:** datotek `index.html` v mapah in `sitemap.xml` **ne urejaj ročno** – po vsaki spremembi besedil ali fotografij zaženi
> `node scripts/build.js` (potrebuješ Node.js, https://nodejs.org) in nato objavi spremenjene datoteke. Generirane datoteke so v repozitoriju, zato gostovanje (Cloudflare/Netlify) ne potrebuje nobenega build ukaza.

## 1. Predogled na računalniku

1. `node scripts/build.js` (če si kaj spremenil)
2. V mapi `C:\casanungwi` zaženi strežnik: `python -m http.server 8080` (ali `npx serve`)
3. Odpri http://localhost:8080 (angleško) ali http://localhost:8080/de/ (nemško) itd.

Ne odpiraj datotek z dvoklikom (file://): povezave so zapisane od korena strani (`/css/style.css`) in tako ne bi delovale.

## 2. Dodajanje fotografij

1. Fotografije (JPG ali WebP) skopiraj v mapo `slike/`. Priporočilo: širina 1600 px, kakovost ~80 %, vsaka pod ~300 KB.
2. V `data/site.json` zamenjaj poti, npr. `"src": "slike/apt1-1.svg"` → `"src": "slike/apt1-1.jpg"`. Popravi tudi `w` in `h` (dejanska širina in višina v pikslih; prepreči "skakanje" strani).
3. Nove fotografije/apartmaje dodaš z novo vrstico v `gallery` oziroma `apartments`. Vsaka fotografija ima unikaten `id`.
4. Neobvezno, za hitrejše nalaganje na telefonih: pripravi več velikosti (`foto-480.jpg`, `foto-960.jpg`, `foto-1600.jpg`), v `src` navedi največjo in dodaj `"widths": [480, 960, 1600]`. Brskalnik izbere primerno velikost. Slike se nalagajo `lazy` (ob pomikanju).
5. Opis slike (alt, za dostopnost in SEO) dodaš v `lang/*.json` pod ključ `alt.<id>` (npr. `"alt.g1": "Pogled na plažo"`). Če ga ni, se uporabi splošno besedilo.
6. Za predogled na družbenih omrežjih dodaj sliko 1200×630 kot `slike/og-image.jpg`.
7. Zaženi `node scripts/build.js`.

## 3. Urejanje besedil in cen

- Vsa besedila so v `lang/en.json` (referenčna) ter `de.json`, `it.json`, `fr.json`, `ru.json`. Levo je ključ (ne spreminjaj), desno besedilo. Če v prevodu ključ manjka, se uporabi angleško besedilo (build izpiše opozorilo).
- Neznane podatke najdeš z iskanjem `TODO` – na strani so rumeno označeni. Ko besedilo popraviš, oznako `[TODO …]` izbriši.
- **Cene:** zdaj piše "Prices from January 2027 – contact us" (ključ `apt.price` v vsaki jezikovni datoteki). Ko cene določite, zamenjaj besedilo v vseh petih datotekah, npr. "From 80 € / night".
- **Imena in opisi apartmajev:** ključi `apt.apt1.name`, `apt.apt1.desc` itd. Število apartmajev: dodaj/odstrani vnose v `data/site.json` in ustrezne ključe `apt.<id>.name/desc` v vseh jezikih.
- **Preverjanje prevodov:** DE/IT/FR/RU so osnutki; pred objavo naj jih preveri materni govorec. Na straneh v teh jezikih je za obiskovalce prikazano opozorilo; ko je prevod pregledan, v tisti jezikovni datoteki ključ `lang.note` nastavi na `""` in opozorilo izgine.
- E-poštni naslov je v `scripts/build.js` (`EMAIL`).
- Spremembe strukture strani (razporeditev razdelkov) delaš v `scripts/pages.js`, glavo/nogo/SEO oznake pa v `scripts/build.js`.

## 4. Jeziki in preklopnik

- Preklopnik jezikov (ikona globusa) vodi na **isto stran v izbranem jeziku** (navadne povezave, delujejo tudi brez JS). Izbira se zapomni v `localStorage`.
- Če se vrne obiskovalec, ki je izbral drug jezik, in pride na angleško stran od zunaj, ga stran enkrat preusmeri v njegov jezik. Strani v drugih jezikih se nikoli ne preusmerjajo (da jih lahko iskalniki indeksirajo).
- Vsaka stran ima `canonical` in `hreflang` za vseh 5 jezikov in `x-default` (angleščina); enako velja za `sitemap.xml`.
- **Nov jezik:** dodaj `lang/xx.json` (kopija `en.json`) in vnos v seznam `LANGS` v `scripts/build.js`, nato zaženi build.

## 4b. Politika zasebnosti (`/privacy/`, `/de/privacy/` …)

- Besedila so v `lang/*.json` pod ključi `privacy.*`; povezava je v nogi vsake strani (`footer.privacy`).
- To je **splošna predloga, ki jo mora pregledati odvetnik**. Podatke o upravljavcu (ime, naslov, registrska številka), čas hrambe, pravno podlago, ponudnika gostovanja in pristojni nadzorni organ moraš vpisati sam – označeni so z `[TODO …]`.
- Če kasneje dodaš piškotke, analitiko ali druge storitve, posodobi razdelek `privacy.tech.*` in ostale ključe.

## 5. Obrazec za povpraševanje (Formspree)

Obrazec je že povezan z Formspree: `https://formspree.io/f/xoeezndl` (nastavljeno v `scripts/pages.js`, razdelek `contact`; po spremembi zaženi `node scripts/build.js`, da se posodobi v vseh jezikih).

1. V Formspree (račun s `casanungwi@gmail.com`) preveri, da obrazec `xoeezndl` pošilja obvestila na `casanungwi@gmail.com`.
2. Ob prvem testnem pošiljanju moraš potrditi e-pošto, ki jo pošlje Formspree.
3. Zaščita pred neželeno pošto: v obrazcu je skrito polje (honeypot `_gotcha`); Formspree take oddaje zavrže. Dodatno lahko v Formspree vklopiš reCAPTCHA.
4. Če ID v `scripts/pages.js` vsebuje `TODO`, obrazec obiskovalcu pove, naj piše neposredno na e-pošto. Povezava na e-pošto je vedno vidna.

**Test:** odpri `/contact/` (ali `/de/contact/` …), izpolni obrazec in pošlji. Pričakuj zeleno potrditev na strani, e-pošto na `casanungwi@gmail.com` in vnos v Formspree → Submissions. Formspree lahko zahteva potrditev pri prvi oddaji ali blokira oddaje z neznane domene, če so v nastavitvah omejene domene.

## 6. Objava in domena iz Porkbuna

Možnost A – **Cloudflare Pages** (priporočeno, brezplačno):
1. Mapo `C:\casanungwi` naloži na GitHub (nov repozitorij) – ali uporabi "Direct Upload" in povleci mapo.
2. https://dash.cloudflare.com → Workers & Pages → Create → Pages → poveži GitHub repozitorij. Build command: *(prazno)*, output directory: `/` (koren).
3. Po objavi dobiš naslov `ime.pages.dev`; preveri, ali stran deluje (tudi `/de/`, `/it/` …).
4. Pages projekt → Custom domains → Set up a domain → vpiši `casanungwi.com`.
5. Najlažje: v Cloudflare dodaj domeno (Add a site), nato pri **Porkbunu** (Domain Management → Authoritative Nameservers) zamenjaj nameserverje s tistima, ki ju pokaže Cloudflare. Čakanje: nekaj minut do 24 h. Cloudflare nato sam uredi DNS in SSL (https).
   - Alternativa brez prenosa DNS: v Porkbunu dodaj `CNAME` za `www` na `ime.pages.dev` (za golo domeno CNAME ni vedno mogoč, zato je prenos nameserverjev preprostejši).

Možnost B – **Netlify**: povleci mapo na https://app.netlify.com/drop, nato Domain management → Add custom domain `casanungwi.com`. Netlify prikaže DNS zapise; vnesi jih v Porkbun (DNS Records) ali zamenjaj nameserverje, kot zgoraj.

Po objavi:
- Preveri `https://casanungwi.com/sitemap.xml` in ga oddaj v Google Search Console (in Bing Webmaster Tools).
- Po želji nastavi preusmeritev `www` → `casanungwi.com`.

## Opombe

- Podatki o lokaciji (razdalja do letališča ~60 km, znamenitosti) so splošni in označeni s TODO – preveri jih.
- Dokler fotografij ni, so slike SVG nadomestki z napisom "PLACEHOLDER PHOTO".

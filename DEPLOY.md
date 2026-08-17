# Deploying Mê Kitchen to Netlify

This folder is the whole site. No build step, no dependencies to install.

## Auto-deploy is live

This repo (`github.com/NavrenNathan/mekitchen`) is connected to the Netlify
project. **Every `git push` to `master` deploys automatically** — no CLI
command needed. Anyone with push access to the repo can ship a change just
by pushing.

```
deploy/
├── index.html      the main site — served at the domain root
├── story.html      the Our story page
├── soon.html       coming-soon holding page with the countdown
├── 404.html        not-found page (Netlify picks this up automatically)
├── robots.txt      currently blocking search engines — see below
├── netlify.toml    security headers, caching, redirects
└── assets/         logos and favicons
```

The main site is `index.html` so it is served at `me-kitchen.com` with no path.
It was briefly at `/site.html`; a 301 in `netlify.toml` keeps that old path
working for any link already shared.

---

## Deploy it

**Drag and drop — easiest, no account setup, no CLI**

1. Go to https://app.netlify.com/drop
2. Drag this entire `deploy` folder onto the page
3. It goes live in a few seconds on a random URL like `sparkly-pho-a1b2c3.netlify.app`

That URL is real and shareable — good enough to send Will for review on his phone.
To keep it and get a nicer name, create a free account and claim the site.

**Or with the CLI, if you'd rather**

```bash
npx netlify-cli deploy --dir=. --prod
```

It opens a browser to authenticate. You do not need an access token in a file
for this — see the security note at the bottom.

---

## Logo — done

`assets/logo-horizontal.png` (the "Mê kitchen" wordmark with the
`pho • banh mi • rice` tagline, transparent background) is in and wired up
in the nav. There's no footer logo — removed by request; the footer keeps
its text wordmark instead.

**The logo is dark green, so it disappears over the dark hero before the nav
goes solid.** The nav forces it white with a CSS filter there — this works
cleanly since the PNG is transparent. Ask Will for a proper cream/reversed
version only if a two-colour mark ever replaces this one, since the filter
trick would flatten that.

---

## The site is currently hidden from Google — on purpose

Two things are blocking search engines:

1. `<meta name="robots" content="noindex, nofollow">` in `index.html`
2. `Disallow: /` in `robots.txt`

This is deliberate. The menu, prices, address, hours, and opening date are still
placeholders. If Google indexes those, wrong information about the restaurant
ends up in search results, and removing it afterwards is slow and unreliable.

### On launch day, remove both

- [ ] Delete the `<meta name="robots" content="noindex, nofollow">` tag from `index.html`
- [ ] Delete the `Disallow: /` line from `robots.txt`
- [ ] Redeploy

Do this only once the real content is in.

---

## Placeholders still in the site

These render literally as `{{LIKE_THIS}}` on the page, so they are obvious.

| Token | Uses | Needs |
|---|---|---|
| `{{SQUARE_ORDER_URL}}` | 24 | **The Square ordering link.** Every order button and every dish's Add button. Nothing converts until this is real. |
| `{{OPENING_MONTH}}` | 3 | Opening month — the scrolling marquee (×2) and the "Doors open" heading |
| `{{PHONE}}` | 2 | Phone — also used in the `tel:` link |
| `{{GOOGLE_MAPS_URL}}` | 2 | Maps / Business Profile link |
| ~~`{{STREET_ADDRESS}}` `{{ZIP}}`~~ | 0 | **Done** — 4213 University Wy NE, Seattle, WA 98105 |
| `{{HOURS}}` | 1 | Opening hours |
| ~~`{{EMAIL}}`~~ | 0 | **Done** — mekitchen.wa@gmail.com, wired as a `mailto:` link |
| `{{SEATS}}` | 1 | Seat count (shown as a stat) |
| `{{INSTAGRAM_URL}}` `{{TIKTOK_URL}}` | 1 each | Socials |
| `{{CAREERS_URL}}` | 1 | Hiring page, or delete the link |
| `{{STORY_*}}` (in `story.html`) | 5 | **The Our story page.** `STORY_STANDFIRST` (opening line), `STORY_INTRO` and `STORY_DETAIL` (two paragraphs), plus `STORY_FOUNDED` and `STORY_KITCHEN` for the facts list. Needs the owners' real account, not invented copy. The name meaning is already in, from the owner. |
| `{{DELIVERY_ANSWER}}` | 1 | FAQ: delivery platforms at launch |
| `{{STUDENT_DISCOUNT_ANSWER}}` | 1 | FAQ: student discount, yes or no |

Also still placeholder, but not tokenised: **the 16 menu items and their prices**,
across the four tabs. Swap these for the real menu before launch.

---

## Also outstanding

- **Photography.** Grey blocks mark each slot and are labelled with the shot needed:
  hero bowl, counter, kitchen in action, storefront/map, and the space under build-out.
  The GBP file has the same list as a shoot brief.
- **Favicon.** None yet. Once there is a square logo file, add it and link it.
- **Claims to verify with Will.** The site states a twenty-four hour broth, bread
  delivered every morning, and herbs cut to order. Those numbers came from draft
  copy, not from him. Confirm or correct them — they appear on the site and in the
  Google Business Profile description.

---

## Security note

There is a `netlify-token.txt` sitting on the Desktop in plain text. If that is a
live Netlify access token, anyone with access to that machine — or any backup or
sync of that folder — can deploy to or delete your sites.

Rotate it, and do not store the replacement in a file. Neither deploy method above
needs one: drag-and-drop needs no credentials at all, and the CLI authenticates
through the browser.

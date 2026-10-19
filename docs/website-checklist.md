# Mê Kitchen website: launch checklist

Audited 18 October 2026 against the working copy in this repo and the live
deployment at me-kitchen.com. Work through it one section at a time, in order.

**Key:** ✅ done · ⚠️ partly done · ❌ to do · 👤 needs something from the client · 🚀 do at launch only

**How the site is built:** hand-written static HTML (index, home, menu, story,
careers, 404), one inline `<style>` and `<script>` per page, no build step.
Netlify publishes the repo folder (`netlify.toml`, `publish = "."`) and
redeploys on every push to `master` on GitHub. The Netlify project sits in
the client's account (Will Phan), not ours. Forms are Netlify Forms.

**Current exposure:** me-kitchen.com is already serving. `/` is the
coming-soon holding page (noindex), and `/home`, `/menu`, `/story` and
`/careers` all return 200 to anyone who has the address. `robots.txt` blocks
all crawlers, so search engines stay out until launch. Treat every deploy as
public.

---

## 1. Blockers (fix before anyone outside the team sees the site)

| | Item | Status | What we found |
|---|---|---|---|
| 1.1 | Contact form delivers to the right inbox | 👤 | Three Netlify forms are registered live (Netlify rewrites their tags on deploy, confirmed on the live pages): `contact` (home), `careers` (with resume uploads), `notify` (holding page). Each has a field named `email`, so replying to a notification goes straight to the sender. **Fixed 18 Oct:** the `notify` form named its subject field `_subject` (another form service's convention); Netlify only reads `subject` (per its docs), so sign-ups would have arrived with a generic subject. Still needed: Will adds an email notification for "Any form" → mekitchen.wa@gmail.com in his Netlify account, then one test send per form after the next deploy. |
| 1.2 | Spam protection on the forms | ✅ | All three forms carry a honeypot field (`netlify-honeypot="bot-field"`), and Netlify's built-in spam filter applies on top. No reCAPTCHA (not needed unless spam gets through). |
| 1.3 | Business name, address, phone, email correct everywhere | ✅ 👤 | Checked every page plus the structured data: name, phone (206-656-8878, `tel:+12066568878`), email, hours (11am–9pm Mon–Sat, closed Sunday) and map location agree everywhere, and the map links point at the right address. Social links verified in a browser: Instagram, TikTok and Facebook all belong to Mê Kitchen. **Address settled 19 Oct:** Google Maps, Facebook and the site all write "4213 University Wy NE", so the site stays as it is; only Square says "Way" (see `docs/local-listings.md`). Hours still need the client's confirmation (👤). |
| 1.4 | Founding year | 👤 | Not shown anywhere on the site. Only add it if the client gives us the real year. |
| 1.5 | "Opening this fall" still accurate | ✅ 👤 | **Confirmed 19 Oct:** not open yet, no date set, "sometime this fall", so the site's "Opening this fall" wording stays. Square is already set up to take orders ("Next available Monday 11:00 am"), so check it can't accept orders before opening day. When a date is set, update these lines: holding page title "Opening soon", its search description, the flyer alt text and "Coming this fall" heading, "We will post how to claim it before opening day", "Be first through the door"; Our Story's "Opening this fall" badge and "as we get ready to open". |
| 1.6 | Legally required info | ✅ | Restaurants don't carry a license number in advertising the way contractors do; food-establishment permits are displayed on the premises. Nothing found that the site is required to show. Client to confirm if they know otherwise. |
| 1.7 | No placeholder text or missing photos on public pages | ✅ | Scanned every page: no lorem ipsum, TODO or `{{…}}` tokens, no placeholder photo boxes, and every image, video and icon file the pages reference exists in `assets/` (checked by script, including files the menu script loads). Content gaps to confirm with the client are listed in 9.4. |
| 1.8 | Rights to the photos used | 👤 | The aerial U District photo came in as `Nov-2-2024-2-scaled.jpg`, a WordPress-style filename that suggests it was downloaded from a website. Client to confirm they own it or have permission. |

## 2. Legal and policies

| | Item | Status | What we found |
|---|---|---|---|
| 2.1 | Privacy policy, linked in the footer, matching what the site collects | ⚠️ 👤 | Not legally required in Washington (no comprehensive state privacy law yet; HB 1671 still in committee), but California's CalOPPA reaches any site collecting personal info from California residents, and the careers form collects résumés. **Done 18 Oct (localhost):** `privacy.html` covers the three forms and their exact fields, Netlify hosting and form storage, the email provider, Square, outbound social and map links, no cookies or tracking, Do Not Track (a CalOPPA requirement), retention, how to request access or deletion, children, and changes. Linked from the footer of every page, including the holding page and the 404, and added to the sitemap. Waiting on the client to review it (especially the retention promises) and to confirm the legal business name and privacy contact (👤). | **Updated 19 Oct:** the Google Fonts line was removed once fonts became self-hosted. **Updated 19 Oct for GA4:** what it records, its cookies, the opt-out, Do Not Track handling and analytics retention. Deploy the policy and the GA ID together so the policy is never ahead of or behind the site. |
| 2.2 | Cookie banner only if needed | ✅ | **Updated 19 Oct:** with GA4, the site will set Google Analytics cookies. A consent banner isn't required for a Washington restaurant serving local customers: the US has no general cookie-consent law, Washington has no comprehensive privacy law yet, and GA4 runs with advertising features off. The privacy policy discloses the cookies and links to Google's opt-out. Revisit if the business ever targets EU/UK visitors or grows past CCPA's thresholds. Other storage: two per-visit `sessionStorage` flags. |
| 2.3 | Email signup handled CAN-SPAM-compliantly | ⚠️ | **Site side done 18 Oct:** the holding page's sign-up now says under the form "We will only email you news about Mê Kitchen, and you can unsubscribe any time" with a link to the privacy policy. **Sending side (👤):** whoever emails that list must include the business's physical address and a working unsubscribe link, honour opt-outs within 10 business days, and use honest subject lines. The footer loyalty sign-up goes to Square, which handles its own compliance. |
| 2.4 | Accessibility (ADA) | ➡️ | Covered by section 8. |
| 2.5 | Copyright and legal business name in the footer | 👤 | Footer reads "© 2026 Mê Kitchen. All rights reserved." (year set automatically), now with a "Privacy policy" link beside it. If the business is registered under a different legal name (an LLC, for example), it should appear here and on the privacy page. |

## 3. Security

| | Item | Status | What we found |
|---|---|---|---|
| 3.1 | HTTPS everywhere | ✅ | `http://` and `http://www` both 301 to `https://me-kitchen.com/`; `https://www` 301s to the bare domain. |
| 3.2 | HSTS | ✅ 🚀 | Already sent by Netlify: `strict-transport-security: max-age=31536000`. At launch, consider adding `includeSubDomains` once we know no subdomain needs plain HTTP. |
| 3.3 | Security headers | ✅ | X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy (now also turning off payment and USB). **Content-Security-Policy tightened 18–19 Oct:** every resource from this site only (fonts self-hosted), fetches and form posts to this origin, no plugins, no framing by other sites, stray http upgraded, and since the script move **no inline scripts except the home page's one-line head script, allowed by its SHA-256 hash**. Styles still allow inline (pages use `<style>` and `style=""`). Verified by serving the exact headers locally and loading every page with interactions: zero violations, while a deliberately bad test page was blocked. Check the live headers after deploy. |
| 3.4 | No secrets in the code or repo | ⚠️ | No API keys or tokens in tracked files or git history. **Fixed 19 Oct (localhost):** the holding page's preview password is now stored only as a SHA-256 hash, checked in the browser, so it no longer appears in the page source (tested: the right password unlocks, a wrong one is refused). Remaining: older commits still contain the plain password, so if it's used anywhere else (an email or Netlify login, for example), change it there; and the gate itself goes at launch (🚀). Separately, `~/Desktop/From windows/netlify-token.txt` (dated 26 Aug, outside the repo) should be revoked in Netlify if it's a live token, then deleted (👤). |
| 3.5 | Third-party scripts kept to a minimum | ✅ | One: Google Analytics 4 (`gtag.js`), loaded after the page by `assets/js/analytics.js`, only on me-kitchen.com. Everything else is self-hosted; Square is linked, not embedded. |

## 4. Technical SEO

| | Item | Status | What we found |
|---|---|---|---|
| 4.1 | Unique title (~60 chars, leading with search terms) on every page | ✅ | **Updated 19 Oct (localhost):** Careers is now "Restaurant Jobs in Seattle's U District \| Mê Kitchen" (52). Home 58 · Menu 47 · Our Story 54 · Privacy 27 · Careers 52. No duplicates (crawl). Holding page and 404 are noindex. |
| 4.2 | Meta description (~155 chars) on every page | ✅ | **Updated 19 Oct (localhost):** Menu trimmed to 142, Our Story rewritten to 137, Careers rewritten to 147. Home 143 · Privacy 119. No duplicates (crawl). |
| 4.3 | One clear H1 per page | ✅ | Exactly one H1 on every page. |
| 4.4 | Canonical tags | ✅ | Self-referencing canonicals on home, menu, story and careers. `/home.html` also answers 200, and the canonical covers it. |
| 4.5 | XML sitemap | ✅ | `sitemap.xml` lists the 5 indexable pages (home, menu, story, careers, privacy), generated by `scripts/generate-sitemap.mjs`. |
| 4.6 | robots.txt | ✅ 🚀 | Pre-launch `Disallow: /` is in place (intentional) with the sitemap declared. The real version comes at launch. |
| 4.7 | Structured data | ✅ | `Restaurant` (address, geo, hours, phone, and now email) on home, menu and story; full `Menu` with prices on the menu page, matching Square. **Added 19 Oct:** `BreadcrumbList` (Home › page) on menu, story, careers and privacy. Schema.org's validator reports 0 errors and 0 warnings on all five pages. No FAQ content, so no FAQ markup. Run Google's Rich Results Test on the live URLs after the next deploy. 🚀 If the main site moves from `/home` to `/` at launch, update the breadcrumb "Home" URL and the `Restaurant` `url`. |
| 4.8 | Open Graph / share image | ✅ | **Added 19 Oct:** share tags (Open Graph and Twitter) on careers and privacy, so every indexable page now has them, each matching its own title and description, with the 1200×630 share image. |
| 4.9 | Favicon and home-screen icon | ✅ | 16, 32 and 192 px favicons plus apple-touch-icon on every page. No web app manifest (optional). |
| 4.10 | Custom 404 page | ✅ | `404.html` is styled, noindex, and returns a real 404 status. |
| 4.11 | Alt text on every image | ✅ | Every `<img>` on every page has alt text (decorative ones are `alt=""`). |
| 4.12 | llms.txt | ✅ | **Added 19 Oct:** `llms.txt` at the site root (format from llmstxt.org): a one-paragraph summary, hours, phone, email, ordering and Instagram links, the meaning of Mê, and a link list of the five pages, using only facts already on the site. Optional and informal, not a standard. |
| 4.13 | http → https redirect | ✅ | See 3.1. |
| 4.14 | 301s from the old site's URLs | 👤 | No earlier site at me-kitchen.com is known; one legacy redirect exists (`/site.html` → `/home`). **Found 19 Oct:** the previous restaurant at this address, Mama's Viet Kitchen, still has a live website (mamasvietkitchen.com). If it belongs to the same owners, redirect it to me-kitchen.com permanently. |
| 4.15 | Google Search Console + sitemap submitted | 👤 🚀 | Needs verification by the client's Google account. Submit the sitemap at launch. |
| 4.16 | Audit crawl, errors fixed | ✅ | **Run 19 Oct (local):** crawled from `/` and `/home`, following every internal link and asset: 28 URLs, all 200; 6 pages audited with no duplicate titles or descriptions, no missing title, description, H1 or canonical, every canonical and sitemap URL resolves, every image has alt text. `check-links.mjs` and `check-seo.mjs` both pass (with the untracked mockups set aside). Run a Semrush Site Audit on the live site after the next deploy; robots.txt already lets its bot in. |

## 5. Local search

| | Item | Status | What we found |
|---|---|---|---|
| 5.1 | Google Business Profile complete, right primary category | ✅ | Listing exists with the right name, "Vietnamese restaurant" category, address, phone, website and a sign photo. **19 Oct:** the client team made the changes from `docs/local-listings.md` (hours, description, links, attributes, photos). Google hadn't published them yet the same day; re-check in a few days. The status should stay **"Temporarily closed"** until opening; once there's a date within 90 days, set it as the opening date so the listing shows "Opening soon". |
| 5.2 | Name, address and phone identical everywhere | ✅ | Site, Google Maps, Facebook and Instagram/TikTok all agree. Square writes "University Way NE"; change it to "Wy" if Square allows. |
| 5.3 | Reviews strategy | ⚠️ 👤 | Drafted in `docs/local-listings.md`, within the FTC's 2024 reviews rule and Google's policies: ask every customer the same way (QR code at the counter, on receipts or bags), reply to every review, and no incentives, staff reviews, gating or suppression. The Instagram free-drink offer is fine as long as it never depends on a review. Client to adopt it. |
| 5.4 | Directory listings (citations) | ⚠️ 👤 | Listed in `docs/local-listings.md`. To claim: Apple Maps (Apple Business Connect), Bing Places, and Yelp (no Mê Kitchen listing found; Yelp still shows the previous restaurant, Mama's Viet Kitchen, as closed at this address). |

## 6. Speed (Core Web Vitals: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1)

| | Item | Status | What we found |
|---|---|---|---|
| 6.1 | Every page type measured on a throttled phone, before and after | ⚠️ | **Measured 19 Oct** with Lighthouse 12 (mobile, simulated slow 4G and a 4× slower CPU), served locally with gzip like Netlify; results logged in `reports/lighthouse-history.jsonl`. LCP before → after: holding 2.85 → **2.10 s** · home 2.56 → 2.63 s · menu 5.70 → 2.78 s · story 5.70 → 2.78 s · careers 0.75 → 1.35 s · privacy 0.75 → 1.35 s · 404 1.58 → 1.35 s. CLS 0.000 and TBT 0 ms on every page (no long tasks, so INP should be good; real INP comes from field data after launch). Page weight: home 3,080 → 942 KB, menu 1,829 → 533 KB, story 1,343 → 436 KB, holding 405 → 212 KB. Home, menu and story still sit 0.1–0.3 s over 2.5 s in this lab simulation, which splits a 1.6 Mbps link across every early request; their LCP images now take ~0.1 s of their own load time. The text pages rose because Lighthouse now counts the site's own font files, which Google Fonts' late loading used to hide; text still paints straight away in the fallback font. Re-measure on the live site after deploy. |
| 6.2 | Photos compressed, right-sized, WebP, width/height set | ✅ | **Done 19 Oct:** every content photo now has WebP copies at the sizes it's shown (e.g. g-spread 429 KB → 45 KB at 480 px / 139 KB at 960 px; our-story 524 KB → 82–180 KB), served with `<picture>`/`srcset`/`sizes` and the original JPEG as fallback. The menu tiles (built by script) use them too, and CSS backgrounds use `image-set()` with a JPEG fallback. Same photos throughout; nothing swapped. Width/height set on every `<img>`. |
| 6.3 | Lazy-load below the fold, priority above it | ✅ | Below-the-fold photos are `loading="lazy"`. **Fixed 19 Oct:** the menu tiles were lazy-loaded although they're the first thing on the page (LCP load delay 3.3 s); they now load at once, the first tile's photo is preloaded, and the Our Story sign photo is `fetchpriority="high"`. The home hero video's files now load only after the page has, and never for reduced-motion visitors (who see the poster, now preloaded as WebP). |
| 6.4 | Efficient fonts | ✅ | **Done 19 Oct:** Space Grotesk and Geist are self-hosted in `/fonts/` (six variable-font files, 99 KB total: Latin, Latin Extended, Vietnamese), declared inline on every page with `font-display:swap`, the two Latin files preloaded, cached for a year, OFL licences kept alongside. No requests to Google any more (also a privacy win; the privacy policy and CSP were updated to match). A size-matched fallback font wasn't added because measured CLS is already 0.000 on every page. |
| 6.5 | Long-term caching with versioned file names | ⚠️ | HTML revalidates every time (right). Fonts now cache for a year (`/fonts/*`, kept outside `/assets/` so only one rule matches). Photos still cache for a week because their names aren't versioned; content-hashed names would allow a year. |

## 7. Code health

| | Item | Status | What we found |
|---|---|---|---|
| 7.1 | Shared CSS/JS in cached files | ⚠️ | **Scripts done 19 Oct:** every page script now lives in `assets/js/`, moved unchanged, with the code that was copied across pages merged: `footer.js` (Directions and Email popups, copy email, year) on all five main pages, `site.js` (menu button, scroll reveal) on menu/story/careers/privacy, plus one file per page (`home.js`, `menu.js`, `story.js`, `careers.js`, `holding.js`). Loaded at the same spot as before, so timing is unchanged, with `?v=` content fingerprints (`scripts/stamp-assets.mjs`) so caches never go stale. Verified by clicking through every page under the strict CSP: menu buttons, both popups, the year, the menu sheet, Our Story's switch and Mê stepper, the hero video and the gate all work, with zero script errors. **Styles kept inline, deliberately:** a shared stylesheet would be render-blocking and add a round trip on every first visit, undoing part of section 6. Revisit if the site grows past a handful of pages. |
| 7.2 | Unused CSS/JS removed | ✅ | **Done 19 Oct:** a scan for style rules whose classes appear nowhere in a page's HTML or scripts found leftovers from replaced layouts (the old careers grid, photo placeholders, the Our Story pronunciation block, an unused footer button style). 49 rules removed or trimmed across menu, story, careers and privacy. Full-page screenshots at 375, 768 and 1440 px before and after: 0 pixels changed on all 12. |
| 7.3 | Valid HTML (W3C validator, every page) | ✅ | **Run 19 Oct on all seven pages; fixed:** the hero video's `<source>` tags without `src` (sources now built by script from `data-` attributes), the 404 page's `aria-label` on a paragraph (now `role="img"`) and `pathLength` on a circle (redrawn as an identical path; pixel check confirmed), and the home gallery section with no heading (screen-reader-only "Photos"). **Remaining flags are known false alarms:** `netlify-honeypot` (Netlify's documented attribute, stripped from the page at deploy) and modern CSS the validator doesn't know yet (`animation-timeline`, `view-timeline`, `animation-range`, `image-set(… type())`). |
| 7.4 | No browser console errors | ✅ | Checked 19 Oct on every page, with the menu sheet, popups, Our Story interactions and the gate exercised: no script errors, no blocked resources. |
| 7.5 | Drafts and private files never shipped | ✅ | Mockups (`story-mock-*.html`, `_snapshots/`) are untracked, so they never deploy (confirmed 404 live). `DEPLOY.md`, `scripts/`, `reports/` and now `docs/` are blocked from public download in `netlify.toml`. |
| 7.6 | Preview password removed at launch | 🚀 | The holding page's staff gate (see 3.4). |
| 7.7 | Deploy notes accurate | ✅ | **Rewritten 19 Oct:** file list, the noindex facts (only the holding page and 404), content status (no placeholders, menu matches Square), a new section on editing scripts/fonts/photos, and the deploy instructions (push to GitHub; never Netlify Drop, which would publish a separate copy). |

## 8. Accessibility (WCAG 2.2 AA)

| | Item | Status | What we found |
|---|---|---|---|
| 8.1 | Automated scan (axe / Lighthouse), every page, desktop and phone, plus open menus and pop-ups | ✅ | **Run 19 Oct** with axe-core 4.14 (WCAG 2.0/2.1/2.2 A and AA rules): 47 scans covering all seven pages at 375 and 1280 px, plus the mobile menu, both footer popups, the menu's dish sheet and dish detail, Our Story's switched states and the holding page's gate. **0 violations**, before and after this section's changes. |
| 8.2 | Text contrast ≥ 4.5:1, including over images and video | ✅ | axe couldn't judge 106 spots (text over photos, the hero video, gradients and decorative layers), so they were **measured**: each element photographed with and without its text, and the text colour compared against the exact pixels behind every letter. **All 189 measurements pass** (worst 5% of letter pixels), including the home hero over six frames of the video. Lowest results: the menu intro over the dragon-bridge background 6.1:1, the home hero lede on a phone 6.9:1, the hero headline 5.8:1 (needs 3:1). |
| 8.3 | Keyboard: everything works, visible focus, skip link | ✅ | **Added 19 Oct:** a "Skip to content" link on every page (first Tab stop, shown on focus, jumps to the main content; the holding page got a main landmark for it). **Fixed:** home's focus ring was dark green and vanished on the dark footer, hero and drawer, so it's now cream there; the menu's dish sheet now moves focus to its title when it opens, keeps Tab inside, and focus follows when you move between list and dish; the home page's floating order bar could cover focused links and the Send button, so the page now scrolls focus clear of it (`scroll-padding-bottom`, extra space under the footer). **Verified** by tabbing through all seven pages: every stop shows a visible change (pixel-compared with and without focus), nothing is hidden under the header or the bar, and both popups and the sheet take focus, trap Tab, close on Escape and return focus. |
| 8.4 | Tap targets ≥ 24×24 px | ✅ | Measured every control on every page at 375 and 1280 px, with the menu, popups and sheet open. Controls under 24 px (header links, small footer links) all meet WCAG 2.2's spacing exception: no neighbour within a 24 px circle. Links inside sentences are exempt. |
| 8.5 | Labelled form fields, clear errors | ✅ | Every field has a visible label (axe: no label violations) and `autocomplete` where it applies (name, email, phone). Errors use the browser's built-in messages, which name the field and the problem; the careers upload boxes add their own ("That file is over 4 MB…") through the same mechanism, and failed sends show a message with an email fallback. |
| 8.6 | Reduced-motion support | ✅ | With reduced motion on, no animation is left running on any page (checked while scrolling each one), the intro is skipped, and the hero video is never even downloaded; the poster shows instead. |
| 8.7 | Reflow at 320 px, no sideways scrolling | ✅ | No sideways scrolling on any page at 320, 375 or 1440 px, including with the menu, popups and sheet open (59 checks). |
| 8.8 | Headings in order | ✅ | One H1 per page and no skipped levels. **Fixed 19 Oct:** the menu tiles used `h3` straight after the H1; they're now `h2` with the same styling (pixel-identical). Home's gallery got a screen-reader-only "Photos" heading (section 7). |

## 9. Quality checks

| | Item | Status | What we found |
|---|---|---|---|
| 9.1 | Crawl for broken links and missing files | ✅ | **19 Oct:** local crawl of every internal link and file (53 URLs, all 200), `check-links.mjs` passes, and all 9 outside destinations resolve: the Square ordering site, the Square rewards sign-up (confirmed as Mê Kitchen's own program), Google Maps, Apple Maps, Instagram and TikTok (200), and Facebook (checked in a browser, as it blocks scripted requests). |
| 9.2 | Every phone link and order button works | ✅ | **19 Oct:** every phone link is `tel:+12066568878` (home contact, the floating bar's Call button, Our Story, privacy); every email link is `mailto:mekitchen.wa@gmail.com`; every Order / Order online button and the menu sheets go to https://me-kitchen.square.site/; every loyalty button goes to the Square rewards page; both map links open the right address. One inconsistency, left for you to decide: the header and hero Order buttons open Square in the same tab, while the footer and menu-sheet ones open a new tab. |
| 9.3 | No sideways scrolling at 375 px and 1440 px | ✅ | Checked 19 Oct on every page and open state (see 8.7). |
| 9.4 | Full copy proofread | ✅ | **19 Oct:** every page read in full, plus alt text, titles, descriptions and script messages. No typos or em dashes. **Fixed:** British spellings on an American site (chilli → chili, coriander → cilantro, spring onion → green onion, queue → line, standing about → standing around, one-off → one-time, "have got" → "'ve got"), "U-District" → "U District", "Located in U District" → "in the U District", "Pick it on your phone" → "Order on your phone", the menu footer's "Pay on your phone" → "Order", "Veg options" → "Veggie options" (matching "Veggie Phở"), and one stray Oxford comma. **For you to decide:** the home opening animation reads "Phở · Bánh mì · Rice" (not "Rice bowls"); the home contact intro opens "However your visit went", which reads oddly before opening day; and earlier open questions (Egg Bánh Mì fillings, "twenty-minute lunch", vegetarian labels). |
| 9.5 | Real devices: iPhone Safari, Android Chrome, desktop browsers | 👤 | Yours. On each device: (1) open /home, /menu, /story, /careers, /privacy and the holding page; (2) tap the menu button, a menu tile, a dish, and close the sheet; (3) tap Directions and pick each map app; (4) tap Email us and Copy email, then paste it somewhere; (5) tap a phone link (it should offer to call); (6) tap Order online and Join the loyalty list; (7) on Our Story, tap Then/Now and step through Mê; (8) rotate the phone once on each page; (9) on one phone, turn on VoiceOver or TalkBack and swipe through the home page. After deploy, also send one test through each form. |

## 10. Measurement and monitoring

| | Item | Status | What we found |
|---|---|---|---|
| 10.1 | Analytics chosen and disclosed in the privacy policy | ✅ | **Chosen: Google Analytics 4** (the team's standard). **Built 19 Oct** as `assets/js/analytics.js` on all seven pages, because the strict CSP would block Google's usual pasted snippet (or Netlify snippet injection): loads Google's tag only after the page has loaded, runs only on me-kitchen.com (local previews and tests never count), Google signals and ad personalisation off. CSP allows exactly Google's documented GA4 hosts *without* Ads features. **Measurement ID G-1602TH6QRB set 19 Oct** (one Google tag per page; Google's pasted snippet is deliberately not used, since the CSP would block it and it would double-count). Privacy policy updated to disclose it. Verified with a test ID: Google's tag loads with no CSP errors. Confirm real data arriving in GA4 → Realtime after deploy. |
| 10.2 | Track the actions that matter | ✅ | Events built in and tested: `click_order_online`, `click_phone`, `click_email`, `copy_email`, `click_directions` (map: google/apple), `click_loyalty`, `click_social` (network), `form_sent` (form: contact/careers/opening_news; fired only on a successful send). In GA4, mark `click_order_online`, `click_phone` and `form_sent` as Key events. |
| 10.3 | Uptime monitoring | 👤 | Needs an account in the client's or agency's name. Suggested: a free UptimeRobot (or Better Stack) monitor on https://me-kitchen.com/home every 5 minutes, with a keyword check for "Mê Kitchen" so a broken deploy also alerts, emailing mekitchen.wa@gmail.com and the agency. |
| 10.4 | Search Console alerts | 👤 🚀 | Comes with 4.15. |

## 11. Launch day

Skipped for now, at your request.

---

## Still waiting on the client

1. Netlify form email notifications set up in Will's account (Forms → Form notifications → Email → Any form → mekitchen.wa@gmail.com), then a test send of each form (1.1).
2. ~~Google Business Profile updates~~ done 19 Oct; waiting for Google to publish them (5.1). Optionally change Square's pickup address to "University Wy NE" to match (5.2).
3. Confirmed opening hours (1.3).
4. Is the restaurant open yet? If so, "Opening this fall" comes off the site (1.5).
5. Founding year, only if they want it shown (1.4).
6. Permission for the aerial U District photo (1.8).
7. Review the new privacy policy (`privacy.html`), especially how long form submissions are kept, and confirm the legal business name and the privacy contact (2.1, 2.5).
8. Who will email the holding-page sign-up list, and with what tool. Those emails need the physical address and an unsubscribe link (2.3).
9. Any old URLs or listings pointing at me-kitchen.com (4.14).
10. Google account access for Search Console and Google Business Profile (4.15, 5.1).
11. Claim Apple Maps, Bing Places and Yelp listings; say whether Mê Kitchen shares owners with Mama's Viet Kitchen and who controls mamasvietkitchen.com (4.14, 5.4); confirm which profile attributes are true (dine-in, seating, accessibility, payment).
12. Vegetarian items to confirm (labels were removed because Square doesn't mark any), the Egg Bánh Mì's fillings, and whether "twenty-minute lunch" is accurate (9.4).
13. Whether `netlify-token.txt` on the Desktop is a live token; if so, revoke it (3.4).
14. **Google Analytics:** ~~measurement ID~~ received (G-1602TH6QRB). In GA4 Admin: set data retention to 14 months, leave Google signals off, mark `click_order_online`, `click_phone` and `form_sent` as Key events, and link Search Console once it's verified (10.1, 10.2, 10.4).
15. An uptime monitor account (UptimeRobot or similar) and who should get the alerts (10.3).

---

## Sources

**Google Search Central**
- Title links: https://developers.google.com/search/docs/appearance/title-link
- Meta descriptions and snippets: https://developers.google.com/search/docs/appearance/snippet
- Canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Local business structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Image SEO and alt text: https://developers.google.com/search/docs/appearance/google-images
- Favicons in search: https://developers.google.com/search/docs/appearance/favicon-in-search
- Redirects and site moves: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Search Console: https://search.google.com/search-console/about
- Google Business Profile guidelines: https://support.google.com/business/answer/3038177

**web.dev**
- Core Web Vitals: https://web.dev/articles/vitals
- Learn Images: https://web.dev/learn/images
- Lazy loading images: https://web.dev/articles/browser-level-image-lazy-loading
- Font best practices: https://web.dev/articles/font-best-practices
- HTTP caching: https://web.dev/articles/http-cache

**W3C**
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Markup Validation Service: https://validator.w3.org/

**U.S. Department of Justice**
- ADA guidance on web accessibility: https://www.ada.gov/resources/web-guidance/

**OWASP**
- Secure Headers Project: https://owasp.org/www-project-secure-headers/
- HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- Third-Party JavaScript Management: https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Javascript_Management_Cheat_Sheet.html

**FTC**
- CAN-SPAM Act compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- Privacy and security guidance for business: https://www.ftc.gov/business-guidance/privacy-security
- Rule on consumer reviews and testimonials: https://www.ftc.gov/legal-library/browse/rules/use-consumer-reviews-testimonials

**Other**
- Netlify Forms spam filters: https://docs.netlify.com/forms/spam-filters/
- Netlify Forms notifications: https://docs.netlify.com/forms/notifications/
- llms.txt proposal: https://llmstxt.org/

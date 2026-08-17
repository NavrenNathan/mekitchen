# Logo assets — drop files here

`logo-horizontal.png` is the wide lockup — "Mê kitchen" wordmark with the
`pho • banh mi • rice` tagline — used in the nav bar in `index.html`. It's a
processed version of Will's original file: background flattened to
transparent (the original was a flat off-white PNG, no alpha), auto-cropped
to the visible mark, and recompressed (~93KB vs ~1MB original). Transparency
matters here — the nav flips the mark to white while it sits over the dark
hero (`.nav.on-dark:not(.solid) .brand img{filter:brightness(0) invert(1)}`),
and that only reads correctly against a transparent background.

There is no footer logo — it was tried (a stacked "Mê" / "kitchen" mark) and
removed by request; the footer now just has the text wordmark ("Me") in its
first column.

SVG would be better if Will has it — sharper at every size and a much
smaller file. If you switch to SVG, update the `src` attribute in
`index.html`.

## The reversed-logo problem

The supplied mark is dark green (`#2d4a2d`). That reads correctly on cream,
but disappears on the dark hero the nav sits over before scrolling. As a
stand-in, the nav applies:

```css
.nav.on-dark:not(.solid) .brand img{filter:brightness(0) invert(1)}
```

This works cleanly since the logo is a single flat colour on a transparent
background — brightness(0)+invert(1) turns it into a clean white silhouette.
If a future two-colour version of the mark is ever used, this trick would
flatten it to solid white; ask Will for a proper reversed/cream version at
that point instead.

## Colour reference

Sampled from the logo and used across all three mockups:

| Token | Value | Role |
|---|---|---|
| Logo green | `#2d4a2d` | The mark itself, `--brand` |
| Deep green | `#22391f` | Body text on cream; background of dark sections in 03 |
| Deepest green | `#182b1a` | Full-page ground in 01 |
| Cream | `#faf7ef` | Page ground, and text on green |
| Cream wash | `#f1ece0` | Photo placeholder fills, subtle bands |
| Line on cream | `#dfd8c8` | Hairline borders |
| Line on green | `#33502f` | Hairline borders in dark sections |
| Sage | `#93a68d` | Muted secondary text on green |

## logo-mark.png — the mark in use

`logo-nav.png` cropped to the wordmark alone, with the `pho • banh mi • rice`
tagline removed. Cropped above the tagline, trimmed to the artwork
exactly, then padded 10px evenly on all four sides so the wordmark is centred
in its own box. 908x200, aspect 4.54:1.

Even padding matters here: an earlier version had 8px above the wordmark and
14px below, which looked fine in the nav but read as visibly lopsided on the
intro curtain, where the mark is centred between two lines of text.

Used for the nav and footer on both pages and on the holding page. The
intro curtain uses the stacked `logo-main.png` instead. Dark green on transparent, so it keeps the
`brightness(0) invert(1)` filter over dark grounds.

Because the tagline is gone, the wordmark reads larger at a given height than
`logo-nav.png` did, so the display heights came down to match: nav 44px,
footer 50px.

## Files not in use

- `logo-nav.png` — the original wide lockup, wordmark plus tagline. Kept as
  the source `logo-mark.png` is cropped from.
- `LOGO MAIN.png` — the supplied stacked lockup, 1254x1254 and roughly
  four-fifths transparent padding. Source for `logo-main.png`.

## logo-main.png — intro curtain only

`LOGO MAIN.png` trimmed to its bounding box, 635x472, aspect 1.35:1. The
stacked "Mê / kitchen" form. Used on the intro curtain, where there is
vertical room for it and it makes a stronger centrepiece than the wide mark.

Not used in the nav: at 1.35:1 it can only be about 56px tall in the 72px bar,
which shrinks "kitchen" to roughly 8px. The wide `logo-mark.png` is used there
instead.

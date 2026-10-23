/* Mê Kitchen: Google Analytics 4, plus the events that matter for a
   restaurant site. Loaded on every page.

   - Does nothing until GA_ID below is the real measurement ID (G-…), and
     nothing anywhere except me-kitchen.com, so local previews and tests
     never reach the client's reports.
   - Google's tag is fetched only after the page has finished loading, so it
     never competes with the page itself.
   - Google signals and ad personalisation are off: GA measures how the site
     is used, nothing is tied to ad profiles. (This is also why the
     Content-Security-Policy in netlify.toml only allows Google's
     non-advertising GA hosts.)

   Events sent (mark the ones you care about as Key events in GA4 > Admin):
     click_order_online  any link to the Square ordering site
     click_phone         any tel: link
     click_email         any mailto: link
     copy_email          the Copy email button in the footer popup
     click_directions    a map app in the Directions popup  (map: google|apple)
     click_loyalty       any Join the loyalty list button
     click_social        Instagram / TikTok / Facebook       (network: …)
     form_sent           a form went through  (form: contact|careers) */
(function(){
  'use strict';

  var GA_ID = 'G-1602TH6QRB';   // GA4 measurement ID (Admin > Data streams)

  if(!/^G-[A-Z0-9]{4,}$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return;
  if(!/(^|\.)me-kitchen\.com$/.test(location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });

  function load(){
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }
  if(document.readyState === 'complete') load();
  else window.addEventListener('load', load);

  function send(name, params){ gtag('event', name, params || {}); }
  function label(el){ return (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g,' ').slice(0,60); }

  /* one listener for every click on the page (capture phase, so it still
     fires when another handler stops the event) */
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('a[href],button') : null;
    if(!el) return;
    if(el.hasAttribute('data-copy-email')){ send('copy_email'); return; }
    var href = el.getAttribute('href') || '';
    var where = { link_text: label(el) };
    if(/^tel:/i.test(href)) send('click_phone', where);
    else if(/^mailto:/i.test(href)) send('click_email', where);
    else if(/me-kitchen\.square\.site/i.test(href)) send('click_order_online', where);
    else if(/squareup\.com\/customer-programs/i.test(href)) send('click_loyalty', where);
    else if(/google\.[a-z.]+\/maps/i.test(href)) send('click_directions', { map: 'google' });
    else if(/maps\.apple\.com/i.test(href)) send('click_directions', { map: 'apple' });
    else {
      var net = (href.match(/instagram|tiktok|facebook/i) || [])[0];
      if(net) send('click_social', { network: net.toLowerCase() });
    }
  }, true);

  /* the form scripts announce a successful send (see home.js, careers.js) */
  document.addEventListener('mk:form-sent', function(e){
    send('form_sent', { form: (e.detail && e.detail.form) || 'unknown' });
  });
})();

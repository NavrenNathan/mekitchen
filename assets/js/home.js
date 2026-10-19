(function(){
  'use strict';

  /* intro curtain — first visit of the session only. Skipped entirely for
     reduced-motion, and never shown if JS is off since .on is added here. */
  (function(){
    var intro = document.getElementById('intro');
    if(!intro) return;

    var seen = false;
    try { seen = !!sessionStorage.getItem('mk_intro'); } catch(e){}
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(seen || reduce) return;
    try { sessionStorage.setItem('mk_intro','1'); } catch(e){}

    var logo = intro.querySelector('.intro-logo');
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    intro.classList.add('on');

    /* Part exactly far enough to clear the logo, then, if the parted line
       would be wider than the screen, scale the whole row down to fit. That
       keeps it on one line on a phone instead of colliding or wrapping. */
    var row = intro.querySelector('.intro-row'),
        lTxt = intro.querySelector('.intro-txt.l'),
        rTxt = intro.querySelector('.intro-txt.r');

    function measure(){
      row.style.transform = '';                      /* measure unscaled */
      var g = logo.getBoundingClientRect();
      if(!g.width) return;
      var gap = Math.max(18, g.width * 0.34);   /* breathing room either side */
      var sep = g.width / 2 + gap;
      intro.style.setProperty('--sep', sep + 'px');

      var needed = 2 * sep + lTxt.getBoundingClientRect().width
                           + rTxt.getBoundingClientRect().width;
      var avail  = window.innerWidth - 24;           /* small safety margin */
      var k = Math.min(1, avail / needed);
      if(k < 1) row.style.transform = 'scale(' + k.toFixed(4) + ')';
    }
    if(logo.complete) measure(); else logo.addEventListener('load', measure);
    window.addEventListener('resize', measure);

    requestAnimationFrame(function(){ intro.classList.add('in'); });
    setTimeout(function(){ measure(); intro.classList.add('go'); }, 700);
    setTimeout(function(){ intro.classList.add('out'); }, 2500);
    setTimeout(function(){
      intro.classList.remove('on');
      document.body.style.overflow = prevOverflow;
    }, 3150);
  })();
  var nav=document.getElementById('nav'),burger=document.getElementById('burger'),bar=document.getElementById('bar');
  var hero=document.querySelector('.hero');

  burger.addEventListener('click',function(){
    var open=nav.classList.toggle('open');
    burger.setAttribute('aria-expanded',open?'true':'false');
  });
  document.querySelectorAll('#drawer a').forEach(function(a){
    a.addEventListener('click',function(){nav.classList.remove('open');burger.setAttribute('aria-expanded','false');});
  });

  /* the order island docks the moment the hero's Order button scrolls away
     under the nav, and stays; the old fixed 560px threshold is the fallback */
  var heroCta=document.querySelector('.hero-cta');
  var barIO=!!(heroCta && 'IntersectionObserver' in window);
  if(barIO){
    new IntersectionObserver(function(es){
      var e=es[0];
      bar.classList.toggle('show',!e.isIntersecting && e.boundingClientRect.top<72);
    },{rootMargin:'-72px 0px 0px 0px'}).observe(heroCta);
  }
  /* the hero video: its files are fetched only after the page has finished
     loading (the poster shows until then), never for reduced-motion
     visitors (the video is hidden for them), and it only plays while the
     hero is on screen */
  var heroVid=document.querySelector('.hero-scene video');
  var motionOK=document.documentElement.classList.contains('mm');
  var heroOnScreen=true, vidReady=false;
  function startVideo(){
    if(!heroVid || !motionOK || vidReady) return;
    vidReady=true;
    [['webm','video/webm'],['mp4','video/mp4']].forEach(function(t){
      var url=heroVid.getAttribute('data-'+t[0]);
      if(!url) return;
      var src=document.createElement('source'); src.src=url; src.type=t[1];
      heroVid.appendChild(src);
    });
    heroVid.load();
    if(heroOnScreen) heroVid.play().catch(function(){});
  }
  if(document.readyState==='complete') startVideo();
  else window.addEventListener('load',startVideo);
  if(heroVid && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      heroOnScreen=es[0].isIntersecting;
      if(!vidReady) return;
      if(heroOnScreen){ if(motionOK) heroVid.play().catch(function(){}); }
      else heroVid.pause();
    }).observe(hero);
  }

  /* nav goes solid past hero; keeps white text while over the dark hero */
  function onScroll(){
    var y=window.scrollY;
    nav.classList.toggle('solid',y>40);
    nav.classList.toggle('on-dark',y < hero.offsetHeight - 80);
    if(!barIO) bar.classList.toggle('show',y>560);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* scroll reveals — each section plays its own entrance once. html.fx (which
     arms the hidden starting states) is only added here, when motion is
     allowed and the observer exists, so nothing can be left hidden. */
  var rv=document.querySelectorAll('[data-mo],.rv');
  if(motionOK && 'IntersectionObserver' in window){
    document.documentElement.classList.add('fx');
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
    },{rootMargin:'0px 0px -12% 0px'});
    /* the footer rows sit at the very end of the page, where the last one can
       never climb past a bottom inset — so they trigger as soon as they show */
    var ioEnd=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ioEnd.unobserve(e.target);}});
    });
    rv.forEach(function(el){(el.closest('footer')?ioEnd:io).observe(el);});
  }

  /* contact form — posted with fetch so the reader stays on the page and gets
     the thank-you in place, instead of being thrown to Netlify's own success
     screen. Falls back to a normal submit if JS is off, which is what the
     form's action is for. ?sent=1 shows the confirmation directly, so the state can be looked at
     without sending anything. */
  var cform=document.querySelector('form[name="contact"]'), csent=document.getElementById('contactSent');
  if(cform && csent){
    var sentText=csent.textContent;
    function showSent(msg,bad){
      cform.hidden=true; csent.hidden=false;
      csent.textContent=msg||sentText;
      csent.classList.toggle('bad',!!bad);
      csent.setAttribute('tabindex','-1'); csent.focus();
    }
    if(/[?&]sent=1(&|$)/.test(location.search)) showSent();
    cform.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=cform.querySelector('button[type=submit]');
      if(btn){ btn.disabled=true; btn.textContent='Sending…'; }
      fetch(location.pathname,{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams(new FormData(cform)).toString()
      }).then(function(r){
        if(!r.ok) throw new Error(r.status);
        showSent();
        /* tell analytics.js a form went through */
        document.dispatchEvent(new CustomEvent('mk:form-sent',{detail:{form:'contact'}}));
      }).catch(function(){
        if(btn){ btn.disabled=false; btn.textContent='Send it'; }
        showSent('That did not send. Please email us at mekitchen.wa@gmail.com and we will pick it up there.',true);
        cform.hidden=false;
      });
    });
  }

  /* chip hover ring — trace a stadium starting at top centre, going clockwise,
     so the stroke opens and closes at the same point. Redrawn on resize since
     the chips are text-width. */
  document.querySelectorAll('.chips li').forEach(function(li){
    var svg=li.querySelector('.ring'),p=svg&&svg.querySelector('path');
    if(!p) return;
    function draw(){
      var w=li.clientWidth,h=li.clientHeight,r=h/2;
      if(!w||!h) return;
      svg.setAttribute('viewBox','0 0 '+w+' '+h);
      p.setAttribute('d','M'+(w/2)+' 0H'+(w-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+
                        'H'+r+'A'+r+' '+r+' 0 0 1 '+r+' 0Z');
    }
    draw();
    if(window.ResizeObserver) new ResizeObserver(draw).observe(li);
  });

  /* today's pickup hours — 11am-9pm Mon-Sat, closed Sunday */
  var todayHours=document.getElementById('todayHours');
  if(todayHours){
    todayHours.textContent = new Date().getDay()===0 ? 'Closed' : '11am\u20139pm';
  }






})();

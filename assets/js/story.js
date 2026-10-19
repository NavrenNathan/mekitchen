/* ===== Mockup 2, interactive layer =====
   Story map (strip), the then / now switch, the turn, the Mê
   tap-through and the scroll hint. Native scrolling throughout. */
(function(){
  'use strict';
  var root = document.documentElement;
  root.classList.add('m2i-js');
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  if(!reduce) root.classList.add('m2i-motion');
  var hasIO = 'IntersectionObserver' in window;
  function each(list, fn){ Array.prototype.forEach.call(list || [], fn); }

  /* ---------- 1. live story map ---------- */
  var STAGES = [
    { id:'m2i-then', name:'Then' },
    { id:'m2i-idea', name:'The idea' },
    { id:'m2i-now',  name:'Now' },
    { id:'m2i-me',   name:'Mê' }
  ];
  var starts = STAGES.map(function(s){ return document.getElementById(s.id); });
  var haveStages = starts.every(function(el){ return !!el; });
  var endEl = document.querySelector('.m2-keep');
  var stripLabel = document.querySelector('.m2i-strip-label');
  var stripFill = document.querySelector('.m2i-strip-fill');
  var stripPips = document.querySelectorAll('.m2i-strip-pips i');
  var strip = document.querySelector('.m2i-strip');
  var mainEl = document.querySelector('main');
  var LINE = 0.45;            /* the reading line, 45% down the viewport */
  var passed = [false, false, false, false];
  var current = -2;

  function setStage(i){
    if(i === current) return;
    current = i;
    each(stripPips, function(p, n){ p.classList.toggle('is-on', n <= i); });
    if(stripLabel){
      stripLabel.textContent = i < 0 ? 'Our story in 4 parts' : (i + 1) + ' of 4 · ' + STAGES[i].name;
    }
  }
  function highestPassed(){
    var c = -1;
    for(var k = 0; k < passed.length; k++){ if(passed[k]) c = k; }
    return c;
  }

  if(haveStages){
    if(hasIO){
      /* root = the top 45% of the viewport; a stage has begun once its first
         element reaches that line (or has already scrolled past the top) */
      var sio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          var k = starts.indexOf(e.target);
          if(k < 0) return;
          passed[k] = e.isIntersecting || e.boundingClientRect.top < 0;
        });
        setStage(highestPassed());
      }, { rootMargin:'0px 0px -55% 0px', threshold:0 });
      starts.forEach(function(el){ sio.observe(el); });
    }

    var ticking = false;
    function paint(){
      ticking = false;
      var vh = window.innerHeight || root.clientHeight;
      var line = vh * LINE;
      var tops = starts.map(function(el){ return el.getBoundingClientRect().top; });
      tops.push(endEl ? endEl.getBoundingClientRect().bottom : tops[3] + vh);
      var f = 0;
      if(tops[0] <= line){
        f = 1;
        for(var k = 0; k < 4; k++){
          if(tops[k + 1] > line){
            var span = tops[k + 1] - tops[k];
            f = (k + (span > 0 ? (line - tops[k]) / span : 1)) / 4;
            break;
          }
        }
      }
      f = Math.max(0, Math.min(1, f));
      if(stripFill) stripFill.style.transform = 'scaleX(' + f.toFixed(4) + ')';
      if(mainEl){
        var mb = mainEl.getBoundingClientRect().bottom;
        if(strip) strip.classList.toggle('m2i-off', mb < strip.getBoundingClientRect().bottom + 8);
      }
      if(!hasIO){
        var c = -1;
        for(var j = 0; j < 4; j++){ if(tops[j] <= line) c = j; }
        setStage(c);
      }
    }
    function onScroll(){
      if(!ticking){ ticking = true; window.requestAnimationFrame(paint); }
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll, { passive:true });
    paint();
  }

  /* ---------- 5a. scroll hint, gone once it has been seen and scrolled past ----------
     It fades only after its own bottom edge rises above 40% of the viewport,
     so on a short phone, where it starts below the fold, it is still there
     when the visitor reaches it. It keeps its space, so nothing jumps. */
  var begin = document.querySelector('.m2i-begin');
  if(begin){
    var hideBegin = function(){
      var vh = window.innerHeight || root.clientHeight;
      if(begin.getBoundingClientRect().bottom < vh * 0.4){
        /* never hide the element that has focus: hand focus on to the Then stage */
        if(document.activeElement === begin){
          var t = document.getElementById('m2i-then');
          if(t){
            t.setAttribute('tabindex', '-1');
            try { t.focus({ preventScroll:true }); } catch(err){ t.focus(); }
          }
        }
        begin.classList.add('m2i-gone');
        window.removeEventListener('scroll', hideBegin);
      }
    };
    window.addEventListener('scroll', hideBegin, { passive:true });
    hideBegin();
  }

  /* ---------- 2. a day on the Ave: then / now ---------- */
  var day = document.querySelector('.m2i-day');
  if(day){
    var sw = day.querySelector('.m2i-switch');
    var hint = day.querySelector('.m2i-day-hint');
    var swBtns = sw ? sw.querySelectorAll('button[data-show]') : [];
    var panels = {
      then: day.querySelector('[data-panel="then"]'),
      now:  day.querySelector('[data-panel="now"]')
    };
    if(sw && swBtns.length === 2 && panels.then && panels.now){
      var ticked = {};
      var active = 'then';
      var tick = function(key){
        var panel = panels[key];
        if(!panel || ticked[key]) return;
        ticked[key] = true;
        each(panel.querySelectorAll('li'), function(li, i){
          var go = function(){
            li.classList.add('m2i-tick');
            if(li.classList.contains('m2-miss')){
              if(reduce) li.classList.add('m2i-drawn');
              else window.setTimeout(function(){ li.classList.add('m2i-drawn'); }, 200);
            }
          };
          if(reduce) go(); else window.setTimeout(go, 150 + i * 220);
        });
      };
      var show = function(key){
        active = key;
        each(swBtns, function(b){
          b.setAttribute('aria-pressed', b.getAttribute('data-show') === key ? 'true' : 'false');
        });
        panels.then.classList.toggle('is-active', key === 'then');
        panels.now.classList.toggle('is-active', key === 'now');
        day.classList.toggle('is-now', key === 'now');
        if(hint) hint.textContent = key === 'now' ? 'Switch to Then to look back.' : 'Switch to Now to see a day on the Ave today.';
        if(seen) tick(key);
      };
      var seen = false;
      each(swBtns, function(b){
        b.addEventListener('click', function(){ show(b.getAttribute('data-show')); });
      });
      day.classList.add('m2i-ready');
      sw.hidden = false;
      if(hint) hint.hidden = false;
      show('then');
      if(hasIO && !reduce){
        var dio = new IntersectionObserver(function(entries){
          entries.forEach(function(e){
            if(e.isIntersecting){ seen = true; tick(active); dio.disconnect(); }
          });
        }, { threshold:0.35 });
        dio.observe(day);
      } else {
        seen = true;
        tick('then');
      }
    }
  }

  /* ---------- 3. the turn: the rail carries from then into now ---------- */
  var turn = document.getElementById('m2i-idea');
  var turnH = document.getElementById('m2-turn-h');
  var nowEra = document.getElementById('m2i-now');
  if(!reduce && hasIO && turn && turnH && nowEra){
    var vh0 = window.innerHeight || root.clientHeight;
    var wideMq = window.matchMedia ? window.matchMedia('(min-width: 960px)') : null;
    var turnSeen = turnH.getBoundingClientRect().top < vh0 * 0.88;
    var nowSeen = nowEra.getBoundingClientRect().top < vh0 * 0.88;
    var releaseTurn = function(){
      if(turn.classList.contains('m2i-wait')){
        turn.classList.remove('m2i-wait');
        turn.classList.add('m2i-go');
      }
    };
    if(!turnSeen) turn.classList.add('m2i-wait');
    if(!nowSeen) nowEra.classList.add('m2i-wait');
    var tio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var wide = !!(wideMq && wideMq.matches);
        if(e.target === turnH){
          tio.unobserve(turnH);
          /* on phones the line runs beside the heading, so it draws now; on
             desktop the drawn segment sits at the foot of the band, so it
             waits for the Now era to arrive */
          if(wide) turn.classList.add('m2i-go'); else releaseTurn();
        } else if(e.target === nowEra){
          tio.unobserve(nowEra);
          releaseTurn();
          window.setTimeout(function(){
            nowEra.classList.add('m2i-go');
            window.setTimeout(function(){ nowEra.classList.remove('m2i-wait', 'm2i-go'); }, 1600);
          }, wide ? 500 : 150);
        }
      });
    }, { rootMargin:'0px 0px -12% 0px' });
    if(!turnSeen) tio.observe(turnH);
    if(!nowSeen) tio.observe(nowEra);
  }

  /* ---------- 4. why we called it Mê: tap-through ---------- */
  var nm = document.querySelector('.m2i-name');
  if(nm){
    var nBtn = nm.querySelector('.m2i-name-btn');
    var steps = nm.querySelectorAll('.m2i-name-step');
    var foot = nm.querySelector('.m2i-name-foot');
    var nCount = nm.querySelector('.m2i-name-n');
    var cue = nm.querySelector('.m2i-name-cue');
    var reset = nm.querySelector('.m2i-name-reset');
    var live = nm.querySelector('.m2i-name-live');
    var pips = nm.querySelectorAll('.m2i-pips i');
    if(nBtn && foot && steps.length === 3){
      var CUES = ['Press Mê for what it means', 'Press Mê for how it feels', 'Press Mê to start again'];
      var step = 0;
      var render = function(announce){
        each(steps, function(s, i){ s.classList.toggle('is-on', i === step); });
        each(pips, function(p, i){ p.classList.toggle('is-on', i <= step); });
        if(nCount) nCount.textContent = (step + 1) + ' of 3';
        if(cue){
          cue.textContent = CUES[step];
          /* on the last step the reset takes the cue's place, in the same slot */
          cue.hidden = !!reset && step === 2;
        }
        if(reset) reset.hidden = step !== 2;
        if(announce && live){
          var k = steps[step].querySelector('.m2-name-say');
          var v = steps[step].querySelector('.m2i-name-v');
          live.textContent = (step + 1) + ' of 3. ' + (k ? k.textContent : '') + ': ' + (v ? v.textContent : '');
        }
      };
      nBtn.addEventListener('click', function(){ step = (step + 1) % 3; render(true); });
      if(reset){
        reset.addEventListener('click', function(){ step = 0; render(true); nBtn.focus(); });
      }
      nm.classList.add('m2i-ready');
      nBtn.hidden = false;
      foot.hidden = false;
      render(false);
    }
  }
})();

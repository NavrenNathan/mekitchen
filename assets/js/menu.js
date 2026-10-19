/* the decorative background behind "Start your order": if it ever fails to
   load, drop it so no broken-image box shows (this used to be an inline
   onerror handler, which the Content-Security-Policy no longer allows) */
(function(){
  var bg=document.querySelector('.start-bg img');
  if(!bg) return;
  function drop(){ bg.remove(); }
  if(bg.complete && !bg.naturalWidth) drop(); else bg.addEventListener('error',drop);
})();

/* ---------- menu explorer ----------------------------------------------
   Read-only. Tap a section, tap a dish, read what is in it, and if you want
   it, the button hands you to Square. Nothing is added up and no basket is
   kept here: Square owns ordering.

   The dish data is READ OUT OF THE PAGE rather than duplicated, so the static
   list below stays the single source of truth. Change a price there and this
   follows automatically.
   ------------------------------------------------------------------------ */
(function(){
  'use strict';
  var SQUARE='https://me-kitchen.square.site/';
  var sheet=document.getElementById('sheet');
  if(!sheet) return;
  var body=document.getElementById('sheetBody'), foot=document.getElementById('sheetFoot'),
      title=document.getElementById('sheetTitle'), cats=document.getElementById('cats');
  var lastFocus=null;

  /* read the menu out of the page */
  var MENU=[];
  Array.prototype.forEach.call(document.querySelectorAll('.menu-sec'),function(sec){
    var h2=sec.querySelector('h2'), lede=sec.querySelector('.lede');
    var c={id:sec.id,name:h2?h2.textContent.trim():sec.id,
           lede:lede?lede.textContent.trim():'',items:[]};
    Array.prototype.forEach.call(sec.querySelectorAll('.item'),function(a){
      var h3=a.querySelector('h3'), veg=!!a.querySelector('.veg');
      var name=h3?h3.textContent.replace(/vegetarian/i,'').trim():'';
      var priceEl=a.querySelector('.price'), p=a.querySelector('p');
      c.items.push({el:a,name:name,veg:veg,
        price:priceEl?priceEl.innerHTML.trim():'',
        desc:p?p.textContent.trim():''});
    });
    if(c.items.length) MENU.push(c);
  });
  if(!MENU.length) return;

  /* the static list is hidden only once this is running, so with JS off the
     whole menu is still on the page */
  document.documentElement.classList.add('js-only');

  /* A short description of what each section actually is. The section ledes in
     the markup open with counts ("Four bowls.") which says nothing useful on a
     tile, so these are written separately. */
  var BLURB = {
    'pho':'Rice noodles in broth with fresh herbs, bean sprouts and lime. Beef, or a vegetable broth with tofu.',
    'banh-mi':'Vietnamese baguette with daikon and carrot pickles, cucumber and jalape\u00f1o. Lemongrass pork, five-spice chicken or egg.',
    'rice-bowls':'Lemongrass pork over broken rice, with fresh salad, pickles, cucumber and cilantro crema.',
    'sides-drinks':'Spring rolls, egg rolls and popcorn chicken to start. Sugarcane juice, Vietnamese coffee, Thai tea and matcha to drink.'
  };

  /* The photograph behind each tile. These point at shots we already have
     rather than duplicating files under new names. Override a tile by adding
     assets/cat-<section>.jpg, which wins over the default below; if neither
     loads, onerror flips the tile to its placeholder. */
  var PHOTO = {
    'pho':'assets/g-pho.jpg',
    'banh-mi':'assets/g-banh-mi.jpg',
    'rice-bowls':'assets/g-rice-bowl.jpg',
    'sides-drinks':'assets/g-spread.jpg'
  };
  var SHOT = {
    'pho':'Ph\u1edf bowl, overhead',
    'banh-mi':'B\u00e1nh m\u00ec, close',
    'rice-bowls':'Rice bowl, overhead',
    'sides-drinks':'Appetizers and drinks'
  };

  MENU.forEach(function(c,i){
    var b=document.createElement('button');
    b.type='button'; b.className='cat no-photo';
    /* the tiles sit at the top of the page, so their photos load straight away
       (no lazy-loading), as small WebP copies with the JPEG as fallback */
    var ph=PHOTO[c.id], webp=ph?ph.replace(/\.jpg$/,''):null;
    b.innerHTML='<span class="cat-bg"><picture>'+
      (webp?'<source type="image/webp" srcset="'+webp+'-480.webp 480w, '+webp+'-960.webp 960w" sizes="(min-width:640px) 19vw, (min-width:480px) 36vw, 92vw">':'')+
      '<img src="'+(ph||('assets/cat-'+c.id+'.jpg'))+'" alt="" decoding="async"'+(i<2?' fetchpriority="high"':'')+'></picture>'+
      '<span class="cat-ph">'+(SHOT[c.id]||'Photo')+'</span></span>'+
      '<span class="cat-copy"><h2>'+c.name+'</h2><p>'+(BLURB[c.id]||c.lede)+'</p>'+
      '<span class="meta">See the dishes <span class="arrow">\u2192</span></span></span>';
    var img=b.querySelector('.cat-bg img');
    img.addEventListener('load',function(){ b.classList.remove('no-photo'); });
    img.addEventListener('error',function(){ img.remove(); });
    b.addEventListener('click',function(){ lastFocus=b; openCat(c); });
    cats.appendChild(b);
  });

  /* opening (or changing what the sheet shows) moves focus to its title, so
     keyboard and screen-reader users land inside the dialog, not on the page
     behind it */
  function openSheet(){
    if(!sheet.hasAttribute('open')){
      sheet.setAttribute('open','');
      requestAnimationFrame(function(){ sheet.classList.add('in'); });
      document.body.style.overflow='hidden';
    }
    title.setAttribute('tabindex','-1');
    title.focus({preventScroll:true});
  }
  function closeSheet(){
    sheet.classList.remove('in');
    setTimeout(function(){ sheet.removeAttribute('open'); document.body.style.overflow=''; },300);
    if(lastFocus) lastFocus.focus();
  }
  Array.prototype.forEach.call(sheet.querySelectorAll('[data-close]'),function(el){
    el.addEventListener('click',closeSheet);
  });
  document.addEventListener('keydown',function(e){
    if(!sheet.hasAttribute('open')) return;
    if(e.key==='Escape'){ closeSheet(); return; }
    if(e.key!=='Tab') return;
    /* keep Tab inside the open sheet */
    var f=Array.prototype.filter.call(sheet.querySelectorAll('.sheet-panel a[href], .sheet-panel button'),function(el){ return el.offsetParent!==null; });
    if(!f.length) return;
    var first=f[0], last=f[f.length-1], a=document.activeElement;
    if(!sheet.contains(a)){ e.preventDefault(); first.focus(); }
    else if(e.shiftKey && (a===first || a===title)){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && a===last){ e.preventDefault(); first.focus(); }
  });

  /* the dishes in a section */
  function openCat(c){
    title.textContent=c.name;
    foot.hidden=false;
    foot.innerHTML='<p class="foot-note grow">Tap a dish to see what is in it.</p>'+
      '<a class="btn btn-ghost" href="'+SQUARE+'" target="_blank" rel="noopener">Order online</a>';
    var h='<p class="sheet-lede">'+c.lede+'</p><div class="rows">';
    c.items.forEach(function(it,ix){
      h+='<button type="button" class="row" data-ix="'+ix+'"><span class="row-main"><h3>'+it.name+
         (it.veg?'<span class="veg">Vegetarian</span>':'')+'</h3><p>'+it.desc+'</p></span>'+
         '<span class="price">'+it.price+'</span></button>';
    });
    body.innerHTML=h+'</div>';
    Array.prototype.forEach.call(body.querySelectorAll('.row'),function(r){
      r.addEventListener('click',function(){ openItem(c,c.items[+r.dataset.ix]); });
    });
    body.scrollTop=0;
    openSheet();
  }

  /* one dish, read only */
  function openItem(c,it){
    title.textContent=it.name;
    var h='';
    if(c.items.length>1) h+='<button type="button" class="back">← '+c.name+'</button>';
    h+='<div class="dish"><div class="dish-top"><h3>'+it.name+
       (it.veg?'<span class="veg">Vegetarian</span>':'')+'</h3><span class="price">'+it.price+'</span></div>'+
       '<p class="dish-desc">'+it.desc+'</p></div>';
    body.innerHTML=h;
    var back=body.querySelector('.back');
    if(back) back.addEventListener('click',function(){ openCat(c); });
    foot.hidden=false;
    foot.innerHTML='<p class="foot-note grow">Orders are placed on our online ordering page.</p>'+
      '<a class="btn" href="'+SQUARE+'" target="_blank" rel="noopener">Order online</a>';
    body.scrollTop=0;
    openSheet();
  }

  /* a link such as menu.html#pho opens that section rather than scrolling to
     a list that is now hidden */
  function fromHash(){
    var id=(location.hash||'').replace('#','');
    if(!id) return;
    var c=MENU.filter(function(x){ return x.id===id; })[0];
    if(c) openCat(c);
  }
  window.addEventListener('hashchange',fromHash);
  fromHash();
})();

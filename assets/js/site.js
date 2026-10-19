/* Mê Kitchen: menu button and scroll reveal, shared by the menu, Our Story,
   careers and privacy pages. (The home page has its own, richer versions in
   home.js.) Loaded at the end of <body>, so the elements already exist. */
(function(){
  'use strict';

  /* burger + drawer */
  var nav=document.getElementById('nav'), burger=document.getElementById('burger');
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('#drawer a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    });
  });

  /* scroll reveal */
  var rv = document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{rootMargin:'0px 0px -10% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else {
    rv.forEach(function(el){ el.classList.add('in'); });
  }
})();

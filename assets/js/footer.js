/* Mê Kitchen: footer behaviour shared by every main page: the Directions
   and Email us popups, copying the address, and the copyright year. */
(function(){
  'use strict';

  /* footer popups — Directions and Email us, both opened from the footer's
     "Find us" column. Vanilla JS matching this file's own conventions: a
     class toggle plus a CSS transition, no library. Each has a minimal focus
     trap and Escape-to-close since they are real dialogs. */
  function popup(triggerSel, modalId, closeSel){
    var trigger=document.querySelector(triggerSel);
    var modal=document.getElementById(modalId);
    if(!trigger||!modal) return;
    var closeBtns=modal.querySelectorAll(closeSel);
    var lastFocus;

    function onKey(e){
      if(e.key==='Escape'){ close(); return; }
      if(e.key==='Tab'){
        var f=modal.querySelectorAll('a,button');
        if(!f.length) return;
        var first=f[0],last=f[f.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    }
    function open(){
      lastFocus=document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow='hidden';
      var first=modal.querySelector('.modal-option,.modal-close');
      if(first) first.focus();
      document.addEventListener('keydown',onKey);
    }
    function close(){
      modal.classList.remove('open');
      document.body.style.overflow='';
      document.removeEventListener('keydown',onKey);
      if(lastFocus) lastFocus.focus();
    }

    trigger.addEventListener('click',open);
    closeBtns.forEach(function(b){ b.addEventListener('click',close); });
    modal.addEventListener('click',function(e){ if(e.target===modal) close(); });
  }
  popup('[data-open-directions]','directionsModal','[data-close-directions]');
  popup('[data-open-email]','emailModal','[data-close-email]');

  /* copy the address: the Clipboard API where allowed, the older
     execCommand route otherwise, and if both fail the address is left
     selected so Cmd/Ctrl+C still works */
  (function(){
    var btn=document.querySelector('[data-copy-email]'), addr=document.getElementById('emailAddr');
    if(!btn||!addr) return;
    var label=btn.querySelector('span'), text=addr.textContent.trim(), t;
    function selectAddr(){
      var r=document.createRange(); r.selectNodeContents(addr);
      var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    function done(ok){
      btn.classList.toggle('done',ok);
      label.textContent=ok?'Copied':'Press Cmd+C to copy';
      clearTimeout(t);
      t=setTimeout(function(){ btn.classList.remove('done'); label.textContent='Copy email'; },2200);
    }
    function fallback(){
      selectAddr();
      var ok=false;
      try{ ok=document.execCommand('copy'); }catch(e){}
      done(ok);
    }
    btn.addEventListener('click',function(){
      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(text).then(function(){ done(true); },fallback);
      } else { fallback(); }
    });
  })();

  document.getElementById('yr').textContent = new Date().getFullYear();
})();

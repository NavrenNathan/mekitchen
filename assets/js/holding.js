(function(){
  'use strict';

  /* ---------------------------------------------------------------
     The preview password, stored only as its SHA-256 hash so it can't be
     read from the page source. This gate is a courtesy screen, not
     security: /home and the other pages load without it. It comes out at
     launch. To change the password, put the output of
       printf %s 'new-password' | shasum -a 256
     here (the hex string only).
     --------------------------------------------------------------- */
  var PASS_SHA256 = '7ab08dabc50b269dbd4631c950089913582e84c935deeaf00e0508edaeed3932';
  function sha256hex(str){
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0'+b.toString(16)).slice(-2); }).join('');
    });
  }

  /* notify list — posts to Netlify Forms without leaving the page, so the
     countdown keeps running. Only works on the deployed Netlify site; a local
     static server has nothing to accept the POST. */
  var nForm=document.getElementById('notifyForm'), nBtn=document.getElementById('notifyBtn'),
      nNote=document.getElementById('notifyNote'), nBox=document.getElementById('notify');

  nForm.addEventListener('submit', function(e){
    e.preventDefault();
    nNote.className='note';
    nNote.textContent='';
    nBtn.disabled=true;
    nBtn.textContent='Saving…';

    fetch('/', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams(new FormData(nForm)).toString()
    })
    .then(function(res){
      if(!res.ok) throw new Error(res.status);
      nBox.classList.add('done');
      /* tell analytics.js a form went through */
      document.dispatchEvent(new CustomEvent('mk:form-sent',{detail:{form:'opening_news'}}));
    })
    .catch(function(){
      nBtn.disabled=false;
      nBtn.textContent="I'm in";
      nNote.className='note bad';
      nNote.textContent='That did not save. Try again in a moment.';
    });
  });

  /* concealed preview gate */
  var dot=document.getElementById('dot'), gate=document.getElementById('gate'),
      pw=document.getElementById('pw'), msg=document.getElementById('msg');

  dot.addEventListener('click', function(){
    gate.classList.toggle('on');
    if(gate.classList.contains('on')) pw.focus();
  });

  gate.addEventListener('submit', function(e){
    e.preventDefault();
    sha256hex(pw.value).then(function(hash){ unlockOr(hash === PASS_SHA256); });
  });
  function unlockOr(ok){
    if(ok){
      msg.style.color = '#a8dd93';
      msg.textContent = 'Unlocked. Loading the site…';
      try { sessionStorage.setItem('mk_preview','1'); } catch(err){}
      setTimeout(function(){ window.location.href = 'home.html'; }, 500);
    } else {
      msg.style.color = '';
      msg.textContent = 'Not quite.';
      gate.classList.remove('shake');
      void gate.offsetWidth;            /* restart the animation */
      gate.classList.add('shake');
      pw.select();
    }
  }
})();

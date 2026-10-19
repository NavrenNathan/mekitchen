/* Mê Kitchen careers page: upload boxes and the application form. */
(function(){
  'use strict';

  /* upload boxes — show the chosen file's name, and turn away anything that
     is not PDF/Word or is over 4 MB before it ever reaches Netlify */
  var MAX=4*1024*1024, OK=/\.(pdf|docx?)$/i;
  document.querySelectorAll('.drop').forEach(function(box){
    var input=box.querySelector('input[type=file]'), name=box.querySelector('.name');
    function show(){
      var f=input.files && input.files[0];
      box.classList.remove('bad');
      input.setCustomValidity('');
      if(!f){ box.classList.remove('has'); name.textContent=name.getAttribute('data-default'); return; }
      if(!OK.test(f.name)){ input.setCustomValidity('Please attach a PDF or Word file.'); }
      else if(f.size>MAX){ input.setCustomValidity('That file is over 4 MB. Please attach a smaller copy.'); }
      if(input.validationMessage){ box.classList.add('bad'); box.classList.remove('has'); name.textContent=input.validationMessage; }
      else { box.classList.add('has'); name.textContent=f.name; }
    }
    input.addEventListener('change',show);
    input.addEventListener('dragenter',function(){ box.classList.add('over'); });
    ['dragleave','drop'].forEach(function(t){ input.addEventListener(t,function(){ box.classList.remove('over'); }); });
  });

  /* application — posted with fetch so the applicant gets the thank-you in
     place. Sent as multipart FormData (no Content-Type header, the browser
     sets the boundary) because it carries files. ?sent=1 shows the
     confirmation without sending anything, and is where the no-JS fallback
     lands. */
  var aform=document.querySelector('form[name="careers"]'), asent=document.getElementById('applySent');
  if(aform && asent){
    var sentText=asent.textContent;
    function showSent(msg,bad){
      aform.hidden=!bad; asent.hidden=false;
      asent.textContent=msg||sentText;
      asent.classList.toggle('bad',!!bad);
      asent.setAttribute('tabindex','-1'); asent.focus();
    }
    if(/[?&]sent=1(&|$)/.test(location.search)) showSent();
    aform.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=aform.querySelector('button[type=submit]');
      if(btn){ btn.disabled=true; btn.textContent='Sending…'; }
      fetch(location.pathname,{ method:'POST', body:new FormData(aform) })
        .then(function(r){
          if(!r.ok) throw new Error(r.status);
          showSent();
          /* tell analytics.js a form went through */
          document.dispatchEvent(new CustomEvent('mk:form-sent',{detail:{form:'careers'}}));
        }).catch(function(){
          if(btn){ btn.disabled=false; btn.textContent='Send application'; }
          showSent('That did not send. Please try again, or email your application to mekitchen.wa@gmail.com.',true);
        });
    });
  }

})();

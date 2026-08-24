/* Charles Gumera — Portfolio interactions */
(function(){
  "use strict";

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var root = document.documentElement;

  /* ---------------- theme ---------------- */
  function applyTheme(t){
    root.setAttribute('data-theme', t);
    localStorage.setItem('cg-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', t === 'dark' ? '#0D0F0D' : '#F6F6F2');
  }
  var saved = localStorage.getItem('cg-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function(){
    var toggle = document.querySelector('.theme-toggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    /* ---------------- active nav link ---------------- */
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function(a){
      var href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')) a.classList.add('active');
    });

    /* ---------------- cursor glow ---------------- */
    if(!isTouch && !reduced){
      var glow = document.querySelector('.cursor-glow');
      if(glow){
        window.addEventListener('pointermove', function(e){
          glow.style.setProperty('--x', e.clientX + 'px');
          glow.style.setProperty('--y', e.clientY + 'px');
        }, { passive: true });
      }
    }

    /* ---------------- magnetic / gravity hover ---------------- */
    if(!isTouch && !reduced){
      document.querySelectorAll('[data-magnetic]').forEach(function(el){
        var strength = parseFloat(el.getAttribute('data-magnetic')) || 10;
        el.addEventListener('mousemove', function(e){
          var r = el.getBoundingClientRect();
          var relX = (e.clientX - r.left) / r.width - 0.5;
          var relY = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = 'translate(' + (relX * strength) + 'px,' + (relY * strength) + 'px)';
        });
        el.addEventListener('mouseleave', function(){
          el.style.transform = 'translate(0,0)';
        });
      });
    }

    /* ---------------- typography reaction ---------------- */
    if(!isTouch && !reduced){
      document.querySelectorAll('.type-fx').forEach(function(el){
        var text = el.textContent;
        el.innerHTML = '';
        text.split('').forEach(function(ch){
          var span = document.createElement('span');
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          el.appendChild(span);
        });
        var letters = el.querySelectorAll('span');
        el.addEventListener('mousemove', function(e){
          letters.forEach(function(s){
            var r = s.getBoundingClientRect();
            var cx = r.left + r.width/2, cy = r.top + r.height/2;
            var dx = e.clientX - cx, dy = e.clientY - cy;
            var dist = Math.sqrt(dx*dx + dy*dy);
            var max = 90;
            if(dist < max){
              var f = (1 - dist/max);
              s.style.transform = 'translateY(' + (-f*10) + 'px) scale(' + (1 + f*0.14) + ')';
              s.style.color = 'var(--lime)';
            } else {
              s.style.transform = '';
              s.style.color = '';
            }
          });
        });
        el.addEventListener('mouseleave', function(){
          letters.forEach(function(s){ s.style.transform=''; s.style.color=''; });
        });
      });
    }

    /* ---------------- scroll reveal ---------------- */
    var revealEls = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window && !reduced){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.14 });
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('in'); });
    }

    /* ---------------- lightbox ---------------- */
    var lb = document.querySelector('.lightbox');
    if(lb){
      var lbImg = lb.querySelector('img');
      var lbCap = lb.querySelector('.lightbox-cap');
      document.querySelectorAll('[data-lightbox]').forEach(function(fig){
        fig.addEventListener('click', function(){
          var img = fig.querySelector('img');
          if(!img) return;
          lbImg.src = img.src;
          lbImg.alt = img.alt || '';
          lbCap.textContent = fig.getAttribute('data-caption') || img.alt || '';
          lb.classList.add('open');
          document.body.style.overflow = 'hidden';
        });
      });
      function closeLb(){
        lb.classList.remove('open');
        document.body.style.overflow = '';
      }
      lb.querySelector('.lightbox-close').addEventListener('click', closeLb);
      lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
      window.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLb(); });
    }

    /* ---------------- ticker duplication for seamless loop ---------------- */
    document.querySelectorAll('.ticker-track').forEach(function(track){
      track.innerHTML += track.innerHTML;
    });

    /* ---------------- mobile nav ---------------- */
    var mobileToggle = document.querySelector('.nav-mobile-toggle');
    var navLinks = document.querySelector('.nav-links');
    if(mobileToggle && navLinks){
      mobileToggle.addEventListener('click', function(){
        var open = navLinks.classList.toggle('mobile-open');
        mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });

      navLinks.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click', function(){
          navLinks.classList.remove('mobile-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.setAttribute('aria-label', 'Open navigation');
        });
      });

      window.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && navLinks.classList.contains('mobile-open')){
          navLinks.classList.remove('mobile-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.setAttribute('aria-label', 'Open navigation');
          mobileToggle.focus();
        }
      });
    }

    /* ---------------- contact form (static demo) ---------------- */
    var form = document.querySelector('.contact-form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var original = btn.textContent;
        btn.textContent = 'Message sent';
        btn.disabled = true;
        setTimeout(function(){ btn.textContent = original; btn.disabled = false; form.reset(); }, 2400);
      });
    }
  });
})();

/* =============================================================
   Portfolio — Mathias JAVIERRE
   Comportements partages : navigation, reveals, modales, thema
   ============================================================= */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Thema clair / sombre
     --------------------------------------------------------- */
  function initTheme() {
    var toggle = $('[data-theme-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('mj-theme', next); } catch (e) {}
      window.dispatchEvent(new Event('resize'));
    });
  }

  /* ---------------------------------------------------------
     Apparition au defilement (une seule fois, avec cascade)
     --------------------------------------------------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      // Cascade legere entre elements qui entrent ensemble
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      visible.forEach(function (entry, i) {
        var el = entry.target;
        el.style.setProperty('--reveal-delay', Math.min(i, 6) * 70 + 'ms');
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     Entree de page (masthead)
     --------------------------------------------------------- */
  function initIntro() {
    requestAnimationFrame(function () {
      $$('.intro, .portrait').forEach(function (el) { el.classList.add('is-ready'); });
    });
  }

  /* ---------------------------------------------------------
     Decodage facon terminal sur les libelles techniques
     Le texte final est strictement identique au texte d'origine.
     --------------------------------------------------------- */
  function initScramble() {
    var targets = $$('[data-scramble]');
    if (!targets.length || reduced) return;

    var pool = '01<>/\\[]{}#$%&*+=~^';

    targets.forEach(function (el, index) {
      var final = el.textContent;
      var letters = final.split('');
      var start = null;
      var duration = 620 + index * 90;
      var delay = 260 + index * 120;

      el.textContent = '';
      el.style.minWidth = el.offsetWidth ? el.offsetWidth + 'px' : '';

      function frame(ts) {
        if (start === null) start = ts;
        var elapsed = ts - start;
        if (elapsed < delay) { requestAnimationFrame(frame); return; }

        var p = Math.min((elapsed - delay) / duration, 1);
        var revealed = Math.floor(p * letters.length);
        var out = '';

        for (var i = 0; i < letters.length; i++) {
          if (letters[i] === ' ') { out += ' '; continue; }
          if (i < revealed) { out += letters[i]; continue; }
          out += pool.charAt((i * 7 + Math.floor(elapsed / 45) * 3) % pool.length);
        }

        el.textContent = out;
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = final;
      }

      requestAnimationFrame(frame);
    });
  }

  /* ---------------------------------------------------------
     Parallaxe discrete de la trame technique de l'en-tete
     --------------------------------------------------------- */
  function initGridParallax() {
    var head = $('.masthead');
    if (!head || reduced || !window.matchMedia('(pointer: fine)').matches) return;

    var raf = null, tx = 0, ty = 0;

    head.addEventListener('mousemove', function (e) {
      var r = head.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * -16;
      ty = ((e.clientY - r.top) / r.height - .5) * -16;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        head.style.setProperty('--gx', tx.toFixed(2) + 'px');
        head.style.setProperty('--gy', ty.toFixed(2) + 'px');
        raf = null;
      });
    });

    head.addEventListener('mouseleave', function () {
      head.style.setProperty('--gx', '0px');
      head.style.setProperty('--gy', '0px');
    });
  }

  /* ---------------------------------------------------------
     Copie de l'adresse e-mail (retour visuel sans texte)
     --------------------------------------------------------- */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy');

        function done() {
          btn.classList.add('is-copied');
          setTimeout(function () { btn.classList.remove('is-copied'); }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done, fallback);
        } else {
          fallback();
        }

        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = value;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Prechargement des pages internes au survol
     --------------------------------------------------------- */
  function initPrefetch() {
    var done = {};
    $$('a[href$=".html"]').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        var href = a.getAttribute('href');
        if (!href || done[href]) return;
        done[href] = true;
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      }, { once: true });
    });
  }

  /* ---------------------------------------------------------
     Barre de progression de lecture
     --------------------------------------------------------- */
  function initProgress() {
    var bar = $('.progress');
    var ring = $('.to-top__bar');
    if (!bar && !ring) return;

    var CIRC = 2 * Math.PI * 20;
    if (ring) {
      ring.style.strokeDasharray = CIRC.toFixed(2);
      ring.style.strokeDashoffset = CIRC.toFixed(2);
    }

    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      if (bar) bar.style.transform = 'scaleX(' + ratio + ')';
      if (ring) ring.style.strokeDashoffset = (CIRC * (1 - ratio)).toFixed(2);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     Retour en haut
     --------------------------------------------------------- */
  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Navigation par onglets + curseur glissant
     --------------------------------------------------------- */
  function initTabs() {
    var list = $('.nav__list');
    if (!list) return;

    var indicator  = $('.nav__indicator');
    var burger     = $('.nav__burger');
    var tabLinks   = $$('a[href^="#"]', list);
    var sections   = $$('.section');

    function moveIndicator(link) {
      if (!indicator || !link) return;
      if (window.innerWidth <= 760) { indicator.style.width = '0px'; return; }
      indicator.style.width = link.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + (link.offsetLeft - list.scrollLeft) + 'px)';
    }

    function activate(id, push) {
      var target = document.getElementById(id);
      if (!target) return;

      sections.forEach(function (s) { s.classList.toggle('is-active', s === target); });

      var current = null;
      tabLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) current = a;
      });
      moveIndicator(current);

      if (push && history.replaceState) history.replaceState(null, '', '#' + id);
    }

    tabLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('href').slice(1);
        activate(id, true);

        // Le contenu change sous la barre : on la ramene en vue si besoin
        var nav = $('.nav');
        var top = nav ? nav.getBoundingClientRect().top + window.scrollY : 0;
        if (window.scrollY > top) {
          window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
        }
        closeMenu();
      });
    });

    function closeMenu() {
      if (!burger) return;
      list.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    if (burger) {
      burger.addEventListener('click', function () {
        var open = list.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
      });
      $$('a', list).forEach(function (a) {
        a.addEventListener('click', function () {
          if (!a.getAttribute('href').startsWith('#')) closeMenu();
        });
      });
    }

    window.addEventListener('resize', function () {
      moveIndicator($('a.is-active', list));
      if (window.innerWidth > 760) closeMenu();
    });
    list.addEventListener('scroll', function () {
      moveIndicator($('a.is-active', list));
    }, { passive: true });

    var initial = window.location.hash.replace('#', '');
    if (initial && document.getElementById(initial)) {
      activate(initial, false);
      // Le navigateur a deja saute a l'ancre alors que la section etait
      // masquee : on repositionne proprement sous la barre de navigation.
      var navEl = $('.nav');
      requestAnimationFrame(function () {
        window.scrollTo(0, navEl ? navEl.offsetTop : 0);
      });
    } else {
      var first = $('a.is-active', list) || tabLinks[0];
      if (first) activate(first.getAttribute('href').slice(1), false);
    }

    // Les polices modifient la largeur des onglets : on recalcule apres chargement
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveIndicator($('a.is-active', list)); });
    }
    window.addEventListener('load', function () { moveIndicator($('a.is-active', list)); });
  }

  /* ---------------------------------------------------------
     Modales (image, video, PDF)
     --------------------------------------------------------- */
  function initModals() {
    var imageModal = $('#imageModal');
    var videoModal = $('#videoModal');
    var pdfModal   = $('#pdfModal');
    var lastFocus  = null;

    function open(modal) {
      if (!modal) return;
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      var close = $('.modal__close', modal);
      if (close) close.focus();
    }

    function close(modal) {
      if (!modal || !modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      var video = $('video', modal);
      if (video) { video.pause(); video.currentTime = 0; }
      var frame = $('iframe', modal);
      if (frame) frame.removeAttribute('src');

      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function closeAll() { $$('.modal').forEach(close); }

    // Visionneuse : toutes les images zoomables de la page forment une serie
    var zoomables = $$('[data-zoom]');
    var current = -1;

    function show(index, direction) {
      if (!zoomables.length || !imageModal) return;
      current = (index + zoomables.length) % zoomables.length;

      var el = zoomables[current];
      var img = $('#modalImage');
      if (!img) return;

      img.src = el.getAttribute('data-zoom');
      img.alt = el.getAttribute('data-zoom-alt') || '';

      if (direction && !reduced) {
        img.classList.remove('slide-prev', 'slide-next');
        void img.offsetWidth;
        img.classList.add(direction > 0 ? 'slide-next' : 'slide-prev');
      }
    }

    zoomables.forEach(function (el, i) {
      el.addEventListener('click', function () {
        show(i, 0);
        open(imageModal);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });

    if (imageModal) {
      if (zoomables.length < 2) {
        $$('.modal__nav', imageModal).forEach(function (b) { b.hidden = true; });
      }
      $$('.modal__nav', imageModal).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var step = btn.classList.contains('modal__nav--next') ? 1 : -1;
          show(current + step, step);
        });
      });

      document.addEventListener('keydown', function (e) {
        if (!imageModal.classList.contains('is-open') || zoomables.length < 2) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, 1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1, -1); }
      });
    }

    $$('[data-pdf]').forEach(function (el) {
      el.addEventListener('click', function () {
        var frame = $('#pdfFrame');
        if (!frame || !pdfModal) return;
        frame.src = el.getAttribute('data-pdf');
        open(pdfModal);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });

    $$('[data-video]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (!videoModal) return;
        open(videoModal);
        var video = $('video', videoModal);
        if (video) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      });
    });

    $$('.modal').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close(modal);
      });
      var btn = $('.modal__close', modal);
      if (btn) btn.addEventListener('click', function () { close(modal); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ---------------------------------------------------------
     Compteurs (page Projets)
     --------------------------------------------------------- */
  function initCounters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      if (reduced) { el.textContent = target; return; }

      var duration = 900;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });

    nodes.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  /* ---------------------------------------------------------
     Age calcule (accueil)
     --------------------------------------------------------- */
  function initAge() {
    var nodes = $$('[data-age]');
    if (!nodes.length) return;

    var birth = new Date(2008, 2, 5);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    nodes.forEach(function (el) { el.textContent = age; });
  }

  /* ---------------------------------------------------------
     Sommaire actif (page Chef-d'oeuvre)
     --------------------------------------------------------- */
  function initToc() {
    var links = $$('.toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var active = map[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------------------------------------------------------
     Amorce
     --------------------------------------------------------- */
  function boot() {
    initTheme();
    initIntro();
    initScramble();
    initGridParallax();
    initReveal();
    initProgress();
    initToTop();
    initTabs();
    initModals();
    initCounters();
    initAge();
    initToc();
    initCopy();
    initPrefetch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

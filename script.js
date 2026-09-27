/* ============================================================
   Portfolio — minimal vanilla JS
   - mobile nav toggle
   - active-section highlighting (IntersectionObserver)
   - scroll reveal
   - terminal typing effect
   - footer year
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
  }

  // Close the menu after choosing a destination.
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') &&
        !nav.contains(e.target)) {
      setMenu(false);
    }
  });

  /* ---------- Sticky nav shadow + active section ---------- */
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  };

  /* ---------- Active section highlighting ----------
     The active section is the last one whose top has passed a line just
     below the fixed navbar. A scroll-position rule is used rather than
     IntersectionObserver because the sections vary a lot in height: an
     observer band gets covered by whichever tall neighbour is on screen
     and the highlight sticks to the wrong section. */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll('main section[id]')
  );
  var navLinks = {};
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-nav]'),
    function (link) {
      navLinks[link.getAttribute('href').slice(1)] = link;
    }
  );

  var currentId = null;

  function setActive(id) {
    if (id === currentId) return;
    currentId = id;
    Object.keys(navLinks).forEach(function (key) {
      navLinks[key].classList.toggle('is-active', key === id);
    });
  }

  var NAV_H = 60; // keep in sync with --nav-h in style.css

  function syncActive() {
    if (!sections.length) return;

    var y = window.scrollY + NAV_H + 1;
    var active = sections[0].id;

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= y) active = sections[i].id;
    }

    // At the very bottom the last section may be too short to reach the
    // line, so pin it explicitly.
    if (window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1].id;
    }

    setActive(active);
  }

  // One passive listener drives both the sticky shadow and the spy. The
  // work is a loop over five sections, which is far too cheap to be worth
  // throttling (and rAF is throttled to a stop in background tabs, which
  // would leave the highlight stale when the user comes back).
  var onScrollShared = function () {
    onScroll();
    syncActive();
    syncReveal();
  };

  onScrollShared();
  window.addEventListener('scroll', onScrollShared, { passive: true });
  window.addEventListener('resize', onScrollShared, { passive: true });
  window.addEventListener('load', onScrollShared, { once: true });

  /* ---------- Smooth scroll (with nav offset) ----------
     CSS `scroll-padding-top` already handles this in modern browsers;
     this block is the fallback for anything that ignores it. */
  var supportsScrollBehavior =
    'scrollBehavior' in document.documentElement.style;

  if (!supportsScrollBehavior || reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start'
        });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  /* ---------- Scroll reveal ----------
     Driven from the same scroll pass as the spy. Each element is measured
     once against the viewport and then dropped from the list, so the work
     is a handful of getBoundingClientRect calls that shrinks to zero as
     the user scrolls. */
  var revealables = [];
  if (!reduceMotion) {
    revealables = Array.prototype.slice.call(
      document.querySelectorAll('.reveal:not(.is-in)')
    );
    // Stagger within a row of cards, capped so nothing feels slow.
    revealables.forEach(function (el, i) {
      el.dataset.delay = String((i % 3) * 70);
    });
    if (!revealables.length) revealables = null;
  } else {
    Array.prototype.forEach.call(
      document.querySelectorAll('.reveal'),
      function (el) { el.classList.add('is-in'); }
    );
  }

  var contactSection = document.getElementById('contact');

  function syncReveal() {
    if (contactSection && contactSection.offsetTop <=
        window.scrollY + window.innerHeight) {
      startCmd();
    }

    if (!revealables || !revealables.length) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;

    for (var i = revealables.length - 1; i >= 0; i--) {
      var el = revealables[i];
      if (el.getBoundingClientRect().top > vh - 24) continue;

      revealables.splice(i, 1);
      (function (node) {
        var delay = Number(node.dataset.delay || 0);
        if (delay) setTimeout(function () { node.classList.add('is-in'); }, delay);
        else node.classList.add('is-in');
      })(el);
    }
  }

  /* ---------- Typing effects ---------- */
  function type(el, text, speed, done) {
    if (!el) { if (done) done(); return; }
    if (reduceMotion) { el.textContent = text; if (done) done(); return; }

    var i = 0;
    (function step() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, speed);
      else if (done) done();
    })();
  }

  var bootLine = document.getElementById('bootLine');
  type(bootLine, 'whoami', 60, function () {
    type(bootLine, 'cat index.html', 45);
  });

  var cmdLine = document.getElementById('cmdLine');
  var cmdStarted = false;

  // Starts when the contact section is scrolled into view, so the typing is
  // not wasted on a page the visitor never reaches.
  function startCmd() {
    if (cmdStarted || !cmdLine) return;
    cmdStarted = true;
    type(cmdLine, 'echo "let\'s talk" && contact --me', 28);
  }
})();

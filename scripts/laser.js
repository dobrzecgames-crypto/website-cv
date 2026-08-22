/* ===========================================================================
   HERO narrative state

   intact -> scanning -> measuring -> dealing -> revealed

   CSS owns the look and the deterministic landing maps. JavaScript owns the
   semantic state, asset readiness and the measured flight origin: every card
   starts at the centre of the real Station image, regardless of breakpoint.
   ========================================================================== */

(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var trigger = document.getElementById('laserIt');
  var station = document.getElementById('stationMedia');
  var deck = document.getElementById('capabilityCards');
  var status = document.getElementById('heroStatus');
  var scrollCue = document.getElementById('scrollCue');
  if (!stage || !trigger || !station || !deck || !scrollCue) return;

  var cards = Array.prototype.slice.call(deck.querySelectorAll('.capability'));
  var images = Array.prototype.slice.call(deck.querySelectorAll('img[data-src]'));
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var busy = false;
  var keyboardActivation = false;
  var cardLoadPromise = null;

  function wait(ms) {
    return new Promise(function (resolve) { window.setTimeout(resolve, ms); });
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function setState(name) {
    stage.dataset.state = name;
  }

  function setBusy(value) {
    busy = value;
    trigger.setAttribute('aria-disabled', value ? 'true' : 'false');
  }

  function loadImage(image) {
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
    if (image.decode) return image.decode().catch(function () {});
    if (image.complete) return Promise.resolve();
    return new Promise(function (resolve) {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  function prepareCards() {
    if (!cardLoadPromise) cardLoadPromise = Promise.all(images.map(loadImage));
    return cardLoadPromise;
  }

  function scheduleCards() {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(prepareCards, { timeout: 2200 });
    } else {
      window.setTimeout(prepareCards, 900);
    }
  }

  if (document.readyState === 'complete') scheduleCards();
  else window.addEventListener('load', scheduleCards, { once: true });
  trigger.addEventListener('pointerenter', prepareCards, { once: true });
  trigger.addEventListener('focus', prepareCards, { once: true });

  /* Measure with each card already in its breakpoint-specific final grid cell.
     The calculated offsets make its first animation frame coincide with the
     centre of Station, so the reveal reads as one source producing many real
     capabilities rather than unrelated screenshots fading in. */
  function measureFlights() {
    var sourceRect = station.getBoundingClientRect();
    var sourceX = sourceRect.left + sourceRect.width / 2;
    var sourceY = sourceRect.top + sourceRect.height / 2;

    cards.forEach(function (card) {
      var cardRect = card.getBoundingClientRect();
      var fromX = sourceX - (cardRect.left + cardRect.width / 2);
      var fromY = sourceY - (cardRect.top + cardRect.height / 2);
      var style = window.getComputedStyle(card);
      var bendX = parseFloat(style.getPropertyValue('--bend-x')) || 0;
      var bendY = parseFloat(style.getPropertyValue('--bend-y')) || 0;

      card.style.setProperty('--from-x', fromX.toFixed(2) + 'px');
      card.style.setProperty('--from-y', fromY.toFixed(2) + 'px');
      card.style.setProperty('--mid-x', (fromX * .28 + bendX).toFixed(2) + 'px');
      card.style.setProperty('--mid-y', (fromY * .28 + bendY).toFixed(2) + 'px');
    });
  }

  function revealContinue() {
    scrollCue.setAttribute('aria-hidden', 'false');
    scrollCue.removeAttribute('tabindex');
    trigger.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('tabindex', '-1');
    trigger.setAttribute('aria-disabled', 'true');
    status.textContent = 'Station revealed: Laser, Pads, four synthesizers, Seq, Song and Mix.';
    busy = false;
    if (keyboardActivation) scrollCue.focus({ preventScroll: true });
  }

  async function reveal(event) {
    if (busy || stage.dataset.state !== 'intact') return;
    keyboardActivation = Boolean(event && event.detail === 0);
    trigger.blur();
    setBusy(true);
    status.textContent = 'Laser scanning Station.';

    var assetsReady = prepareCards();

    if (reducedMotion.matches) {
      await assetsReady;
      stage.classList.add('is-cut');
      setState('measuring');
      measureFlights();
      deck.setAttribute('aria-hidden', 'false');
      setState('revealed');
      revealContinue();
      return;
    }

    setState('scanning');
    await wait(500);
    stage.classList.add('is-cut');
    await wait(92);
    stage.classList.add('is-flash');
    await wait(180);
    stage.classList.remove('is-flash');
    await assetsReady;

    setState('measuring');
    measureFlights();
    deck.setAttribute('aria-hidden', 'false');
    status.textContent = 'Station is opening its capabilities.';
    await nextFrame();
    setState('dealing');

    /* Last launch is at 768ms and its flight is 560ms. The small hold lets the
       final card visibly settle before the continuation control arrives. */
    await wait(1480);
    setState('revealed');
    revealContinue();
  }

  trigger.addEventListener('click', reveal);

  scrollCue.addEventListener('click', function () {
    stage.classList.add('is-cue-used');
  });

  /* GRID_BIBLE.md debug contract: Shift+G (or ?grid) shows twelve columns,
     the 16px lattice, the centre seam and the 56px rails. */
  if (new URLSearchParams(window.location.search).has('grid')) {
    document.documentElement.classList.add('show-hero-grid');
  }
  window.addEventListener('keydown', function (event) {
    if (event.shiftKey && event.key.toLowerCase() === 'g') {
      document.documentElement.classList.toggle('show-hero-grid');
    }
  });
}());

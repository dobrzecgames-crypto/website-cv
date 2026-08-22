/* ===========================================================================
   LASER IT — one machine, one six-module slot, one cut.

     intact -> arming -> slicing -> dealing -> released
                                                |
                                           closing -> intact

   CSS owns all geometry, every trajectory and the crop each module is
   released at. JS owns only narrative state and the clock.

   Every departing module is the exact node that filled the central slot, so
   revealing the next one is a consequence of the motion rather than a
   screenshot swap or a duplicate appearing elsewhere. The chassis closes over
   its own emptied bay on its own beat, once the last module is clear of it —
   which is why 'released' is entered before the last flight has finished.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var trigger = document.getElementById('laserIt');
  var deck = document.getElementById('deck');
  if (!stage || !trigger || !deck) return;

  var cards = Array.prototype.slice.call(deck.querySelectorAll('.plate'));
  var label = document.getElementById('triggerLabel');
  var meta = document.getElementById('triggerMeta');
  var readout = document.getElementById('readoutText');
  var hint = document.getElementById('hint');
  var calmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  var flags = new URLSearchParams(window.location.search);
  var frozen = flags.get('motion') === 'off';
  var forcedMotion = flags.get('motion') === 'on';
  var audit = flags.get('audit') !== null ? [] : null;
  var runStart = 0;
  if (frozen) root.classList.add('no-motion');
  if (forcedMotion) root.classList.add('force-motion');
  if (audit) stage.dataset.audit = '[]';
  function calm() { return frozen || (!forcedMotion && calmQuery.matches); }

  function mark(event, mode) {
    if (!audit) return;
    audit.push({ event: event, mode: mode || null, at: Math.round(performance.now() - runStart) });
    stage.dataset.audit = JSON.stringify(audit);
  }

  /* Six launches inside 475ms, after a 160ms prelude. The chassis starts
     closing 90ms after the last module clears it and takes 380ms, so the
     scene resolves at 1105ms and the cue follows 160ms after that.
     GRID_BIBLE.md section 11 is the contract these numbers answer to. */
  var CLOCK = {
    arm: 50,
    sweep: 110,
    interval: 95,
    close: 90,
    closing: 380,
    cueDelay: 160,
    restore: 300
  };

  var COPY = {
    intact: {
      readout: 'Source loaded · 1 slice',
      label: 'Laser it',
      meta: 'cut 6',
      hint: 'One pass. Six modules, all held in the same central slot.'
    },
    cutting: {
      readout: 'Cutting',
      label: 'Cutting',
      meta: '···',
      hint: ''
    },
    dealing: {
      readout: 'Opening · 6 modules',
      label: 'Opening',
      meta: 'bach · bach',
      hint: ''
    },
    released: {
      readout: '6 modules · chassis closed',
      label: 'Close it',
      meta: 'put it back',
      hint: 'Six modules left one machine. What is left of it is the surface that names them.'
    }
  };

  function say(key) {
    var copy = COPY[key];
    if (!copy) return;
    readout.textContent = copy.readout;
    label.textContent = copy.label;
    meta.textContent = copy.meta;
    hint.textContent = copy.hint;
  }

  var timers = [];
  function at(ms, fn) { timers.push(window.setTimeout(fn, ms)); }
  function cancelPending() {
    for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
    timers = [];
  }

  var busy = false;
  function setBusy(value) {
    busy = value;
    trigger.setAttribute('aria-disabled', value ? 'true' : 'false');
  }
  function state(name) { stage.dataset.state = name; }

  /* Load the five cards under LASER before they are needed. They are small
     derived WebP assets; intent is the safety net for an immediate click. */
  var deckReady = false;
  var deckUrls = ['pads', 'synth', 'seq', 'song', 'mix'].map(function (mode) {
    return 'media/station/final/station-mode-' + mode + '.webp';
  });
  function readyDeck() {
    if (deckReady) return;
    deckReady = true;
    root.classList.add('deck-ready');
    deckUrls.forEach(function (src) { var image = new Image(); image.src = src; });
  }
  function scheduleDeck() {
    if (window.requestIdleCallback) window.requestIdleCallback(readyDeck, { timeout: 1600 });
    else window.setTimeout(readyDeck, 700);
  }
  if (document.readyState === 'complete') scheduleDeck();
  else window.addEventListener('load', scheduleDeck, { once: true });
  trigger.addEventListener('pointerenter', readyDeck, { once: true });
  trigger.addEventListener('focus', readyDeck, { once: true });

  function milliseconds(card) {
    var value = getComputedStyle(card).getPropertyValue('--flight').trim();
    return value.slice(-2) === 'ms' ? parseFloat(value) : parseFloat(value) * 1000;
  }

  function clearCard(card) {
    card.classList.remove('is-launching', 'is-landed', 'is-returning');
  }
  function resetCards() {
    cards.forEach(clearCard);
    deck.setAttribute('aria-hidden', 'true');
  }
  function land(card) {
    card.classList.remove('is-launching', 'is-returning');
    card.classList.add('is-landed');
  }
  function landAll() {
    cards.forEach(land);
    deck.removeAttribute('aria-hidden');
  }

  function finishDeal() {
    landAll();
    say('released');
    setBusy(false);
    mark('settled');
    at(CLOCK.cueDelay, function () {
      stage.classList.add('is-cue-ready');
      mark('cue');
    });
  }

  function startDeal() {
    state('dealing');
    say('dealing');
    deck.removeAttribute('aria-hidden');
    mark('deal-start');

    var lastLaunch = 0;
    var lastSettle = 0;
    cards.forEach(function (card, index) {
      var launch = index * CLOCK.interval;
      var flight = milliseconds(card);
      var settle = launch + flight;
      lastLaunch = Math.max(lastLaunch, launch);
      lastSettle = Math.max(lastSettle, settle);
      at(launch, function () {
        card.classList.add('is-launching');
        mark('launch', card.dataset.mode);
      });
      at(settle, function () {
        land(card);
        mark('land', card.dataset.mode);
      });
    });

    /* The machine closes on its own beat, not as an afterthought once every
       module has settled: by the time MIX is clear of the slot there is
       nothing left in it, and a chassis that waited would read as a hole. */
    var closed = lastLaunch + CLOCK.close;
    at(closed, function () {
      state('released');
      mark('chassis-close');
    });
    at(Math.max(lastSettle, closed + CLOCK.closing), finishDeal);
  }

  function cut() {
    cancelPending();
    if (audit) {
      audit = [];
      runStart = performance.now();
      mark('click');
    }
    readyDeck();
    resetCards();
    stage.classList.remove('is-cue-ready', 'is-flash');
    setBusy(true);

    if (calm()) {
      landAll();
      state('released');
      say('released');
      setBusy(false);
      stage.classList.add('is-cue-ready');
      mark('reduced-final');
      return;
    }

    say('cutting');
    state('arming');
    at(CLOCK.arm, function () { state('slicing'); });
    at(CLOCK.arm + CLOCK.sweep, function () {
      stage.classList.add('is-flash');
      startDeal();
      at(70, function () { stage.classList.remove('is-flash'); });
    });
  }

  function restore() {
    cancelPending();
    stage.classList.remove('is-cue-ready', 'is-flash');
    setBusy(true);
    state('closing');

    if (calm()) {
      resetCards();
      state('intact');
      say('intact');
      setBusy(false);
      return;
    }

    cards.forEach(function (card) {
      card.classList.remove('is-launching', 'is-landed');
      card.classList.add('is-returning');
    });
    at(CLOCK.restore, function () {
      resetCards();
      state('intact');
      say('intact');
      setBusy(false);
    });
  }

  trigger.addEventListener('click', function () {
    if (busy) return;
    if (stage.dataset.state === 'released' || stage.dataset.state === 'closing') restore();
    else cut();
  });

  var onCalmChange = function () {
    if (!calmQuery.matches || !busy) return;
    cancelPending();
    stage.classList.remove('is-flash');
    landAll();
    state('released');
    say('released');
    setBusy(false);
    stage.classList.add('is-cue-ready');
  };
  if (calmQuery.addEventListener) calmQuery.addEventListener('change', onCalmChange);
  else if (calmQuery.addListener) calmQuery.addListener(onCalmChange);

  deck.setAttribute('aria-hidden', 'true');
  var wanted = flags.get('state');
  if (wanted === 'released') {
    readyDeck();
    landAll();
    state('released');
    say('released');
    stage.classList.add('is-cue-ready');
  } else {
    resetCards();
    state('intact');
    say('intact');
  }
}());

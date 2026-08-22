/* ===========================================================================
   LASER IT — one machine, one cut, fourteen cards on the table.

     intact -> arming -> slicing -> dealing -> released
                                                 |
                                            closing -> intact

   CSS owns all geometry: where every card lands, how big it is, and the arc it
   takes. JS owns narrative state and the clock, nothing else.

   The deal is deliberately faster than a card can be read. Nobody is meant to
   study the table on the way past — the impression to leave is how much came
   out of one object, and that only lands if it happens at once.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var trigger = document.getElementById('laserIt');
  var deck = document.getElementById('deck');
  if (!stage || !trigger || !deck) return;

  var cards = Array.prototype.slice.call(deck.querySelectorAll('.card'));
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

  function mark(event, card) {
    if (!audit) return;
    audit.push({ event: event, card: card || null, at: Math.round(performance.now() - runStart) });
    stage.dataset.audit = JSON.stringify(audit);
  }

  /* Fourteen launches inside 500ms after a 160ms prelude, flights of 320-400ms.
     The table is complete a touch under a second after the flash; the cue
     follows 160ms behind the last card. GRID_BIBLE.md section 11. */
  var CLOCK = {
    arm: 50,
    sweep: 110,
    interval: 38,
    cueDelay: 160,
    restore: 300
  };

  var COPY = {
    intact: {
      readout: 'Source loaded · 1 slice',
      label: 'Laser it',
      meta: 'open it up',
      hint: 'One instrument. Cut it open and see what it is holding.'
    },
    cutting: { readout: 'Cutting', label: 'Cutting', meta: '···', hint: '' },
    dealing: { readout: 'Dealing', label: 'Dealing', meta: 'bach · bach · bach', hint: '' },
    released: {
      readout: '14 cards · one machine',
      label: 'Put it back',
      meta: 'close it up',
      hint: 'Every one of these came out of the same tab.'
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

  /* The cards are worth 156 KB between them and none of them is on screen
     before the click, so they are fetched at idle — or the moment the pointer
     reaches the trigger, which is the safety net for an immediate press. */
  var deckReady = false;
  function readyDeck() {
    if (deckReady) return;
    deckReady = true;
    root.classList.add('deck-ready');
    cards.forEach(function (card) {
      var image = new Image();
      image.src = 'media/station/cards/' + card.dataset.card + '.webp';
    });
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

  function clearCard(card) { card.classList.remove('is-out', 'is-landed', 'is-back'); }
  function land(card) {
    card.classList.remove('is-out', 'is-back');
    card.classList.add('is-landed');
  }
  function resetCards() {
    cards.forEach(clearCard);
    deck.setAttribute('aria-hidden', 'true');
  }
  function landAll() {
    cards.forEach(land);
    deck.removeAttribute('aria-hidden');
  }

  function finishDeal() {
    landAll();
    state('released');
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

    var last = 0;
    cards.forEach(function (card) {
      var order = parseInt(card.style.getPropertyValue('--n'), 10) || 0;
      var launch = order * CLOCK.interval;
      var settle = launch + milliseconds(card);
      last = Math.max(last, settle);
      at(launch, function () {
        card.classList.add('is-out');
        mark('deal', card.dataset.card);
      });
      at(settle, function () { land(card); });
    });
    at(last, finishDeal);
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
      card.classList.remove('is-out', 'is-landed');
      card.classList.add('is-back');
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
  if (flags.get('state') === 'released') {
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

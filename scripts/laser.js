/* ==========================================================================
   LASER IT — the one interaction on this scene.

   The JavaScript does two things: it moves the scene between named narrative
   states, and it decides when the five hidden mode plates are worth fetching.
   CSS owns every pixel of the result.

       intact -> arming -> slicing -> sliced -> released
                                                   |
                                            closing -> intact

   One pass opens the whole machine. The chassis closes back into a shell and
   steps away; the core closes back into one plate and then deals itself out
   alongside the five states that were lying underneath it the whole time.

   Timings below mirror the custom properties in styles/site.css. Keep them in
   step if either side changes.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var trigger = document.getElementById('laserIt');
  if (!stage || !trigger) return;

  var label = document.getElementById('triggerLabel');
  var meta = document.getElementById('triggerMeta');
  var readout = document.getElementById('readoutText');
  var hint = document.getElementById('hint');

  var calmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- timeline --------------------------------------------------------- */

  var MOVED = {
    arm: 140,          /* brackets acquire the object */
    sweep: 620,        /* the beam travels it, cuts igniting as it passes */
    flashHold: 40,     /* the layers start moving inside the flash */
    flashClear: 300,
    open: 350,         /* how long the eight layers get on their own */
    restore: 620
  };
  var CALM = { arm: 0, sweep: 0, flashHold: 0, flashClear: 0, open: 0, restore: 200 };

  /* --- copy per state --------------------------------------------------- */

  var COPY = {
    intact: {
      readout: 'Source loaded · 1 slice',
      label: 'Laser it',
      meta: 'cut 8',
      hint: 'One pass. Eight layers, and everything the tabs were keeping out of sight.'
    },
    cutting: {
      readout: 'Cutting',
      label: 'Cutting',
      meta: '···',
      hint: ''
    },
    released: {
      readout: '6 modes · one chassis',
      label: 'Restore',
      meta: 'close up',
      hint: 'Every mode came out of the same place under the tabs. Pads is nearest.'
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

  /* --- plumbing --------------------------------------------------------- */

  var timers = [];
  function at(ms, fn) { timers.push(window.setTimeout(fn, ms)); }
  function cancelPending() {
    for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
    timers = [];
  }

  var busy = false;
  function setBusy(value) {
    busy = value;
    /* aria-disabled rather than disabled: a disabled button drops keyboard
       focus mid-interaction, which is worse than a button that is briefly inert */
    trigger.setAttribute('aria-disabled', value ? 'true' : 'false');
  }

  function state(name) { stage.dataset.state = name; }

  /* --- the five hidden states ------------------------------------------
     They are not part of the first paint. Marking the document ready is what
     gives them their background-image, and therefore what fetches them. Idle
     time is the normal path; the first sign of intent is the safety net. */

  var deckReady = false;
  function readyDeck() {
    if (deckReady) return;
    deckReady = true;
    root.classList.add('deck-ready');
  }

  function scheduleDeck() {
    if (window.requestIdleCallback) window.requestIdleCallback(readyDeck, { timeout: 2500 });
    else window.setTimeout(readyDeck, 1200);
  }
  if (document.readyState === 'complete') scheduleDeck();
  else window.addEventListener('load', scheduleDeck, { once: true });

  trigger.addEventListener('pointerenter', readyDeck, { once: true });
  trigger.addEventListener('focus', readyDeck, { once: true });

  /* --- the cut ---------------------------------------------------------- */

  function cut() {
    readyDeck();
    setBusy(true);

    if (calmQuery.matches) {
      /* no travelling beam, no flash, no fan-out: the same arrangement,
         arrived at directly */
      say('released');
      state('released');
      setBusy(false);
      return;
    }

    var t = MOVED;
    say('cutting');
    state('arming');

    at(t.arm, function () { state('slicing'); });
    at(t.arm + t.sweep, function () { stage.classList.add('is-flash'); });
    at(t.arm + t.sweep + t.flashHold, function () { state('sliced'); });
    at(t.arm + t.sweep + t.flashClear, function () { stage.classList.remove('is-flash'); });

    /* the eight layers get a moment to read as eight layers, then the core
       closes up and everything it was hiding comes out of it */
    at(t.arm + t.sweep + t.flashHold + t.open, function () {
      state('released');
      say('released');
      setBusy(false);
    });
  }

  function restore() {
    var t = calmQuery.matches ? CALM : MOVED;
    setBusy(true);
    cancelPending();
    stage.classList.remove('is-flash');

    /* closing holds exactly the same geometry as released but without the
       animations, so the next frame can transition out of it instead of
       snapping when the animations are dropped */
    state('closing');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        state('intact');
        say('intact');
        at(t.restore, function () { setBusy(false); });
      });
    });
  }

  trigger.addEventListener('click', function () {
    if (busy) return;
    cancelPending();
    if (stage.dataset.state === 'released' || stage.dataset.state === 'closing') restore();
    else cut();
  });

  /* if the motion preference flips mid-scene, settle immediately into the
     final arrangement rather than finishing motion the user opted out of */
  var onCalmChange = function () {
    if (!calmQuery.matches || !busy) return;
    cancelPending();
    stage.classList.remove('is-flash');
    state('released');
    say('released');
    setBusy(false);
  };
  if (calmQuery.addEventListener) calmQuery.addEventListener('change', onCalmChange);
  else if (calmQuery.addListener) calmQuery.addListener(onCalmChange);
}());

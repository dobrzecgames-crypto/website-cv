/* ==========================================================================
   LASER IT — the one interaction on this scene.

   The JavaScript does exactly one thing: it moves the scene between four
   named narrative states and lets CSS own every pixel of the result.

       intact -> arming -> slicing -> sliced        (and back to intact)

   Timings below mirror the custom properties in styles/site.css. Keep them
   in step if either side changes.
   ========================================================================== */

(function () {
  'use strict';

  var stage = document.getElementById('stage');
  var trigger = document.getElementById('laserIt');
  if (!stage || !trigger) return;

  var label = document.getElementById('triggerLabel');
  var meta = document.getElementById('triggerMeta');
  var readout = document.getElementById('readoutText');
  var hint = document.getElementById('hint');

  var calmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- timeline --------------------------------------------------------- */

  var MOVED = { arm: 140, sweep: 620, flashHold: 40, flashClear: 300, restore: 560 };
  var CALM  = { arm: 0, sweep: 0, flashHold: 0, flashClear: 0, restore: 200 };

  /* --- copy per state --------------------------------------------------- */

  var COPY = {
    intact: {
      readout: 'Source loaded · 1 slice',
      label: 'Laser it',
      meta: 'cut 8',
      hint: 'One pass. Eight layers. Station opens along its own seams.'
    },
    arming: {
      readout: 'Laser armed · cut 8',
      label: 'Cutting',
      meta: '···',
      hint: ''
    },
    slicing: {
      readout: 'Cutting',
      label: 'Cutting',
      meta: '···',
      hint: ''
    },
    sliced: {
      readout: '8 layers · pads 01–08 ready',
      label: 'Restore',
      meta: 'undo cut',
      hint: "Cut on Station’s own module seams. Layer 08 is where PADS begins."
    }
  };

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

  function setState(name) {
    stage.dataset.state = name;
    var copy = COPY[name];
    if (!copy) return;
    readout.textContent = copy.readout;
    label.textContent = copy.label;
    meta.textContent = copy.meta;
    hint.textContent = copy.hint;
  }

  /* --- the cut ---------------------------------------------------------- */

  function cut() {
    var t = calmQuery.matches ? CALM : MOVED;
    setBusy(true);

    if (calmQuery.matches) {
      /* no travelling beam, no flash: the same consequence, arrived at directly */
      setState('sliced');
      setBusy(false);
      return;
    }

    setState('arming');
    at(t.arm, function () { setState('slicing'); });
    at(t.arm + t.sweep, function () { stage.classList.add('is-flash'); });
    at(t.arm + t.sweep + t.flashHold, function () {
      setState('sliced');
      setBusy(false);
    });
    at(t.arm + t.sweep + t.flashClear, function () {
      stage.classList.remove('is-flash');
    });
  }

  function restore() {
    var t = calmQuery.matches ? CALM : MOVED;
    setBusy(true);
    stage.classList.remove('is-flash');
    setState('intact');
    at(t.restore, function () { setBusy(false); });
  }

  trigger.addEventListener('click', function () {
    if (busy) return;
    cancelPending();
    if (stage.dataset.state === 'sliced') restore();
    else cut();
  });

  /* if the motion preference flips mid-scene, settle immediately into the
     current state rather than finishing an animation the user opted out of */
  var onCalmChange = function () {
    if (!calmQuery.matches || !busy) return;
    cancelPending();
    stage.classList.remove('is-flash');
    setState('sliced');
    setBusy(false);
  };
  if (calmQuery.addEventListener) calmQuery.addEventListener('change', onCalmChange);
  else if (calmQuery.addListener) calmQuery.addListener(onCalmChange);
}());

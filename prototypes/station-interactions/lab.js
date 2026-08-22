/*
  Station Micro-Interaction Lab

  This file deliberately contains presentation feedback only. There is no
  audio graph, sample model, pattern engine, persistence or product state.
*/

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tabs = Array.from(document.querySelectorAll('.lab-tab'));
  var panels = Array.from(document.querySelectorAll('.experiment'));
  var activePanel = 'pads';

  /* ----------------------------------------------------------------------
     LAB NAVIGATION
     ------------------------------------------------------------------- */

  function selectPanel(id, focus) {
    if (!document.getElementById(id)) return;
    activePanel = id;

    tabs.forEach(function (tab) {
      var selected = tab.dataset.target === id;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    panels.forEach(function (panel) {
      var selected = panel.id === id;
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + id);
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectPanel(tab.dataset.target, false); });
    tab.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      selectPanel(tabs[next].dataset.target, true);
    });
  });

  var requestedPanel = window.location.hash.slice(1);
  if (panels.some(function (panel) { return panel.id === requestedPanel; })) {
    selectPanel(requestedPanel, false);
  }

  /* ----------------------------------------------------------------------
     PADS — momentary physical state, shared by pointer and keyboard.
     ------------------------------------------------------------------- */

  var touchReleaseSlop = 18;
  var penReleaseSlop = 8;

  function pointerReleaseSlop(pointerType) {
    if (pointerType === 'touch') return touchReleaseSlop;
    if (pointerType === 'pen') return penReleaseSlop;
    return 0;
  }

  function isOutsidePad(bounds, clientX, clientY, slop) {
    return clientX < bounds.left - slop
      || clientX > bounds.right + slop
      || clientY < bounds.top - slop
      || clientY > bounds.bottom + slop;
  }

  Array.from(document.querySelectorAll('.rubber-pad')).forEach(function (pad) {
    var pointerReleaseSlops = new Map();
    var activationKey = null;

    function syncPressedState() {
      pad.dataset.pressed = String(pointerReleaseSlops.size > 0 || activationKey !== null);
    }

    function releasePointer(pointerId) {
      if (!pointerReleaseSlops.delete(pointerId)) return;
      syncPressedState();
    }

    function releaseAllPointers() {
      if (pointerReleaseSlops.size === 0) return;
      pointerReleaseSlops.clear();
      syncPressedState();
    }

    function releaseActivationKey() {
      if (activationKey === null) return;
      activationKey = null;
      syncPressedState();
    }

    pad.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      pad.setPointerCapture(event.pointerId);
      pointerReleaseSlops.set(event.pointerId, pointerReleaseSlop(event.pointerType));
      syncPressedState();
    });

    pad.addEventListener('pointermove', function (event) {
      var slop = pointerReleaseSlops.get(event.pointerId);
      if (slop === undefined) return;
      if (isOutsidePad(pad.getBoundingClientRect(), event.clientX, event.clientY, slop)) {
        releasePointer(event.pointerId);
      }
    });

    pad.addEventListener('pointerup', function (event) { releasePointer(event.pointerId); });
    pad.addEventListener('pointercancel', function (event) { releasePointer(event.pointerId); });
    pad.addEventListener('lostpointercapture', function (event) { releasePointer(event.pointerId); });

    window.addEventListener('pointerup', function (event) { releasePointer(event.pointerId); }, true);
    window.addEventListener('pointercancel', function (event) { releasePointer(event.pointerId); }, true);
    window.addEventListener('pointermove', function (event) {
      var slop = pointerReleaseSlops.get(event.pointerId);
      if (slop === undefined) return;
      if (isOutsidePad(pad.getBoundingClientRect(), event.clientX, event.clientY, slop)) {
        releasePointer(event.pointerId);
      }
    }, true);

    pad.addEventListener('keydown', function (event) {
      if ((event.key !== ' ' && event.key !== 'Enter') || event.repeat || activationKey !== null) return;
      event.preventDefault();
      activationKey = event.key;
      syncPressedState();
    });

    pad.addEventListener('keyup', function (event) {
      if (event.key !== activationKey) return;
      event.preventDefault();
      releaseActivationKey();
    });

    pad.addEventListener('blur', releaseActivationKey);
    window.addEventListener('blur', releaseAllPointers);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') releaseAllPointers();
    });
  });

  /* ----------------------------------------------------------------------
     ZOLA-X — the current Station PolyWorkspace, reduced to visual feedback.
     Wavetable generation, interpolation and drag response mirror Station.
     ------------------------------------------------------------------- */

  var zolaDisplaySvg = document.getElementById('zolaDisplaySvg');
  var zolaDisplayLabel = document.getElementById('zolaDisplayLabel');
  var zolaDisplayValue = document.getElementById('zolaDisplayValue');
  var zolaPrimaryControl = document.getElementById('zolaPrimaryControl');
  var zolaControlLegend = document.getElementById('zolaControlLegend');
  var zolaControlValue = document.getElementById('zolaControlValue');
  var zolaPage = 'osc';
  var zolaDisplayKind = '';
  var zolaTrailPaths = [];
  var zolaTrailHistory = [];
  var zolaTrailTicks = 0;
  var zolaTrailStamp = 0;
  var zolaCurrentPath = '';
  var zolaGeneratedFrames = {};
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var zolaOscillator = {
    label: 'OSC 1',
    tableLabel: 'BLOOM',
    position: .28,
    definition: { id: 'soft-bloom', slope: 2.05, odd: 1, even: .8, formant: 2.1, phase: .3, motion: .7, seed: 13 }
  };

  var zolaFilter = { mode: 'LP24', cutoffHz: 4800, resonance: 1.1 };
  var zolaEnvelope = { label: 'AMP ENVELOPE', attack: .018, decay: .42, sustain: .78, release: .72 };
  var zolaLfo = { label: 'LFO 1', shape: 'sine', phase: 0 };

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function hash01(seed) {
    var value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function harmonicAmplitude(definition, harmonic, morph) {
    var parity = harmonic % 2 === 1 ? definition.odd : definition.even;
    var center = 1 + definition.formant * (.35 + .65 * morph);
    var formant = .38 + .62 * Math.exp(-Math.pow(Math.log2(Math.max(1, harmonic) / center), 2) / .7);
    var ripple = .68 + .32 * Math.sin(harmonic * (.47 + definition.seed * .013) + morph * Math.PI * 2 * definition.motion);
    var movingNotch = 1 - .72 * Math.exp(-Math.pow(harmonic - (2 + morph * definition.formant), 2) / Math.max(2, definition.formant * .45));
    return parity * formant * ripple * movingNotch / Math.pow(harmonic, definition.slope);
  }

  function harmonicPhase(definition, harmonic, morph) {
    var random = hash01(definition.seed * 131 + harmonic * 17);
    return (random - .5) * definition.phase + morph * definition.motion * Math.sin(harmonic * .37 + definition.seed);
  }

  function generateWavetableFrames(definition) {
    if (zolaGeneratedFrames[definition.id]) return zolaGeneratedFrames[definition.id];

    var frames = [];
    var frameCount = 16;
    var sampleCount = 512;

    for (var frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      var morph = frameIndex / (frameCount - 1);
      var samples = new Float32Array(sampleCount);

      for (var harmonic = 1; harmonic <= 128; harmonic += 1) {
        var amplitude = harmonicAmplitude(definition, harmonic, morph);
        if (Math.abs(amplitude) < 1e-7) continue;
        var phase = harmonicPhase(definition, harmonic, morph);
        for (var sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
          samples[sampleIndex] += amplitude * Math.sin(Math.PI * 2 * harmonic * sampleIndex / sampleCount + phase);
        }
      }

      var peak = 0;
      samples.forEach(function (sample) { peak = Math.max(peak, Math.abs(sample)); });
      var scale = peak > 0 ? .92 / peak : 1;
      for (var index = 0; index < samples.length; index += 1) samples[index] *= scale;
      frames.push(samples);
    }

    zolaGeneratedFrames[definition.id] = frames;
    return frames;
  }

  function interpolateWavetablePosition(definition, position, sampleIndex) {
    var frames = generateWavetableFrames(definition);
    var bounded = clamp(position, 0, 1) * (frames.length - 1);
    var first = Math.floor(bounded);
    var second = Math.min(frames.length - 1, first + 1);
    var mix = bounded - first;
    return frames[first][sampleIndex] + (frames[second][sampleIndex] - frames[first][sampleIndex]) * mix;
  }

  function wavetablePath(definition, position) {
    var frames = generateWavetableFrames(definition);
    var lastSample = frames[0].length - 1;
    var originX = 50;
    var width = 540;
    var baseline = 106;
    var amplitude = 38;
    var pointCount = 120;
    var commands = [];

    for (var point = 0; point < pointCount; point += 1) {
      var normalized = point / (pointCount - 1);
      var sampleIndex = Math.round(normalized * lastSample);
      var x = originX + normalized * width;
      var sample = clamp(interpolateWavetablePosition(definition, position, sampleIndex), -1, 1);
      var y = baseline - sample * amplitude;
      commands.push((point === 0 ? 'M' : 'L') + ' ' + x.toFixed(2) + ' ' + y.toFixed(2));
    }

    return commands.join(' ');
  }

  function svgNode(tagName, attributes) {
    var node = document.createElementNS(SVG_NS, tagName);
    Object.keys(attributes || {}).forEach(function (name) {
      node.setAttribute(name, attributes[name]);
    });
    return node;
  }

  function clearZolaDisplay() {
    while (zolaDisplaySvg.firstChild) zolaDisplaySvg.removeChild(zolaDisplaySvg.firstChild);
    zolaTrailPaths = [];
    zolaTrailHistory = [];
    zolaDisplayKind = '';
  }

  function buildZolaTrail(path) {
    clearZolaDisplay();
    zolaDisplayKind = 'osc';
    zolaTrailHistory = new Array(12).fill(path);

    for (var index = 0; index < 12; index += 1) {
      var depth = 11 - index;
      var trace = svgNode('path', {
        d: path,
        transform: 'translate(' + (depth * 11) + ' ' + (-depth * 3) + ')',
        class: depth === 0 ? 'zx-wave-front' : 'zx-wave-history',
        opacity: depth === 0 ? '1' : Math.max(.08, .44 - depth * .033).toFixed(3),
        'data-zx-depth': depth
      });
      zolaDisplaySvg.appendChild(trace);
      zolaTrailPaths[depth] = trace;
    }
  }

  function updateZolaTrail(path, ripple) {
    if (zolaDisplayKind !== 'osc') buildZolaTrail(path);
    zolaCurrentPath = path;

    if (!ripple || reduceMotion.matches) {
      zolaTrailHistory = new Array(12).fill(path);
      zolaTrailPaths.forEach(function (trace) { trace.setAttribute('d', path); });
      zolaTrailTicks = 0;
      return;
    }

    zolaTrailHistory[0] = path;
    zolaTrailPaths[0].setAttribute('d', path);
    zolaTrailTicks = 12;
    zolaTrailStamp = 0;
  }

  function advanceZolaTrail(now) {
    if (!zolaTrailTicks || zolaDisplayKind !== 'osc') return;
    if (zolaTrailStamp && now - zolaTrailStamp < 33) return;
    zolaTrailStamp = now;
    zolaTrailHistory.unshift(zolaCurrentPath);
    zolaTrailHistory.length = 12;
    zolaTrailPaths.forEach(function (trace, depth) {
      trace.setAttribute('d', zolaTrailHistory[depth]);
    });
    zolaTrailTicks -= 1;
  }

  function makeStationPath(points, sample) {
    var commands = [];
    for (var index = 0; index < points; index += 1) {
      var ratio = index / (points - 1);
      var x = 10 + ratio * 620;
      var y = 90 - clamp(sample(ratio), -1, 1) * 78;
      commands.push((index === 0 ? 'M' : 'L') + ' ' + x.toFixed(2) + ' ' + y.toFixed(2));
    }
    return commands.join(' ');
  }

  function renderTechnicalTrace(path, ariaLabel) {
    clearZolaDisplay();
    zolaDisplayKind = 'trace';

    var grid = svgNode('g', { 'aria-hidden': 'true' });
    grid.appendChild(svgNode('rect', {
      class: 'zx-display-frame',
      x: 10,
      y: 12,
      width: 620,
      height: 156
    }));
    grid.appendChild(svgNode('path', {
      class: 'zx-display-grid zx-display-grid-major',
      d: 'M10 64H630M10 116H630M165 12V168M475 12V168'
    }));
    grid.appendChild(svgNode('path', {
      class: 'zx-display-axis',
      d: 'M10 90H630M320 12V168'
    }));
    zolaDisplaySvg.appendChild(grid);
    zolaDisplaySvg.appendChild(svgNode('path', {
      d: path,
      class: 'zx-signal-trace',
      role: 'img',
      'aria-label': ariaLabel
    }));
  }

  function filterResponse(mode, cutoffHz, resonance) {
    var cutoffRatio = Math.log(cutoffHz / 20) / Math.log(1000);
    var q = Math.max(.2, resonance / 4);
    return makeStationPath(180, function (ratio) {
      var relative = Math.pow(10, (ratio - cutoffRatio) * 3);
      var denominator = Math.sqrt(Math.pow(1 - relative * relative, 2) + Math.pow(relative / q, 2));
      var lowPass = 1 / Math.max(.12, denominator);
      var highPass = relative * relative / Math.max(.12, denominator);
      var bandPass = relative / Math.max(.12, denominator);
      var notch = Math.abs(1 - relative * relative) / Math.max(.12, denominator);
      var response = mode === 'LP12' ? Math.sqrt(lowPass)
        : mode === 'LP24' ? lowPass
          : mode === 'HP12' ? Math.sqrt(highPass)
            : mode === 'BP12' ? bandPass
              : notch;
      return clamp(response, 0, 1) * 1.7 - .85;
    });
  }

  function envelopeResponse(envelope) {
    var total = Math.max(.2, envelope.attack + envelope.decay + envelope.release);
    var attackX = Math.min(.34, .08 + envelope.attack / total * .36);
    var decayX = Math.min(.68, attackX + .1 + envelope.decay / total * .28);
    var releaseX = Math.max(.78, 1 - envelope.release / total * .18);
    var sustainY = 168 - envelope.sustain * 146;
    return 'M 10 168 L ' + (10 + attackX * 620) + ' 12 L ' + (10 + decayX * 620) + ' ' + sustainY + ' L ' + (10 + releaseX * 620) + ' ' + sustainY + ' L 630 168';
  }

  function lfoSample(shape, rawPhase) {
    var phase = ((rawPhase % 1) + 1) % 1;
    if (shape === 'sine') return Math.sin(phase * Math.PI * 2);
    if (shape === 'triangle') return 1 - 4 * Math.abs(phase - .5);
    return 0;
  }

  function lfoResponse(lfo) {
    return makeStationPath(180, function (ratio) {
      return lfoSample(lfo.shape, ratio + lfo.phase);
    });
  }

  function formatEnvelopeTime(seconds) {
    if (seconds < 1) return Math.round(seconds * 1000) + ' ms';
    return seconds.toFixed(2) + ' s';
  }

  function formatFrequency(hz) {
    if (hz >= 1000) return (hz / 1000).toFixed(2) + ' kHz';
    return Math.round(hz) + ' Hz';
  }

  function zolaControlConfig() {
    if (zolaPage === 'osc') {
      return {
        label: 'POSITION',
        value: zolaOscillator.position,
        format: function (value) { return Math.round(value * 100) + '%'; },
        apply: function (value) { zolaOscillator.position = value; }
      };
    }

    if (zolaPage === 'filter') {
      return {
        label: 'CUTOFF',
        value: Math.log(zolaFilter.cutoffHz / 20) / Math.log(1000),
        format: function () { return formatFrequency(zolaFilter.cutoffHz); },
        apply: function (value) { zolaFilter.cutoffHz = 20 * Math.pow(1000, value); }
      };
    }

    if (zolaPage === 'env') {
      return {
        label: 'ATTACK',
        value: zolaEnvelope.attack / 10,
        format: function () { return formatEnvelopeTime(zolaEnvelope.attack); },
        apply: function (value) { zolaEnvelope.attack = value * 10; }
      };
    }

    return {
      label: 'PHASE',
      value: zolaLfo.phase,
      format: function (value) { return Math.round(value * 100) + '%'; },
      apply: function (value) { zolaLfo.phase = value; }
    };
  }

  function renderZolaDisplay(ripple) {
    if (zolaPage === 'osc') {
      var path = wavetablePath(zolaOscillator.definition, zolaOscillator.position);
      zolaDisplayLabel.textContent = zolaOscillator.label + ' / ' + zolaOscillator.tableLabel;
      zolaDisplayValue.textContent = Math.round(zolaOscillator.position * 100) + '% POSITION';
      zolaDisplaySvg.setAttribute('aria-label', zolaOscillator.label + ' wavetable at ' + Math.round(zolaOscillator.position * 100) + ' percent position');
      updateZolaTrail(path, ripple);
      return;
    }

    if (zolaPage === 'filter') {
      zolaDisplayLabel.textContent = zolaFilter.mode + ' FILTER';
      zolaDisplayValue.textContent = formatFrequency(zolaFilter.cutoffHz);
      zolaDisplaySvg.setAttribute('aria-label', zolaFilter.mode + ' filter response at ' + formatFrequency(zolaFilter.cutoffHz));
      renderTechnicalTrace(filterResponse(zolaFilter.mode, zolaFilter.cutoffHz, zolaFilter.resonance), zolaFilter.mode + ' filter response');
      return;
    }

    if (zolaPage === 'env') {
      zolaDisplayLabel.textContent = zolaEnvelope.label;
      zolaDisplayValue.textContent = formatEnvelopeTime(zolaEnvelope.attack) + ' ATTACK';
      zolaDisplaySvg.setAttribute('aria-label', zolaEnvelope.label + ' response');
      renderTechnicalTrace(envelopeResponse(zolaEnvelope), zolaEnvelope.label + ' response');
      return;
    }

    zolaDisplayLabel.textContent = zolaLfo.label + ' / MODULATION';
    zolaDisplayValue.textContent = '1 ACTIVE ROUTE';
    zolaDisplaySvg.setAttribute('aria-label', zolaLfo.label + ' ' + zolaLfo.shape + ' waveform');
    renderTechnicalTrace(lfoResponse(zolaLfo), zolaLfo.label + ' ' + zolaLfo.shape + ' waveform');
  }

  function setEngaged(nodes, activeNode) {
    nodes.forEach(function (node) {
      var engaged = node === activeNode;
      node.dataset.engaged = String(engaged);
      if (node.hasAttribute('aria-pressed')) node.setAttribute('aria-pressed', String(engaged));
    });
  }

  function selectZolaPage(page) {
    zolaPage = page;
    var pageKeys = Array.from(document.querySelectorAll('[data-zx-page]'));
    setEngaged(pageKeys, pageKeys.find(function (key) { return key.dataset.zxPage === page; }));
    syncZolaControl();
    renderZolaDisplay(false);
  }

  function syncZolaControl() {
    var control = zolaControlConfig();
    zolaPrimaryControl.value = control.value;
    zolaPrimaryControl.setAttribute('aria-label', control.label);
    zolaPrimaryControl.parentElement.style.setProperty('--zx-pos', control.value);
    zolaControlLegend.textContent = control.label;
    zolaControlValue.textContent = control.format(control.value);
  }

  function updateZolaControl(value, ripple) {
    var normalized = Math.round(clamp(value, 0, 1) * 100) / 100;
    var control = zolaControlConfig();
    control.apply(normalized);
    syncZolaControl();
    renderZolaDisplay(ripple);
  }

  document.querySelectorAll('[data-zx-page]').forEach(function (button) {
    button.addEventListener('click', function () { selectZolaPage(button.dataset.zxPage); });
  });

  var zolaDrag = null;
  var zolaSuppressClick = false;

  function endZolaDrag(event) {
    if (!zolaDrag || (event && event.pointerId !== zolaDrag.pointerId)) return;
    zolaSuppressClick = true;
    zolaDrag = null;
    document.removeEventListener('pointermove', moveZolaDrag, true);
    document.removeEventListener('pointerup', endZolaDrag, true);
    document.removeEventListener('pointercancel', endZolaDrag, true);
  }

  function moveZolaDrag(event) {
    if (!zolaDrag || event.pointerId !== zolaDrag.pointerId) return;
    event.preventDefault();
    var now = performance.now();
    var dx = event.clientX - zolaDrag.lastX;
    var dy = event.clientY - zolaDrag.startY;
    var elapsed = Math.max(1, now - zolaDrag.lastTime);
    var speed = clamp(Math.abs(dx) / elapsed, .05, .6);
    var velocityScale = .45 + ((speed - .05) / .55) * .55;
    var perpendicularScale = clamp(1 - Math.abs(dy) / 35, .07, 1);
    var sensitivity = event.shiftKey ? .00035 : .0053;
    var delta = dx * sensitivity * velocityScale * perpendicularScale;
    zolaDrag.travel += dx;
    zolaDrag.value = clamp(zolaDrag.value + delta, 0, 1);
    zolaDrag.lastX = event.clientX;
    zolaDrag.lastTime = now;
    updateZolaControl(zolaDrag.value, true);
  }

  zolaPrimaryControl.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    zolaPrimaryControl.focus();
    zolaSuppressClick = true;
    zolaDrag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      value: Number(zolaPrimaryControl.value),
      travel: 0
    };
    document.addEventListener('pointermove', moveZolaDrag, { capture: true, passive: false });
    document.addEventListener('pointerup', endZolaDrag, true);
    document.addEventListener('pointercancel', endZolaDrag, true);
  });

  zolaPrimaryControl.addEventListener('input', function () {
    if (!zolaDrag) updateZolaControl(Number(zolaPrimaryControl.value), true);
  });

  zolaPrimaryControl.addEventListener('keydown', function (event) {
    var next = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Number(zolaPrimaryControl.value) - .01;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Number(zolaPrimaryControl.value) + .01;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 1;
    if (next === null) return;
    event.preventDefault();
    updateZolaControl(next, true);
  });

  zolaPrimaryControl.addEventListener('click', function (event) {
    if (zolaSuppressClick) event.preventDefault();
    zolaSuppressClick = false;
  });

  window.addEventListener('blur', function () { endZolaDrag(); });

  syncZolaControl();
  selectZolaPage('osc');

  /* ----------------------------------------------------------------------
     MIXER — repeatable transient streams with attack/release smoothing.
     ------------------------------------------------------------------- */

  var channelShape = [
    { gain: .72, period: .52, offset: .03, release: 4.8 },
    { gain: .58, period: .81, offset: .17, release: 3.9 },
    { gain: .82, period: .66, offset: .31, release: 5.5 },
    { gain: .47, period: 1.08, offset: .09, release: 3.2 },
    { gain: .68, period: .73, offset: .42, release: 4.4 },
    { gain: .55, period: .91, offset: .26, release: 3.7 },
    { gain: .76, period: .59, offset: .38, release: 5.1 },
    { gain: .43, period: 1.13, offset: .14, release: 3.1 },
    { gain: .70, period: .57, offset: .22, release: 4.6 },
    { gain: .61, period: .86, offset: .36, release: 4.1 },
    { gain: .79, period: .64, offset: .08, release: 5.3 },
    { gain: .49, period: 1.02, offset: .47, release: 3.4 },
    { gain: .66, period: .76, offset: .19, release: 4.5 },
    { gain: .53, period: .95, offset: .33, release: 3.6 },
    { gain: .74, period: .61, offset: .44, release: 5.0 },
    { gain: .45, period: 1.11, offset: .12, release: 3.0 }
  ];

  var mixerVolumes = [.82, .68, .74, .56, .79, .64, .71, .59, .77, .62, .69, .53, .81, .66, .72, .57];
  var mixerSources = ['KICK_01.WAV', 'SNARE_02.WAV', 'HAT_03.WAV', 'PERC_04.WAV', 'CHORD_05.WAV', 'BASS_06.WAV', 'TEXTURE_07.WAV', 'FX_08.WAV', 'KICK_09.WAV', 'SNARE_10.WAV', 'HAT_11.WAV', 'PERC_12.WAV', 'CHORD_13.WAV', 'BASS_14.WAV', 'TEXTURE_15.WAV', 'FX_16.WAV'];
  var reducedMeterLevel = [.36, .24, .48, .19, .31, .27, .41, .22, .34, .26, .45, .18, .32, .25, .39, .21];
  var mixerChannelState = channelShape.map(function (_, index) {
    return { index: index, level: .08 + (index % 8) * .018, peak: .12 + (index % 8) * .02, muted: false, soloed: false };
  });
  var mixerSlots = Array.from(document.querySelectorAll('.mixer-strip')).map(function (node, slotIndex) {
    return {
      node: node,
      slotIndex: slotIndex,
      channelIndex: slotIndex,
      label: node.querySelector('.mixer-strip-label'),
      status: node.querySelector('.mixer-strip-status'),
      pump: node.querySelector('.mixer-strip-pump'),
      meter: node.querySelector('.channel-meter'),
      fader: node.querySelector('.mixer-strip-fader'),
      output: node.querySelector('output'),
      mute: node.querySelector('[data-mixer-action="mute"]'),
      solo: node.querySelector('[data-mixer-action="solo"]'),
      peak: node.querySelector('.meter-peak')
    };
  });

  function stableUnit(value) {
    var raw = Math.sin(value * 91.733 + 17.17) * 43758.5453;
    return raw - Math.floor(raw);
  }

  function transient(time, period, offset, channelIndex, release) {
    var shifted = time + offset;
    var cycle = Math.floor(shifted / period);
    var age = shifted - cycle * period;
    var amplitude = .52 + stableUnit(cycle + channelIndex * 19.7) * .43;
    var attack = .022 + (channelIndex % 8) * .002;
    var envelope = age < attack
      ? age / attack
      : Math.exp(-(age - attack) * release);
    return amplitude * envelope;
  }

  function meterTarget(time, index) {
    var shape = channelShape[index];
    var rms = .07
      + .025 * (1 + Math.sin(time * (1.15 + index * .09) + index))
      + .018 * (1 + Math.sin(time * .43 + index * 1.7));
    var main = transient(time, shape.period, shape.offset, index, shape.release);
    var secondary = transient(time, shape.period * 2.35, shape.offset + .27, index + 7, shape.release * .72) * .38;
    return Math.min(.96, shape.gain * (rms + main + secondary));
  }

  function channelIsAudible(channel) {
    var hasSolo = mixerChannelState.some(function (candidate) { return candidate.soloed; });
    return !channel.muted && (!hasSolo || channel.soloed);
  }

  function syncMixerSlot(slot) {
    var channel = mixerChannelState[slot.channelIndex];
    var channelNumber = String(channel.index + 1).padStart(2, '0');
    var padLabel = 'PAD ' + channelNumber;
    var isPumpSource = channel.index === 2 || channel.index === 11;

    slot.node.dataset.channel = String(channel.index);
    slot.node.dataset.muted = String(channel.muted);
    slot.node.dataset.solo = String(channel.soloed);
    slot.label.textContent = channelNumber;
    slot.status.title = mixerSources[channel.index];
    slot.status.setAttribute('aria-label', mixerSources[channel.index] + ' loaded');
    slot.pump.classList.toggle('mixer-strip-pump-source', isPumpSource);
    if (isPumpSource) {
      slot.pump.removeAttribute('aria-hidden');
      slot.pump.setAttribute('aria-label', 'Sidechain source');
    } else {
      slot.pump.setAttribute('aria-hidden', 'true');
      slot.pump.removeAttribute('aria-label');
    }
    slot.meter.setAttribute('aria-label', padLabel + ' signal level');
    slot.fader.style.setProperty('--mixer-fader-position', String(mixerVolumes[channel.index] * 100) + '%');
    slot.output.value = mixerVolumes[channel.index].toFixed(2);
    slot.mute.setAttribute('aria-label', padLabel + ' mute');
    slot.solo.setAttribute('aria-label', padLabel + ' solo');
    slot.mute.classList.toggle('mixer-toggle-active', channel.muted);
    slot.solo.classList.toggle('mixer-toggle-active', channel.soloed);
    slot.mute.setAttribute('aria-pressed', String(channel.muted));
    slot.solo.setAttribute('aria-pressed', String(channel.soloed));
  }

  function renderMeters(now, deltaSeconds) {
    var time = now / 1000;
    mixerSlots.forEach(function (slot) {
      var channel = mixerChannelState[slot.channelIndex];
      var audible = channelIsAudible(channel);
      var target = audible ? (reduceMotion.matches ? reducedMeterLevel[channel.index] : meterTarget(time, channel.index)) : 0;
      if (reduceMotion.matches) {
        channel.level = target;
        channel.peak = target;
      } else {
        var constant = target > channel.level ? .022 : .34;
        var smoothing = Math.exp(-deltaSeconds / constant);
        channel.level = target + (channel.level - target) * smoothing;

        if (channel.level >= channel.peak) channel.peak = channel.level;
        else channel.peak = Math.max(channel.level, channel.peak - deltaSeconds * .13);
        if (!audible && channel.level < .001) channel.level = 0;
        if (!audible && channel.peak < .001) channel.peak = 0;
      }

      slot.node.style.setProperty('--level', channel.level.toFixed(4));
      slot.node.style.setProperty('--peak', channel.peak.toFixed(4));
      slot.node.dataset.signal = audible ? 'active' : 'silent';
      var dbfs = Math.max(-60, 20 * Math.log10(Math.max(.001, channel.level)));
      var roundedDbfs = Math.round(dbfs);
      slot.meter.setAttribute('aria-valuenow', String(roundedDbfs));
      slot.meter.setAttribute('aria-valuetext', channel.level > .001 ? String(roundedDbfs).replace('-', '−') + ' dBFS' : 'Silence');
      slot.peak.style.opacity = channel.peak > .001 ? '1' : '0';
    });
  }

  mixerSlots.forEach(function (slot) {
    slot.mute.addEventListener('click', function () {
      var channel = mixerChannelState[slot.channelIndex];
      channel.muted = !channel.muted;
      syncMixerSlot(slot);
      renderMeters(performance.now(), .016);
    });
    slot.solo.addEventListener('click', function () {
      var channel = mixerChannelState[slot.channelIndex];
      channel.soloed = !channel.soloed;
      syncMixerSlot(slot);
      renderMeters(performance.now(), .016);
    });
  });

  var mixerPageButtons = Array.from(document.querySelectorAll('.mixer-page-button'));
  function selectMixerPage(pageIndex) {
    mixerSlots.forEach(function (slot) {
      slot.channelIndex = pageIndex * 8 + slot.slotIndex;
      syncMixerSlot(slot);
    });
    mixerPageButtons.forEach(function (button) {
      var selected = Number(button.dataset.mixerPage) === pageIndex;
      button.classList.toggle('mixer-selector-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    renderMeters(performance.now(), .016);
  }
  mixerPageButtons.forEach(function (button) {
    button.addEventListener('click', function () { selectMixerPage(Number(button.dataset.mixerPage)); });
  });

  Array.from(document.querySelectorAll('#mixerBank .mixer-toggle')).forEach(function (button) {
    button.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      button.classList.add('is-pressed');
    });
    ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture'].forEach(function (eventName) {
      button.addEventListener(eventName, function () { button.classList.remove('is-pressed'); });
    });
  });
  selectMixerPage(0);

  /* ----------------------------------------------------------------------
     LASER — pointer position and short, bounded confirmation.
     ------------------------------------------------------------------- */

  var laserSurface = document.getElementById('laserSurface');
  var laserFlash = document.getElementById('laserFlash');
  var sliceReaction = document.getElementById('sliceReaction');
  var laserStatus = document.getElementById('laserStatus');
  var markers = Array.from(document.querySelectorAll('.slice-marker'));
  var markerPositions = markers.map(function (marker) { return Number(marker.dataset.x); });
  var playheadPosition = .5;
  var feedbackTimer = 0;

  function waveAmplitude(position) {
    var base = .12
      + Math.abs(Math.sin(position * 10.7 + .3)) * .13
      + Math.abs(Math.sin(position * 27.1 + 1.4)) * .055;
    var hits = [
      { at: .015, size: .78, width: .018 },
      { at: .26, size: .67, width: .012 },
      { at: .515, size: .58, width: .014 },
      { at: .55, size: .88, width: .009 },
      { at: .76, size: .72, width: .015 }
    ];
    hits.forEach(function (hit) {
      base += hit.size * Math.exp(-Math.abs(position - hit.at) / hit.width);
    });
    return Math.min(.92, base);
  }

  function buildWaveform() {
    var top = ['M 0 150'];
    var bottom = ['M 0 150'];
    var topFill = ['M 0 150'];
    var bottomFill = ['M 0 150'];
    var count = 128;
    for (var i = 0; i <= count; i += 1) {
      var p = i / count;
      var x = p * 1000;
      var texture = .84 + .16 * Math.sin(p * 93 + .5);
      var amplitude = waveAmplitude(p) * texture * 118;
      top.push('L ' + x.toFixed(2) + ' ' + (150 - amplitude).toFixed(2));
      bottom.push('L ' + x.toFixed(2) + ' ' + (150 + amplitude * .78).toFixed(2));
      topFill.push('L ' + x.toFixed(2) + ' ' + (150 - amplitude).toFixed(2));
      bottomFill.push('L ' + x.toFixed(2) + ' ' + (150 + amplitude * .78).toFixed(2));
    }
    topFill.push('L 1000 150 Z');
    bottomFill.push('L 1000 150 Z');
    document.getElementById('waveLineTop').setAttribute('d', top.join(' '));
    document.getElementById('waveLineBottom').setAttribute('d', bottom.join(' '));
    document.getElementById('waveFillTop').setAttribute('d', topFill.join(' '));
    document.getElementById('waveFillBottom').setAttribute('d', bottomFill.join(' '));
  }

  function setPlayhead(position) {
    playheadPosition = Math.max(0, Math.min(1, position));
    laserSurface.style.setProperty('--playhead-x', (playheadPosition * 100).toFixed(2) + '%');
  }

  function positionFromPointer(event) {
    var rect = laserSurface.getBoundingClientRect();
    return (event.clientX - rect.left) / rect.width;
  }

  function restartClass(node, className) {
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
  }

  function triggerSlice(position) {
    position = Math.max(0, Math.min(1, position));
    setPlayhead(position);

    var nearest = 0;
    markerPositions.forEach(function (markerPosition, index) {
      if (Math.abs(markerPosition - position) < Math.abs(markerPositions[nearest] - position)) nearest = index;
    });

    var bounds = [0].concat(markerPositions, [1]);
    var slice = bounds.length - 2;
    for (var i = 0; i < bounds.length - 1; i += 1) {
      if (position >= bounds[i] && position <= bounds[i + 1]) { slice = i; break; }
    }

    markers.forEach(function (marker) { marker.classList.remove('is-hit'); });
    markers[nearest].classList.add('is-hit');
    laserSurface.style.setProperty('--flash-x', (position * 100).toFixed(2) + '%');
    sliceReaction.style.setProperty('--slice-left', (bounds[slice] * 100).toFixed(2) + '%');
    sliceReaction.style.setProperty('--slice-width', ((bounds[slice + 1] - bounds[slice]) * 100).toFixed(2) + '%');
    restartClass(laserFlash, 'is-active');
    restartClass(sliceReaction, 'is-active');
    laserStatus.innerHTML = '<span>Slice ' + String(slice + 1).padStart(2, '0') + '</span> Visual feedback confirmed at ' + Math.round(position * 100) + '%.';

    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(function () {
      markers[nearest].classList.remove('is-hit');
    }, 520);
  }

  laserSurface.addEventListener('pointermove', function (event) {
    if (event.target.closest('.slice-marker')) return;
    setPlayhead(positionFromPointer(event));
  });
  laserSurface.addEventListener('pointerdown', function (event) {
    if (event.target.closest('.slice-marker')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    laserSurface.setPointerCapture(event.pointerId);
    triggerSlice(positionFromPointer(event));
  });
  laserSurface.addEventListener('keydown', function (event) {
    if (event.target !== laserSurface) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setPlayhead(playheadPosition + (event.key === 'ArrowLeft' ? -.025 : .025));
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerSlice(playheadPosition);
    }
  });
  markers.forEach(function (marker) {
    marker.addEventListener('click', function (event) {
      event.stopPropagation();
      triggerSlice(Number(marker.dataset.x));
    });
  });
  buildWaveform();

  /* ----------------------------------------------------------------------
     SEQ — visual cells and a display-only playhead.
     ------------------------------------------------------------------- */

  var seqSteps = Array.from(document.querySelectorAll('.seq-step'));
  var seqColumns = Array.from(document.querySelectorAll('.seq-column'));
  var seqTransport = document.getElementById('seqTransport');
  var seqRunning = !reduceMotion.matches;
  var seqEpoch = performance.now();
  var seqCurrent = 0;

  function updateTransport() {
    seqTransport.setAttribute('aria-pressed', String(seqRunning));
    seqTransport.querySelector('span').textContent = seqRunning ? 'Playhead on' : 'Playhead off';
    if (!seqRunning) {
      seqSteps.forEach(function (step) { step.classList.remove('is-playhead'); });
      seqColumns.forEach(function (column) { column.classList.remove('is-playhead'); });
    }
  }

  function renderPlayhead(stepNumber) {
    if (stepNumber === seqCurrent) return;
    seqCurrent = stepNumber;
    seqSteps.forEach(function (step) {
      step.classList.toggle('is-playhead', Number(step.dataset.step) === stepNumber);
    });
    seqColumns.forEach(function (column) {
      column.classList.toggle('is-playhead', Number(column.dataset.step) === stepNumber);
    });
  }

  function toggleSeqStep(step) {
    var active = !step.classList.contains('is-on');
    step.classList.toggle('is-on', active);
    step.setAttribute('aria-pressed', String(active));
  }

  seqSteps.forEach(function (step) {
    step.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      step.setPointerCapture(event.pointerId);
      step.classList.add('is-pressed');
      toggleSeqStep(step);
    });
    step.addEventListener('pointerup', function (event) {
      step.classList.remove('is-pressed');
      if (step.hasPointerCapture(event.pointerId)) step.releasePointerCapture(event.pointerId);
    });
    step.addEventListener('pointercancel', function () { step.classList.remove('is-pressed'); });
    step.addEventListener('lostpointercapture', function () { step.classList.remove('is-pressed'); });
    step.addEventListener('click', function (event) {
      if (event.detail === 0) toggleSeqStep(step);
    });
  });
  seqTransport.addEventListener('click', function () {
    seqRunning = !seqRunning;
    seqEpoch = performance.now();
    updateTransport();
  });
  updateTransport();

  /* ----------------------------------------------------------------------
     One animation clock. Only the visible experiment receives live work.
     ------------------------------------------------------------------- */

  var previousFrame = performance.now();
  function frame(now) {
    var delta = Math.min(.1, Math.max(.001, (now - previousFrame) / 1000));
    previousFrame = now;

    if (!document.hidden) {
      if (activePanel === 'zola' && !reduceMotion.matches) advanceZolaTrail(now);
      if (activePanel === 'mixer' && !reduceMotion.matches) renderMeters(now, delta);
      if (activePanel === 'seq' && seqRunning && !reduceMotion.matches) {
        renderPlayhead((Math.floor((now - seqEpoch) / 520) % 8) + 1);
      }
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
  renderMeters(performance.now(), .016);

  function onMotionPreference() {
    if (reduceMotion.matches) {
      seqRunning = false;
      updateTransport();
      renderZolaDisplay(false);
      renderMeters(0, 1);
    }
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionPreference);
  else if (reduceMotion.addListener) reduceMotion.addListener(onMotionPreference);
}());

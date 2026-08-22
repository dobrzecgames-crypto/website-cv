/* ==========================================================================
   Grid overlay — development only.

     Shift+G          toggle
     ?grid            load with it already on
     window.grid()    from the console

   The overlay is built the first time it is asked for and removed when it is
   switched off, so a page that nobody toggles never carries the markup. It is
   fixed, inert and painted above the document: it cannot influence the layout
   it is drawing.

   The columns are laid out by grid.css using the HERO's active 12/8/4-track
   rule, not by numbers copied into this file. The reading chapters retain
   their checkpointed grid during this hero-only pass; this overlay measures
   the binding dealer canvas from #stage.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'website:grid';
  var node = null;

  function build() {
    var scope = document.getElementById('stage') || document.documentElement;
    var scopeStyle = getComputedStyle(scope);
    var lab = document.createElement('div');
    lab.className = 'gridlab';
    lab.setAttribute('aria-hidden', 'true');
    lab.style.setProperty('--grid-cols', scopeStyle.getPropertyValue('--grid-cols').trim());
    lab.style.setProperty('--gutter', scopeStyle.getPropertyValue('--gutter').trim());
    lab.style.setProperty('--grid-margin', scopeStyle.getPropertyValue('--hero-rail').trim());
    lab.style.setProperty('--hero-width', scopeStyle.getPropertyValue('--hero-width').trim());

    var bleed = document.createElement('div');
    bleed.className = 'gridlab__bleed';

    var rhythm = document.createElement('div');
    rhythm.className = 'gridlab__rhythm';

    var cols = document.createElement('div');
    cols.className = 'gridlab__cols';

    var total = parseInt(scopeStyle.getPropertyValue('--grid-cols'), 10) || 12;
    for (var i = 1; i <= total; i++) {
      var col = document.createElement('i');
      col.className = 'gridlab__col';
      col.dataset.n = i < 10 ? '0' + i : String(i);
      cols.appendChild(col);
    }

    var meta = document.createElement('p');
    meta.className = 'gridlab__meta';

    lab.append(rhythm, bleed, cols, meta);
    document.body.appendChild(lab);

    /* measured, not assumed: whatever the clamps actually resolved to */
    var measure = function () {
      var one = cols.firstChild.getBoundingClientRect().width;
      var rail = cols.getBoundingClientRect().left;
      meta.textContent =
        total + ' col · ' + Math.round(one) + 'px ' +
        '· gutter ' + px('--gutter', lab) +
        ' · rail ' + Math.round(rail) + 'px' +
        ' · rhythm ' + px('--rhythm') +
        ' · ' + Math.round(window.innerWidth) + '×' + Math.round(window.innerHeight);
    };
    measure();
    window.addEventListener('resize', measure);
    lab._measure = measure;
    return lab;
  }

  function read(name, from) {
    return getComputedStyle(from || document.documentElement).getPropertyValue(name).trim();
  }
  function px(name, from) {
    return Math.round(parseFloat(read(name, from))) + 'px';
  }

  function show(on) {
    if (on && !node) node = build();
    else if (!on && node) {
      window.removeEventListener('resize', node._measure);
      node.remove();
      node = null;
    }
    try { sessionStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    return on;
  }

  function toggle() { return show(!node); }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'G' || e.ctrlKey || e.metaKey || e.altKey || !e.shiftKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    e.preventDefault();
    toggle();
  });

  window.grid = toggle;

  var wanted = false;
  try { wanted = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (/[?&]grid\b/.test(location.search)) wanted = true;
  if (wanted) show(true);
}());

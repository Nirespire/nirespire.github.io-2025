/* Animated node-graph background.
 * Drifting nodes connected by proximity edges, drawn on a transparent
 * full-viewport canvas so the body gradient shows through. Reacts to the
 * mouse cursor (desktop) and touch (mobile) via Pointer Events. Adapts its
 * colors to the active light/dark theme and honors reduced-motion. */
(function () {
  'use strict';

  const canvas = document.getElementById('node-graph-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const CONFIG = {
    density: 16000, // lower = more nodes; node count ~ area / density
    maxNodes: 90,
    linkDist: 120, // node-to-node connection distance (CSS px)
    maxEdgeAlpha: 0.35,
    nodeAlpha: 0.5,
    nodeRadius: 1.6,
    speed: 0.15, // max drift per frame (CSS px)
    pointerDist: 160, // pointer interaction radius (CSS px)
    pointerEdgeAlpha: 0.5,
    pointerRepel: 0.35, // velocity nudge applied near the pointer
    maxSpeed: 0.6, // velocity clamp so repulsion stays stable
  };

  // Fallbacks match --color-accent-rgb / --color-border-subtle-rgb (dark).
  let nodeColor = '249, 115, 22';
  let edgeColor = '75, 85, 99';
  // Light backgrounds wash out the subtle gray edges, so we recolor them to
  // the accent and scale up their opacity in light mode (set in readColors).
  let edgeAlphaScale = 1;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let rafId = null;
  let resizeTimer = null;

  // Pointer state; pointer.active is false until the cursor/finger moves.
  const pointer = { x: 0, y: 0, active: false };

  function readColors() {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const accent = cs.getPropertyValue('--color-accent-rgb').trim();
    const border = cs.getPropertyValue('--color-border-subtle-rgb').trim();
    if (accent) nodeColor = accent;
    if (root.classList.contains('light')) {
      // Accent edges + boosted opacity so the graph stays visible on light bg.
      edgeColor = accent || border || edgeColor;
      edgeAlphaScale = 1.7;
    } else {
      if (border) edgeColor = border;
      edgeAlphaScale = 1;
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedNodes() {
    const count = Math.min(Math.round((width * height) / CONFIG.density), CONFIG.maxNodes);
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height); // transparent: gradient shows through
    ctx.lineWidth = 1;

    // Edges between nearby nodes.
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < CONFIG.linkDist) {
          const alpha = (1 - dist / CONFIG.linkDist) * CONFIG.maxEdgeAlpha * edgeAlphaScale;
          ctx.strokeStyle = 'rgba(' + edgeColor + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Edges reaching from the pointer to nearby nodes.
    if (pointer.active) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dist = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (dist < CONFIG.pointerDist) {
          const alpha = (1 - dist / CONFIG.pointerDist) * CONFIG.pointerEdgeAlpha;
          ctx.strokeStyle = 'rgba(' + nodeColor + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    // Nodes.
    ctx.fillStyle = 'rgba(' + nodeColor + ',' + CONFIG.nodeAlpha + ')';
    for (let k = 0; k < nodes.length; k++) {
      const n = nodes[k];
      ctx.beginPath();
      ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function clamp(v, limit) {
    if (v > limit) return limit;
    if (v < -limit) return -limit;
    return v;
  }

  function step() {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Gentle repulsion away from the pointer.
      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < CONFIG.pointerDist) {
          const force = (1 - dist / CONFIG.pointerDist) * CONFIG.pointerRepel;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }

      n.vx = clamp(n.vx, CONFIG.maxSpeed);
      n.vy = clamp(n.vy, CONFIG.maxSpeed);
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    draw();
    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId !== null) return;
    if (reduceMotion.matches) {
      draw(); // single static frame, no loop
      return;
    }
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // --- init ---
  readColors();
  resize();
  seedNodes();
  start();

  // Resize: debounced re-init.
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      seedNodes();
      if (rafId === null) draw(); // refresh the static frame in reduced-motion
    }, 150);
  });

  // Pointer interactivity (mouse + touch + pen). The canvas is
  // pointer-events:none, so these listen on window and never block clicks.
  window.addEventListener(
    'pointermove',
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerdown',
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
  function clearPointer() {
    pointer.active = false;
  }
  window.addEventListener('pointerup', clearPointer, { passive: true });
  window.addEventListener('pointercancel', clearPointer, { passive: true });
  window.addEventListener('pointerleave', clearPointer, { passive: true });

  // Pause when the tab is hidden.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  // Re-read theme colors when the light/dark class toggles.
  const observer = new MutationObserver(function () {
    readColors();
    if (rafId === null) draw(); // recolor the static frame in reduced-motion
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // React to OS reduced-motion changes.
  reduceMotion.addEventListener('change', function () {
    stop();
    start();
  });
})();

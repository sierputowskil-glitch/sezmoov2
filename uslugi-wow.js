/* ============================================================
   SEZMOO — WOW scroll controller
   - Activates pinned scrub only on desktop + fine pointer + motion-ok.
   - One rAF loop. Per pinned section: compute progress p (0..1)
     from getBoundingClientRect, write a single CSS var --p.
   - No layout writes beyond style.setProperty; only runs work when
     scroll changed and section is near viewport. Buttery on mobile
     because on mobile it does nothing (static CSS end-state).
   ============================================================ */
/* Cursor spotlight for premium hover sections (.svc-steps) — pointer-fine only */
(function () {
  "use strict";
  if (!window.matchMedia("(min-width: 881px) and (pointer: fine)").matches) return;
  var els = document.querySelectorAll(".svc-steps");
  els.forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });
})();

(function () {
  "use strict";
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canPin = window.matchMedia("(min-width: 881px) and (pointer: fine)").matches;

  if (!motionOK || !canPin) return; // mobile / touch / reduced-motion → leave static end-state

  document.documentElement.classList.add("wow-on");

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  // collect pinned sections
  var sections = [];
  document.querySelectorAll("[data-wow]").forEach(function (el) {
    sections.push({
      el: el,
      tc: el.querySelector("[data-tc-scrub]"),
      tcFrames: parseInt(el.getAttribute("data-tc-frames") || "204", 10), // total frames to scrub
      count: el.querySelector("[data-fmt-count]"),
      countTo: parseInt(el.getAttribute("data-count-to") || "0", 10)
    });
  });
  if (!sections.length) return;

  var vh = window.innerHeight;
  var lastScroll = -1;
  var ticking = false;

  function fmtTC(frames, fps) {
    fps = fps || 24;
    var f = frames % fps;
    var totalSec = Math.floor(frames / fps);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600);
    var p2 = function (n) { return n < 10 ? "0" + n : "" + n; };
    return p2(h) + ":" + p2(m) + ":" + p2(s) + ":" + p2(f);
  }

  function update() {
    ticking = false;
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var rect = sec.el.getBoundingClientRect();
      // skip far-offscreen sections (cheap guard)
      if (rect.bottom < -vh || rect.top > vh * 2) continue;
      var total = rect.height - vh;
      var p;
      if (total > 40) {
        // tall pinned section: progress through the scrub
        p = clamp(-rect.top / total, 0, 1);
      } else {
        // short section: view-progress as it crosses the screen
        p = clamp((vh * 0.72 - rect.top) / rect.height, 0, 1);
      }
      sec.el.style.setProperty("--p", p.toFixed(4));
      if (sec.tc) sec.tc.textContent = fmtTC(Math.round(p * sec.tcFrames));
      if (sec.count && sec.countTo) sec.count.textContent = Math.round(p * sec.countTo);
    }
  }

  function onScroll() {
    if (window.scrollY === lastScroll) return;
    lastScroll = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    // re-evaluate capability (e.g. devtools resize); if no longer pinnable, reload static
    if (!window.matchMedia("(min-width: 881px) and (pointer: fine)").matches) {
      document.documentElement.classList.remove("wow-on");
    } else {
      document.documentElement.classList.add("wow-on");
    }
    lastScroll = -1; onScroll();
  }, { passive: true });

  // initial paint
  requestAnimationFrame(update);
})();

/* ============================================================
   SEZMOO — interactions
   ============================================================ */
(function () {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- TIMECODE (nav + hero) ---------- */
  function tc(frames) {
    const fps = 24;
    const f = frames % fps;
    const totalSec = Math.floor(frames / fps);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
  }
  let frame = 12 * 24 + 8; // start at 00:00:12:08
  const tcEls = document.querySelectorAll("[data-tc]");
  if (!reduce) {
    setInterval(() => {
      frame++;
      const str = tc(frame);
      tcEls.forEach((el) => (el.textContent = str));
    }, 1000 / 24);
  } else {
    tcEls.forEach((el) => (el.textContent = tc(frame)));
  }

  /* ---------- HERO background video: force muted autoplay + reveal on play ---------- */
  (function heroVideo() {
    const wrap = document.querySelector(".hero__video");
    const video = document.getElementById("hero-video");
    if (!wrap || !video) return;

    const reveal = () => wrap.classList.add("is-playing");
    const tryPlay = () => {
      video.muted = true;
      video.playsInline = true;
      const play = video.play();
      if (play && play.catch) play.catch(() => {});
    }

    video.addEventListener("playing", reveal);
    video.addEventListener("canplay", tryPlay, { once: true });
    video.addEventListener("loadeddata", () => {
      if (video.readyState >= 2) reveal();
    }, { once: true });
    tryPlay();
  })();

  /* ---------- NAV stuck state ---------- */
  const nav = document.querySelector(".nav");
  const onScrollNav = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- Mobile nav ---------- */
  (function mobileNav() {
    const btn = document.querySelector(".nav__burger");
    const menu = document.querySelector(".nav__menu");
    if (!btn || !menu) return;

    const setOpen = (open) => {
      btn.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
    };

    btn.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setOpen(false);
    });
  })();

  /* ---------- SCRUBBER (page progress) ---------- */
  const fill = document.querySelector(".scrubber__fill");
  const head = document.querySelector(".scrubber__head");
  function updateScrub() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    fill.style.width = p + "%";
    head.style.left = p + "%";
  }
  updateScrub();
  window.addEventListener("scroll", updateScrub, { passive: true });
  window.addEventListener("resize", updateScrub);

  /* ---------- REVEAL on scroll (position-based; robust where IO is unreliable) ---------- */
  function revealCheck() {
    const vh = innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > -40) el.classList.add("in");
    });
  }
  revealCheck();
  requestAnimationFrame(revealCheck);
  window.addEventListener("scroll", revealCheck, { passive: true });
  window.addEventListener("resize", revealCheck);
  setTimeout(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")), 3000);

  // hero entrance
  const hero = document.querySelector(".hero");
  if (hero) requestAnimationFrame(() => hero.classList.add("is-in"));

  // Safety net: if the headline entrance transition never commits (e.g. animations
  // throttled in a backgrounded tab), force the visible end-state so the H1 is never hidden.
  setTimeout(() => {
    document.querySelectorAll(".hero h1 .clip > span").forEach((s) => {
      let ty = 0;
      try { ty = new DOMMatrix(getComputedStyle(s).transform).m42; } catch (_) {}
      if (Math.abs(ty) > 2) { s.style.transition = "none"; s.style.transform = "none"; }
    });
  }, 1400);

  /* ---------- CUSTOM CURSOR ---------- */
  if (fine) {
    const cur = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor-dot");
    let cx = innerWidth / 2, cy = innerHeight / 2, dx = cx, dy = cy, tx = cx, ty = cy;
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    function loop() {
      dx += (tx - dx) * 0.2; dy += (ty - dy) * 0.2;
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      dot.style.transform = `translate(${dx}px,${dy}px)`;
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("[data-cursor='play']").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cur-play"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cur-play"));
    });
    document.querySelectorAll("a, button, .chip, [data-cursor='link']").forEach((el) => {
      if (el.closest("[data-cursor='play']")) return;
      el.addEventListener("mouseenter", () => document.body.classList.add("cur-link"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cur-link"));
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (fine && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.34;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- PARALLAX thumbnails ---------- */
  if (!reduce) {
    const px = [...document.querySelectorAll("[data-parallax]")];
    function parallax() {
      const vh = innerHeight;
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const prog = (r.top + r.height / 2 - vh / 2) / vh; // -.5..+.5-ish
        const amt = parseFloat(el.dataset.parallax) || 18;
        const media = el.querySelector(".frame-media") || el;
        media.style.setProperty("--py", (-prog * amt).toFixed(1) + "px");
      });
      requestAnimationFrame(parallax);
    }
    parallax();
  }

  /* ---------- PORTFOLIO: hover-play real videos (incl. blurred bg copy) ---------- */
  document.querySelectorAll(".card").forEach((card) => {
    const vids = card.querySelectorAll(".card__video, .card__video-bg");
    if (!vids.length) return;
    card.addEventListener("mouseenter", () => {
      vids.forEach((v) => { try { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} });
    });
    card.addEventListener("mouseleave", () => {
      vids.forEach((v) => { try { v.pause(); v.currentTime = 0; } catch (_) {} });
    });
  });

  /* ---------- STUDIO: autoplay BTS video while in view ---------- */
  (function studioVideo() {
    const v = document.querySelector(".studio__video");
    if (!v) return;
    const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener("canplay", tryPlay);
    tryPlay();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) tryPlay(); else v.pause(); });
      }, { threshold: 0.2 }).observe(v);
    }
  })();

  /* ---------- PORTFOLIO filters ---------- */
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".card[data-cats]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        const match = f === "all" || (card.dataset.cats || "").split(",").includes(f);
        card.style.transition = "opacity .4s ease, transform .4s ease";
        if (match) {
          card.style.display = "";
          requestAnimationFrame(() => { card.style.opacity = "1"; card.style.transform = "none"; });
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(.97)";
          setTimeout(() => { if (!chip.classList.contains("is-on")) return; card.style.display = "none"; }, 380);
        }
      });
    });
  });

  /* ---------- PROCESS timeline (scroll-driven playhead) ---------- */
  const track = document.querySelector(".tl__track");
  const playhead = document.querySelector(".tl__playhead");
  const clips = [...document.querySelectorAll(".tl__clips .clip")];
  const ptc = document.querySelector(".tl__playhead .ptc");
  if (track && playhead && clips.length) {
    function timeline() {
      const r = track.getBoundingClientRect();
      const vh = innerHeight;
      // progress as the track scrolls through the middle band of viewport
      const start = vh * 0.85;
      const end = vh * 0.2;
      let p = (start - r.top) / (start - end + r.height);
      p = Math.max(0, Math.min(1, p));
      playhead.style.left = (p * 100) + "%";
      if (ptc) ptc.textContent = tc(Math.round(p * (clips.length * 48)));
      const activeIdx = Math.min(clips.length - 1, Math.floor(p * clips.length + 0.0001));
      clips.forEach((c, i) => {
        c.classList.toggle("is-done", i < activeIdx || (p >= 1 && i <= activeIdx));
        c.classList.toggle("is-active", i === activeIdx && p < 1);
        if (p >= 1) c.classList.add("is-done");
      });
      requestAnimationFrame(timeline);
    }
    if (!reduce) timeline();
    else clips.forEach((c) => c.classList.add("is-done"));
  }

  /* ---------- FX: HERO scroll-expand (Apple-style pinned reveal) ---------- */
  (function heroExpand() {
    const wrap = document.getElementById("hero-wrap");
    const hero = document.querySelector(".hero");
    if (!wrap || !hero) return;
    let running = false;
    function frame() {
      if (!root.classList.contains("fx-hero")) {
        hero.style.removeProperty("--hp");
        running = false;
        return;
      }
      if (reduce) { hero.style.setProperty("--hp", "1"); running = false; return; }
      const total = wrap.offsetHeight - innerHeight;
      const top = wrap.getBoundingClientRect().top;
      let p = total > 0 ? -top / total : 0;
      p = Math.max(0, Math.min(1, p));
      hero.style.setProperty("--hp", p.toFixed(4));
      requestAnimationFrame(frame);
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    // observe Tweak toggling fx-hero on/off
    new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ["class"] });
  })();

  /* ---------- FX: CONTENT SYSTEM scroll scene ---------- */
  (function contentPackScene() {
    const services = document.getElementById("services");
    const pack = document.getElementById("content-pack");
    const status = document.getElementById("pack-status");
    const tcEl = document.getElementById("pack-tc");
    if (!services || !pack) return;
    const cl = (v) => Math.max(0, Math.min(1, v));
    const smooth = (t) => t * t * (3 - 2 * t);

    if (reduce) {
      services.style.setProperty("--services-progress", "1");
      pack.style.setProperty("--pack-progress", "1");
      pack.style.setProperty("--pack-open", "1");
      pack.style.setProperty("--pack-split", "1");
      pack.style.setProperty("--pack-glow", "1");
      if (status) status.textContent = "Campaign export";
      if (tcEl) tcEl.textContent = tc(12 * 24);
      return;
    }

    let last = "";
    function frame() {
      const r = pack.getBoundingClientRect();
      const vh = innerHeight || document.documentElement.clientHeight;
      const p = cl((vh * 0.82 - r.top) / (r.height + vh * 0.32));
      const sp = cl((vh * 0.95 - r.top) / (r.height + vh * 0.55));
      const open = smooth(cl(p / 0.45));
      const split = smooth(cl((p - 0.32) / 0.5));
      const glow = smooth(cl((p - 0.12) / 0.72));
      services.style.setProperty("--services-progress", sp.toFixed(3));
      pack.style.setProperty("--pack-progress", p.toFixed(3));
      pack.style.setProperty("--pack-open", open.toFixed(3));
      pack.style.setProperty("--pack-split", split.toFixed(3));
      pack.style.setProperty("--pack-glow", glow.toFixed(3));
      const st = p < 0.33 ? "Open gate" : (p < 0.7 ? "Split formats" : "Campaign export");
      if (st !== last && status) { status.textContent = st; last = st; }
      if (tcEl) tcEl.textContent = tc(Math.round(p * 12 * 24));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------- CONTACT: brief type chips ---------- */
  (function briefChips() {
    const chips = document.querySelectorAll(".cbrief__chip");
    const input = document.getElementById("cf-type");
    if (!chips.length) return;
    chips.forEach((c) => {
      c.addEventListener("click", () => {
        const already = c.classList.contains("is-on");
        chips.forEach((x) => x.classList.remove("is-on"));
        if (already) { if (input) input.value = ""; return; }
        c.classList.add("is-on");
        if (input) input.value = c.dataset.type || "";
      });
    });
  })();

  /* ---------- BACK TO TOP ---------- */
  (function backToTop() {
    const btn = document.querySelector(".to-top");
    const onScroll = () => { if (btn) btn.classList.toggle("is-on", window.scrollY > innerHeight * 0.85); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.querySelectorAll("[data-totop]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    });
  })();

  /* ---------- Smooth anchor nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      }
    });
  });
})();

// overlay.js - Screen overlay renderer. Hangs one or more charms ("dangles")
// from the top edge of the screen, each with its own rope physics.

(function () {
  const MAX_DANGLES = 8;
  const SCALE = 1.6;

  const container = document.getElementById("dg-container");
  const defs = document.getElementById("dg-defs");
  const worldGroup = document.getElementById("dg-world");
  const contextMenu = document.getElementById("dg-context-menu");
  const cmQuit = document.getElementById("dg-cm-quit");
  const cmToggle = document.getElementById("dg-cm-toggle");
  const cmGallery = document.getElementById("dg-cm-gallery");
  const cmRitual = document.getElementById("dg-cm-ritual");
  const cmAdd = document.getElementById("dg-cm-add");
  const cmRemove = document.getElementById("dg-cm-remove");
  const toastEl = document.getElementById("dg-toast");
  const ghantaAudio = document.getElementById("dg-sound-ghanta");
  const SVG_NS = "http://www.w3.org/2000/svg";

  if (ghantaAudio) ghantaAudio.volume = 0.4;
  defs.innerHTML = getSvgDefs();
  worldGroup.setAttribute("transform", `scale(${SCALE})`);

  const dangles = [];
  let activeDangle = null; // last charm the user touched; tray/gallery "Hang" replaces this one
  let menuTarget = null; // charm the context menu was opened on
  let allDangled = true;

  // ---------------------------------------------------------------------------
  // Click-through: the window ignores the mouse except over a charm's controls
  // ---------------------------------------------------------------------------
  let interactive = false;
  function setInteractive(on) {
    if (interactive === on) return;
    interactive = on;
    if (!window.electronAPI) return;
    if (on) window.electronAPI.setIgnoreMouseEvents(false);
    else window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
  }
  function refreshInteractive() {
    const hovering = !!container.querySelector(".dg-grab:hover, .dg-anchor-handle:hover, .dg-close-anchor:hover");
    const busy = dangles.some((d) => d.physics.dragging || d.anchorDragging);
    setInteractive(hovering || busy || contextMenu.classList.contains("visible"));
  }
  if (window.electronAPI) window.electronAPI.setIgnoreMouseEvents(true, { forward: true });

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("visible"), 2400);
  }

  // ---------------------------------------------------------------------------
  // One hanging charm
  // ---------------------------------------------------------------------------
  class Dangle {
    constructor(state) {
      // Drop undefined fields so they don't overwrite the defaults below
      const given = Object.fromEntries(Object.entries(state || {}).filter(([, v]) => v !== undefined && v !== null));
      this.state = {
        slug: "diya",
        emoji: "🍀",
        customImage: "",
        customImageAspect: 1,
        anchorXRatio: 0.75,
        length: 12,
        darumaState: 0,
        drishtiColorIndex: 0,
        ...given
      };
      this.charm = CHARMS.find((c) => c.slug === this.state.slug) || CHARMS[0];
      this.state.slug = this.charm.slug;
      this.anim = {}; // ritual start times keyed by ritual kind
      this.anchorDragging = false;

      const w = window.innerWidth / SCALE;
      this.physics = new RopePhysics({
        count: this.state.length,
        segment: 15.5,
        hangOffset: this.charm.hangOffset,
        hangY: -4,
        anchorX: Math.round(w * this.state.anchorXRatio)
      });
      this.updateBounds();
      this.buildDom();
      this.buildVisuals();
    }

    // --- DOM -----------------------------------------------------------------
    buildDom() {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "dg-dangle");
      g.innerHTML = `
        <g class="dg-rope">
          <path class="dg-cord-base" d="" fill="none"/>
          <path class="dg-cord-texture" d="" fill="none"/>
          <path class="dg-cord-stitch" d="" fill="none"/>
        </g>
        <g class="dg-garland"></g>
        <g class="dg-beads"></g>
        <g class="dg-charm"></g>`;
      worldGroup.appendChild(g);
      this.root = g;
      this.ropePaths = Array.from(g.querySelectorAll(".dg-rope path"));
      this.garlandGroup = g.querySelector(".dg-garland");
      this.beadsGroup = g.querySelector(".dg-beads");
      this.charmGroup = g.querySelector(".dg-charm");

      this.anchorHandle = document.createElement("div");
      this.anchorHandle.className = "dg-anchor-handle";
      this.anchorHandle.title = "Drag to slide along the screen edge";
      this.closeBtn = document.createElement("button");
      this.closeBtn.className = "dg-close-anchor";
      this.grabButton = document.createElement("button");
      this.grabButton.className = "dg-grab";
      this.grabButton.setAttribute("aria-label", "Grab and flick charm");
      this.grabButton.title = "Click: flick · Double-click: ritual · Right-click: options";
      container.append(this.anchorHandle, this.closeBtn, this.grabButton);
      this.updateCloseTitle();
      this.bindEvents();
    }

    updateCloseTitle() {
      this.closeBtn.textContent = "✕";
      this.closeBtn.title = dangles.length > 1 ? "Remove this charm" : "Exit Lucky Dangle";
    }

    destroy() {
      this.root.remove();
      this.anchorHandle.remove();
      this.closeBtn.remove();
      this.grabButton.remove();
    }

    updateBounds() {
      const w = window.innerWidth / SCALE;
      this.physics.minAX = Math.min(80, w * 0.1);
      this.physics.maxAX = w - this.physics.minAX;
    }

    // --- Input ---------------------------------------------------------------
    bindEvents() {
      const showClose = (on) => { this.closeBtn.style.opacity = on ? "1" : "0"; };
      [this.grabButton, this.anchorHandle, this.closeBtn].forEach((el) => {
        el.addEventListener("mouseenter", () => {
          setInteractive(true);
          if (el !== this.grabButton) showClose(true);
        });
        el.addEventListener("mouseleave", () => setTimeout(() => {
          if (!this.anchorHandle.matches(":hover") && !this.closeBtn.matches(":hover")) showClose(false);
          refreshInteractive();
        }, 50));
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeDangle = this;
          openContextMenu(this, e.clientX, e.clientY);
        });
      });

      this.closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dangles.length > 1) removeDangle(this);
        else if (window.electronAPI) window.electronAPI.quitApp();
      });

      // Slide the hanging point along the top edge
      this.anchorHandle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        activeDangle = this;
        this.anchorDragging = true;
        this.anchorHandle.setPointerCapture(e.pointerId);
        setInteractive(true);
      });
      this.anchorHandle.addEventListener("pointermove", (e) => {
        if (!this.anchorDragging) return;
        this.physics.anchorX = Math.min(Math.max(e.clientX / SCALE, this.physics.minAX), this.physics.maxAX);
        this.physics.anchorXTarget = null;
      });
      const stopAnchor = () => {
        if (!this.anchorDragging) return;
        this.anchorDragging = false;
        refreshInteractive();
        saveAll();
      };
      this.anchorHandle.addEventListener("pointerup", stopAnchor);
      this.anchorHandle.addEventListener("pointercancel", stopAnchor);

      // Grab, drag and flick the charm
      let dragStart = null;
      let dragDistance = 0;
      const toPhysics = (e) => ({ x: e.clientX / SCALE, y: e.clientY / SCALE });
      this.grabButton.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        activeDangle = this;
        dragStart = toPhysics(e);
        dragDistance = 0;
        this.physics.dragging = true;
        this.physics.dragTo(dragStart);
        this.grabButton.setPointerCapture(e.pointerId);
        setInteractive(true);
      });
      this.grabButton.addEventListener("pointermove", (e) => {
        const pos = toPhysics(e);
        if (this.physics.dragging && dragStart) {
          dragDistance = Math.max(dragDistance, Math.hypot(pos.x - dragStart.x, pos.y - dragStart.y));
          this.physics.dragTo(pos);
        }
      });
      const stopGrab = () => {
        if (!this.physics.dragging) return;
        this.physics.dragging = false;
        this.physics.dragTarget = null;
        if (dragDistance < 8) this.physics.flick(22);
        refreshInteractive();
      };
      this.grabButton.addEventListener("pointerup", stopGrab);
      this.grabButton.addEventListener("pointercancel", stopGrab);
      this.grabButton.addEventListener("dblclick", (e) => {
        e.preventDefault();
        this.performRitual();
      });
    }

    // --- Visuals -------------------------------------------------------------
    imageAt(href, w, h, extra = "") {
      return `<image ${extra} href="${href}" x="${(-w / 2).toFixed(1)}" y="${(-this.charm.attach * h).toFixed(1)}" width="${w}" height="${h}"/>`;
    }

    tip(from, to) {
      return `<g filter="url(#dg-tipshadow)">
        <path class="dg-cord-base" d="M 0 ${from} L 0 ${to}" fill="none"/>
        <path class="dg-cord-texture" d="M 0 ${from} L 0 ${to}" fill="none"/>
        <path class="dg-cord-stitch" d="M 0 ${from} L 0 ${to}" fill="none"/>
      </g>`;
    }

    buildVisuals() {
      const c = this.charm;
      const s = this.state;
      this.physics.hangOffset = c.hangOffset;

      // Beads along the cord
      if (c.beads) {
        const types = [c.beads.small, c.beads.big, c.beads.small];
        const sizes = [3.5, c.beads.bigSize / 2, 3.5];
        this.beadsGroup.innerHTML = types
          .map((t, i) => `<g class="dg-bead">${renderBead(t, sizes[i], s.emoji)}</g>`)
          .join("");
      } else {
        this.beadsGroup.innerHTML = "";
      }

      // Nimbu-mirchi garland threads chilies along the cord itself
      if (c.art.type === "garland") {
        this.garlandGroup.innerHTML = GARLAND_CONFIG.slots.map((_, i) => {
          const sprite = GARLAND_CONFIG.slotSprite[i];
          const [w, h] = GARLAND_CONFIG.chiliSizes[sprite];
          const flip = i % 2 === 0 ? "" : ' transform="scale(-1, 1)"';
          return `<g class="dg-slot"><image href="../assets/charms/nimbu-chili-${sprite + 1}.png" x="${(-w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${w}" height="${h}"${flip}/></g>`;
        }).join("");
        this.charmGroup.innerHTML = `
          <image href="../assets/charms/nimbu-lemon.png" x="-22" y="-24.3" width="44" height="48.6"/>
          <image href="../assets/charms/nimbu-coal.png" x="-10.5" y="18.6" width="21" height="18.8"/>`;
        return;
      }
      this.garlandGroup.innerHTML = "";

      const [w, h] = c.art.frame || [64, 84];
      let html = "";
      switch (c.slug) {
        case "custom":
          html = `${this.tip(0, 28)}<text x="0" y="22" text-anchor="middle" dominant-baseline="central" font-size="${c.art.fontSize}">${s.emoji}</text>`;
          break;
        case "daruma": {
          let eyes = "";
          if (s.darumaState >= 1) eyes += `<circle cx="-10" cy="14" r="3.7" fill="#171416"/><circle cx="-11.4" cy="12.5" r="0.9" fill="rgba(255,255,255,0.85)"/>`;
          if (s.darumaState >= 2) eyes += `<circle cx="9.7" cy="14" r="3.7" fill="#171416"/><circle cx="8.3" cy="12.5" r="0.9" fill="rgba(255,255,255,0.85)"/>`;
          html = this.imageAt(c.art.src, w, h) + eyes;
          break;
        }
        case "drishti-bommai":
          html = this.imageAt(DRISHTI_COLORS[s.drishtiColorIndex % DRISHTI_COLORS.length], w, h);
          break;
        case "maneki-neko":
          html = this.imageAt(c.art.body, w, h) + this.imageAt(c.art.arm, w, h, 'class="dg-maneki-arm"');
          break;
        case "scarab":
          html = this.imageAt(c.art.wings, w, h, 'class="dg-scarab-wings" opacity="0"') + this.imageAt(c.art.body, w, h);
          break;
        case "ghanta":
          html = `<g class="dg-ghanta-body">${this.imageAt(c.art.src, w, h)}${this.tip(-0.5, 6.5)}</g>`;
          break;
        case "chinese-knot":
          html = `<g class="dg-knot-body">${this.imageAt(c.art.src, w, h)}
            <rect x="-2.3" y="-2.3" width="4.6" height="1.7" rx="0.85" fill="#6b1412"/>
            <rect x="-2.3" y="-0.3" width="4.6" height="1.7" rx="0.85" fill="#ad2b21"/>
            <rect x="-2.3" y="1.7" width="4.6" height="1.7" rx="0.85" fill="#6b1412"/></g>`;
          break;
        case "himmeli":
          html = `<g class="dg-himmeli-body">${this.imageAt(c.art.src, w, h)}</g>`;
          break;
        case "custom-image": {
          const aspect = s.customImageAspect || 1;
          let iw = 64;
          let ih = Math.round(iw / aspect);
          if (ih > 150) { ih = 150; iw = Math.round(ih * aspect); }
          else if (ih < 40) { ih = 40; iw = Math.round(ih * aspect); }
          this.physics.hangOffset = Math.round(ih * 0.45);
          html = this.imageAt(s.customImage || "../assets/app-icon.png", iw, ih);
          break;
        }
        default:
          if (c.art.type === "svg") {
            html = `<g class="dg-svg-body">${c.art.markup}</g>`;
          } else {
            html = this.imageAt(c.art.src, w, h) + (c.cordEnd?.kind === "tip" ? this.tip(-0.4, 5.4) : "");
          }
      }
      this.charmGroup.innerHTML = html;
    }

    q(selector) {
      return this.charmGroup.querySelector(selector);
    }

    // --- Rituals -------------------------------------------------------------
    performRitual() {
      const now = performance.now() / 1000;
      const s = this.state;
      switch (this.charm.ritual.kind) {
        case "ghanta":
          this.anim.ghanta = now;
          if (ghantaAudio) {
            ghantaAudio.currentTime = 0;
            ghantaAudio.play().catch(() => {});
          }
          showToast("Bell rung. Clear skies and good luck");
          break;
        case "drishti": {
          s.drishtiColorIndex = (s.drishtiColorIndex + 1) % DRISHTI_COLORS.length;
          this.buildVisuals();
          this.physics.flick(14);
          const names = ["Traditional Crimson", "Azure Blue", "Emerald Green", "Marigold Orange", "Royal Purple", "Solar Yellow", "Obsidian Black"];
          showToast(`Guardian repainted: ${names[s.drishtiColorIndex]}`);
          saveAll();
          break;
        }
        case "daruma":
          s.darumaState = (s.darumaState + 1) % 3;
          this.buildVisuals();
          this.physics.flick(14);
          showToast(["New goal begun", "Goal set. Make a wish", "Goal reached. Wish granted 🌟"][s.darumaState]);
          saveAll();
          break;
        case "maneki":
          this.anim.maneki = now;
          showToast("Beckoning good fortune ✨");
          break;
        case "scarab":
          this.anim.scarab = now;
          showToast("Ceremonial wings spread");
          break;
        case "knot":
          this.anim.knot = now;
          showToast("Good fortune tied in");
          break;
        case "himmeli":
          this.anim.himmeli = now;
          showToast("Turning in the draft");
          break;
        case "diya":
          this.anim.diya = now;
          this.physics.flick(10);
          showToast("Diya lit. May light chase the dark 🪔");
          break;
        case "vel":
          this.anim.vel = now;
          this.physics.flick(18);
          showToast("Vetrivel Muruganukku Arogara");
          break;
        case "garland":
          this.physics.setDangled(false);
          showToast("Hanging a fresh garland…");
          setTimeout(() => this.physics.setDangled(true), 850);
          break;
        case "emoji":
          if (window.electronAPI) window.electronAPI.openGallery();
          this.physics.flick(25);
          break;
        default:
          this.physics.flick(26);
          showToast(`${this.charm.name} blessed`);
      }
    }

    // Plays a ritual animation for `duration` seconds, then calls `done`
    runAnim(key, duration, now, frame, done) {
      const start = this.anim[key];
      if (start == null) return;
      const elapsed = now - start;
      if (elapsed >= duration) {
        this.anim[key] = null;
        done();
      } else {
        frame(elapsed, elapsed / duration);
      }
    }

    updateRituals(now) {
      const set = (el, attr, v) => el && el.setAttribute(attr, v);
      const clear = (el, attr) => el && el.removeAttribute(attr);

      const arm = this.q(".dg-maneki-arm");
      this.runAnim("maneki", 2.4, now, (_, t) => {
        set(arm, "transform", `rotate(${(Math.sin(t * Math.PI * 8) * 18 * (1 - t) ** 2).toFixed(2)} 24 38)`);
      }, () => clear(arm, "transform"));

      const wings = this.q(".dg-scarab-wings");
      this.runAnim("scarab", 3.2, now, (_, t) => {
        const curve = Math.sin(t * Math.PI);
        set(wings, "opacity", Math.min(curve * 1.5, 1).toFixed(3));
        const k = (0.85 + 0.25 * curve).toFixed(3);
        set(wings, "transform", `scale(${k} ${k})`);
      }, () => { set(wings, "opacity", "0"); clear(wings, "transform"); });

      const bell = this.q(".dg-ghanta-body");
      this.runAnim("ghanta", 2.2, now, (e) => {
        set(bell, "transform", `rotate(${(10 * Math.exp(-1.45 * e) * Math.sin(e * Math.PI * 4.3)).toFixed(2)})`);
      }, () => clear(bell, "transform"));

      const knot = this.q(".dg-knot-body");
      this.runAnim("knot", 3.5, now, (e) => {
        const cinch = Math.sin(Math.min(e / 0.5, 1) * Math.PI / 2) * Math.exp(-e * 0.8);
        const swing = 6 * Math.exp(-e * 0.8) * Math.sin(e * Math.PI * 2);
        set(knot, "transform", `rotate(${swing.toFixed(2)}) scale(${(1 - 0.15 * cinch).toFixed(3)} ${(1 + 0.12 * cinch).toFixed(3)})`);
      }, () => clear(knot, "transform"));

      const himmeli = this.q(".dg-himmeli-body");
      this.runAnim("himmeli", 4, now, (_, t) => {
        set(himmeli, "transform", `scale(${Math.cos(t * Math.PI * 6).toFixed(3)} 1)`);
      }, () => clear(himmeli, "transform"));

      const flame = this.q(".ld-flame-boost");
      this.runAnim("diya", 2.8, now, (_, t) => {
        const k = (1 + 0.9 * Math.sin(t * Math.PI)).toFixed(3);
        set(flame, "transform", `scale(${k})`);
      }, () => clear(flame, "transform"));

      const halo = this.q(".ld-vel-glow");
      this.runAnim("vel", 2.6, now, (_, t) => {
        set(halo, "opacity", Math.sin(t * Math.PI).toFixed(3));
      }, () => set(halo, "opacity", "0"));
    }

    // --- Frame ---------------------------------------------------------------
    render() {
      const p = this.physics;
      const pts = p.pts;
      const end = p.end;
      const endAngle = p.endAngle();

      let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
      for (let i = 1; i < p.count - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
      }
      d += ` L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
      this.ropePaths.forEach((path) => path.setAttribute("d", d));

      if (this.charm.beads) {
        const raise = this.charm.beads.raise || 0;
        const beads = this.beadsGroup.children;
        [34, 24, 15].forEach((dist, i) => {
          const at = p.interpolated(1 - (dist + raise) / p.restLength);
          if (beads[i]) beads[i].setAttribute("transform", `translate(${at.x.toFixed(2)} ${at.y.toFixed(2)}) rotate(${(at.angle * 180 / Math.PI).toFixed(2)})`);
        });
      }

      if (this.charm.art.type === "garland") {
        const chilies = this.garlandGroup.children;
        GARLAND_CONFIG.slots.forEach((t, i) => {
          const at = p.interpolated(t);
          const rot = ((at.angle + GARLAND_CONFIG.slotJitter[i]) * 180 / Math.PI).toFixed(2);
          if (chilies[i]) chilies[i].setAttribute("transform", `translate(${at.x.toFixed(2)} ${at.y.toFixed(2)}) rotate(${rot})`);
        });
      }

      this.charmGroup.setAttribute("transform", `translate(${end.x.toFixed(2)} ${end.y.toFixed(2)}) rotate(${(endAngle * 180 / Math.PI).toFixed(2)})`);

      const r = Math.round(28 * SCALE);
      const gx = (end.x + p.hangOffset * Math.sin(endAngle)) * SCALE;
      const gy = (end.y + p.hangOffset * Math.cos(endAngle)) * SCALE;
      this.grabButton.style.width = `${r * 2}px`;
      this.grabButton.style.height = `${r * 2}px`;
      this.grabButton.style.transform = `translate(${(gx - r).toFixed(1)}px, ${(gy - r).toFixed(1)}px)`;

      const ax = p.anchorX * SCALE;
      this.anchorHandle.style.transform = `translate(${(ax - 25).toFixed(1)}px, 0)`;
      this.closeBtn.style.transform = `translate(${(ax + 32).toFixed(1)}px, 2px)`;
    }

    // --- Charm changes -------------------------------------------------------
    setCharm(data) {
      const found = CHARMS.find((c) => c.slug === data.slug);
      if (!found) return;
      this.charm = found;
      this.state.slug = found.slug;
      if (data.emoji) this.state.emoji = data.emoji;
      if (data.customImage) this.state.customImage = data.customImage;
      if (data.customImageAspect) this.state.customImageAspect = data.customImageAspect;
      this.buildVisuals();
      this.physics.flick(24);
    }

    toJSON() {
      return { ...this.state, anchorXRatio: this.physics.anchorX / (window.innerWidth / SCALE) };
    }
  }

  // ---------------------------------------------------------------------------
  // Managing the set of charms
  // ---------------------------------------------------------------------------
  // Pick the spot along the top edge that is furthest from every hanging charm
  function freeAnchorRatio() {
    const taken = dangles.map((d) => d.physics.anchorX / (window.innerWidth / SCALE));
    if (!taken.length) return 0.75;
    let best = 0.5;
    let bestGap = -1;
    for (let r = 0.08; r <= 0.92; r += 0.01) {
      const gap = Math.min(...taken.map((t) => Math.abs(t - r)));
      if (gap > bestGap) { bestGap = gap; best = r; }
    }
    return best;
  }

  function addDangle(state, { drop = true, save = true } = {}) {
    if (dangles.length >= MAX_DANGLES) {
      showToast(`Up to ${MAX_DANGLES} charms can hang at once`);
      return null;
    }
    const lengths = [12, 10, 13, 11, 14, 9, 12, 10];
    const dangle = new Dangle({
      ...state,
      anchorXRatio: typeof state.anchorXRatio === "number" ? state.anchorXRatio : freeAnchorRatio(),
      length: state.length || lengths[dangles.length % lengths.length]
    });
    dangles.push(dangle);
    dangles.forEach((d) => d.updateCloseTitle());
    activeDangle = dangle;
    if (drop && allDangled) setTimeout(() => dangle.physics.setDangled(true), 120);
    if (save) saveAll();
    return dangle;
  }

  function removeDangle(dangle) {
    const i = dangles.indexOf(dangle);
    if (i < 0 || dangles.length <= 1) return;
    dangle.physics.setDangled(false);
    dangles.splice(i, 1);
    if (activeDangle === dangle) activeDangle = dangles[dangles.length - 1];
    dangles.forEach((d) => d.updateCloseTitle());
    setTimeout(() => dangle.destroy(), 700); // let it rise off screen first
    refreshInteractive();
    saveAll();
  }

  function setAllDangled(on) {
    allDangled = on;
    dangles.forEach((d, i) => setTimeout(() => d.physics.setDangled(on), i * 90));
  }

  function ritualAll() {
    if (!allDangled) return setAllDangled(true);
    dangles.forEach((d, i) => setTimeout(() => d.performRitual(), i * 150));
  }

  function saveAll() {
    if (!window.electronAPI) return;
    const active = activeDangle || dangles[0];
    const list = dangles.map((d) => d.toJSON());
    window.electronAPI.saveSettings({
      dangles: list,
      activeIndex: Math.max(0, dangles.indexOf(active)),
      // Keep the single-charm fields in sync for the gallery and older builds
      slug: active?.state.slug,
      emoji: active?.state.emoji,
      customImage: active?.state.customImage,
      customImageAspect: active?.state.customImageAspect
    });
  }

  // ---------------------------------------------------------------------------
  // Context menu
  // ---------------------------------------------------------------------------
  function openContextMenu(dangle, x, y) {
    menuTarget = dangle;
    cmRemove.hidden = dangles.length <= 1;
    cmAdd.hidden = dangles.length >= MAX_DANGLES;
    contextMenu.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 240)}px`;
    contextMenu.classList.add("visible");
    setInteractive(true);
  }
  function closeContextMenu() {
    if (!contextMenu.classList.contains("visible")) return;
    contextMenu.classList.remove("visible");
    refreshInteractive();
  }
  const menuAction = (el, fn) => el && el.addEventListener("click", () => { const t = menuTarget; closeContextMenu(); fn(t); });
  menuAction(cmRitual, (t) => t && t.performRitual());
  menuAction(cmGallery, () => window.electronAPI && window.electronAPI.openGallery());
  menuAction(cmAdd, (t) => addDangle({ slug: t ? t.state.slug : "diya", emoji: t?.state.emoji }));
  menuAction(cmRemove, (t) => t && removeDangle(t));
  menuAction(cmToggle, () => setAllDangled(!allDangled));
  menuAction(cmQuit, () => window.electronAPI && window.electronAPI.quitApp());
  window.addEventListener("pointerdown", (e) => {
    if (!contextMenu.contains(e.target)) closeContextMenu();
  });

  window.addEventListener("resize", () => dangles.forEach((d) => d.updateBounds()));

  // The cursor brushing past nudges every charm (mouse moves are forwarded even while click-through)
  window.addEventListener("pointermove", (e) => {
    const pos = { x: e.clientX / SCALE, y: e.clientY / SCALE };
    for (const d of dangles) d.physics.mouse = pos;
  });
  document.addEventListener("mouseleave", () => {
    for (const d of dangles) d.physics.mouse = null;
  });

  // ---------------------------------------------------------------------------
  // Loop: fixed-step physics for every charm
  // ---------------------------------------------------------------------------
  let lastTime = 0;
  let accumulator = 0;
  const fixedDt = 1 / 120;
  function loop(nowMs) {
    requestAnimationFrame(loop);
    const delta = lastTime === 0 ? fixedDt : Math.min((nowMs - lastTime) / 1000, 0.1);
    lastTime = nowMs;
    accumulator += delta;
    while (accumulator >= fixedDt) {
      for (const d of dangles) d.physics.step(fixedDt);
      accumulator -= fixedDt;
    }
    const now = nowMs / 1000;
    for (const d of dangles) {
      d.updateRituals(now);
      d.render();
    }
  }

  // ---------------------------------------------------------------------------
  // Startup + messages from the main process (tray, shortcuts, gallery)
  // ---------------------------------------------------------------------------
  function start(settings) {
    let list = Array.isArray(settings?.dangles) && settings.dangles.length ? settings.dangles : null;
    if (!list) {
      // Migrate the old single-charm settings
      list = [{
        slug: settings?.slug || "diya",
        emoji: settings?.emoji,
        customImage: settings?.customImage,
        customImageAspect: settings?.customImageAspect,
        anchorXRatio: typeof settings?.anchorXRatio === "number" ? settings.anchorXRatio : 0.75,
        darumaState: settings?.darumaState || 0,
        drishtiColorIndex: settings?.drishtiColorIndex || 0
      }];
    }
    list.slice(0, MAX_DANGLES).forEach((s) => addDangle(s, { drop: false, save: false }));
    activeDangle = dangles[Math.min(settings?.activeIndex || 0, dangles.length - 1)];
    saveAll(); // persists the migrated multi-charm format straight away
    requestAnimationFrame(loop);
    setTimeout(() => setAllDangled(true), 450);
  }

  if (window.electronAPI) {
    window.electronAPI.onCharmChanged((data) => {
      const target = activeDangle || dangles[0];
      if (target) { target.setCharm(data); saveAll(); }
    });
    window.electronAPI.onCharmAdded((data) => {
      addDangle({
        slug: data.slug,
        emoji: data.emoji,
        customImage: data.customImage,
        customImageAspect: data.customImageAspect
      });
    });
    window.electronAPI.onToggleDangle(() => setAllDangled(!allDangled));
    window.electronAPI.onPerformRitual(() => ritualAll());
    window.electronAPI.getSettings().then(start);
  } else {
    start(null);
  }

  // Shortcuts while the overlay itself has focus
  window.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
    if (e.code === "KeyD") { e.preventDefault(); setAllDangled(!allDangled); }
    else if (e.code === "KeyS") { e.preventDefault(); ritualAll(); }
  });
})();

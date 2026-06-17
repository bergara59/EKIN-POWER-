/* Año actual en el footer */
document.getElementById("year").textContent = new Date().getFullYear();

/* Menú móvil: abrir / cerrar */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

/* Cierra el menú al tocar un enlace */
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* Banda en vivo: líneas de "mercado energético" fluyendo (canvas) */
const liveCanvas = document.getElementById("liveCanvas");
if (liveCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = liveCanvas.getContext("2d");
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const series = [
    { color: "rgba(59,158,255,0.9)", amp: 0.16, freq: 1.4, sp: 0.6, off: 0.5 },   // precio (azul)
    { color: "rgba(207,214,224,0.55)", amp: 0.11, freq: 2.1, sp: 0.9, off: 0.45 }, // demanda (gris)
    { color: "rgba(61,220,132,0.85)", amp: 0.13, freq: 1.0, sp: 0.4, off: 0.6 },   // ahorro (verde)
  ];
  function resize() {
    const r = liveCanvas.getBoundingClientRect();
    w = r.width; h = r.height;
    liveCanvas.width = w * dpr; liveCanvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  let t = 0, raf;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    // rejilla sutil
    ctx.strokeStyle = "rgba(59,158,255,0.06)";
    ctx.lineWidth = 1;
    for (let x = (t * 18) % 48 - 48; x < w; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // líneas
    series.forEach((s) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const nx = x / w;
        const y = h * (s.off
          + s.amp * Math.sin(nx * s.freq * 6.28 + t * s.sp)
          + s.amp * 0.4 * Math.sin(nx * s.freq * 13 - t * s.sp * 1.7));
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
    t += 0.016;
    raf = requestAnimationFrame(draw);
  }
  // pausa fuera de pantalla
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { if (!raf) draw(); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
  });
  io.observe(liveCanvas);
}

/* Pronóstico energético: datos vivos */
const fcIrr = document.getElementById("fcIrr");
if (fcIrr && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const fcTemp = document.getElementById("fcTemp");
  const fcWind = document.getElementById("fcWind");
  const fcSolar = document.getElementById("fcSolar");
  const sparks = document.querySelectorAll(".fc-spark i");
  let irr = 820, temp = 28, wind = 14;
  setInterval(() => {
    irr = Math.max(680, Math.min(960, irr + (Math.random() * 60 - 30)));
    temp = Math.max(22, Math.min(34, temp + (Math.random() * 1.6 - 0.8)));
    wind = Math.max(6, Math.min(28, wind + (Math.random() * 4 - 2)));
    const solar = Math.round(irr / 9.6);
    fcIrr.textContent = Math.round(irr);
    fcTemp.textContent = Math.round(temp);
    fcWind.textContent = Math.round(wind);
    fcSolar.textContent = solar;
    if (sparks[0]) sparks[0].style.width = Math.round((irr / 960) * 100) + "%";
    if (sparks[1]) sparks[1].style.width = Math.round((temp / 40) * 100) + "%";
    if (sparks[2]) sparks[2].style.width = Math.round((wind / 30) * 100) + "%";
    if (sparks[3]) sparks[3].style.width = solar + "%";
  }, 2400);
}

/* Investment memo (financiación) */
const finmemo = document.getElementById("finmemo");
if (finmemo) {
  const fin = [
    { name: "CAPEX · COMPRA DIRECTA", badge: "MAX RETORNO", inv: 95, invV: "Alta", sav: 100, savV: "100%", risk: 55, riskV: "Medio", pay: "2–4 años", tir: "18–25%", own: "Día 1", note: "Ideal para quien busca el máximo retorno a largo plazo y puede invertir capital." },
    { name: "ARRENDAMIENTO FINANCIERO", badge: "LIQUIDEZ", inv: 45, invV: "Media", sav: 80, savV: "Alto", risk: 32, riskV: "Bajo-medio", pay: "Pagos fijos", tir: "12–18%", own: "Al final", note: "Ideal para acceder a la tecnología con pagos previsibles, sin descapitalizar la empresa." },
    { name: "ESCO · INVERSIÓN CERO", badge: "SIN INVERSIÓN", inv: 5, invV: "Cero", sav: 60, savV: "Compartido", risk: 8, riskV: "Mínimo", pay: "Desde día 1", tir: "—", own: "EKIN POWER", note: "Ideal para ahorrar sin arriesgar capital: nosotros invertimos y compartes el ahorro." },
  ];
  const $ = (id) => document.getElementById(id);
  function setFin(i) {
    const d = fin[i];
    $("finName").textContent = d.name;
    $("finBadge").textContent = d.badge;
    $("finInv").style.width = d.inv + "%"; $("finInvV").textContent = d.invV;
    $("finSav").style.width = d.sav + "%"; $("finSavV").textContent = d.savV;
    $("finRisk").style.width = d.risk + "%"; $("finRiskV").textContent = d.riskV;
    $("finPay").textContent = d.pay;
    $("finTir").textContent = d.tir;
    $("finOwn").textContent = d.own;
    $("finNote").textContent = d.note;
  }
  finmemo.querySelectorAll(".fin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      finmemo.querySelectorAll(".fin-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      setFin(+tab.dataset.f);
    });
  });
  setFin(0);
}

/* Selector de industrias */
const industry = document.getElementById("industry");
if (industry) {
  const data = [
    { n: "MANUFACTURA & FÁBRICAS", pain: "Picos de demanda y bajo factor de potencia que disparan los cargos por capacidad.", var: "kWh / unidad producida", sol: "Optimización + BESS (peak shaving) + PPA + corrección de cos φ.", met: "€/MWh · €/unidad" },
    { n: "HOTELES & RESORTS", pain: "Climatización y agua caliente con ocupación variable; consumo difícil de controlar.", var: "kWh / cuarto ocupado", sol: "Control de demanda + solar autoconsumo + eficiencia térmica + ESG.", met: "kWh/cuarto · €/noche" },
    { n: "SUPERMERCADOS & RETAIL", pain: "Refrigeración 24/7 y decenas de sedes sin visibilidad comparada.", var: "kWh / m²", sol: "Optimización de frío + solar distribuida + benchmark multisede.", met: "kWh/m² · €/tienda" },
    { n: "CINES & ENTRETENIMIENTO", pain: "Climatización dimensionada al pico, con ocupación intermitente.", var: "kWh / sesión", sol: "Gestión por ocupación + programación de cargas + tarifas.", met: "kWh/asiento" },
    { n: "CENTROS LOGÍSTICOS", pain: "Operación 24/7, naves enormes y electrificación de flotas.", var: "kWh / m² + movilidad", sol: "Iluminación industrial + solar + infraestructura de recarga EV.", met: "kWh/m² · €/pallet" },
    { n: "HOSPITALES & CLÍNICAS", pain: "La continuidad es crítica: un corte no es una opción.", var: "Disponibilidad + kWh/cama", sol: "Respaldo (BESS) + calidad de energía + eficiencia en áreas críticas.", met: "Uptime · kWh/cama" },
    { n: "PLANTAS DE PROCESO", pain: "Vapor, aire comprimido y motores que se comen la factura.", var: "kWh / tonelada", sol: "Recuperación de calor + variadores + integración renovable.", met: "kWh/ton" },
    { n: "OFICINAS CORPORATIVAS", pain: "HVAC, iluminación y presión ESG sin datos para decidir.", var: "kWh/m² + kgCO₂", sol: "Edificios inteligentes + solar + certificación LEED/ESG.", met: "kWh/m² · tCO₂" },
  ];
  const panel = industry.querySelector(".ind-panel");
  const elName = document.getElementById("indName");
  const elPain = document.getElementById("indPain");
  const elVar = document.getElementById("indVar");
  const elSol = document.getElementById("indSol");
  const elMet = document.getElementById("indMet");
  function render(i) {
    const d = data[i];
    panel.classList.add("switching");
    setTimeout(() => {
      elName.textContent = d.n;
      elPain.textContent = d.pain;
      elVar.textContent = d.var;
      elSol.textContent = d.sol;
      elMet.textContent = d.met;
      panel.classList.remove("switching");
    }, 180);
  }
  industry.querySelectorAll(".ind-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      industry.querySelectorAll(".ind-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      render(+tab.dataset.i);
    });
  });
  render(0);
}

/* Calculadora de ahorro */
const calcBill = document.getElementById("calcBill");
if (calcBill) {
  const out = document.getElementById("calcBillOut");
  const sectorSel = document.getElementById("calcSector");
  const btn = document.getElementById("calcBtn");
  const screen = document.getElementById("calcScreen");
  const ccSave = document.getElementById("ccSave");
  const ccPct = document.getElementById("ccPct");
  const ccCo2 = document.getElementById("ccCo2");
  const ccPay = document.getElementById("ccPay");
  const calcNote = document.getElementById("calcNote");
  const nf = new Intl.NumberFormat("es-MX");

  const updateBill = () => { out.textContent = "€" + nf.format(+calcBill.value); };
  calcBill.addEventListener("input", updateBill);
  updateBill();

  function animateNum(el, target, fmt) {
    const start = performance.now(), dur = 1100;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  btn.addEventListener("click", () => {
    const bill = +calcBill.value;
    const annual = bill * 12;
    const pHigh = parseFloat(sectorSel.value);     // potencial alto del sector
    const pLow = pHigh * 0.55;
    const pMid = (pLow + pHigh) / 2;
    const saving = Math.round(annual * pMid);
    const kWh = annual / 0.16;                      // ~€/kWh
    const co2 = Math.round((kWh * pMid * 0.42) / 1000); // toneladas
    screen.dataset.state = "done";
    animateNum(ccSave, saving, (v) => "€" + nf.format(v));
    ccPct.textContent = Math.round(pLow * 100) + "–" + Math.round(pHigh * 100) + "%";
    animateNum(ccCo2, co2, (v) => nf.format(v) + " t");
    ccPay.textContent = "1.5–3 años";
    calcNote.innerHTML = "Estimación orientativa. El <b>cálculo exacto</b> va en tu Energy Assessment.";
  });
}

/* Terminal de inteligencia energética (hero) */
const termBoot = document.getElementById("termBoot");
const termClock = document.getElementById("termClock");
if (termBoot) {
  const lines = [
    ['EKIN POWER SYSTEM INITIALIZING', 'bl'],
    ['LOAD DATA CONNECTED', 'ok'],
    ['TARIFF ENGINE ONLINE', 'ok'],
    ['BESS OPTIMIZER ACTIVE', 'ok'],
    ['SAVINGS MODEL READY', 'ok'],
  ];
  let i = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function boot() {
    if (i < lines.length) {
      const [txt, cls] = lines[i];
      const mark = cls === 'ok' ? '<span class="ok">✓</span> ' : '<span class="bl">▸</span> ';
      termBoot.insertAdjacentHTML("beforeend", `<div>${mark}${txt}</div>`);
      // mantener solo las últimas 3 líneas
      while (termBoot.children.length > 3) termBoot.removeChild(termBoot.firstChild);
      i++;
      setTimeout(boot, reduced ? 0 : 520);
    } else {
      termBoot.insertAdjacentHTML("beforeend", '<div><span class="term-cursor">█</span> awaiting site data…</div>');
      while (termBoot.children.length > 3) termBoot.removeChild(termBoot.firstChild);
    }
  }
  boot();

  if (termClock) {
    const p = (x) => String(x).padStart(2, "0");
    const tickT = () => {
      const n = new Date();
      termClock.textContent = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
    };
    tickT(); setInterval(tickT, 1000);
  }

  /* Datos "vivos" sutiles */
  if (!reduced) {
    const ttCost = document.getElementById("ttCost");
    const ttSoc = document.getElementById("ttSoc");
    const ttSocBar = document.getElementById("ttSocBar");
    let soc = 78, cost = 142;
    setInterval(() => {
      soc = Math.max(70, Math.min(88, soc + (Math.random() * 6 - 3)));
      cost = Math.max(128, Math.min(156, cost + (Math.random() * 8 - 4)));
      if (ttSoc) ttSoc.textContent = Math.round(soc);
      if (ttSocBar) ttSocBar.style.width = Math.round(soc) + "%";
      if (ttCost) ttCost.textContent = Math.round(cost);
    }, 2200);
  }
}

/* Reloj "live" del board de Experiencia */
const boardClock = document.getElementById("boardClock");
if (boardClock) {
  const tick = () => {
    const n = new Date();
    const p = (x) => String(x).padStart(2, "0");
    boardClock.textContent = `${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

/* Simulador BESS: pestañas que cambian curva, texto, lecturas y alerta */
const bessScreen = document.querySelector(".bess-screen");
if (bessScreen) {
  const bessCaption = document.getElementById("bessCaption");
  const bessAlert = document.getElementById("bessAlert");
  const bessReadouts = document.getElementById("bessReadouts");

  const bessData = {
    arbitraje: {
      text: "<strong>Arbitraje.</strong> La batería se carga de madrugada, cuando la energía es barata, y descarga en las horas pico, cuando es cara. Pagas menos por la misma energía.",
      alert: "PRICE ARBITRAGE ACTIVE",
      reads: [["BUY @", "€78/MWh", ""], ["SELL @", "€142/MWh", ""], ["SPREAD", "▲ +82%", "up"], ["CYCLES/DAY", "1.0", ""]],
    },
    peak: {
      text: "<strong>Peak Shaving.</strong> La batería recorta los picos de demanda: en vez de pagar caros cargos por capacidad, la energía sale de la batería y aplanas tu curva.",
      alert: "DEMAND CHARGE AVOIDED",
      reads: [["PEAK BEFORE", "1.42 MW", ""], ["PEAK AFTER", "0.98 MW", ""], ["DEMAND SAVED", "▲ 31%", "up"], ["WINDOW", "18–21h", ""]],
    },
    respaldo: {
      text: "<strong>Backup.</strong> Ante un corte de red, la batería entra en milisegundos y cubre tu operación. Cero interrupciones en procesos críticos.",
      alert: "OUTAGE COVERED · 0 ms",
      reads: [["TRANSFER", "< 20 ms", ""], ["AUTONOMY", "4 h", ""], ["CRITICAL LOADS", "100%", "up"], ["UPTIME", "▲ 99.98%", "up"]],
    },
    solar: {
      text: "<strong>Solar Firming.</strong> El excedente solar de mediodía se guarda en la batería y se usa después, estabilizando la generación y aprovechando cada kWh.",
      alert: "SOLAR FIRMING ON",
      reads: [["SOLAR USE", "▲ +24%", "up"], ["GRID EXPORT", "▼ −60%", "up"], ["MIDDAY CHARGE", "11–15h", ""], ["SELF-SUFF.", "▲ 68%", "up"]],
    },
  };

  function renderReadouts(mode) {
    if (!bessReadouts) return;
    bessReadouts.innerHTML = bessData[mode].reads
      .map(([k, v, c]) => `<div class="ro"><span class="ro-k">${k}</span><span class="ro-v ${c}">${v}</span></div>`)
      .join("");
  }
  function setMode(mode) {
    bessScreen.dataset.mode = mode;
    if (bessCaption) bessCaption.innerHTML = bessData[mode].text;
    if (bessAlert) bessAlert.textContent = bessData[mode].alert;
    renderReadouts(mode);
  }
  bessScreen.querySelectorAll(".bess-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      bessScreen.querySelectorAll(".bess-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
      setMode(tab.dataset.mode);
    });
  });
  setMode("arbitraje");
}

/* Acordeón de sectores: solo uno abierto a la vez */
const sectorAccs = document.querySelectorAll(".sector-acc");
sectorAccs.forEach((acc) => {
  const btn = acc.querySelector(".sector-acc-btn");
  const panel = acc.querySelector(".sector-acc-panel");
  btn.addEventListener("click", () => {
    const willOpen = !acc.classList.contains("open");
    // Cierra todos los demás
    sectorAccs.forEach((other) => {
      if (other !== acc) {
        other.classList.remove("open");
        other.querySelector(".sector-acc-btn").setAttribute("aria-expanded", "false");
        other.querySelector(".sector-acc-panel").style.maxHeight = "";
      }
    });
    // Alterna el actual
    acc.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    panel.style.maxHeight = willOpen ? panel.scrollHeight + "px" : "";
  });
});

/* Barra de progreso de scroll */
const progressBar = document.getElementById("scrollProgress");
function updateProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = Math.min(scrolled * 100, 100) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* Efectos de cursor (solo en dispositivos con mouse y sin reduced-motion) */
const finePointer = window.matchMedia("(pointer: fine)").matches;
if (finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

  /* Foco de luz que sigue al cursor dentro de tarjetas */
  document.querySelectorAll(".card, .reason").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* Inclinación 3D de tarjetas y proyectos */
  document.querySelectorAll(".card, .project").forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* Botones primarios magnéticos */
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  /* Parallax del hero según el movimiento del cursor */
  const heroSection = document.querySelector(".hero");
  const heroPhoto = document.querySelector(".hero-photo");
  const heroInner = document.querySelector(".hero-inner");
  if (heroSection && heroPhoto) {
    let raf = null;
    heroSection.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = heroSection.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        heroPhoto.style.transform = `translate(${px * -18}px, ${py * -18}px) scale(1.06)`;
        if (heroInner) heroInner.style.transform = `translate(${px * 8}px, ${py * 8}px)`;
        raf = null;
      });
    });
    heroSection.addEventListener("mouseleave", () => {
      heroPhoto.style.transform = "";
      if (heroInner) heroInner.style.transform = "";
    });
  }
}

/* Resalta en el menú la sección que se está viendo (scroll-spy) */
const spyLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
const spyTargets = spyLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = "#" + entry.target.id;
        spyLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === id)
        );
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
spyTargets.forEach((t) => spyObserver.observe(t));

/* Números que cuentan hacia arriba al entrar en pantalla */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  if (prefersReduced) {
    el.textContent = prefix + target + suffix;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* Aparición de elementos al hacer scroll */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document
  .querySelectorAll(
    ".section-head, .card, .reason, .faq-item, .cta-inner, .module, .ind-tab, .ind-panel, .board, .bess-screen, .impact-card, .compare-wrap, .calc, .client-card, .step, .livefeed-content, .fin-tab, .fin-panel"
  )
  .forEach((el, idx) => {
    el.style.setProperty("--ri", (idx % 6).toString());
    observer.observe(el);
  });

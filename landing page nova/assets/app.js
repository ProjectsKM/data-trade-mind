/* ============================================================
   OrionHub landing — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Data ---------- */
  const brokers = ["TradingView", "IQ Option", "Quotex", "MetaTrader 5", "Binance", "Bybit", "Pocket Option", "Olymp Trade", "Exnova", "Avalon"];

  const tools = [
    {
      id: "mind", route: "/mind", label: "OrionMind",
      icon: '<path d="M12 2a4 4 0 0 0-4 4v1H7a3 3 0 0 0 0 6h.5"/><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-.5"/><path d="M9 18h6M10 22h4"/>',
      title: "Mentor IA que anota por você",
      desc: "Converse sobre estratégia, gestão e psicologia. O OrionMind tira qualquer dúvida do mercado e registra suas operações automaticamente na planilha — por texto ou voz.",
      bullets: ["Registro automático na planilha", "Comando por voz em tempo real", "Memória do seu histórico de banca"],
    },
    {
      id: "scan", route: "/scan", label: "OrionScan",
      icon: '<path d="M3 3h18v14H3z"/><path d="M7 21h10M12 17v4"/><path d="M7 13l3-3 2 2 4-4"/>',
      title: "Escaneia o print e diz a hora de entrar",
      desc: "A IA lê o gráfico de qualquer broker, identifica tendência, suporte e resistência e calcula o horário certo de entrada com as duas proteções da gestão Orion.",
      bullets: ["Direção + nível de confiança", "Suporte, resistência e padrões marcados", "Horário de entrada e proteções"],
    },
    {
      id: "gestao", route: "/gestao", label: "Gestão",
      icon: '<path d="M3 3v18h18"/><path d="M7 14l3-4 3 2 4-6"/>',
      title: "Planilha inteligente de lucros",
      desc: "Toda operação vira dado: win-rate, lucro acumulado, melhor ativo e drawdown calculados em tempo real, com exportação em PDF e sincronização na nuvem.",
      bullets: ["Win-rate e lucro em tempo real", "Melhor ativo e curva de capital", "Exportação em PDF e cloud sync"],
    },
    {
      id: "calc", route: "/calc", label: "Calculadora",
      icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h3M13 10h3M8 14h3M13 14h3M8 18h8"/>',
      title: "Calculadora de banca e gestão",
      desc: "Defina sua banca e o risco por entrada — a calculadora aplica a gestão padrão Orion: 1% por operação, duas proteções (martingale controlado) e stop diário automático.",
      bullets: ["Risco de 1% por entrada", "Duas proteções calculadas", "Stop loss e stop win diários"],
    },
    {
      id: "noticias", route: "/noticias", label: "Notícias",
      icon: '<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 9v11"/>',
      title: "Calendário econômico por impacto",
      desc: "Os eventos que movem o mercado, classificados por grau de impacto — alto, médio e baixo — em tempo real, para você saber exatamente quando ficar de fora.",
      bullets: ["Impacto alto, médio e baixo", "Horário e moeda afetada", "Alertas antes dos eventos"],
    },
    {
      id: "crypto", route: "/cryptobubbles", label: "CryptoBubbles",
      icon: '<circle cx="8" cy="9" r="4"/><circle cx="17" cy="15" r="3"/><circle cx="16" cy="6" r="2"/>',
      title: "Radar visual do mercado cripto",
      desc: "Veja o mercado inteiro de relance: cada moeda é uma bolha dimensionada pela variação. Identifique pra onde o dinheiro está fluindo em segundos.",
      bullets: ["Variação 24h visual", "Tamanho proporcional ao movimento", "Integrado ao seu painel"],
    },
  ];

  /* mock UI builders per tool */
  const mocks = {
    mind: () => `<div class="mock"><div class="mk">
      <div class="mk-head"><span class="dots"><i></i><i></i><i></i></span><span class="mk-title">OrionMind</span><span class="mk-route">/mind</span></div>
      <div class="mk-body"><div class="mind-msgs">
        <div class="mind-msg u"><span class="micon">${svg('<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>', 2)}</span>"Win em BTC, 50 dólares, payout 86, compra"</div>
        <div class="mind-msg a">Anotado! 📈 Esse foi seu <b style="color:var(--win)">4º win seguido</b> hoje. Quer ver o resumo do dia?</div>
        <div class="mind-logcard"><span class="lc-ic">${svg('<path d="M20 6 9 17l-5-5"/>', 2.6)}</span><div><div class="lc-t">BTC/USD · Compra</div><div class="lc-s">Registrado na planilha · payout 86%</div></div><span class="lc-amt">+$43</span></div>
      </div>
      <div class="mind-input"><span class="ph">Fale ou digite sua operação…</span><span class="mic">${svg('<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>', 2)}</span></div>
      </div></div></div>`,

    scan: () => `<div class="mock"><div class="chart-card" style="box-shadow:var(--shadow)">
      <div class="chart-top"><span class="pair">BTC/USD <span class="tf">· M5</span></span><span class="ai-badge">${svg('<path d="M12 3v3M12 18v3M5 12H2M22 12h-3"/><circle cx="12" cy="12" r="4"/>', 2)}IA · 87%</span></div>
      <div class="chart-plot">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none"><defs><linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34E0A1" stop-opacity="0.28"/><stop offset="100%" stop-color="#34E0A1" stop-opacity="0"/></linearGradient></defs>
        <path d="M0,150 L40,140 L70,155 L100,130 L140,138 L170,110 L210,120 L240,90 L280,98 L320,64 L360,72 L400,42 L400,200 L0,200 Z" fill="url(#fill2)"/>
        <path d="M0,150 L40,140 L70,155 L100,130 L140,138 L170,110 L210,120 L240,90 L280,98 L320,64 L360,72 L400,42" fill="none" stroke="#34E0A1" stroke-width="2.4" stroke-linejoin="round"/></svg>
        <div class="zone res" style="top:24%"><span class="zlabel">RESISTÊNCIA 63.580</span></div>
        <div class="zone sup" style="top:74%"><span class="zlabel">SUPORTE 63.180</span></div>
        <span class="call-badge" style="top:14%;right:14%">▲ CALL · 87%</span>
      </div>
      <div class="scan-stats"><div><div class="k">Tendência</div><div class="v up">Alta</div></div><div><div class="k">Suporte</div><div class="v">63.180</div></div><div><div class="k">Resistência</div><div class="v">63.580</div></div><div><div class="k">Entrada</div><div class="v">14:35</div></div></div>
    </div></div>`,

    gestao: () => `<div class="mock"><div class="mk">
      <div class="mk-head"><span class="dots"><i></i><i></i><i></i></span><span class="mk-title">Planilha</span><span class="mk-route">/gestao</span></div>
      <div class="mk-body">
        <div class="gest-stats"><div><div class="k">Win-rate</div><div class="v up">73%</div></div><div><div class="k">Lucro mês</div><div class="v up">+R$ 4.280</div></div><div><div class="k">Drawdown</div><div class="v">8%</div></div></div>
        <div class="gest-spark"><svg viewBox="0 0 300 50" preserveAspectRatio="none"><path d="M0,40 L30,38 L60,30 L90,34 L120,24 L150,26 L180,16 L210,20 L240,10 L270,12 L300,4" fill="none" stroke="#18A6F0" stroke-width="2.2" stroke-linejoin="round"/><circle cx="300" cy="4" r="3" fill="#18A6F0"/></svg></div>
        <div class="gest-table">
          <div class="gest-trow h"><div>Ativo</div><div>Dir.</div><div>Valor</div><div>Res.</div></div>
          <div class="gest-trow"><div class="asset">BTC/USD</div><div>Call</div><div>$50</div><div class="res w">+$43</div></div>
          <div class="gest-trow"><div class="asset">EUR/USD</div><div>Put</div><div>$30</div><div class="res w">+$26</div></div>
          <div class="gest-trow"><div class="asset">GOLD</div><div>Call</div><div>$40</div><div class="res l">−$40</div></div>
          <div class="gest-trow"><div class="asset">ETH/USD</div><div>Call</div><div>$50</div><div class="res w">+$44</div></div>
        </div>
      </div></div></div>`,

    calc: () => `<div class="mock"><div class="mk">
      <div class="mk-head"><span class="dots"><i></i><i></i><i></i></span><span class="mk-title">Calculadora de banca</span><span class="mk-route">/calc</span></div>
      <div class="mk-body">
        <div class="calc-display"><div class="cl">Entrada recomendada (1% da banca)</div><div class="cv">R$ 25,00</div></div>
        <div class="calc-rows">
          <div class="calc-row"><span class="ck">Banca total</span><span class="cval">R$ 2.500</span></div>
          <div class="calc-row"><span class="ck">1ª proteção</span><span class="cval">R$ 58,00</span></div>
          <div class="calc-row"><span class="ck">2ª proteção</span><span class="cval">R$ 134,00</span></div>
          <div class="calc-row"><span class="ck">Stop loss diário</span><span class="cval" style="color:var(--loss)">−R$ 125</span></div>
          <div class="calc-row hl"><span class="ck">Stop win diário</span><span class="cval">+R$ 250</span></div>
        </div>
      </div></div></div>`,

    noticias: () => `<div class="mock"><div class="mk">
      <div class="mk-head"><span class="dots"><i></i><i></i><i></i></span><span class="mk-title">Calendário econômico</span><span class="mk-route">/noticias</span></div>
      <div class="mk-body"><div class="news-list">
        <div class="news-item"><span class="imp hi"></span><span class="ntime">14:30</span><div class="nmain"><div class="nt">Payroll (NFP)</div><div class="nflag">🇺🇸 USD</div></div><span class="nbadge hi">ALTO</span></div>
        <div class="news-item"><span class="imp hi"></span><span class="ntime">15:00</span><div class="nmain"><div class="nt">Decisão de juros FED</div><div class="nflag">🇺🇸 USD</div></div><span class="nbadge hi">ALTO</span></div>
        <div class="news-item"><span class="imp md"></span><span class="ntime">11:00</span><div class="nmain"><div class="nt">PMI Industrial</div><div class="nflag">🇪🇺 EUR</div></div><span class="nbadge md">MÉDIO</span></div>
        <div class="news-item"><span class="imp lo"></span><span class="ntime">09:30</span><div class="nmain"><div class="nt">Estoque de petróleo</div><div class="nflag">🇨🇦 CAD</div></div><span class="nbadge lo">BAIXO</span></div>
      </div></div></div></div>`,

    crypto: () => {
      const bs = [
        { s: "BTC", p: "+4.2%", cls: "up", x: 38, y: 26, d: 118 },
        { s: "ETH", p: "+2.8%", cls: "up", x: 4, y: 8, d: 92 },
        { s: "SOL", p: "+9.1%", cls: "up", x: 68, y: 4, d: 80 },
        { s: "BNB", p: "−1.4%", cls: "dn", x: 2, y: 56, d: 74 },
        { s: "XRP", p: "−3.2%", cls: "dn", x: 70, y: 52, d: 86 },
        { s: "ADA", p: "+1.1%", cls: "up", x: 44, y: 62, d: 60 },
      ];
      return `<div class="mock"><div class="mk">
        <div class="mk-head"><span class="dots"><i></i><i></i><i></i></span><span class="mk-title">CryptoBubbles</span><span class="mk-route">/cryptobubbles · 24h</span></div>
        <div class="mk-body"><div class="bubbles">${bs.map((b, i) => `<div class="bubble ${b.cls}" style="width:${b.d}px;height:${b.d}px;left:${b.x}%;top:${b.y}%;animation-delay:${i * 0.4}s"><div class="bsym">${b.s}</div><div class="bpct">${b.p}</div></div>`).join("")}</div></div>
      </div></div>`;
    },
  };

  const steps = [
    { n: "01", title: "Adquira seu acesso", desc: "Pagamento único, 12 meses, garantia de 7 dias." },
    { n: "02", title: "Carregue o gráfico", desc: "Print, arrastar ou Ctrl+V. Qualquer broker." },
    { n: "03", title: "A IA analisa", desc: "Padrões, contexto e horário — em segundos." },
    { n: "04", title: "Opere com clareza", desc: "Sinal, proteções e gestão recomendada." },
  ];

  const testimonials = [
    { q: "Colo o print no OrionScan e em 2s tenho o setup pronto. Parei de perder tempo abrindo 3 plataformas pra checar suporte e resistência.", n: "Rafael M.", r: "Trader · Forex", i: "RM" },
    { q: "O OrionMind me explica os erros da semana e o que ajustar. É como ter um mentor à disposição 24h sem julgamento.", n: "Camila S.", r: "Iniciante · Opções", i: "CS" },
    { q: "A planilha automática e os relatórios mensais me deram uma clareza que eu nunca tive operando sozinho.", n: "João P.", r: "Trader · Cripto", i: "JP" },
  ];

  const compareRows = [
    { feat: "Análises com OrionScan", trial: "5 totais", anual: "Ilimitadas" },
    { feat: "OrionMind (mentor IA)", trial: "Limitado", anual: "Ilimitado" },
    { feat: "Planilha + relatórios PDF", trial: "Básico", anual: "Completo" },
    { feat: "Calculadora de banca", trial: "yes", anual: "yes" },
    { feat: "Notícias & Calendário", trial: "no", anual: "yes" },
    { feat: "CryptoBubbles", trial: "no", anual: "yes" },
    { feat: "Voz no OrionMind", trial: "no", anual: "yes" },
    { feat: "Suporte prioritário", trial: "no", anual: "yes" },
  ];

  const faqs = [
    { q: "A IA funciona com qualquer broker?", a: "Sim. A análise é feita visualmente sobre a imagem do gráfico — basta um print de qualquer plataforma (IQ Option, Quotex, MT5, TradingView, etc)." },
    { q: "Funciona em opções binárias e forex?", a: "Sim. O OrionScan lê o contexto do gráfico independentemente do ativo — opções binárias, forex, cripto ou índices. As recomendações de entrada e proteção se adaptam ao tipo de operação." },
    { q: "Vocês garantem lucros?", a: "Não. O OrionHub é uma ferramenta de apoio à decisão, não uma promessa de retorno. Operar envolve risco e resultados passados não garantem performance futura. A plataforma acelera sua leitura e disciplina — a gestão é sua." },
    { q: "Tenho garantia se não gostar?", a: "Sim. Você tem 7 dias de garantia incondicional com devolução de 100% do valor. Basta solicitar pelo suporte dentro do prazo." },
    { q: "O acesso renova automaticamente?", a: "Não. É um pagamento único que libera 12 meses completos. Não há cobrança recorrente nem renovação automática — ao fim do período você decide se quer renovar." },
    { q: "Posso usar no celular?", a: "Sim. O OrionHub funciona no navegador de qualquer dispositivo e sincroniza entre eles. Você pode instalar como app (PWA) no celular e registrar operações por voz." },
    { q: "Quem é Gabriel Dutra?", a: "Gabriel Dutra é o trader oficial da Orion Capital. A metodologia de price action, gestão de banca e disciplina que ele ensina aos alunos é a base de cada regra e fluxo dentro da plataforma." },
    { q: "Como recebo o acesso após o pagamento?", a: "O acesso é liberado automaticamente em poucos minutos após a confirmação do pagamento, com as instruções de login enviadas por e-mail." },
  ];

  /* ---------- Render helpers ---------- */
  const svg = (paths, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.9}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* Brokers (duplicated for seamless marquee) */
  const track = document.getElementById("brokerTrack");
  if (track) {
    const chip = (b) => `<span class="broker-chip"><span class="bdot"></span>${b}</span>`;
    track.innerHTML = (brokers.map(chip).join("")) + (brokers.map(chip).join(""));
  }

  /* Product explorer */
  const expTabs = document.getElementById("expTabs");
  const expStage = document.getElementById("expStage");
  if (expTabs && expStage) {
    tools.forEach((t, i) => {
      const tab = el(`<button class="exp-tab ${i === 0 ? "active" : ""}" role="tab" data-id="${t.id}">
        <span class="ti">${svg(t.icon)}</span>
        <span class="tlabel">${t.label}</span>
      </button>`);
      expTabs.appendChild(tab);

      const panel = el(`<div class="exp-panel ${i === 0 ? "active" : ""}" data-id="${t.id}">
        <div class="exp-copy">
          <span class="route-chip">${svg(t.icon, 2)}${t.route}</span>
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
          <ul class="feature-list">${t.bullets.map(b => `<li><span class="tick">${svg('<path d="M20 6 9 17l-5-5"/>', 2.4)}</span>${b}</li>`).join("")}</ul>
        </div>
        <div class="exp-visual">${mocks[t.id]()}</div>
      </div>`);
      expStage.appendChild(panel);
    });

    const tabs = [...expTabs.querySelectorAll(".exp-tab")];
    const panels = [...expStage.querySelectorAll(".exp-panel")];
    expTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".exp-tab");
      if (!tab) return;
      const id = tab.dataset.id;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      panels.forEach(p => p.classList.toggle("active", p.dataset.id === id));
    });
  }

  /* Steps */
  const sg = document.getElementById("stepsGrid");
  if (sg) {
    steps.forEach((s, i) => {
      const arrow = i < steps.length - 1 ? `<span class="arrow">${svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 2)}</span>` : "";
      sg.appendChild(el(`<div class="step reveal" data-d="${i}">
        <div class="snum">${s.n}</div><div class="sline"></div>
        <h3>${s.title}</h3><p>${s.desc}</p>${arrow}
      </div>`));
    });
  }

  /* Testimonials */
  const tg = document.getElementById("testiGrid");
  if (tg) {
    const star = svg('<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" fill="currentColor" stroke="none"/>');
    testimonials.forEach((t, i) => {
      tg.appendChild(el(`<div class="tcard reveal" data-rev="zoom" data-d="${i}">
        <div class="stars">${star.repeat(5)}</div>
        <blockquote>“${t.q}”</blockquote>
        <div class="who"><span class="ava">${t.i}</span><div><div class="n">${t.n}</div><div class="r">${t.r}</div></div></div>
      </div>`));
    });
  }

  /* Compare table */
  const ct = document.getElementById("compareTable");
  if (ct) {
    const yes = `<span class="yes">${svg('<path d="M20 6 9 17l-5-5"/>', 2.6)}</span>`;
    const no = `<span class="no">—</span>`;
    const cell = (v, cls) => `<div class="val ${cls}">${v === "yes" ? yes : v === "no" ? no : v}</div>`;
    let html = `<div class="compare-row compare-head"><div>Recurso</div><div>Trial</div><div class="col-anual">Anual</div></div>`;
    compareRows.forEach(r => {
      html += `<div class="compare-row"><div class="feat">${r.feat}</div>${cell(r.trial, "")}${cell(r.anual, "anual")}</div>`;
    });
    ct.innerHTML = html;
  }

  /* FAQ */
  const fw = document.getElementById("faqWrap");
  if (fw) {
    faqs.forEach((f, i) => {
      const item = el(`<div class="faq-item reveal" data-d="${i % 3}">
        <button class="faq-q" aria-expanded="false"><span>${f.q}</span><span class="ic"></span></button>
        <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
      </div>`);
      const btn = item.querySelector(".faq-q");
      const ans = item.querySelector(".faq-a");
      btn.addEventListener("click", () => {
        const open = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(o => {
          o.classList.remove("open");
          o.querySelector(".faq-a").style.maxHeight = null;
          o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("open");
          ans.style.maxHeight = ans.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
      fw.appendChild(item);
    });
  }

  /* ---------- Nav scroll state + progress + parallax ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ticking = false;
  const updateScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    }
    if (!reduceMotion) {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const offset = (center - vh / 2) / vh;
        const speed = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = "translate3d(0," + (offset * speed * 100).toFixed(2) + "px,0)";
      });
    }
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } };
  updateScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    const close = () => { toggle.classList.remove("open"); menu.classList.remove("open"); };
    toggle.addEventListener("click", () => { toggle.classList.toggle("open"); menu.classList.toggle("open"); });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = () => document.querySelectorAll(".reveal:not(.in)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  reveals().forEach(r => io.observe(r));
  // Safety: if IO never fires (e.g. inactive tab / no rAF), reveal after a beat.
  setTimeout(() => {
    if (!document.querySelector(".reveal.in")) reveals().forEach(r => r.classList.add("in"));
  }, 1600);

  /* ---------- Animated counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const runCount = (node) => {
    const target = parseFloat(node.dataset.count);
    const prefix = node.dataset.prefix || "";
    const suffix = node.dataset.suffix || "";
    const dur = 1500;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const val = Math.round(target * easeOut(p));
      node.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else node.textContent = prefix + target + suffix;
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(n => countIO.observe(n));

})();

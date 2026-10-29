/* ============================================================
   SEC//LAB · 交互逻辑
   ============================================================ */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const STORE_KEY = "seclab.installed.v1";

  let installed = new Set();
  try { installed = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")); } catch (e) { installed = new Set(); }

  const saveInstalled = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(installed))); } catch (e) {}
    updateProgress();
  };

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const catName = (id) => (CATS.find(c => c.id === id) || { name: id }).name;

  /* ---------------- Toast ---------------- */
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.style.cssText = "position:fixed;left:50%;bottom:32px;transform:translateX(-50%) translateY(20px);" +
        "padding:10px 20px;border-radius:10px;background:rgba(10,26,22,.96);color:#7ef0c8;" +
        "border:1px solid rgba(52,224,138,.5);font-size:13px;z-index:999;opacity:0;" +
        "transition:.28s;font-family:var(--mono);box-shadow:0 12px 30px -12px #000;pointer-events:none";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => {
      toastEl.style.opacity = "1";
      toastEl.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateX(-50%) translateY(12px)";
    }, 1900);
  }

  /* ---------------- 复制 ---------------- */
  function copyText(text, btn) {
    const done = () => {
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "已复制";
        btn.classList.add("ok");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("ok"); }, 1400);
      }
      toast("已复制到剪贴板");
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else { fallback(); }

    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("复制失败，请手动选择文本"); }
      document.body.removeChild(ta);
    }
  }

  /* ============================================================
     1. 背景粒子
     ============================================================ */
  (function bg() {
    const cv = $("#bg-canvas");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let w, h, dots = [], raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = cv.width = innerWidth * DPR;
      h = cv.height = innerHeight * DPR;
      cv.style.width = innerWidth + "px";
      cv.style.height = innerHeight + "px";
      const n = Math.min(80, Math.floor(innerWidth / 18));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .34 * DPR, vy: (Math.random() - .5) * .34 * DPR,
        r: (Math.random() * 1.5 + .6) * DPR
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130 * DPR;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34,225,255,.55)";
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j];
          const dx = d.x - o.x, dy = d.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = "rgba(34,225,255," + (0.16 * (1 - dist / linkDist)).toFixed(3) + ")";
            ctx.lineWidth = DPR * .6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); resize(); draw(); }, 200); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  })();

  /* ============================================================
     2. 数字滚动
     ============================================================ */
  function countUp(el, target, dur) {
    const start = performance.now();
    const d = dur || 1100;
    function step(now) {
      const p = Math.min((now - start) / d, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ============================================================
     3. 终端打字
     ============================================================ */
  (function term() {
    const body = $("#termBody");
    if (!body) return;
    const lines = [
      { h: '<span class="p">kali@seclab</span>:<span class="c">~</span>$ uname -a' },
      { h: 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux' },
      { h: '<span class="p">kali@seclab</span>:<span class="c">~</span>$ nmap -sT -Pn --top-ports 8 127.0.0.1' },
      { h: 'PORT     STATE SERVICE' },
      { h: '22/tcp   open  ssh' },
      { h: '80/tcp   open  http' },
      { h: '<span class="w">[!] 以上全部是本地靶场，勿对未授权目标执行</span>' },
      { h: '<span class="p">kali@seclab</span>:<span class="c">~</span>$ echo "环境就绪 / 从第一阶段开始"' },
      { h: '<span class="c">环境就绪 / 从第一阶段开始</span>' }
    ];
    let i = 0;
    function next() {
      if (i >= lines.length) return;
      const div = document.createElement("div");
      div.innerHTML = lines[i].h;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      i++;
      setTimeout(next, 260 + Math.random() * 260);
    }
    setTimeout(next, 600);
  })();

  /* ============================================================
     4. Hero 统计（用真实数据覆盖）
     ============================================================ */
  (function stats() {
    const stats = $$(".hero-stats .count");
    if (!stats.length) return;
    const totalSteps = TOOLS.reduce((n, t) => n + (t.steps ? t.steps.length : 0), 0);
    const vals = [TOOLS.length, CATS.length - 1, totalSteps, RANGES.length];
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      stats.forEach((el, k) => {
        el.dataset.target = vals[k];
        countUp(el, vals[k], 900 + k * 120);
      });
    };
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { fire(); io.disconnect(); } });
    }, { threshold: .25 });
    const box = $(".hero-stats");
    if (box) io.observe(box);
    setTimeout(fire, 1400);   // 兜底：窗口太矮时页面滚动前也要动起来
  })();

  /* ============================================================
     5. 工具库
     ============================================================ */
  const grid = $("#toolGrid");
  let filterCat = "all";
  let keyword = "";

  (function chips() {
    const box = $("#chips");
    if (!box) return;
    box.innerHTML = CATS.map(c => {
      const n = c.id === "all" ? TOOLS.length : TOOLS.filter(t => t.cat === c.id).length;
      return '<button class="chip' + (c.id === "all" ? " active" : "") + '" data-cat="' + c.id + '">' +
        esc(c.name) + '<i>' + n + "</i></button>";
    }).join("");
    box.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filterCat = btn.dataset.cat;
      $$(".chip", box).forEach(b => b.classList.toggle("active", b === btn));
      renderTools();
    });
  })();

  function match(t) {
    if (filterCat !== "all" && t.cat !== filterCat) return false;
    if (!keyword) return true;
    const k = keyword.toLowerCase();
    const hay = [t.name, t.desc, t.plat, catName(t.cat), (t.tags || []).join(" "), t.ver || ""].join(" ").toLowerCase();
    return hay.indexOf(k) !== -1;
  }

  function renderTools() {
    if (!grid) return;
    const list = TOOLS.filter(match);
    $("#resultCount").textContent = "共 " + list.length + " 个工具" + (keyword ? "（关键字：" + keyword + "）" : "");
    $("#empty").hidden = list.length > 0;
    grid.innerHTML = list.map((t, i) => {
      const done = installed.has(t.id);
      return '<article class="card' + (done ? " done" : "") + '" data-id="' + t.id + '" style="animation-delay:' + Math.min(i * 22, 300) + 'ms">' +
        (done ? '<span class="check-badge">INSTALLED</span>' : "") +
        '<div class="card-top">' +
          '<div class="card-icon c-' + t.cat + '">' + esc(t.icon) + '</div>' +
          '<div class="card-title">' +
            '<h3>' + esc(t.name) + (t.ver ? ' <span class="ver">' + esc(t.ver) + '</span>' : "") + '</h3>' +
            '<span class="card-cat">' + esc(catName(t.cat)) + ' · ' + esc(t.lvl || "入门") + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="card-desc">' + esc(t.desc) + '</p>' +
        '<div class="card-tags">' + (t.tags || []).map(x => "<span>" + esc(x) + "</span>").join("") + '</div>' +
        '<div class="card-foot">' +
          '<span class="plat">' + esc(t.plat) + '</span>' +
          '<button class="mini-btn' + (done ? " done-on" : "") + '" data-act="done">' + (done ? "✔ 已安装" : "标记已装") + '</button>' +
          '<button class="mini-btn" data-act="open">教程 →</button>' +
        '</div>' +
      '</article>';
    }).join("");
    updateProgress();
  }

  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const t = TOOLS.find(x => x.id === card.dataset.id);
      if (!t) return;
      const act = e.target.closest("[data-act]");
      if (act && act.dataset.act === "done") {
        e.stopPropagation();
        toggleDone(t.id);
        return;
      }
      openModal(t);
    });
  }

  function toggleDone(id, silent) {
    if (installed.has(id)) installed.delete(id); else installed.add(id);
    saveInstalled();
    renderTools();
    if (!silent) toast(installed.has(id) ? "已标记为已安装" : "已取消标记");
  }

  const searchInput = $("#search");
  if (searchInput) {
    let timer;
    searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { keyword = searchInput.value.trim(); renderTools(); }, 140);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (e.key === "Escape" && document.activeElement === searchInput) searchInput.blur();
    });
  }

  /* ---------------- 进度 ---------------- */
  function updateProgress() {
    const total = TOOLS.length, done = installed.size;
    const pct = total ? Math.round(done / total * 100) : 0;
    const ring = $("#ringFg"), txt = $("#ringTxt"), bar = $("#barFg"), barTxt = $("#barTxt");
    const C = 2 * Math.PI * 15.5;
    if (ring) {
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C * (1 - pct / 100);
    }
    if (txt) txt.textContent = pct + "%";
    if (bar) bar.style.width = pct + "%";
    if (barTxt) barTxt.textContent = "已安装 " + done + " / " + total;
  }

  const btnReset = $("#btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (!installed.size) { toast("还没有标记任何工具"); return; }
      if (!confirm("清空本地记录的「已安装」标记？（不会卸载任何软件）")) return;
      installed.clear();
      saveInstalled();
      renderTools();
      toast("已清空进度");
    });
  }

  /* ============================================================
     6. 模态框
     ============================================================ */
  const mask = $("#modalMask");
  let lastFocus = null;

  function openModal(t) {
    if (!mask) return;
    lastFocus = document.activeElement;
    $("#mIcon").textContent = t.icon;
    $("#mIcon").className = "m-icon";
    $("#mCat").textContent = catName(t.cat).toUpperCase() + " · " + (t.lvl || "入门") + " · " + t.plat;
    $("#mName").textContent = t.name + (t.ver ? "  " + t.ver : "");
    $("#mDesc").textContent = t.desc;
    $("#mLinks").innerHTML =
      '<a class="primary" href="' + esc(t.dl) + '" target="_blank" rel="noopener noreferrer">↓ 官方下载页</a>' +
      '<a href="' + esc(t.official) + '" target="_blank" rel="noopener noreferrer">⊙ 官方网站</a>' +
      '<a href="https://www.baidu.com/s?wd=' + encodeURIComponent(t.name + " 安装教程") + '" target="_blank" rel="noopener noreferrer">🔍 更多教程</a>';

    let html = '<h4>安装步骤（' + (t.steps ? t.steps.length : 0) + ' 步）</h4><ol class="gsteps">';
    (t.steps || []).forEach((s) => {
      html += "<li><h4>" + esc(s.t) + "</h4>";
      if (s.d) html += "<p>" + esc(s.d) + "</p>";
      if (s.cmd) {
        html += '<div class="cmd"><code>' + esc(s.cmd) + '</code>' +
          '<button class="copy-btn" data-cmd="' + encodeURIComponent(s.cmd) + '">复制</button></div>';
      }
      if (s.hint) html += '<span class="hint">' + esc(s.hint) + "</span>";
      html += "</li>";
    });
    html += "</ol>";
    if (t.pit) html += '<h4>常见坑 / 注意事项</h4><p class="hint bad">' + esc(t.pit) + "</p>";
    html += '<h4>下载地址</h4><p style="word-break:break-all;font-family:var(--mono);font-size:12px;color:#7f90aa">' + esc(t.dl) + "</p>";
    $("#mBody").innerHTML = html;

    const done = installed.has(t.id);
    const btn = $("#mDone");
    btn.textContent = done ? "✔ 已安装（点击取消）" : "标记为已安装";
    btn.dataset.id = t.id;
    $("#mTip").textContent = "记录保存在本地浏览器，不上传任何数据";

    mask.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal").scrollTop = 0;
    $("#modalClose").focus();
  }

  function closeModal() {
    if (!mask) return;
    mask.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  if (mask) {
    $("#modalClose").addEventListener("click", closeModal);
    mask.addEventListener("click", (e) => { if (e.target === mask) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !mask.hidden) closeModal(); });
    mask.addEventListener("click", (e) => {
      const c = e.target.closest(".copy-btn");
      if (c) copyText(decodeURIComponent(c.dataset.cmd), c);
      if (e.target.closest("#mDone")) {
        const id = $("#mDone").dataset.id;
        if (id) { toggleDone(id, true); openModal(TOOLS.find(t => t.id === id)); }
      }
    });
  }

  /* ============================================================
     7. 安装主线
     ============================================================ */
  (function guides() {
    const tabs = $("#guideTabs"), panel = $("#guidePanel");
    if (!tabs || !panel) return;

    function render(key) {
      const g = GUIDES[key];
      if (!g) return;
      let html = "<h3>" + esc(g.title) + "</h3><p class=\"lead\">" + esc(g.lead) + "</p><ol class=\"gsteps\">";
      g.steps.forEach(s => {
        html += "<li><h4>" + esc(s.t) + "</h4>";
        if (s.d) html += "<p>" + esc(s.d) + "</p>";
        if (s.cmd) {
          html += '<div class="cmd"><code>' + esc(s.cmd) + '</code>' +
            '<button class="copy-btn" data-cmd="' + encodeURIComponent(s.cmd) + '">复制</button></div>';
        }
        if (s.hint) html += '<span class="hint">' + esc(s.hint) + "</span>";
        html += "</li>";
      });
      html += "</ol>";
      panel.innerHTML = html;
    }

    tabs.addEventListener("click", (e) => {
      const b = e.target.closest(".gt");
      if (!b) return;
      $$(".gt", tabs).forEach(x => x.classList.toggle("active", x === b));
      render(b.dataset.g);
    });
    panel.addEventListener("click", (e) => {
      const c = e.target.closest(".copy-btn");
      if (c) copyText(decodeURIComponent(c.dataset.cmd), c);
    });
    render("vm");
  })();

  /* ============================================================
     8. 命令速查
     ============================================================ */
  (function cheats() {
    const box = $("#cheatGrid");
    if (!box) return;
    box.innerHTML = CHEATS.map(c =>
      '<div class="cheat-card">' +
        '<div class="cheat-head"><b>' + esc(c.tool) + '</b><span>' + esc(c.note) + '</span></div>' +
        '<div class="cheat-body">' +
          c.items.map(it =>
            '<div class="line"><code>' + esc(it.cmd) + '<span class="why">' + esc(it.why) + '</span></code>' +
            '<button class="copy-btn" data-cmd="' + encodeURIComponent(it.cmd) + '">复制</button></div>'
          ).join("") +
        '</div></div>'
    ).join("");
    box.addEventListener("click", (e) => {
      const c = e.target.closest(".copy-btn");
      if (c) copyText(decodeURIComponent(c.dataset.cmd), c);
    });
  })();

  /* ============================================================
     9. 靶场
     ============================================================ */
  (function ranges() {
    const box = $("#rangeGrid");
    if (!box) return;
    box.innerHTML = RANGES.map(r =>
      '<div class="range-card">' +
        '<div class="rh"><b>' + esc(r.name) + '</b><span class="lv ' + esc(r.lv) + '">' + esc(r.lvText) + '</span></div>' +
        '<p>' + esc(r.desc) + '</p>' +
        '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">前往 →</a>' +
      '</div>'
    ).join("");
  })();

  /* ============================================================
     10. 滚动出现 + 导航高亮
     ============================================================ */
  (function scrollFx() {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(el => io.observe(el));

    const links = $$(".nav-links a");
    const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const spy = () => {
      const y = scrollY + 120;
      let idx = 0;
      secs.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
      links.forEach((a, i) => a.classList.toggle("active", i === idx));
    };
    addEventListener("scroll", spy, { passive: true });
    spy();

    const burger = $("#burger"), navLinks = $("#navLinks");
    if (burger) burger.addEventListener("click", () => navLinks.classList.toggle("open"));
    if (navLinks) navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  })();

  /* ============================================================
     11. 初始化
     ============================================================ */
  renderTools();
  updateProgress();
  console.log("%c SEC//LAB ", "background:#22e1ff;color:#04141b;font-weight:bold",
    "工具 " + TOOLS.length + " 个 · 全部链接指向官方渠道 · 仅限授权测试");
})();

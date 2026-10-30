/* ================================================================
   دليل الفعاليات — main.js
   سلايدر، فلترة، تقويم، مشاركة، تحقق النموذج، وحجز وهمي خفيف.
   ================================================================ */

const STORE = {
  theme: "daleel:theme",
  lastFilter: "daleel:lastFilter",
};

/* التصنيفات المطلوبة في الوظيفة: ثقافة، رياضة، موسيقى، عائلي */
const EVENTS = [
  {
    id: 1, title: "مهرجان الموسيقى", category: "music", date: "2026-10-28",
    location: "الساحة الرئيسية", image: "assets/img/event-music.jpg",
    excerpt: "فرق طلابية على المسرح من العصر حتى المساء.",
    description: "خمس فرق تتناوب على المسرح مع ركن شاي وزاوية للعائلات. الدخول مجاني لطلاب الجامعة الافتراضية، والتسجيل المسبق يمنح مقعداً في الصفوف الأمامية.",
    speakers: ["فرقة إيقاع الحرم"],
    featured: true,
  },
  {
    id: 2, title: "اليوم الرياضي المفتوح", category: "sports", date: "2026-10-30",
    location: "الملعب الأخضر", image: "assets/img/event-sports.jpg",
    excerpt: "مباريات قصيرة ومسابقات خفيفة لكل المستويات.",
    description: "يوم مفتوح للجري والمباريات الودية. لا يشترط خبرة سابقة، والحضور بعائلة مسموح في المدرجات. يُرجى إحضار حذاء رياضي وماء.",
    speakers: ["نادي الحركة"],
    featured: true,
  },
  {
    id: 3, title: "أمسية ثقافية", category: "culture", date: "2026-11-01",
    location: "القاعة الكبرى", image: "assets/img/event-culture.jpg",
    excerpt: "قراءات قصيرة وحوار عن الحرم والمجتمع.",
    description: "ثلاث مداخلات من طلاب وأستاذ ضيف، ثم أسئلة من الجمهور. الهدف تعريف الزوار بنشاطات الكليات بطريقة قريبة وواضحة.",
    speakers: ["د. هدى المغربي"],
    featured: true,
  },
  {
    id: 4, title: "سهرة عائلية تحت النجوم", category: "family", date: "2026-11-12",
    location: "المرصد", image: "assets/img/event-family.jpg",
    excerpt: "رصد مبسّط وأنشطة للأطفال برفقة الأهل.",
    description: "تلسكوبات مفتوحة للجميع مع شرح قصير، وركن رسم للأطفال. المناسبة مناسبة للعائلات ولا تحتاج معرفة فلكية سابقة.",
    speakers: [],
  },
  {
    id: 5, title: "معرض الثقافة الرقمية", category: "culture", date: "2026-11-20",
    location: "مكتبة الجامعة", image: "assets/img/event-exhibit.jpg",
    excerpt: "لوحات وقصص قصيرة عن مشاريع الطلاب.",
    description: "معرض هادئ يمر فيه الزائر على لوحات توضّح مشاريع ثقافية رقمية. يمكن طرح الأسئلة على أصحاب الأعمال طوال فترة المعرض.",
    speakers: ["م. ديانا عبدالله"],
  },
  {
    id: 6, title: "ورشة الإيقاع", category: "music", date: "2026-12-04",
    location: "قاعة الموسيقى", image: "assets/img/event-rhythm.jpg",
    excerpt: "ساعة عملية لتعلّم جملة إيقاعية بسيطة.",
    description: "ورشة قصيرة للمبتدئين. الأدوات متوفرة في القاعة، والمقاعد محدودة حتى يبقى التمرين مريحاً.",
    speakers: ["أ. وليد شمس"],
  },
];

const CATEGORY_LABELS = {
  culture: "ثقافة",
  sports: "رياضة",
  music: "موسيقى",
  family: "عائلي",
};

/* -------- Helpers -------- */
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" }); }
  catch(_) { return iso; }
}
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function getParam(k) { return new URLSearchParams(location.search).get(k); }
function cardHTML(ev) {
  const today = ev.date === todayISO() ? `<span class="badge-today">اليوم</span>` : "";
  return `
    <article class="glass glass-hover c-card h-100">
      <img src="${ev.image}" alt="${ev.title}" class="card-img-top" loading="lazy">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <span><span class="badge-cat badge-${ev.category}">${CATEGORY_LABELS[ev.category] || ev.category}</span>${today}</span>
          <small style="color:var(--c-muted);">${fmtDate(ev.date)}</small>
        </div>
        <h3>${ev.title}</h3>
        <p class="small mb-2" style="color:var(--c-muted);"><i class="bi bi-geo-alt"></i> ${ev.location}</p>
        <p class="excerpt">${ev.excerpt}</p>
        <div class="d-flex gap-2">
          <a href="event.html?id=${ev.id}" class="btn-c-primary text-decoration-none">التفاصيل</a>
          <button class="btn-c-ghost" data-bs-toggle="modal" data-bs-target="#bookModal" data-event-id="${ev.id}">حجز</button>
        </div>
      </div>
    </article>
  `;
}

/* -------- تقويم: توليد ملف ICS بسيط -------- */
function buildICS(ev) {
  const day = (ev.date || "").replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daleel//Events//AR",
    "BEGIN:VEVENT",
    `UID:campusly-${ev.id}@campusly`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${(ev.excerpt || "").replace(/\n/g, " ")}`,
    `LOCATION:${ev.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(ev) {
  const blob = new Blob([buildICS(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareEvent(ev) {
  const url = `${location.origin}${location.pathname.replace(/[^/]*$/, "")}event.html?id=${ev.id}`;
  const data = { title: ev.title, text: ev.excerpt, url };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(url);
      showToast("تم نسخ رابط الفعالية", "success");
    }
  } catch (_) {
    /* المستخدم ألغى المشاركة */
  }
}

/* -------- الرئيسية: فعاليات مميزة + أحدث -------- */
function markTodayOnSlider() {
  const slide = document.querySelector("#heroCarousel .carousel-item.active .carousel-caption");
  const ev = EVENTS.find(e => e.featured && e.date === todayISO());
  if (!slide || !ev || slide.querySelector(".badge-today")) return;
  if (!slide.textContent.includes(ev.title)) return;
  slide.querySelector(".badge-cat")?.insertAdjacentHTML("afterend", ` <span class="badge-today">اليوم</span>`);
}
function renderHomeLatest() {
  const el = document.getElementById("latestGrid");
  if (!el) return;
  const latest = [...EVENTS].filter(e => !e.featured).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 3);
  el.innerHTML = latest.map(e => `<div class="col-md-6 col-lg-4">${cardHTML(e)}</div>`).join("");
}

/* -------- events.html — فلترة حسب التصنيف / التاريخ / الموقع -------- */
function setupEventsPage() {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;
  const q = document.getElementById("searchInput");
  const cat = document.getElementById("categoryFilter");
  const dateF = document.getElementById("dateFilter");
  const locF = document.getElementById("locationFilter");
  const emptyMsg = document.getElementById("emptyMsg");

  // تعبئة خيارات التاريخ والموقع من البيانات
  if (dateF) {
    [...new Set(EVENTS.map(e => e.date))].sort().forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = fmtDate(d);
      dateF.appendChild(opt);
    });
  }
  if (locF) {
    [...new Set(EVENTS.map(e => e.location))].sort().forEach(loc => {
      const opt = document.createElement("option");
      opt.value = loc;
      opt.textContent = loc;
      locF.appendChild(opt);
    });
  }

  // أولوية: معامل URL ثم تفضيلات localStorage
  const urlCat = getParam("cat");
  const saved = JSON.parse(localStorage.getItem(STORE.lastFilter) || "{}");
  if (q && saved.q) q.value = saved.q;
  if (cat) cat.value = urlCat || saved.cat || "";
  if (dateF && saved.date) dateF.value = saved.date;
  if (locF && saved.loc) locF.value = saved.loc;

  function render() {
    const qv = (q?.value || "").trim().toLowerCase();
    const cv = cat?.value || "";
    const dv = dateF?.value || "";
    const lv = locF?.value || "";
    const filtered = EVENTS.filter(ev =>
      (!qv || ev.title.toLowerCase().includes(qv) || ev.excerpt.toLowerCase().includes(qv)) &&
      (!cv || ev.category === cv) &&
      (!dv || ev.date === dv) &&
      (!lv || ev.location === lv)
    );
    grid.innerHTML = filtered.map(e => `<div class="col-md-6 col-lg-4">${cardHTML(e)}</div>`).join("");
    if (emptyMsg) emptyMsg.classList.toggle("d-none", filtered.length > 0);
    localStorage.setItem(STORE.lastFilter, JSON.stringify({ q: qv, cat: cv, date: dv, loc: lv }));
    const count = document.getElementById("resultsCount");
    if (count) count.textContent = filtered.length;
  }
  [q, cat, dateF, locF].forEach(el => el && el.addEventListener("input", render));
  [cat, dateF, locF].forEach(el => el && el.addEventListener("change", render));
  render();
}

/* -------- event.html — تفاصيل + خريطة + تقويم + مشاركة + ذات صلة -------- */
function setupEventDetailsPage() {
  const host = document.getElementById("eventDetails");
  if (!host) return;
  const id = parseInt(getParam("id") || "1", 10);
  const ev = EVENTS.find(e => e.id === id) || EVENTS[0];
  document.title = `${ev.title} — دليل الفعاليات`;

  host.innerHTML = `
    <div class="row g-4 align-items-start">
      <div class="col-lg-7">
        <span class="badge-cat badge-${ev.category} mb-3 d-inline-block">${CATEGORY_LABELS[ev.category]}</span>${ev.date === todayISO() ? ` <span class="badge-today">اليوم</span>` : ""}
        <h1 class="display-6">${ev.title}</h1>
        <p class="text-muted" style="color:var(--c-muted)!important;">
          <strong style="color:var(--c-text);">التاريخ:</strong> ${fmtDate(ev.date)} ·
          <strong style="color:var(--c-text);">المكان:</strong> ${ev.location}
        </p>
        <img src="${ev.image}" alt="${ev.title}" class="img-fluid mt-3" style="border-radius:18px; aspect-ratio:16/8; object-fit:cover; width:100%; border:1px solid var(--c-border);">
        <div class="glass p-4 mt-4">
          <h2 class="h5">نظرة عامة</h2>
          <p class="mb-0">${ev.description}</p>
        </div>
        ${ev.speakers?.length ? `
        <div class="glass p-4 mt-3">
          <h2 class="h6">المتحدثون</h2>
          <ul class="mb-0">${ev.speakers.map(s => `<li>${s}</li>`).join("")}</ul>
        </div>` : ""}
        <h2 class="h6 mt-4">معرض الصور</h2>
        <div class="row g-3 event-gallery">
          <div class="col-6 col-md-4"><img src="${ev.image}" alt=""></div>
          <div class="col-6 col-md-4"><img src="${EVENTS.find(x => x.id === (ev.id % 6) + 1)?.image || ev.image}" alt=""></div>
          <div class="col-6 col-md-4"><img src="${EVENTS.find(x => x.id === ((ev.id + 1) % 6) + 1)?.image || ev.image}" alt=""></div>
        </div>
      </div>
      <aside class="col-lg-5">
        <div class="glass p-4">
          <h2 class="h6">الموقع</h2>
          <p class="small mb-3" style="color:var(--c-muted); line-height:1.7;">${ev.location}</p>
          <!-- خريطة ثابتة بصورة كما في الوظيفة -->
          <img src="assets/img/campus-map-guide.jpg" alt="خريطة موقع ${ev.location}" class="event-map mb-3" width="800" height="420">
          <div class="d-grid gap-2">
            <button class="btn-c-primary" data-bs-toggle="modal" data-bs-target="#bookModal" data-event-id="${ev.id}">حجز مقعد</button>
            <button type="button" class="btn-c-ghost" id="addToCalendarBtn"><i class="bi bi-calendar-plus"></i> أضف للتقويم</button>
            <button type="button" class="btn-c-ghost" id="shareEventBtn"><i class="bi bi-share"></i> شارك</button>
          </div>
        </div>
      </aside>
    </div>
  `;

  document.getElementById("addToCalendarBtn")?.addEventListener("click", () => {
    downloadICS(ev);
    showToast("تم تنزيل ملف التقويم (.ics)", "success");
  });
  document.getElementById("shareEventBtn")?.addEventListener("click", () => shareEvent(ev));

  const relatedHost = document.getElementById("relatedEvents");
  if (relatedHost) {
    const related = EVENTS.filter(e => e.category === ev.category && e.id !== ev.id).slice(0, 3);
    const fallback = related.length ? related : EVENTS.filter(e => e.id !== ev.id).slice(0, 3);
    relatedHost.innerHTML = `
      <div class="section-head">
        <h2>فعاليات ذات صلة</h2>
        <a href="events.html?cat=${ev.category}" class="btn-c-ghost text-decoration-none">المزيد</a>
      </div>
      <div class="row g-4">
        ${fallback.map(e => `<div class="col-md-6 col-lg-4">${cardHTML(e)}</div>`).join("")}
      </div>
    `;
  }
}

/* -------- contact.html — تحقق + Bootstrap Alerts -------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const alertBox = document.getElementById("contactAlert");

  function showAlert(type, message) {
    if (!alertBox) {
      showToast(message, type === "danger" ? "danger" : "success");
      return;
    }
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
    alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const msg = form.elements["message"].value.trim();
    const errors = [];
    if (name.length < 3) errors.push("الاسم قصير جداً (3 أحرف على الأقل).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("صيغة البريد الإلكتروني غير صحيحة.");
    if (msg.length < 10) errors.push("الرسالة قصيرة جداً (10 أحرف على الأقل).");

    if (errors.length) {
      showAlert("danger", errors.join(" — "));
    } else {
      showAlert("success", "تم استلام رسالتك بنجاح، شكراً لتواصلك!");
      form.reset();
    }
  });
}

/* -------- Modal الحجز بـ Stepper -------- */
function setupBookModal() {
  const modal = document.getElementById("bookModal");
  if (!modal) return;
  const title = modal.querySelector(".modal-title");
  const steps = modal.querySelectorAll(".step");
  const panes = modal.querySelectorAll("[data-pane]");

  function goTo(i) {
    steps.forEach((s, idx) => s.classList.toggle("active", idx <= i));
    panes.forEach((p, idx) => p.classList.toggle("d-none", idx !== i));
    modal.querySelector("#bookNext").classList.toggle("d-none", i === panes.length - 1);
    modal.querySelector("#bookConfirm").classList.toggle("d-none", i !== panes.length - 1);
    modal.querySelector("#bookBack").disabled = (i === 0);
    modal.dataset.step = i;
  }

  modal.addEventListener("show.bs.modal", (ev) => {
    const btn = ev.relatedTarget;
    const id = btn?.getAttribute("data-event-id");
    const found = EVENTS.find(e => String(e.id) === String(id));
    if (found && title) title.textContent = `حجز: ${found.title}`;
    goTo(0);
  });

  modal.querySelector("#bookNext")?.addEventListener("click", () => {
    const i = parseInt(modal.dataset.step || "0", 10);
    goTo(Math.min(i + 1, panes.length - 1));
  });
  modal.querySelector("#bookBack")?.addEventListener("click", () => {
    const i = parseInt(modal.dataset.step || "0", 10);
    goTo(Math.max(i - 1, 0));
  });
  modal.querySelector("#bookConfirm")?.addEventListener("click", () => {
    showToast("تم تأكيد الحجز بنجاح", "success");
    bootstrap.Modal.getInstance(modal)?.hide();
  });
}

/* -------- Scroll Top -------- */
function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 400));
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* الوضع الافتراضي فاتح. الزر يبدّل صنفاً واحداً على body. */
function updateThemeToggleLabel(toggle) {
  if (!toggle) return;
  const isDark = document.body.classList.contains("dark");
  toggle.textContent = isDark ? "الوضع الفاتح" : "الوضع الداكن";
  toggle.setAttribute("title", isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن");
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (localStorage.getItem(STORE.theme) === "dark") document.body.classList.add("dark");
  updateThemeToggleLabel(toggle);
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(STORE.theme, document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeToggleLabel(toggle);
  });
}

/* -------- Toast (Bootstrap) -------- */
function showToast(message, type = "success", duration = 2800) {
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    host.className = "toast-container position-fixed top-0 start-50 translate-middle-x p-3";
    host.style.zIndex = "1090";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `toast c-toast ${type}`;
  el.setAttribute("role", "alert");
  el.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${type === "danger" ? "خطأ" : "تمّ"}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  host.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: duration });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

/* -------- Active Nav -------- */
function highlightActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".c-navbar .nav-link").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

/* -------- init -------- */
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
  setupThemeToggle();
  setupScrollTop();
  setupBookModal();
  markTodayOnSlider();
  renderHomeLatest();
  setupEventsPage();
  setupEventDetailsPage();
  setupContactForm();
});

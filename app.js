/* ============ GuruGo frontend ============ */
"use strict";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const S = {
  role: "student", studentId: "s1", teacherId: "t1",
  data: null, studentTab: "find", teacherTab: "requests",
  q: "", subject: "All", sort: "rating",
  seen: {}, seenInit: false, modalRating: 0,
};

const SUBJ_EMOJI = { "Mathematics": "➗", "Physics": "🧲", "Chemistry": "🧪", "Biology": "🧬", "Computer Science": "💻", "English": "📖", "Hindi": "✍️" };
const STATUS_LABEL = { requested: "Requested", accepted: "Accepted", in_progress: "Live now", completed: "Completed", declined: "Declined", cancelled: "Cancelled" };

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const initials = name => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const pad = n => String(n).padStart(2, "0");
const teacherOf = b => S.data.teachers.find(t => t.id === b.teacher_id);
const studentOf = b => S.data.students.find(s => s.id === b.student_id);
const fee = () => S.data.platform_fee ?? 0.15;
const payout = price => Math.round(price * (1 - fee()));

function fmtWhen(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
function rel(iso) {
  const diff = new Date(iso) - Date.now();
  const m = Math.round(Math.abs(diff) / 60000);
  if (m < 1) return "just now";
  const t = m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + "m" : ""}`.trim();
  return diff > 0 ? `in ${t}` : `${t} ago`;
}
function starsLine(r) { return "★".repeat(r) + "☆".repeat(5 - r); }
function avatarHTML(person, size) {
  const st = size ? `style="width:${size}px;height:${size}px;min-width:${size}px;font-size:${Math.round(size / 2.9)}px;background:${person.color}"` : `style="background:${person.color}"`;
  return `<div class="avatar" ${st}>${initials(person.name)}</div>`;
}
function toast(msg, type = "ok") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = msg;
  $("#toast-root").appendChild(el);
  setTimeout(() => { el.classList.add("hide"); setTimeout(() => el.remove(), 350); }, 4200);
}
async function api(path, body) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { toast("⚠️ " + esc(j.error || "Something went wrong"), "error"); throw new Error(j.error); }
  return j;
}

/* ---------- data load + live polling ---------- */
async function load() {
  const r = await fetch("/api/state");
  const d = await r.json();
  detectChanges(d);
  S.data = d;
  render();
}
function detectChanges(d) {
  const key = b => `${b.status}|${b.rating}`;
  if (!S.seenInit) {
    d.bookings.forEach(b => S.seen[b.id] = key(b));
    S.seenInit = true;
    return;
  }
  for (const b of d.bookings) {
    const prev = S.seen[b.id], now = key(b);
    if (prev !== now) {
      const tName = esc((d.teachers.find(t => t.id === b.teacher_id) || {}).name || "Teacher");
      const sName = esc((d.students.find(s => s.id === b.student_id) || {}).name || "Student");
      const [pStatus, pRating] = (prev || "|").split("|");
      if (S.role === "student" && b.student_id === S.studentId && pStatus !== b.status) {
        if (b.status === "accepted") toast(`✅ <b>${tName}</b> accepted your session!`);
        if (b.status === "declined") toast(`😔 <b>${tName}</b> declined your request.`, "error");
        if (b.status === "in_progress") toast(`🚀 Your session with <b>${tName}</b> is live!`, "info");
        if (b.status === "completed") toast(`🎓 Session completed — rate <b>${tName}</b>!`);
      }
      if (S.role === "teacher" && b.teacher_id === S.teacherId) {
        if (prev === undefined && b.status === "requested") toast(`🔔 New request from <b>${sName}</b> · ${esc(b.subject)}`, "info");
        if (b.status === "cancelled" && pStatus !== b.status) toast(`⚠️ <b>${sName}</b> cancelled the session.`, "error");
        if (b.rating && pRating === "null") toast(`⭐ <b>${sName}</b> rated you ${b.rating}/5!`);
      }
    }
    S.seen[b.id] = now;
  }
}
setInterval(() => load().catch(() => {}), 3500);

/* ---------- render root ---------- */
function render() {
  // preserve focus across re-renders (search box typing vs. polling)
  const act = document.activeElement;
  const fid = act && act.id, selStart = act && act.selectionStart, selEnd = act && act.selectionEnd;

  $$("#roles button").forEach(b => b.classList.toggle("active", b.dataset.role === S.role));
  renderPersona();
  const main = $("#main");
  if (!S.data) { main.innerHTML = `<div class="empty"><div class="e">⏳</div><b>Loading GuruGo…</b></div>`; return; }
  if (S.role === "student") main.innerHTML = studentView();
  else if (S.role === "teacher") main.innerHTML = teacherView();
  else main.innerHTML = adminView();

  if (fid) {
    const el = document.getElementById(fid);
    if (el) { el.focus(); try { el.setSelectionRange(selStart, selEnd); } catch (e) {} }
  }
}
function renderPersona() {
  const box = $("#persona");
  if (!S.data || S.role === "admin") { box.innerHTML = ""; return; }
  if (S.role === "student") {
    box.innerHTML = `<select id="persona-select" title="Demo: choose which student you are">${S.data.students.map(s =>
      `<option value="${s.id}" ${s.id === S.studentId ? "selected" : ""}>🧑‍🎓 ${esc(s.name)} · ${esc(s.grade)}</option>`).join("")}</select>`;
  } else {
    box.innerHTML = `<select id="persona-select" title="Demo: choose which teacher you are">${S.data.teachers.map(t =>
      `<option value="${t.id}" ${t.id === S.teacherId ? "selected" : ""}>${t.online ? "🟢" : "⚫"} ${esc(t.name)}</option>`).join("")}</select>`;
  }
}

/* =========================================================
   STUDENT VIEW
========================================================= */
function studentView() {
  const me = S.data.students.find(s => s.id === S.studentId);
  const mine = S.data.bookings.filter(b => b.student_id === S.studentId);
  const active = mine.filter(b => ["requested", "accepted", "in_progress"].includes(b.status));
  return `
  <div class="hero">
    <h1>Find your teacher, ${esc(me.name.split(" ")[0])} 👋</h1>
    <p>Book a 1-on-1 session instantly — just like booking a ride. ${S.data.teachers.filter(t => t.online).length} teachers online now.</p>
  </div>
  <div class="how">
    <div><span class="n">1</span><span><b>Search</b>by subject & budget</span></div>
    <div><span class="n">2</span><span><b>Book</b>pick a time & topic</span></div>
    <div><span class="n">3</span><span><b>Learn</b>teacher accepts, session goes live</span></div>
    <div><span class="n">4</span><span><b>Rate</b>stars help other students</span></div>
  </div>
  <div class="tabs">
    <button data-action="s-tab" data-tab="find" class="${S.studentTab === "find" ? "active" : ""}">🔍 Find teachers</button>
    <button data-action="s-tab" data-tab="bookings" class="${S.studentTab === "bookings" ? "active" : ""}">📅 My bookings${active.length ? `<span class="badge">${active.length}</span>` : ""}</button>
  </div>
  ${S.studentTab === "find" ? findTeachers() : myBookings(mine)}`;
}

function findTeachers() {
  const subjects = ["All", ...new Set(S.data.teachers.flatMap(t => t.subjects))];
  let list = S.data.teachers.filter(t =>
    (S.subject === "All" || t.subjects.includes(S.subject)) &&
    (t.name.toLowerCase().includes(S.q.toLowerCase()) || t.subjects.join(" ").toLowerCase().includes(S.q.toLowerCase()))
  );
  const sorts = {
    rating: (a, b) => b.rating - a.rating,
    price_low: (a, b) => a.rate - b.rate,
    price_high: (a, b) => b.rate - a.rate,
    experience: (a, b) => b.experience - a.experience,
  };
  list.sort(sorts[S.sort] || sorts.rating);
  list.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)); // online first, like nearby drivers
  return `
  <div class="filters">
    <input id="q" class="search" type="text" placeholder="Search teacher or subject…" value="${esc(S.q)}">
    <select id="sort">
      <option value="rating" ${S.sort === "rating" ? "selected" : ""}>⭐ Top rated</option>
      <option value="price_low" ${S.sort === "price_low" ? "selected" : ""}>💸 Price: low → high</option>
      <option value="price_high" ${S.sort === "price_high" ? "selected" : ""}>💎 Price: high → low</option>
      <option value="experience" ${S.sort === "experience" ? "selected" : ""}>🎓 Most experienced</option>
    </select>
  </div>
  <div class="chips">${subjects.map(s =>
    `<button class="chip ${S.subject === s ? "active" : ""}" data-action="chip" data-subject="${esc(s)}">${SUBJ_EMOJI[s] || "📚"} ${esc(s)}</button>`).join("")}
  </div>
  ${list.length ? `<div class="grid">${list.map(teacherCard).join("")}</div>`
    : `<div class="empty"><div class="e">🔭</div><b>No teachers match</b>Try a different subject or search term.</div>`}`;
}

function teacherCard(t) {
  return `
  <div class="card">
    <div class="t-top">
      ${avatarHTML(t)}
      <div>
        <div class="t-name">${esc(t.name)}</div>
        <span class="online-pill ${t.online ? "on" : "off"}"><span class="dot"></span>${t.online ? "Online now" : "Offline"}</span>
        <div class="t-bio">${esc(t.bio)}</div>
      </div>
    </div>
    <div class="tags">${t.subjects.map(s => `<span class="tag">${SUBJ_EMOJI[s] || ""} ${esc(s)}</span>`).join("")}</div>
    <div class="t-meta">
      <span><span class="star">★</span> <b>${t.rating}</b> (${t.ratings})</span>
      <span>🎓 ${t.experience} yrs</span>
      <span class="rate">${money(t.rate)}<span style="font-size:11px;color:var(--muted);font-weight:600">/hr</span></span>
    </div>
    <button class="btn btn-primary" data-action="book" data-id="${t.id}" ${t.online ? "" : "disabled"}>
      ${t.online ? "⚡ Book a session" : "Currently offline"}
    </button>
  </div>`;
}

function myBookings(mine) {
  const active = mine.filter(b => ["requested", "accepted", "in_progress"].includes(b.status))
    .sort((a, b) => new Date(a.when) - new Date(b.when));
  const past = mine.filter(b => !["requested", "accepted", "in_progress"].includes(b.status))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!mine.length) return `<div class="empty"><div class="e">📭</div><b>No bookings yet</b>Find a teacher and book your first session!</div>`;
  return `
  ${active.length ? `<div class="section-title">🟢 Active</div><div class="blist">${active.map(b => bookingCard(b, "student")).join("")}</div>` : ""}
  ${past.length ? `<div class="section-title">🗂 Past</div><div class="blist">${past.map(b => bookingCard(b, "student")).join("")}</div>` : ""}`;
}

/* ---------- shared booking card ---------- */
function timelineHTML(b) {
  if (["declined", "cancelled"].includes(b.status)) {
    const ev = b.timeline[b.timeline.length - 1];
    return `<div class="hint">❌ ${b.status === "declined" ? "Declined by teacher" : "Cancelled by student"} · ${rel(ev.at)}</div>`;
  }
  const steps = [["requested", "Requested"], ["accepted", "Accepted"], ["in_progress", "Live"], ["completed", "Done"]];
  const idx = steps.findIndex(s => s[0] === b.status);
  return `<div class="timeline">${steps.map((s, i) => {
    const cls = b.status === "completed" ? "done" : i < idx ? "done" : i === idx ? "now" : "";
    const line = i < steps.length - 1 ? `<div class="tline ${i < idx || b.status === "completed" ? "done" : ""}"></div>` : "";
    return `<div class="tstep ${cls}"><div class="tdot"></div><span>${s[1]}</span></div>${line}`;
  }).join("")}</div>`;
}

function bookingCard(b, perspective) {
  const t = teacherOf(b), s = studentOf(b);
  const person = perspective === "student" ? t : s;
  const sub = perspective === "student"
    ? `${esc(b.subject)} with <b>${esc(t.name)}</b>`
    : `${esc(b.subject)} · <b>${esc(s.name)}</b> (${esc(s.grade)})`;
  let actions = "";
  if (perspective === "student") {
    if (["requested", "accepted"].includes(b.status))
      actions = `<div class="btn-row"><button class="btn btn-danger btn-sm" data-action="cancel" data-id="${b.id}">✖ Cancel</button></div>
        ${b.status === "requested" ? `<div class="hint">⏳ Waiting for ${esc(t.name.split(" ")[0])} to accept… (demo tip: switch to the Teacher view to respond)</div>` : ""}`;
    if (b.status === "in_progress") actions = `<div class="hint">🚀 Session is live — join your class link. It ends when the teacher marks it complete.</div>`;
    if (b.status === "completed" && b.rating == null)
      actions = `<div class="btn-row"><button class="btn btn-primary btn-sm" data-action="rate" data-id="${b.id}">⭐ Rate session</button></div>`;
  } else {
    if (b.status === "requested")
      actions = `<div class="btn-row">
        <button class="btn btn-green btn-sm" data-action="accept" data-id="${b.id}">✔ Accept</button>
        <button class="btn btn-danger btn-sm" data-action="decline" data-id="${b.id}">✖ Decline</button></div>`;
    if (b.status === "accepted")
      actions = `<div class="btn-row"><button class="btn btn-primary btn-sm" data-action="start" data-id="${b.id}">▶ Start session</button></div>`;
    if (b.status === "in_progress")
      actions = `<div class="btn-row"><button class="btn btn-green btn-sm" data-action="complete" data-id="${b.id}">🏁 Complete session</button></div>`;
  }
  const priceInfo = perspective === "student"
    ? `<span>💰 Total <b>${money(b.price)}</b></span>`
    : `<span>💰 You earn <b>${money(payout(b.price))}</b> <span style="font-size:11px">(after ${Math.round(fee() * 100)}% fee)</span></span>`;
  const review = b.rating != null
    ? `<div class="review-box"><div class="stars-line">${starsLine(b.rating)}</div>${b.review ? "“" + esc(b.review) + "”" : "<i>No written review</i>"}</div>` : "";
  return `
  <div class="bcard">
    <div class="b-head">
      ${avatarHTML(person, 42)}
      <div>
        <div class="b-title">${esc(b.topic)}</div>
        <div class="b-sub">${sub}</div>
      </div>
      <span class="pill ${b.status}">${STATUS_LABEL[b.status]}</span>
    </div>
    <div class="b-info">
      <span>🗓 <b>${fmtWhen(b.when)}</b> (${rel(b.when)})</span>
      <span>⏱ ${b.duration} min</span>
      ${priceInfo}
    </div>
    ${timelineHTML(b)}
    ${actions}
    ${review}
  </div>`;
}

/* =========================================================
   TEACHER VIEW  (the "driver" side)
========================================================= */
function teacherView() {
  const me = S.data.teachers.find(t => t.id === S.teacherId);
  const mine = S.data.bookings.filter(b => b.teacher_id === S.teacherId);
  const requests = mine.filter(b => b.status === "requested").sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const upcoming = mine.filter(b => ["accepted", "in_progress"].includes(b.status)).sort((a, b) => new Date(a.when) - new Date(b.when));
  const history = mine.filter(b => ["completed", "declined", "cancelled"].includes(b.status)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const today = new Date().toDateString();
  const todayEarn = mine.filter(b => b.status === "completed" && b.completed_at && new Date(b.completed_at).toDateString() === today)
    .reduce((sum, b) => sum + (b.teacher_earning || 0), 0);
  const tabs = { requests, upcoming, history };
  const list = tabs[S.teacherTab] || requests;
  return `
  <div class="driver-bar">
    <div class="who">
      ${avatarHTML(me, 50)}
      <div>
        <h2>${esc(me.name)}</h2>
        <div class="sub">${me.subjects.map(esc).join(" · ")} · <span class="star">★</span> ${me.rating} (${me.ratings} ratings) · ${money(me.rate)}/hr</div>
      </div>
    </div>
    <div class="switch-wrap">
      <span style="color:${me.online ? "var(--green)" : "var(--muted)"}">${me.online ? "🟢 Online — accepting bookings" : "⚫ Offline"}</span>
      <label class="switch"><input type="checkbox" id="online-toggle" ${me.online ? "checked" : ""}><span class="slider"></span></label>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="l">Today's earnings</div><div class="v lime">${money(todayEarn)}</div></div>
    <div class="stat"><div class="l">Lifetime earnings</div><div class="v green">${money(me.earnings)}</div></div>
    <div class="stat"><div class="l">Sessions taught</div><div class="v blue">${me.sessions}</div></div>
    <div class="stat"><div class="l">Pending requests</div><div class="v amber">${requests.length}</div></div>
  </div>
  <div class="tabs">
    <button data-action="t-tab" data-tab="requests" class="${S.teacherTab === "requests" ? "active" : ""}">🔔 Requests${requests.length ? `<span class="badge">${requests.length}</span>` : ""}</button>
    <button data-action="t-tab" data-tab="upcoming" class="${S.teacherTab === "upcoming" ? "active" : ""}">📅 Upcoming & live${upcoming.length ? `<span class="badge">${upcoming.length}</span>` : ""}</button>
    <button data-action="t-tab" data-tab="history" class="${S.teacherTab === "history" ? "active" : ""}">🗂 History</button>
  </div>
  ${list.length ? `<div class="blist">${list.map(b => bookingCard(b, "teacher")).join("")}</div>`
    : `<div class="empty"><div class="e">${S.teacherTab === "requests" ? "🌤" : S.teacherTab === "upcoming" ? "📭" : "🗂"}</div>
       <b>${S.teacherTab === "requests" ? "No pending requests" : S.teacherTab === "upcoming" ? "Nothing scheduled" : "No history yet"}</b>
       ${S.teacherTab === "requests" ? (me.online ? "You're online — new student requests will appear here instantly." : "Go online to start receiving student requests.") : "Accepted and completed sessions will show up here."}</div>`}`;
}

/* =========================================================
   ADMIN VIEW
========================================================= */
function adminView() {
  const d = S.data;
  const completed = d.bookings.filter(b => b.status === "completed");
  const gmv = completed.reduce((s, b) => s + b.price, 0);
  const revenue = gmv - completed.reduce((s, b) => s + (b.teacher_earning || 0), 0);
  const counts = {};
  d.bookings.forEach(b => counts[b.status] = (counts[b.status] || 0) + 1);
  const leaders = [...d.teachers].sort((a, b) => b.sessions - a.sessions).slice(0, 6);
  const recent = [...d.bookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  const rated = d.bookings.filter(b => b.rating != null);
  const avgRating = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : "—";
  return `
  <div class="hero" style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
    <div style="flex:1;min-width:240px">
      <h1>Platform dashboard 📊</h1>
      <p>Live overview of the GuruGo marketplace · platform fee ${Math.round(fee() * 100)}%</p>
    </div>
    <button class="btn btn-danger btn-sm" data-action="reset">↺ Reset demo data</button>
  </div>
  <div class="stats6">
    <div class="stat"><div class="l">Students</div><div class="v blue">${d.students.length}</div></div>
    <div class="stat"><div class="l">Teachers (${d.teachers.filter(t => t.online).length} online)</div><div class="v">${d.teachers.length}</div></div>
    <div class="stat"><div class="l">Total bookings</div><div class="v amber">${d.bookings.length}</div></div>
    <div class="stat"><div class="l">GMV (completed)</div><div class="v lime">${money(gmv)}</div></div>
    <div class="stat"><div class="l">Platform revenue</div><div class="v green">${money(revenue)}</div></div>
    <div class="stat"><div class="l">Avg session rating</div><div class="v amber">${avgRating} ★</div></div>
  </div>
  <div class="section-title">📦 Bookings by status</div>
  <div class="chips">${Object.keys(STATUS_LABEL).map(s =>
    `<span class="chip">${STATUS_LABEL[s]} · <b style="color:var(--lime)">${counts[s] || 0}</b></span>`).join("")}</div>
  <div class="section-title">🏆 Top teachers</div>
  <div class="table-wrap"><table>
    <thead><tr><th>Teacher</th><th>Subjects</th><th>Rating</th><th>Sessions</th><th>Lifetime earnings</th><th>Status</th></tr></thead>
    <tbody>${leaders.map(t => `<tr>
      <td><b>${esc(t.name)}</b></td>
      <td style="color:var(--muted)">${t.subjects.map(esc).join(", ")}</td>
      <td><span class="star">★</span> ${t.rating}</td>
      <td>${t.sessions}</td>
      <td style="color:var(--lime);font-weight:700">${money(t.earnings)}</td>
      <td><span class="online-pill ${t.online ? "on" : "off"}"><span class="dot"></span>${t.online ? "Online" : "Offline"}</span></td>
    </tr>`).join("")}</tbody>
  </table></div>
  <div class="section-title">🕒 Recent activity</div>
  <div class="feed">${recent.map(b => `
    <div class="feed-item">
      <span>${SUBJ_EMOJI[b.subject] || "📚"}</span>
      <span><b>${esc(studentOf(b).name)}</b> → <b>${esc(teacherOf(b).name)}</b> · ${esc(b.subject)} · ${money(b.price)}</span>
      <span class="when">${rel(b.created_at)}</span>
      <span class="pill ${b.status}">${STATUS_LABEL[b.status]}</span>
    </div>`).join("")}</div>`;
}

/* =========================================================
   MODALS
========================================================= */
function openModal(html) {
  $("#modal-root").innerHTML = `<div class="backdrop"><div class="modal">${html}</div></div>`;
  $(".backdrop").addEventListener("click", e => { if (e.target.classList.contains("backdrop")) closeModal(); });
}
function closeModal() { $("#modal-root").innerHTML = ""; }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function openBookModal(tid) {
  const t = S.data.teachers.find(x => x.id === tid);
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const dateVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const timeVal = `${pad(d.getHours())}:00`;
  openModal(`
    <h3>Book a session ⚡</h3>
    <div class="msub">with <b style="color:var(--text)">${esc(t.name)}</b> · <span class="star">★</span> ${t.rating} · ${money(t.rate)}/hr</div>
    <div class="field"><label>Subject</label>
      <select id="bm-subject">${t.subjects.map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
    <div class="field"><label>What do you want to learn?</label>
      <input id="bm-topic" maxlength="200" placeholder="e.g. Trigonometry — heights & distances doubts"></div>
    <div class="frow">
      <div class="field"><label>Date</label><input id="bm-date" type="date" value="${dateVal}" min="${dateVal}"></div>
      <div class="field"><label>Time</label><input id="bm-time" type="time" value="${timeVal}"></div>
    </div>
    <div class="field"><label>Duration</label>
      <select id="bm-duration">
        <option value="30">30 minutes</option>
        <option value="60" selected>60 minutes</option>
        <option value="90">90 minutes</option>
        <option value="120">2 hours</option>
      </select></div>
    <div class="price-box"><span class="pl">Total price<br><small>pay after the session</small></span><span class="pv" id="bm-total">${money(t.rate)}</span></div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="bm-cancel">Cancel</button>
      <button class="btn btn-primary" id="bm-confirm">📨 Send request</button>
    </div>`);
  const upd = () => $("#bm-total").textContent = money(Math.round(t.rate * Number($("#bm-duration").value) / 60));
  $("#bm-duration").addEventListener("change", upd);
  $("#bm-cancel").addEventListener("click", closeModal);
  $("#bm-confirm").addEventListener("click", async () => {
    const date = $("#bm-date").value, time = $("#bm-time").value;
    const when = new Date(`${date}T${time}`);
    if (!date || !time || isNaN(when)) return toast("⚠️ Pick a valid date & time.", "error");
    const btn = $("#bm-confirm"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      await api("/api/book", {
        student_id: S.studentId, teacher_id: t.id,
        subject: $("#bm-subject").value, topic: $("#bm-topic").value,
        when: when.toISOString(), duration: Number($("#bm-duration").value),
      });
      closeModal();
      S.studentTab = "bookings";
      await load();
      toast(`📨 Request sent to <b>${esc(t.name)}</b>! Waiting for acceptance…`);
    } catch (e) { btn.disabled = false; btn.textContent = "📨 Send request"; }
  });
  $("#bm-topic").focus();
}

function openRateModal(bid) {
  const b = S.data.bookings.find(x => x.id === bid);
  const t = teacherOf(b);
  S.modalRating = 0;
  openModal(`
    <h3>Rate your session ⭐</h3>
    <div class="msub">${esc(b.subject)} with <b style="color:var(--text)">${esc(t.name)}</b> · ${fmtWhen(b.when)}</div>
    <div class="star-picker" id="star-picker">${[1, 2, 3, 4, 5].map(i =>
      `<button data-val="${i}" title="${i} star${i > 1 ? "s" : ""}">★</button>`).join("")}</div>
    <div class="field"><label>Review (optional)</label>
      <textarea id="rv-text" maxlength="300" placeholder="How was the session? Help other students choose…"></textarea></div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="rv-cancel">Later</button>
      <button class="btn btn-primary" id="rv-submit">Submit rating</button>
    </div>`);
  $$("#star-picker button").forEach(btn => btn.addEventListener("click", () => {
    S.modalRating = Number(btn.dataset.val);
    $$("#star-picker button").forEach(x => x.classList.toggle("lit", Number(x.dataset.val) <= S.modalRating));
  }));
  $("#rv-cancel").addEventListener("click", closeModal);
  $("#rv-submit").addEventListener("click", async () => {
    if (!S.modalRating) return toast("⚠️ Tap a star to rate first.", "error");
    try {
      await api(`/api/booking/${bid}/action`, { action: "rate", rating: S.modalRating, review: $("#rv-text").value });
      closeModal(); await load();
      toast(`⭐ Thanks! You rated <b>${esc(t.name)}</b> ${S.modalRating}/5.`);
    } catch (e) {}
  });
}

function openConfirm(msg, onYes) {
  openModal(`
    <h3>Are you sure?</h3>
    <div class="msub">${msg}</div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="cf-no">No, keep it</button>
      <button class="btn btn-danger" id="cf-yes">Yes, do it</button>
    </div>`);
  $("#cf-no").addEventListener("click", closeModal);
  $("#cf-yes").addEventListener("click", async () => { closeModal(); await onYes(); });
}

/* =========================================================
   EVENTS (delegation — survives re-renders)
========================================================= */
$("#roles").addEventListener("click", e => {
  const btn = e.target.closest("button[data-role]");
  if (!btn) return;
  S.role = btn.dataset.role;
  render();
});
$("#persona").addEventListener("change", e => {
  if (e.target.id !== "persona-select") return;
  if (S.role === "student") S.studentId = e.target.value;
  else S.teacherId = e.target.value;
  render();
});
$("#main").addEventListener("click", async e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "s-tab") { S.studentTab = btn.dataset.tab; render(); }
  else if (action === "t-tab") { S.teacherTab = btn.dataset.tab; render(); }
  else if (action === "chip") { S.subject = btn.dataset.subject; render(); }
  else if (action === "book") openBookModal(id);
  else if (action === "rate") openRateModal(id);
  else if (action === "cancel") openConfirm("Cancel this session request?", async () => {
    await api(`/api/booking/${id}/action`, { action: "cancel" }).catch(() => {}); await load(); toast("Session cancelled.", "info");
  });
  else if (["accept", "decline", "start", "complete"].includes(action)) {
    btn.disabled = true;
    await api(`/api/booking/${id}/action`, { action }).catch(() => {});
    await load();
    const msgs = { accept: "✅ Request accepted — it's now in Upcoming.", decline: "Request declined.", start: "🚀 Session started — it's live!", complete: "🏁 Session completed — earnings added!" };
    toast(msgs[action], action === "decline" ? "info" : "ok");
  }
  else if (action === "reset") openConfirm("This restores the original demo teachers, students and bookings.", async () => {
    await api("/api/reset", {}); S.seenInit = false; await load(); toast("↺ Demo data reset.");
  });
});
$("#main").addEventListener("input", e => {
  if (e.target.id === "q") { S.q = e.target.value; render(); }
});
$("#main").addEventListener("change", async e => {
  if (e.target.id === "sort") { S.sort = e.target.value; render(); }
  if (e.target.id === "online-toggle") {
    const online = e.target.checked;
    await api(`/api/teacher/${S.teacherId}/availability`, { online }).catch(() => {});
    await load();
    toast(online ? "🟢 You're online — students can book you now!" : "⚫ You're offline — hidden from new bookings.", "info");
  }
});

/* ---------- go! ---------- */
load();

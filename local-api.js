/* GuruGo local API — Python backend (app.py) ka JavaScript port. Data localStorage me save hota hai. */
(function () {
  const KEY = "gurugo_db_v1", FEE = 0.15;
  const SEED = {"teachers": [{"id": "t1", "name": "Ananya Sharma", "subjects": ["Mathematics", "Physics"], "rating": 4.9, "ratings": 212, "rate": 450, "experience": 8, "online": true, "color": "#8b5cf6", "bio": "IIT-Delhi alum. Makes calculus and mechanics feel like a game.", "sessions": 340, "earnings": 128400}, {"id": "t2", "name": "Rahul Verma", "subjects": ["Physics", "Mathematics"], "rating": 4.8, "ratings": 186, "rate": 400, "experience": 6, "online": true, "color": "#38bdf8", "bio": "JEE & NEET specialist. 500+ students cracked top exams with me.", "sessions": 295, "earnings": 101200}, {"id": "t3", "name": "Priya Iyer", "subjects": ["Chemistry", "Biology"], "rating": 4.9, "ratings": 324, "rate": 500, "experience": 10, "online": true, "color": "#f472b6", "bio": "PhD in Biochemistry. Concept-first teaching, zero rote learning.", "sessions": 510, "earnings": 214600}, {"id": "t4", "name": "Arjun Mehta", "subjects": ["Computer Science", "Mathematics"], "rating": 4.7, "ratings": 158, "rate": 550, "experience": 5, "online": false, "color": "#34d399", "bio": "Ex-software engineer. Python, DSA and board exam CS made simple.", "sessions": 201, "earnings": 93800}, {"id": "t5", "name": "Sneha Kulkarni", "subjects": ["English", "Hindi"], "rating": 4.8, "ratings": 203, "rate": 350, "experience": 7, "online": true, "color": "#fbbf24", "bio": "Cambridge-certified. Grammar, essays and confident speaking.", "sessions": 322, "earnings": 96100}, {"id": "t6", "name": "Vikram Singh", "subjects": ["Mathematics"], "rating": 4.6, "ratings": 97, "rate": 300, "experience": 4, "online": true, "color": "#fb923c", "bio": "Tricks and shortcuts for speed maths. Boards + NTSE + Olympiads.", "sessions": 150, "earnings": 38900}, {"id": "t7", "name": "Fatima Khan", "subjects": ["Biology", "Chemistry"], "rating": 4.9, "ratings": 275, "rate": 480, "experience": 9, "online": true, "color": "#2dd4bf", "bio": "NEET mentor with a 98% selection rate among my mentees.", "sessions": 430, "earnings": 175300}, {"id": "t8", "name": "Karthik Reddy", "subjects": ["Computer Science"], "rating": 4.8, "ratings": 141, "rate": 600, "experience": 6, "online": false, "color": "#a78bfa", "bio": "Full-stack dev by day, coding coach by evening. Web + AI basics.", "sessions": 188, "earnings": 95900}, {"id": "t9", "name": "Meera Nair", "subjects": ["English"], "rating": 4.7, "ratings": 119, "rate": 320, "experience": 5, "online": true, "color": "#f87171", "bio": "Literature lover. I turn shy readers into bold storytellers.", "sessions": 176, "earnings": 47800}, {"id": "t10", "name": "Aditya Joshi", "subjects": ["Physics"], "rating": 4.5, "ratings": 76, "rate": 280, "experience": 3, "online": true, "color": "#4ade80", "bio": "Young, energetic and patient. Doubt-solving is my superpower.", "sessions": 98, "earnings": 23400}], "students": [{"id": "s1", "name": "Aarav Patel", "grade": "Class 10", "color": "#38bdf8"}, {"id": "s2", "name": "Diya Gupta", "grade": "Class 12", "color": "#f472b6"}, {"id": "s3", "name": "Rohan Das", "grade": "Class 9", "color": "#fbbf24"}, {"id": "s4", "name": "Ishita Roy", "grade": "Class 11", "color": "#34d399"}], "bookings": [{"id": "b1", "student_id": "s1", "teacher_id": "t1", "subject": "Mathematics", "topic": "Quadratic equations \u2014 doubt session", "when": {"$off": -93600}, "duration": 60, "price": 450, "status": "completed", "created_at": {"$off": -108000}, "timeline": [{"status": "requested", "at": {"$off": -108000}}, {"status": "accepted", "at": {"$off": -104400}}, {"status": "in_progress", "at": {"$off": -93600}}, {"status": "completed", "at": {"$off": -90000}}], "completed_at": {"$off": -90000}, "teacher_earning": 383, "rating": 5, "review": "Explained super clearly, finally understand parabolas!"}, {"id": "b2", "student_id": "s1", "teacher_id": "t3", "subject": "Chemistry", "topic": "Organic chemistry basics \u2014 nomenclature", "when": {"$off": 7200}, "duration": 60, "price": 500, "status": "accepted", "created_at": {"$off": -10800}, "timeline": [{"status": "requested", "at": {"$off": -10800}}, {"status": "accepted", "at": {"$off": -7200}}], "completed_at": null, "teacher_earning": null, "rating": null, "review": null}, {"id": "b3", "student_id": "s2", "teacher_id": "t1", "subject": "Physics", "topic": "Projectile motion \u2014 numericals practice", "when": {"$off": 10800}, "duration": 90, "price": 675, "status": "requested", "created_at": {"$off": -1500}, "timeline": [{"status": "requested", "at": {"$off": -1500}}], "completed_at": null, "teacher_earning": null, "rating": null, "review": null}, {"id": "b4", "student_id": "s3", "teacher_id": "t5", "subject": "English", "topic": "Essay writing practice for boards", "when": {"$off": -180000}, "duration": 60, "price": 350, "status": "completed", "created_at": {"$off": -198000}, "timeline": [{"status": "requested", "at": {"$off": -198000}}, {"status": "accepted", "at": {"$off": -194400}}, {"status": "in_progress", "at": {"$off": -180000}}, {"status": "completed", "at": {"$off": -176400}}], "completed_at": {"$off": -176400}, "teacher_earning": 298, "rating": 4, "review": "Great feedback on my structure and vocabulary."}, {"id": "b5", "student_id": "s2", "teacher_id": "t2", "subject": "Physics", "topic": "Rotational motion \u2014 moment of inertia", "when": {"$off": -1200}, "duration": 60, "price": 400, "status": "in_progress", "created_at": {"$off": -18000}, "timeline": [{"status": "requested", "at": {"$off": -18000}}, {"status": "accepted", "at": {"$off": -14400}}, {"status": "in_progress", "at": {"$off": -1200}}], "completed_at": null, "teacher_earning": null, "rating": null, "review": null}], "counter": 6};
  const iso = ms => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "+00:00");
  const nowIso = () => iso(Date.now());
  function revive(x, base) {
    if (Array.isArray(x)) return x.map(v => revive(v, base));
    if (x && typeof x === "object") {
      if ("$off" in x) return iso(base + x.$off * 1000);
      const o = {}; for (const k in x) o[k] = revive(x[k], base); return o;
    }
    return x;
  }
  const seed = () => revive(SEED, Date.now());
  let DB;
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    const d = seed(); save(d); return d;
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  DB = load();
  class ApiError extends Error { constructor(m, c) { super(m); this.code = c || 400; } }
  const find = (c, id) => DB[c].find(x => x.id === id);

  function createBooking(p) {
    const student = find("students", p.student_id), teacher = find("teachers", p.teacher_id);
    if (!student || !teacher) throw new ApiError("Invalid student or teacher.");
    if (!teacher.online) throw new ApiError(teacher.name + " is offline right now. Pick an online teacher.");
    if (!teacher.subjects.includes(p.subject || "")) throw new ApiError("Pick one of the teacher's subjects.");
    const topic = (p.topic || "").trim();
    if (!topic) throw new ApiError("Please tell the teacher what you want to learn (topic).");
    if (topic.length > 200) throw new ApiError("Topic is too long (max 200 characters).");
    if (![30, 60, 90, 120].includes(p.duration)) throw new ApiError("Duration must be 30, 60, 90 or 120 minutes.");
    if (isNaN(new Date(p.when).getTime())) throw new ApiError("Please pick a valid date & time.");
    const price = Math.round(teacher.rate * p.duration / 60);
    const b = { id: "b" + DB.counter, student_id: student.id, teacher_id: teacher.id, subject: p.subject, topic,
      when: p.when, duration: p.duration, price, status: "requested", created_at: nowIso(),
      timeline: [{ status: "requested", at: nowIso() }], completed_at: null, teacher_earning: null, rating: null, review: null };
    DB.counter += 1; DB.bookings.push(b); return b;
  }
  const TR = { accept: ["requested", "accepted"], decline: ["requested", "declined"], start: ["accepted", "in_progress"],
    complete: ["in_progress", "completed"], cancel: [null, "cancelled"] };
  function bookingAction(id, p) {
    const b = find("bookings", id); if (!b) throw new ApiError("Booking not found.", 404);
    const t = find("teachers", b.teacher_id), a = p.action;
    if (a === "rate") {
      if (b.status !== "completed") throw new ApiError("You can rate only after the session is completed.");
      if (b.rating !== null) throw new ApiError("This session is already rated.");
      const r = p.rating; if (!Number.isInteger(r) || r < 1 || r > 5) throw new ApiError("Rating must be 1–5 stars.");
      b.rating = r; b.review = (p.review || "").trim().slice(0, 300);
      t.rating = Math.round((t.rating * t.ratings + r) / (t.ratings + 1) * 100) / 100; t.ratings += 1; return b;
    }
    if (!(a in TR)) throw new ApiError("Unknown action.");
    const [req, ns] = TR[a];
    if (a === "cancel") { if (!["requested", "accepted"].includes(b.status)) throw new ApiError("Only pending or accepted sessions can be cancelled."); }
    else if (b.status !== req) throw new ApiError("Cannot " + a + " a session that is '" + b.status + "'.");
    b.status = ns; b.timeline.push({ status: ns, at: nowIso() });
    if (a === "complete") {
      b.completed_at = nowIso(); const e = Math.round(b.price * (1 - FEE));
      b.teacher_earning = e; t.earnings += e; t.sessions += 1;
    }
    return b;
  }
  function setAvail(id, p) {
    const t = find("teachers", id); if (!t) throw new ApiError("Teacher not found.", 404);
    const on = !!p.online;
    if (!on && DB.bookings.some(b => b.teacher_id === id && b.status === "in_progress"))
      throw new ApiError("You have a live session — complete it before going offline.");
    t.online = on; return t;
  }
  const respond = (code, body) => new Response(JSON.stringify(body), { status: code, headers: { "Content-Type": "application/json" } });
  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (!url.pathname.startsWith("/api/")) return realFetch(input, init);
    const path = url.pathname, method = ((init && init.method) || "GET").toUpperCase();
    try {
      if (method === "GET" && path === "/api/state")
        return respond(200, { students: DB.students, teachers: DB.teachers, bookings: DB.bookings, platform_fee: FEE, server_time: nowIso() });
      const p = init && init.body ? JSON.parse(init.body) : {};
      let r, m;
      if (path === "/api/book") r = createBooking(p);
      else if ((m = path.match(/^\/api\/booking\/([\w-]+)\/action$/))) r = bookingAction(m[1], p);
      else if ((m = path.match(/^\/api\/teacher\/([\w-]+)\/availability$/))) r = setAvail(m[1], p);
      else if (path === "/api/reset") { DB = seed(); r = { ok: true }; }
      else throw new ApiError("Not found", 404);
      save(DB); return respond(200, r);
    } catch (e) {
      if (e instanceof ApiError) return respond(e.code, { error: e.message });
      return respond(500, { error: "Server error: " + e.message });
    }
  };
})();

// static/ ko www/ me copy karta hai, local-api.js jodta hai, service worker hata deta hai.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "..", "gurugo", "static");
const SRC2 = path.join(__dirname, "..", "web");
const DST = path.join(__dirname, "..", "www");
const base = fs.existsSync(SRC2) ? SRC2 : SRC;
fs.rmSync(DST, { recursive: true, force: true });
fs.cpSync(base, DST, { recursive: true });
fs.copyFileSync(path.join(__dirname, "..", "local-api.js"), path.join(DST, "local-api.js"));
fs.rmSync(path.join(DST, "sw.js"), { force: true });
let h = fs.readFileSync(path.join(DST, "index.html"), "utf8");
h = h.replace(/<script>if\("serviceWorker"[\s\S]*?<\/script>/, "")
     .replace('<script src="app.js"></script>', '<script src="local-api.js"></script>\n<script src="app.js"></script>');
fs.writeFileSync(path.join(DST, "index.html"), h);
console.log("www ready:", fs.readdirSync(DST).join(", "));

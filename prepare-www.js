const fs = require("fs"), path = require("path");
const ROOT = __dirname, DST = path.join(ROOT, "www");
fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST);
for (const f of ["app.js", "style.css", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "local-api.js"]) {
  fs.copyFileSync(path.join(ROOT, f), path.join(DST, f));
}
let h = fs.readFileSync(path.join(DST, "index.html"), "utf8");
h = h.replace(/<script>if\("serviceWorker"[\s\S]*?<\/script>/, "")
     .replace('<script src="app.js"></script>', '<script src="local-api.js"></script>\n<script src="app.js"></script>');
fs.writeFileSync(path.join(DST, "index.html"), h);
console.log("www ready:", fs.readdirSync(DST).join(", "));

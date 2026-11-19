# GuruGo — Android APK (offline, bina server)

App ka poora backend JavaScript me port hai (`local-api.js`), data phone ke localStorage me save hota hai.
Internet / server ki zarurat nahi.

## APK banane ke steps (PC par kuch install nahi karna)
1. github.com par naya repo banao (jaise `gurugo-app`).
2. Is folder ki saari files repo me upload karo (`.github` folder samet — hidden hai, drag-drop se jata hai).
3. Repo → **Actions** tab → **Build GuruGo APK** → **Run workflow** (push par apne aap bhi chalta hai).
4. 3-5 min baad run khulo → neeche **Artifacts** → `GuruGo-apk` download karo → zip ke andar `app-debug.apk`.
5. APK phone me bhejo (WhatsApp/Drive/USB) → tap → "Install unknown apps" allow → Install.

## Local build (optional)
Node 20 + JDK 17 + Android SDK ho to: `npm install && npm run prepare-www && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug`

## Notes
- Ye debug-signed APK hai: personal use / testing ke liye theek. Play Store ke liye release keystore + AAB chahiye.
- `web/` = frontend ki copy. Design badalna ho to `web/` me edit karo.
- Agar baad me real server se connect karna ho (sab users ka data shared), `local-api.js` hata do aur `app.py` ko host karo.

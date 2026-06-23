# Deploy (Netlify)

`netlify.toml` declares the build command and the official Next.js Runtime
plugin (`@netlify/plugin-nextjs`), which Netlify auto-installs at build time —
no local `npm install` of it needed. Deploy this **after** TLCN-BE is live,
since you need its URL.

## Steps

1. Push this repo to GitHub.
2. On Netlify: **Add new site > Import an existing project**, pick this repo.
3. Branch to deploy: `feature/chatbot-memory` (or whichever branch has the
   latest code — check with `git log` if unsure).
4. Build settings are read from `netlify.toml` automatically; you shouldn't
   need to change the build command or publish directory shown.
5. Before the first deploy (or in **Site configuration > Environment
   variables** afterwards), add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend>.onrender.com/api`
6. Deploy.
7. Go back to TLCN-BE's env vars and set `CORS_ORIGINS` / `FRONTEND_URL` to
   the Netlify URL you just got (e.g. `https://your-app.netlify.app`), then
   redeploy the backend.

# Deploy (Vercel)

Next.js needs zero config files for Vercel — it auto-detects the framework,
build command, and output directory. Deploy this **after** TLCN-BE is live,
since you need its URL.

## Steps

1. Push this repo to GitHub.
2. On Vercel: **Add New > Project**, import this repo.
3. In **Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend>.onrender.com/api`
4. Deploy.
5. Go back to TLCN-BE's env vars and set `CORS_ORIGINS` / `FRONTEND_URL` to
   the Vercel URL you just got (e.g. `https://your-app.vercel.app`), then
   redeploy the backend.

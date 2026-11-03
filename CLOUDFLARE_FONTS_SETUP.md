# Quran Fonts V2 - Cloudflare Static CDN Hosting

This setup hosts the Quran fonts as pure static files directly behind Cloudflare CDN using **Cloudflare R2** and a **Cloudflare Worker**.

---

## 1. Why this is decoupled from Vercel Backend

- **No API / No Serverless Overhead**: The main backend (`Alwadih`) runs NestJS on Vercel. Font files are large (~60MB across 604 files) and require long-term immutable caching.
- **Edge CDN URL**: Cloudflare serves `https://<your-host>/quran/fonts/v2/*` directly from edge memory and Cloudflare R2 object storage.
- **Vercel Bypassed**: Requests for `/quran/fonts/v2/*` are intercepted by Cloudflare before reaching Vercel. Vercel backend handles normal API endpoints (`/api/*`, etc.) with zero impact on serverless execution or bandwidth limits.

---

## 2. Directory Files Created

| File | Purpose |
| :--- | :--- |
| `wrangler.toml` | Cloudflare Worker configuration & R2 bucket binding |
| `worker.js` | Cloudflare Worker edge code ensuring custom headers & plain HTTP 404 |
| `verify.ps1` | PowerShell script testing all 604 fonts, manifest, SHA-256, and plain 404 |

---

## 3. Step-by-Step Deployment Instructions

### Step 3.1: Create the Cloudflare R2 Bucket
1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**.
2. Click **Create bucket**.
3. Bucket name: `quran-fonts-v2`.

### Step 3.2: Extract & Upload `v2/` Folder to R2
1. Extract `quran-fonts-v2.zip`.
2. Upload the `v2/` folder into the `quran-fonts-v2` bucket so objects have the key prefix `v2/` (e.g. `v2/manifest.json`, `v2/p1.ttf` ... `v2/p604.ttf`).
   - You can drag-and-drop the folder directly in Cloudflare Dashboard.
   - Or upload using AWS CLI / S3 client.

### Step 3.3: Deploy the Worker
From `F:\Back-End Projects\Alwadih`:
```powershell
npx wrangler deploy
```

### Step 3.4: Configure Host / Domain
In Cloudflare Dashboard → **Workers & Pages** → `quran-fonts-v2` → **Settings** → **Domains & Routes**:
- If using your main domain proxied through Cloudflare (e.g., `alwadih.com`):
  - Add a **Route**: `alwadih.com/quran/fonts/v2/*` pointing to `quran-fonts-v2`.
- If using a dedicated subdomain:
  - Add a **Custom Domain**: `cdn.alwadih.com` or `fonts.alwadih.com`.
- Or use the default Cloudflare Workers URL:
  - `https://quran-fonts-v2.<your-subdomain>.workers.dev`

---

## 4. Run Verification Suite

Once deployed, run:

```powershell
.\verify.ps1 -BaseUrl "https://<your-host>/quran/fonts/v2"
```

The script will automatically verify:
1. `manifest.json` returns 200, `application/json`, `max-age=3600`, and 604 entries.
2. All 604 font files return 200, `font/ttf`, and `public, max-age=31536000, immutable`.
3. SHA-256 of `p587.ttf` matches `5fcb3b47363dc46bb3442cb0e2fad2154cb450d413fdd6f6870fb7ca8562fc1d`.
4. Missing file (`p999.ttf`) returns a plain HTTP 404 (strictly `text/plain`, no HTML).

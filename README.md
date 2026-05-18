# 📱 AI Secretary Mobile

PWA app สำหรับอ่าน [AI-Secretary content](https://github.com/Tanakitsonthe/AI-Secretary) บนมือถือ — installable, dark mode, markdown rendering.

## ✨ Features

- 🌅 **Daily Brief หน้าแรก** — แสดง brief ของวันนี้อัตโนมัติ (มี fallback ถ้ายังไม่มี)
- 📚 **บทเรียน** — Stock / Crypto / Webdev tracks
- 📊 **Research reports** — NVDA / BTC / Gold + future
- 🛠️ **Projects** — Weekly experiments + stock-portfolio-tracker + ai-trading-systemPro
- 📱 **PWA installable** — Add to Home Screen → ใช้เหมือน native app
- 🌙 **Auto dark mode** — ตาม system preference
- ⚡ **Server-side rendering + 5-min revalidate** — เร็ว + สดเสมอ

## 🚀 Deploy on Vercel (one-time setup)

### 1. Sign in with GitHub
ไปที่ [vercel.com/signup](https://vercel.com/signup) → คลิก **"Continue with GitHub"** → authorize

### 2. Import this repo
- คลิก **"Add New..."** → **"Project"**
- หา `Tanakitsonthe/ai-secretary-mobile` → คลิก **"Import"**

### 3. Add environment variable
ก่อน Deploy → expand **"Environment Variables"** section:

| Key | Value |
|-----|-------|
| `GITHUB_TOKEN` | (paste PAT เดิม — `AI-Secretary-Daily-Refresh` token) |

### 4. Deploy
คลิก **"Deploy"** → รอ ~2 นาที → ได้ URL `https://ai-secretary-mobile-XXX.vercel.app`

## 📱 Install on Phone

**iPhone (Safari):**
1. เปิด URL ใน Safari
2. แตะปุ่ม Share (กรอบมีลูกศรขึ้น)
3. เลื่อนลง → **"Add to Home Screen"**
4. ตั้งชื่อ → **"Add"**

**Android (Chrome):**
1. เปิด URL ใน Chrome
2. แตะ menu (จุด 3 จุด)
3. **"Add to Home screen"** หรือ **"Install app"**
4. Confirm

## 🛠️ Development

```bash
# Install
npm install

# Create .env.local with GITHUB_TOKEN
echo "GITHUB_TOKEN=your_pat_here" > .env.local

# Dev
npm run dev

# Build
NEXT_TELEMETRY_DISABLED=1 npm run build
```

## 🏗️ Architecture

```
app/
├── page.tsx                      # Home — today's brief
├── briefs/                       # Daily briefs history
├── lessons/[track]/[slug]/       # Stock/Crypto/Webdev lessons
├── research/[track]/[slug]/      # Research reports
└── projects/                     # Project assessments + weekly

lib/github.ts                     # GitHub Contents API helper
components/
├── MarkdownView.tsx              # react-markdown + GFM + highlight
└── Nav.tsx                       # Bottom tab bar

public/
├── manifest.json                 # PWA manifest
├── icon-192.svg / icon-512.svg   # PWA icons
└── favicon.svg
```

## 🔒 Security

- `GITHUB_TOKEN` lives **server-side only** (Vercel env var)
- Client browser never sees the token
- API calls go through Next.js server functions
- PAT scoped to `Tanakitsonthe/AI-Secretary` only (Contents R/W)

## 🔄 Updates

Content auto-refreshes every 5 minutes (Next.js `revalidate: 300`).
For instant refresh after pushing new content:
- Vercel dashboard → Deployments → "Redeploy"
- Or just wait — page revalidates on next visit after 5 min

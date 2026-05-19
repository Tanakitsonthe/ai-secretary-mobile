# Vercel Env Vars Setup — Step by Step

This is the exact walkthrough for NUT to enable Push Notifications.

## ⏱ Time: 5 minutes

---

## 1. Open Vercel Dashboard

Go to https://vercel.com/dashboard

Find the project `ai-secretary-mobile` → click it.

## 2. Open Settings → Environment Variables

Click **Settings** tab (top nav inside the project), then **Environment Variables** in the left sidebar.

## 3. Add 4 variables

Click "Add New" for each. **For each, check both Production AND Preview AND Development**.

### Variable 1
- **Key:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Value:** `BFktV5xTwT2to-efy7obRjCo8it2_rAK5a7ZfnBNGYrh4FB58MShU5BGcHBp8pEo2z71G3GA22NINzqj8LXsbTI`

### Variable 2
- **Key:** `VAPID_PRIVATE_KEY`
- **Value:** `R6RasEz9LzgSu2fLO8Yru_YFOepv5Xf25YiZPWbUMKM`
- **⚠️ Sensitive!** Mark as "Sensitive" if Vercel shows that option.

### Variable 3
- **Key:** `VAPID_SUBJECT`
- **Value:** `mailto:tanakit.sont@bumail.net`

### Variable 4
- **Key:** `PUSH_INTERNAL_SECRET`
- **Value:** Generate one — open terminal and run:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Copy that hex string. **Save it somewhere safe** — routines need it.

## 4. Redeploy

After adding all 4:
- Go to **Deployments** tab
- Find the latest deployment
- Click `⋯` menu → **Redeploy**
- Wait ~1 min for build

## 5. Test on phone

1. Open PWA on phone (refresh if cached)
2. Navigate to `/settings`
3. Tap **"เปิดการแจ้งเตือน"**
4. Allow notifications when iOS/Android asks
5. Tap **"ทดสอบส่ง"**
6. ✅ Should see "🔔 Test from AI Secretary" notification within 5 seconds

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "VAPID public key not set" error | Step 3 missed `NEXT_PUBLIC_` prefix — must have it |
| Permission button greyed out | Browser blocked notifications previously — Settings → Site permissions → Allow |
| Test button gives 500 | `VAPID_PRIVATE_KEY` doesn't match public — copy both fresh from this file |
| iOS not showing | Must be iOS 16.4+ AND PWA installed to home screen (not just Safari) |
| Subscribed but no test push | Check Vercel Function logs for `/api/push/send` |

## After setup works

Save `PUSH_INTERNAL_SECRET` value — you'll paste it into claude.ai routine prompts so routines can trigger pushes.

Update `company/routines/*-prompt.md` files to include the actual Vercel URL and the secret value (or use env var in the routine config).

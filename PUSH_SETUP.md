# Push Notifications Setup

PWA uses Web Push API. NUT must configure 3 env vars on Vercel before the first subscribe works.

## 1. Generate VAPID keys (one time)

```bash
cd ai-secretary-mobile
npx web-push generate-vapid-keys
```

Output:
```
Public Key:  BFktV5xTwT2to-efy7obRjCo8it2_rAK5a7ZfnBNGYrh4FB58MShU5BGcHBp8pEo2z71G3GA22NINzqj8LXsbTI
Private Key: R6RasEz9LzgSu2fLO8Yru_YFOepv5Xf25YiZPWbUMKM
```

**Already generated for NUT — re-use the values above** (or regenerate if compromised).

## 2. Vercel env vars

Add these in Vercel project → Settings → Environment Variables (Production):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | the Public Key from step 1 |
| `VAPID_PRIVATE_KEY` | the Private Key from step 1 |
| `VAPID_SUBJECT` | `mailto:tanakit.sont@bumail.net` |
| `PUSH_INTERNAL_SECRET` | any long random string — for routine auth |

After saving, redeploy.

## 3. Subscribe (on phone)

1. Open the PWA on phone
2. Go to `/settings`
3. Tap "เปิดการแจ้งเตือน"
4. Allow notifications when prompted
5. Tap "ทดสอบส่ง" — should see notification within 5 seconds

Subscription is stored at `company/notifications/subscription.json` in the AI-Secretary repo (private).

## 4. Send from a routine (claude.ai)

In a cloud routine prompt, add this step:

```
After completing task, POST to https://{vercel-domain}/api/push/send with header
Authorization: Bearer {PUSH_INTERNAL_SECRET}
Body: { "title": "🔔 Daily Brief ready", "body": "Open the app to read today's brief", "url": "/" }
```

## Troubleshooting

- **"VAPID public key not set in env"** → step 2 not done or not redeployed
- **Permission denied** → user blocked notifications in browser settings
- **Subscription stored but no push received** → check `VAPID_PRIVATE_KEY` matches the public key used to subscribe
- **iOS not receiving** → requires iOS 16.4+ and PWA must be installed to home screen

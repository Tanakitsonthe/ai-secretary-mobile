# Vercel Cron Setup — Autonomous Routines

Routines run automatically on Vercel — **no more manual paste on claude.ai**.

## Required env vars (in addition to existing)

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` from https://console.anthropic.com |
| `CRON_SECRET` | random hex string (generate with `openssl rand -hex 32`) |
| `CLAUDE_ROUTINE_MODEL` | `claude-sonnet-4-5-20251022` (or claude-haiku-4-5 for cheaper) |
| `CLAUDE_CHAT_MODEL` | `claude-haiku-4-5-20251001` (cheap chat) |

The chat now uses Claude API directly — falls back to OpenRouter if `ANTHROPIC_API_KEY` missing.

## Schedule (BKK times → UTC in vercel.json)

| Route | When | What |
|-------|------|------|
| `/api/cron/daily-briefer` | Daily 07:20 BKK | Morning brief |
| `/api/cron/fitness-daily` | Daily 06:00 BKK | Today's workout |
| `/api/cron/weekly-project` | Sun 09:02 BKK | Mini project proposal |
| `/api/cron/reflect-reminder` | Daily 22:00 BKK | Push to nudge `/reflect` |

After deploy → Vercel dashboard → Cron Jobs → verify all 4 listed.

## How to test (without waiting for cron)

Call the endpoint manually with the secret:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-vercel-url.vercel.app/api/cron/daily-briefer
```

Response: `{ "ok": true, "output": "stocks/daily-news/2026-05-19.md" }`

Cost per run estimate (Sonnet 4.5):
- daily-briefer: ~$0.05
- fitness-daily: ~$0.02
- weekly-project: ~$0.03
- reflect-reminder: $0 (no LLM call)

Total ~$2-3/month for all routines.

## Migration from claude.ai routines

1. Set env vars on Vercel + redeploy
2. Verify by curling each cron endpoint manually
3. Delete the 3 old routines on claude.ai (they're now redundant)
4. The 4th (fitness-daily) was never created on claude.ai — Vercel handles it now

## Cost cap

If daily cost > $5 (configured in `company/budget.json`), routines should skip with a warning entry in activity log. *(Future feature.)*

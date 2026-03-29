# Vercel Deployment Guide: Turfivo

Follow these steps to deploy your Turf Booking System to production.

## 1. Environment Variables ⚠️
You **must** add these to the **Environment Variables** section in your Vercel Project Settings:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | Your production PostgreSQL/MySQL URL |
| `NEXTAUTH_SECRET` | `[run 'openssl rand -base64 32' to generate]` |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://your-app.vercel.app`) |
| `RESEND_API_KEY` | Your Resend API key for emails |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_FROM_PHONE` | Your Twilio phone number |

## 2. Database Setup
Vercel does not host databases. We recommend:
- **Neon.tech** (PostgreSQL) - Fast and has a free tier.
- **Supabase** (PostgreSQL) - Robust and full-featured.

**Note**: After connecting your database, you may need to run:
```bash
npx prisma db push
```
from your local machine (connected to the production string) to set up the tables.

## 3. Build Configuration
Vercel should automatically detect the project. Ensure the settings are:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (current)
- **Install Command**: `npm install`
- **Build Command**: `next build` (Vercel runs `prisma generate` automatically).

## 4. Cron Jobs (Reminders)
To enable the **2-hour booking reminders**, you can use **Vercel Cron Jobs**:
1. Create a `vercel.json` in your root:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 * * * *" 
    }
  ]
}
```
2. (Optional) Let me know if you want me to create that `/api/cron/reminders` endpoint!

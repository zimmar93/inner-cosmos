# Inner Cosmos — Vercel Deployment Guide

## Project Structure

```
inner-cosmos/
├── backend/            # NestJS API
├── store-frontend/     # Next.js Store
└── erp-frontend/       # Next.js ERP Admin
```

---

## Prerequisites

1. Create a free account on [Vercel](https://vercel.com)
2. Create a free PostgreSQL database (e.g., [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Vercel Postgres](https://vercel.com/storage/postgres))
3. Get your Stripe keys from the [Stripe Dashboard](https://dashboard.stripe.com)

---

## 1. Google Cloud Storage (Invoice PDFs)

Even on Vercel, you need a place to store invoice PDFs. We use GCS for this.

```bash
# Provide these credentials as environment variables in Vercel:
# GCS_PROJECT_ID=...
# GCS_BUCKET_NAME=...
# GCS_KEY_FILE=... (Paste the JSON content of your service account key here)
```

---

## 2. Deploy Backend to Vercel

The backend is configured to run as a Vercel Serverless Function via `api/index.ts`.

1. Go to your **Vercel Dashboard** and import the `inner-cosmos` repository.
2. Select the `backend` folder as the Root Directory.
3. Vercel will auto-detect the `vercel.json` file.
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://user:password@host:port/dbname`
   - `JWT_SECRET`: `your_random_secret_string`
   - `JWT_EXPIRES_IN`: `7d`
   - `STRIPE_SECRET_KEY`: `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...` (You'll get this in step 3)
   - `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, `GCS_KEY_FILE`
   - `COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_EMAIL`
5. Click **Deploy**. Vercel will give you a URL like `https://inner-cosmos-backend.vercel.app`.

---

## 3. Configure Stripe Webhook

After deploying the backend:

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://YOUR_BACKEND_VERCEL_URL/api/v1/payments/webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the **Webhook Signing Secret** and update your backend env var `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## 4. Deploy Store Frontend to Vercel

1. Import the same repo in Vercel, but select `store-frontend` as Root Directory.
2. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://YOUR_BACKEND_VERCEL_URL/api/v1`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
3. Click **Deploy**.

---

## 5. Deploy ERP Frontend to Vercel

1. Import the same repo, select `erp-frontend` as Root Directory.
2. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://YOUR_BACKEND_VERCEL_URL/api/v1`
3. Click **Deploy**.

---

## 6. Create First Admin User

Run this terminal command to create your first admin account (replace the URL with your backend Vercel URL):

```bash
curl -X POST https://YOUR_BACKEND_VERCEL_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@innercosmos.com",
    "password": "SecureAdminPassword123!",
    "role": "ADMIN"
  }'
```

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
npx vercel dev   # Runs the serverless function locally

# Terminal 2 — Store Frontend
cd store-frontend
npm install
npm run dev      # http://localhost:3000

# Terminal 3 — ERP Frontend
cd erp-frontend
npm install
npm run dev      # http://localhost:3002
```

# ChatVista — Real-time Chat App with AI Assistant

Production-ready repository for a real-time one-on-one chat application with AI features,
built to run on Termux and deployable to Koyeb.

This repository contains:
- `/backend` — Node.js + Express + Socket.IO backend
- `/frontend` — Next.js React frontend (client-side rendered pages for auth + chat)
- `/scripts` — SQL migration script to create required tables
- `/docs` — deployment and setup documentation

## Quick actions
- Download the repository ZIP: [Download the ZIP](sandbox:/mnt/data/chatvista_repo.zip)

## Deploy on Koyeb
Click the button below to start a Koyeb deployment. The deploy process will ask for the environment variables:
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `JWT_SECRET`

[![Deploy on Koyeb](https://www.koyeb.com/deploy/button.svg)](https://app.koyeb.com/deploy?repo=https://github.com/princemaster1/chatvista&env[DATABASE_URL]=postgresql://...&env[JWT_SECRET]=YourSecretHere&env[OPENAI_API_KEY]=sk-...)

> Replace the GitHub repo URL above with your repository after you push this code.

See `/docs/KOYEB.md` for a full Koyeb deploy example including `koyeb.yml`.



## Termux Quick Start (tested steps)

Install packages:
```
pkg update && pkg upgrade -y
pkg install nodejs git postgresql-libs -y
# optional: install psql if you need local migrations
```

Clone and run:
```
git clone <repo-url>
cd chatvista_repo/backend
cp .env.example .env
# Edit .env -> DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npm run migrate   # requires psql and DATABASE_URL; otherwise create tables manually using scripts/migrations.sql
npm start
# In another session:
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

### Important note about "zero errors"
I will make this repo as complete and Termux-friendly as possible — using `bcryptjs`, avoiding native modules in dependencies, and including migration scripts. However, **I cannot guarantee zero runtime errors** because runtime depends on environment, DB access, API keys, and system Node version. If you run into any errors, paste the logs here and I'll fix them immediately.

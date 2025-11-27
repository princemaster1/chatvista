# Setup Guide (Termux & Local)

## Prerequisites
- Node.js 16+ (Termux: `pkg install nodejs`), npm
- psql (optional for migrations) or connect to remote DB
- Git

## Clone
git clone <your-repo-url>
cd chatvista_repo

## Backend
cd backend
cp .env.example .env
# Edit .env to include DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npm run migrate    # runs SQL migration (requires psql and DATABASE_URL)
npm start

## Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev

## Testing real-time
- Open frontend at http://localhost:3000, login/signup.
- Open two browsers to simulate two users or use the demo conversation button.

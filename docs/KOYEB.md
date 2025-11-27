# Deploying to Koyeb

1. Push this repository to GitHub.
2. On Koyeb, create a new app and connect your GitHub repo.
3. Use `docs/koyeb.yml` as a reference for service configuration.
4. Provide the following secrets in Koyeb: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`.
5. For Termux compatibility: Node.js 16+ is required.

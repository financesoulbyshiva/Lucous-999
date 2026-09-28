# 16 - Environment and Deployment: LUCOUS

## 1. Environment Variables Inventory

### Backend Variables ([`backend/server.js`](file:///c:/Shiva/Lucous2509-main/backend/server.js) & [`backend/prisma/schema.prisma`](file:///c:/Shiva/Lucous2509-main/backend/prisma/schema.prisma))

| Variable Name | Required | Default in Code | Purpose |
| :--- | :---: | :---: | :--- |
| `MONGODB_URI` | **Yes** | *None (Fails if unset)* | MongoDB connection URI (`mongodb+srv://...` or `mongodb://localhost:27017/lucous`). |
| `PORT` | No | `5000` | HTTP listening port for the Express application. |
| `JWT_SECRET` | No (Insecure) | `"lucous-development-secret"` | HMAC secret used to sign and verify JSON Web Tokens. |
| `NODE_ENV` | No | `"development"` | Controls OTP exposure in JSON responses and detailed logging. |
| `AI_PROVIDER` | Optional | `"openai"` | LLM provider name (currently must be `"openai"`). |
| `AI_API_KEY` | Optional | *None* | OpenAI API authentication key (`sk-...`). |
| `AI_MODEL` | Optional | `"gpt-4o-mini"` | Target OpenAI model name. |
| `RAZORPAY_KEY_ID` | Optional | *None* | Razorpay public key ID (`rzp_test_...` or `rzp_live_...`). |
| `RAZORPAY_KEY_SECRET` | Optional | *None* | Razorpay private API key secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | *None* | Secret token configured in the Razorpay Webhooks dashboard. |

### Frontend Variables (`src/`)

| Variable Name | Required | Current State | Recommendation |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Critical** | **Not implemented.** `http://localhost:5000/api` is hardcoded across 4 files. | Must be introduced to allow pointing to staging/production backends. |

---

## 2. Recommended `.env.example` Templates

### Root Frontend Template (`.env.example`)
```bash
# LUCOUS Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend Template (`backend/.env.example`)
```bash
# LUCOUS Backend Environment Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-secure-random-secret-key-at-least-32-chars

# Database (MongoDB connection string)
MONGODB_URI=mongodb://localhost:27017/lucous

# OpenAI Integration
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key
AI_MODEL=gpt-4o-mini

# Razorpay Payments Integration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

---

## 3. Package Scripts & Execution Auditing

### Frontend (`package.json`)
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Backend (`backend/package.json`)
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "postinstall": "prisma skills sync || exit 0"
}
```

#### Critical Backend Script Anomaly:
- `backend/package.json` specifies `"main": "index.js"`.
- However, the server file is named **`server.js`**. There is no `index.js`.
- There is **no `npm start` or `npm run dev` script** in `backend/package.json`.
- Developers currently must run `node server.js` directly.
- Recommended addition to `backend/package.json`:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "seed": "node prisma/seed.js"
  }
  ```

---

## 4. Deployment Configuration Audit

- **Docker:** No `Dockerfile` or `docker-compose.yml` exists in the repository.
- **Vercel:** `.gitignore` includes references to `.vercel`, indicating the frontend was structured for Vercel deployment.
- **CORS Configuration:** Backend explicitly allows `origin: ["http://localhost:3000", "http://127.0.0.1:3000"]` ([`backend/server.js:18`](file:///c:/Shiva/Lucous2509-main/backend/server.js#L18)). In production, this must be updated to accept production domains via an environment variable.

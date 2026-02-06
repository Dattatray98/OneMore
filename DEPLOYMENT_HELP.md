# Deployment Checklist

If data saving/retrieval is not working in production, it is almost ALWAYS due to missing Environment Variables.

## 1. Frontend (Client) Variables
**Where to set:** Vercel / Netlify / Cloudflare Pages Dashboard

- **`VITE_API_URL`**: This MUST be set to your deployed backend URL.
  - *Example:* `https://my-task-app-backend.onrender.com/api`
  - *Important:* Ensure you include `/api` at the end if your routes are setup that way (which they are).
  - *Verify:* Open your browser console (F12) on the production site. It will now log `configured API_URL: ...`. If it says `localhost`, this variable is missing.

- **`VITE_CLERK_PUBLISHABLE_KEY`**: Required for authentication to work from the frontend.

## 2. Backend (Server) Variables
**Where to set:** Render / Railway / Heroku Dashboard

- **`FRONTEND_URL`**: Used for CORS access.
  - *Example:* `https://my-task-app.vercel.app` (No trailing slash)
  - *Verify:* Check your server logs. It will now log `CORS Check - Origin: ...`. If it logs "CORS Blocked", add that origin to this variable.

- **`MONGO_URI`**: Database connection string.
  - *Note:* The code has a specific fallback, but for security and reliability, always set this in production.

- **`CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`**: Required for verifying tokens on the backend.

## 3. Redeploy
After adding these variables, you usually need to **Redeploy** both the Client and Server for changes to take effect.

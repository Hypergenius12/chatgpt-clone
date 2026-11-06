# ChaatGPT (Full-Stack)

A feature-complete ChaatGPT clone built with React, Vite, Tailwind CSS, Express, and Google's Gemini models with dual-key automatic failover, file downloads, and AI image generation.

---

## 🔒 Security & API Key Safety

**Your API key is never exposed to the browser or committed to GitHub:**
- **Zero Client Exposure**: The frontend makes requests only to your local backend `/api/chat`. The backend server injects the API key secretly on the server side.
- **Git Protection**: `.env` is listed in `.gitignore`. When you push to GitHub, Git automatically ignores your `.env` file containing your real keys. Only `.env.example` is pushed.

---

## 🚀 Free Hosting via GitHub (Step-by-Step)

Because this app uses a backend server to keep your API keys hidden from client inspection, it cannot run on static-only hosts like GitHub Pages. Instead, you connect your GitHub repository to a free full-stack host like **Render**, **Railway**, or **Koyeb**.

### Deploy to Render (Free, 100% Automated from GitHub)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Render:**
   - Sign up for free at [render.com](https://render.com) using your GitHub account.
   - Click **New +** → **Web Service**.
   - Select your newly pushed GitHub repository.

3. **Configure Settings (or let `render.yaml` auto-configure):**
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Add Your Secret Keys:**
   Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(paste your primary Gemini API key)*
   - `GEMINI_FALLBACK_API_KEY`: *(paste your fallback Gemini API key)*
   - `NODE_ENV`: `production`

5. **Click "Create Web Service"**:
   Render will build the app and give you a free HTTPS URL (e.g. `https://my-chatgpt-clone.onrender.com`).
   - Every time you push updates to GitHub, Render automatically redeploys.
   - Your API key remains encrypted inside Render's vault and will never be exposed or taken down!

---

## 💻 Local Development

1. **Clone repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Add your keys to `.env`:
   ```env
   GEMINI_API_KEY="your_primary_key"
   GEMINI_FALLBACK_API_KEY="your_fallback_key"
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

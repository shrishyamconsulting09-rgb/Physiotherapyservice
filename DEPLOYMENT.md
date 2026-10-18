# Deploying PhysioTracker to Vercel

PhysioTracker is configured with official Vercel deployment presets, single-page application (SPA) rewrite rules, and clinical-grade HTTP security headers.

---

## Quick Deploy (Recommended: via GitHub)

1. **Push or Export Project to GitHub**:
   - In Google AI Studio, click **Settings (gear icon)** or **Export** &rarr; **Export to GitHub** (or download the ZIP and push to your GitHub account).
2. **Log into Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. **Import Project**:
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your `physiotracker` GitHub repository.
4. **Build & Output Settings** (Detected automatically via `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables** (Optional):
   - If utilizing server-side Gemini AI features, add `GEMINI_API_KEY` under the **Environment Variables** section.
6. **Deploy**:
   - Click **"Deploy"**. Vercel will build and assign you a free production URL (e.g., `https://physiotracker.vercel.app`) with free automatic SSL/TLS.

---

## Alternative: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Log in to your Vercel account
vercel login

# 3. Deploy to production
vercel --prod
```

---

## Security Architecture & Protections

The pre-configured `vercel.json` applies the following security safeguards:

1. **Content Security Policy (CSP)**:
   - Restricts executable scripts and styles to trusted domains, mitigating Cross-Site Scripting (XSS).
2. **Anti-Clickjacking (`X-Frame-Options: SAMEORIGIN`)**:
   - Prevents unauthorized third-party sites from framing the clinical dashboard inside malicious iframes.
3. **MIME Sniffing Prevention (`X-Content-Type-Options: nosniff`)**:
   - Prevents browsers from interpreting files as executable scripts if their MIME type differs.
4. **Strict Transport Security (HSTS)**:
   - Enforces HTTPS communication for all network traffic (`max-age=63072000; includeSubDomains; preload`).
5. **Hardware Permissions Policy**:
   - Explicitly restricts camera, microphone, and geolocation APIs when not in use (`camera=(), microphone=(), geolocation=()`).
6. **Referrer Policy (`strict-origin-when-cross-origin`)**:
   - Prevents leaking patient navigation data and query params to external sites.
7. **End-to-End AES-256-GCM Vault Encryption (Zero-Knowledge Architecture)**:
   - Patient records, diagnoses, addresses, contact details, SOAP clinical documentation, pain metrics, and financial visit logs are encrypted at rest using AES-GCM 256-bit with PBKDF2-HMAC-SHA-256 key derivation (100,000 computation rounds).
   - Cryptographically Secure Pseudo-Random (CSPRNG) 16-byte salt and 12-byte IV per write cycle.
   - Plaintext patient records are completely wiped from device storage (`localStorage`) upon vault activation.
   - Includes automatic idle timeout locking (5, 15, 30, 60 minutes), quick lock keyboard shortcut (`Ctrl+L` / `Cmd+L`), and encrypted `.physiovault` file export/restore.

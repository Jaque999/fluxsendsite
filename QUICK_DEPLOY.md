# Quick Deployment Guide

## After cloning on your server:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Create directories:**
   ```bash
   mkdir -p data storage logs
   ```

4. **Create .env.local:**
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
   
   Update these values:
   - `TOKEN_PEPPER` - Generate with: `openssl rand -hex 32`
   - `BASE_URL` - Your domain (e.g., `https://fluxsend.xyz`)
   - `DATA_DIR` - Full path to data directory
   - `STORAGE_DIR` - Full path to storage directory

5. **Update ecosystem.config.js:**
   
   Edit the file and set environment variables before starting:
   ```bash
   export APP_DIR=$(pwd)
   export DATA_DIR=$(pwd)/data
   export STORAGE_DIR=$(pwd)/storage
   export TOKEN_PEPPER="your-token-here"
   export BASE_URL="https://your-domain.com"
   ```

   Or edit `ecosystem.config.js` directly and replace the paths.

6. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

7. **Configure nginx** (see DEPLOY.md for full instructions)

8. **Test:**
   ```bash
   curl http://localhost:3000
   ```

## Important Notes:

- Make sure to remove any `package-lock.json` files in parent directories (like `/root/package-lock.json`)
- The app must be built before PM2 can start it
- Check logs with: `pm2 logs fluxsend`


# Ubuntu Server Deployment Guide

## Prerequisites

- Ubuntu 20.04+ server (Contabo)
- Root or sudo access
- Domain name pointed to your server IP (optional but recommended)

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install build tools (required for better-sqlite3)
sudo apt install -y build-essential python3
```

## Step 2: Clone and Setup Project

```bash
# Create app directory
sudo mkdir -p /var/www/fluxsend
sudo chown $USER:$USER /var/www/fluxsend

# Clone your repository or upload files
cd /var/www/fluxsend
# git clone your-repo-url .
# OR upload files via SFTP/SCP

# Install dependencies
npm install

# Build the application
npm run build
```

## Step 3: Configure Environment Variables

```bash
# Create .env.local file
nano /var/www/fluxsend/.env.local
```

Add these variables:
```
TOKEN_PEPPER=your-very-long-random-secret-string-here
BASE_URL=https://your-domain.com
DATA_DIR=/var/www/fluxsend/data
STORAGE_DIR=/var/www/fluxsend/storage
NODE_ENV=production
PORT=3000
```

Generate a secure TOKEN_PEPPER:
```bash
openssl rand -hex 32
```

## Step 4: Create Directories

```bash
mkdir -p /var/www/fluxsend/data
mkdir -p /var/www/fluxsend/storage
mkdir -p /var/www/fluxsend/logs
```

## Step 5: Configure PM2

```bash
# Edit ecosystem config
nano /var/www/fluxsend/ecosystem.config.js

# Update TOKEN_PEPPER and BASE_URL in the file

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it prints
```

## Step 6: Configure Nginx

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/fluxsend
```

Copy the contents from `nginx.conf` and update `your-domain.com` with your actual domain.

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/fluxsend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 7: Setup SSL (Optional but Recommended)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure nginx for HTTPS
```

After SSL setup, uncomment the HTTP to HTTPS redirect in nginx config.

## Step 8: Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 9: Verify Deployment

1. Visit your domain in a browser
2. Try uploading a file
3. Test downloading the file

## Useful Commands

```bash
# View PM2 logs
pm2 logs fluxsend

# Restart application
pm2 restart fluxsend

# Stop application
pm2 stop fluxsend

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check application status
pm2 status
```

## Maintenance

### Update Application

```bash
cd /var/www/fluxsend
# git pull  # if using git
# OR upload new files

npm install
npm run build
pm2 restart fluxsend
```

### Backup Database and Files

```bash
# Backup database
cp /var/www/fluxsend/data/fluxsend.db /backup/location/

# Backup storage
tar -czf /backup/location/storage-backup.tar.gz /var/www/fluxsend/storage/
```

### Cleanup Expired Uploads

You can create a cron job to periodically clean expired uploads:

```bash
# Edit crontab
crontab -e

# Add this line to run cleanup daily at 2 AM
0 2 * * * cd /var/www/fluxsend && node -e "require('./src/lib/store').purgeExpired()"
```

## Troubleshooting

- **Application won't start**: Check PM2 logs with `pm2 logs fluxsend`
- **502 Bad Gateway**: Ensure the app is running on port 3000: `pm2 status`
- **Files not uploading**: Check storage directory permissions: `ls -la /var/www/fluxsend/storage`
- **Database errors**: Check data directory permissions: `ls -la /var/www/fluxsend/data`


#!/bin/bash

# FluxSend Ubuntu Server Setup Script
# Run this script on your Ubuntu server after cloning/uploading the project

set -e

echo "🚀 FluxSend Setup Script"
echo "========================"

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please don't run as root. Run as a regular user with sudo privileges."
   exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Check nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    sudo apt update
    sudo apt install -y nginx
else
    echo "✅ nginx already installed"
fi

# Install build tools
echo "📦 Installing build tools..."
sudo apt install -y build-essential python3

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create directories
echo "📁 Creating directories..."
mkdir -p data storage logs

# Generate TOKEN_PEPPER if not set
if [ -z "$TOKEN_PEPPER" ]; then
    TOKEN_PEPPER=$(openssl rand -hex 32)
    echo "🔑 Generated TOKEN_PEPPER: $TOKEN_PEPPER"
    echo "⚠️  Save this TOKEN_PEPPER value!"
fi

# Create .env.local
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
TOKEN_PEPPER=$TOKEN_PEPPER
BASE_URL=http://localhost:3000
DATA_DIR=$(pwd)/data
STORAGE_DIR=$(pwd)/storage
NODE_ENV=production
PORT=3000
EOF
    echo "✅ Created .env.local (update BASE_URL with your domain)"
else
    echo "✅ .env.local already exists"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Update ecosystem.config.js with TOKEN_PEPPER
if [ -n "$TOKEN_PEPPER" ]; then
    sed -i "s/CHANGE_THIS_TO_RANDOM_STRING/$TOKEN_PEPPER/g" ecosystem.config.js
    echo "✅ Updated ecosystem.config.js with TOKEN_PEPPER"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual BASE_URL (your domain)"
echo "2. Update ecosystem.config.js BASE_URL if needed"
echo "3. Configure nginx (see DEPLOY.md)"
echo "4. Start the application: pm2 start ecosystem.config.js"
echo "5. Save PM2: pm2 save && pm2 startup"


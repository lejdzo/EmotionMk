# E-MOTION Deployment Guide - Apache on Port 9000

## Setup Overview
- **Apache**: Listens on port 9000, proxies requests
- **Node.js**: Runs on port 3000 (localhost only)
- **Access**: http://your-server-ip:9000

---

## Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Enable Apache modules
sudo a2enmod proxy proxy_http headers rewrite

# Configure Apache to listen on port 9000
sudo nano /etc/apache2/ports.conf
# Add this line: Listen 9000

# Restart Apache
sudo systemctl restart apache2
```

---

## Step 1: Build Application (on your dev machine)

```bash
cd /home/tedi/VisualStudioProjects/emotionmk

# Build for production
npm run build
```

---

## Step 2: Prepare Server Directory

```bash
# Create directory structure
sudo mkdir -p /var/www/html/static/emotion
sudo mkdir -p /var/www/html/static/emotion/logs

# Set ownership (replace 'youruser' with your username)
sudo chown -R youruser:youruser /var/www/html/static/emotion
```

---

## Step 3: Transfer Files to Server

```bash
# From your dev machine
cd /home/tedi/VisualStudioProjects/emotionmk

# Transfer .output directory
scp -r .output youruser@your-server:/var/www/html/static/emotion/

# Transfer PM2 config
scp ecosystem.config.cjs youruser@your-server:/var/www/html/static/emotion/

# Transfer Apache config
scp apache-emotion.conf youruser@your-server:~/

# Transfer .env (create production version first!)
scp .env.production.example youruser@your-server:/var/www/html/static/emotion/.env
```

---

## Step 4: Configure Apache

```bash
# Copy Apache config to sites-available
sudo cp ~/apache-emotion.conf /etc/apache2/sites-available/emotion.conf

# Edit if needed (change ServerName)
sudo nano /etc/apache2/sites-available/emotion.conf

# Enable the site
sudo a2ensite emotion.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Step 5: Configure Environment

```bash
cd /var/www/html/static/emotion

# Edit .env with production values
nano .env
```

Required variables:
```env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
NITRO_PORT=3000
NITRO_HOST=127.0.0.1

MONGODB_URI=your-production-mongodb-uri
MONGODB_DB_NAME=emotionmk
SESSION_SECRET=your-strong-random-secret

NUXT_MAIL_SMTP={"service":"gmail","auth":{"user":"your-email","pass":"your-password"}}
NUXT_MAIL_MESSAGE={"to":"your-email"}
```

---

## Step 6: Start Application

```bash
cd /var/www/html/static/emotion

# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Enable PM2 on system boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs emotion
```

---

## Step 7: Configure Firewall

```bash
# Allow Apache port 9000
sudo ufw allow 9000/tcp

# Port 3000 should NOT be exposed (internal only)

# Check firewall status
sudo ufw status
```

---

## Testing

```bash
# Test Node.js directly (on server)
curl http://localhost:3000

# Test Apache proxy (on server)
curl http://localhost:9000

# From browser
http://your-server-ip:9000
```

---

## Maintenance

### View Logs
```bash
# Application logs
pm2 logs emotion

# Apache logs
sudo tail -f /var/log/apache2/emotion-error.log
sudo tail -f /var/log/apache2/emotion-access.log
```

### Restart Application
```bash
pm2 restart emotion
```

### Update Deployment
```bash
# Build on dev machine
npm run build

# Transfer to server
scp -r .output youruser@your-server:/var/www/html/static/emotion/

# Restart on server
pm2 restart emotion
```

### Stop Application
```bash
pm2 stop emotion
pm2 delete emotion
```

---

## Troubleshooting

### Check if Node.js is running
```bash
pm2 status
curl http://localhost:3000
```

### Check if Apache is listening on 9000
```bash
sudo netstat -tulpn | grep :9000
sudo ss -tulpn | grep :9000
```

### Check Apache proxy
```bash
sudo apache2ctl -M | grep proxy
# Should see: proxy_module, proxy_http_module
```

### Port conflicts
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :9000
```

### Apache not starting
```bash
sudo apache2ctl configtest
sudo systemctl status apache2
sudo journalctl -u apache2 -n 50
```

---

## File Structure on Server

```
/var/www/html/static/emotion/
├── .output/
│   ├── server/
│   │   └── index.mjs
│   └── public/
├── .env
├── ecosystem.config.cjs
└── logs/
    ├── error.log
    └── out.log
```

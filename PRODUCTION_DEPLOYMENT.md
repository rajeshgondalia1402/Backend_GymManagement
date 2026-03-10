# Production Deployment Guide (Hostinger VPS)

## What Changes When Deploying to Production

This project auto-loads environment variables based on `NODE_ENV`:
- **Development** (local): loads `.env.development`
- **Production** (VPS): loads `.env.production`
- **Fallback**: loads `.env` if no environment-specific file exists

---

## Step-by-Step VPS Deployment

### 1. SSH into your Hostinger VPS

```bash
ssh root@your-vps-ip
```

### 2. Install Node.js, npm, PostgreSQL

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2
```

### 3. Setup PostgreSQL Database

```bash
sudo -u postgres psql

# Inside psql:
CREATE USER gymadmin WITH PASSWORD 'YourStrongPassword123!';
CREATE DATABASE gym_management OWNER gymadmin;
GRANT ALL PRIVILEGES ON DATABASE gym_management TO gymadmin;
\q
```

### 4. Clone & Setup Project

```bash
cd /var/www
git clone <your-repo-url> gym-management
cd gym-management/backend
npm install
```

### 5. Create `.env.production` on VPS

Create the file `/var/www/gym-management/backend/.env.production`:

```bash
nano .env.production
```

Paste and update these values:

```env
# Database
DATABASE_URL="postgresql://gymadmin:YourStrongPassword123!@localhost:5432/gym_management?schema=public"

# JWT Secrets (GENERATE NEW ONES - run the command below)
JWT_SECRET="PASTE_GENERATED_SECRET_HERE"
JWT_REFRESH_SECRET="PASTE_ANOTHER_GENERATED_SECRET_HERE"
JWT_EXPIRES_IN="15d"
JWT_REFRESH_EXPIRES_IN="15d"

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (your actual domain)
FRONTEND_URL="https://yourdomain.com"

# Cloudflare R2 (same values, or separate production bucket)
R2_ACCOUNT_ID="626b435d6788b23f4585931dfe1c9429"
R2_ACCESS_KEY_ID="49ca57d6350329afc7d65ef35acc5f04"
R2_SECRET_ACCESS_KEY="511a18669e8371f88618fa38c51763937b435659c2fc4aaa266e158f494a7c9c"
R2_BUCKET_NAME="gym-management-storage"
R2_PUBLIC_URL="https://626b435d6788b23f4585931dfe1c9429.r2.cloudflarestorage.com"

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=60
```

### 6. Generate Strong JWT Secrets

Run this command **twice** (once for each secret):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy each output and paste into `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### 7. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 8. Build & Start

```bash
npm run build
npm run start
# OR use PM2 for auto-restart:
NODE_ENV=production pm2 start dist/server.js --name gym-backend
pm2 save
pm2 startup
```

---

## Quick Reference: What Exactly to Change for Production

| Variable | Development (Local) | Production (VPS) | Action |
|----------|-------------------|-------------------|--------|
| `DATABASE_URL` | `localhost` with local password | VPS PostgreSQL credentials | **MUST CHANGE** |
| `JWT_SECRET` | Dev key | Strong random 128-char hex | **MUST CHANGE** |
| `JWT_REFRESH_SECRET` | Dev key | Strong random 128-char hex | **MUST CHANGE** |
| `JWT_EXPIRES_IN` | `15d` | `15d` | No change needed |
| `JWT_REFRESH_EXPIRES_IN` | `15d` | `15d` | No change needed |
| `PORT` | `5000` | `5000` (or your choice) | Optional |
| `NODE_ENV` | `development` | `production` | **MUST CHANGE** |
| `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` | **MUST CHANGE** |
| `R2_*` | Your R2 credentials | Same or separate bucket | No change needed |
| `RATE_LIMIT_MAX` | `100` | `60` (stricter) | Recommended |

---

## How It Works

The app automatically picks the right `.env` file:

```
NODE_ENV=development  →  loads .env.development
NODE_ENV=production   →  loads .env.production
Not set               →  loads .env (fallback)
```

**You don't need to change any code.** Just:
1. Copy the project to VPS
2. Create `.env.production` with production values
3. Run `npm run build && npm run start`

---

## Production Safety Features

The app will **refuse to start** in production if:
- `DATABASE_URL` is missing
- `JWT_SECRET` is missing or contains "CHANGE_ME" or is less than 32 characters
- `JWT_REFRESH_SECRET` is missing or contains "CHANGE_ME" or is less than 32 characters

It will **warn** if:
- `FRONTEND_URL` still contains "localhost"

---

## Useful PM2 Commands (Production)

```bash
pm2 list                    # See running processes
pm2 logs gym-backend        # View logs
pm2 restart gym-backend     # Restart the app
pm2 stop gym-backend        # Stop the app
pm2 monit                   # Monitor CPU/memory
```

---

## Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt install nginx
```

Copy the included Nginx config to your VPS:

```bash
# Copy the config file (from project root)
sudo cp nginx.conf.example /etc/nginx/sites-available/gym-api

# Enable it
sudo ln -sf /etc/nginx/sites-available/gym-api /etc/nginx/sites-enabled/

# Test & restart
sudo nginx -t
sudo systemctl restart nginx
```

Or manually create `/etc/nginx/sites-available/gym-api`:

```nginx
server {
    listen 80;
    server_name api.gymdeskpro.in;

    client_max_body_size 10M;

    location / {
        # Handle CORS preflight at Nginx level
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 86400;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 200;
        }

        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers on all proxied responses
        add_header 'Access-Control-Allow-Origin' $http_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/gym-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL with Let's Encrypt (Free HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

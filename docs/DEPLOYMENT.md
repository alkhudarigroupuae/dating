# Production Deployment Guide

## 1. Prerequisites
- **VPS**: Ubuntu 22.04 LTS (e.g., DigitalOcean, AWS EC2, Linode)
- **Domain**: A registered domain name pointing to your VPS IP.
- **Services**: MongoDB Atlas (or local), Redis (local or cloud), Cloudinary, Stripe.

## 2. Backend Deployment (VPS)

1. **SSH into VPS**:
   ```bash
   ssh root@your_vps_ip
   ```

2. **Install Node.js & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

3. **Clone Repository**:
   ```bash
   git clone https://github.com/yourusername/loveconnect.git
   cd loveconnect/server
   ```

4. **Install Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

5. **Configure Environment**:
   Create `.env` file with production values.

6. **Start with PM2**:
   ```bash
   pm2 start dist/index.js --name "loveconnect-api"
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx (Reverse Proxy)**:
   - Install Nginx: `sudo apt install nginx`
   - Configure `/etc/nginx/sites-available/default` to proxy `/api` and socket connections to `localhost:5000`.
   - Enable SSL with Certbot: `sudo apt install certbot python3-certbot-nginx` -> `sudo certbot --nginx`.

## 3. Frontend Deployment (Vercel)

1. **Push code to GitHub**.
2. **Import project in Vercel**.
3. **Set Root Directory** to `client`.
4. **Configure Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-domain.com/api`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://your-domain.com`
5. **Deploy**.

## 4. Database & Redis
- Use MongoDB Atlas for a managed database.
- Use Upstash for managed Redis or install Redis on VPS (`sudo apt install redis-server`).

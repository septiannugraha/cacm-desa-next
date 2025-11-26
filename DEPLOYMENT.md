# CACMDesa-Next Deployment Guide

Complete guide for deploying the CACMDesa-Next application using Docker Compose.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Deployment Options](#deployment-options)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ and Docker Compose V2
- Domain name (for production with SSL)
- Minimum 2GB RAM, 10GB disk space
- Open ports: 80, 443, 3000 (or custom)

### Install Docker (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd cacmdesa-next

# Create production environment file
cp .env.production.example .env.production

# Edit the environment variables
nano .env.production
```

### 2. Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Copy the output and paste it in .env.production as NEXTAUTH_SECRET
```

### 3. Build and Start

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service health
docker compose ps
```

### 4. Initialize Database

```bash
# Wait for SQL Server to be ready (check logs)
docker compose logs -f mssql

# Once healthy, run Prisma migrations
docker compose exec app npx prisma db push

# Seed the database with initial data
docker compose exec app npx prisma db seed
```

### 5. Access Application

Open your browser to:
- **Without nginx**: http://your-server-ip:3000
- **With nginx**: http://your-domain.com (or https:// if SSL is configured)

Default admin credentials (from seed):
- Username: `admin`
- Password: `admin123`
- Fiscal Year: `2025`

**IMPORTANT**: Change these credentials immediately after first login!

## Configuration

### Environment Variables (.env.production)

```env
# Database
DB_NAME=CACMDesa
DB_PASSWORD=YourStrong@Passw0rd2024!
DB_PORT=1433

# Application
APP_PORT=3000
NODE_ENV=production

# NextAuth (REQUIRED!)
NEXTAUTH_SECRET=your-generated-secret-from-openssl
NEXTAUTH_URL=https://your-domain.com

# Nginx (if using)
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### Update Database Password

⚠️ **SECURITY**: Always change the default database password!

SQL Server password requirements:
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, and symbols
- Example: `MyStr0ng!P@ssw0rd2024`

## Deployment Options

### Option 1: App + Database Only (Default)

```bash
docker compose up -d
```

This starts:
- ✅ Next.js application on port 3000
- ✅ SQL Server on port 1433

### Option 2: With Nginx Reverse Proxy

```bash
# Start all services including nginx
docker compose --profile with-nginx up -d
```

This adds:
- ✅ Nginx on ports 80 and 443
- ✅ SSL/TLS termination
- ✅ Better security headers
- ✅ Static file caching

### Option 3: Database Only (Development)

```bash
# Start only the database
docker compose up -d mssql

# Run Next.js locally
npm run dev
```

## Database Setup

### Initial Setup

```bash
# 1. Wait for SQL Server to be healthy
docker compose logs mssql | grep "SQL Server is now ready"

# 2. Generate Prisma Client
docker compose exec app npx prisma generate

# 3. Push schema to database
docker compose exec app npx prisma db push

# 4. Seed with initial data
docker compose exec app npx prisma db seed
```

### Database Backup

```bash
# Create backup
docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "BACKUP DATABASE CACMDesa TO DISK='/var/opt/mssql/backup/cacmdesa-$(date +%Y%m%d).bak'"

# Copy backup to host
docker compose cp mssql:/var/opt/mssql/backup/cacmdesa-*.bak ./backups/
```

### Database Restore

```bash
# Copy backup to container
docker compose cp ./backups/cacmdesa-20250123.bak mssql:/var/opt/mssql/backup/

# Restore database
docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "RESTORE DATABASE CACMDesa FROM DISK='/var/opt/mssql/backup/cacmdesa-20250123.bak' WITH REPLACE"

# Restart app to reconnect
docker compose restart app
```

## SSL/HTTPS Setup

### Option A: Let's Encrypt with Certbot (Recommended)

1. **Update nginx.conf** with your domain:
   ```nginx
   server_name your-actual-domain.com;
   ```

2. **Install Certbot** (on host):
   ```bash
   sudo apt install certbot
   ```

3. **Obtain Certificate**:
   ```bash
   # Stop nginx temporarily
   docker compose stop nginx

   # Get certificate
   sudo certbot certonly --standalone -d your-domain.com

   # Copy certificates to nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

   # Set permissions
   sudo chmod 644 nginx/ssl/fullchain.pem
   sudo chmod 600 nginx/ssl/privkey.pem

   # Start nginx with SSL
   docker compose --profile with-nginx up -d
   ```

4. **Auto-Renewal**:
   ```bash
   # Add to crontab
   0 0 1 * * certbot renew --quiet && docker compose --profile with-nginx restart nginx
   ```

### Option B: Self-Signed Certificate (Testing Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=your-domain.com"

# Start with nginx
docker compose --profile with-nginx up -d
```

⚠️ **Warning**: Self-signed certificates will show browser warnings. Use only for testing!

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f mssql

# Last 100 lines
docker compose logs --tail=100 app
```

### Check Health

```bash
# Service status
docker compose ps

# Application health endpoint
curl http://localhost:3000/api/health

# Database health
docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "${DB_PASSWORD}" \
  -Q "SELECT @@VERSION"
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose build --no-cache app
docker compose up -d app

# Or rebuild everything
docker compose up -d --build
```

## Troubleshooting

### Application Won't Start

1. **Check logs**:
   ```bash
   docker compose logs app
   ```

2. **Common issues**:
   - Database not ready: Wait for mssql healthcheck
   - Wrong DATABASE_URL: Check connection string in .env.production
   - Missing Prisma Client: Run `docker compose exec app npx prisma generate`

### Database Connection Failed

1. **Check database is running**:
   ```bash
   docker compose ps mssql
   docker compose logs mssql
   ```

2. **Test connection**:
   ```bash
   docker compose exec mssql /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P "${DB_PASSWORD}" \
     -Q "SELECT 1"
   ```

3. **Common fixes**:
   - Wait longer for SQL Server startup (can take 30-60 seconds)
   - Check DB_PASSWORD meets complexity requirements
   - Ensure DATABASE_URL uses service name `mssql` not `localhost`

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :3000

# Stop the process or change APP_PORT in .env.production
```

### Out of Disk Space

```bash
# Remove old images and containers
docker system prune -a

# Remove unused volumes (CAUTION: May delete data!)
docker volume prune
```

### Permission Denied

```bash
# Fix ownership of project files
sudo chown -R $USER:$USER .

# Ensure docker group membership
sudo usermod -aG docker $USER
newgrp docker
```

### SSL Certificate Issues

```bash
# Check certificate files exist
ls -la nginx/ssl/

# Check certificate validity
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Regenerate if expired
```

## Production Checklist

Before going live:

- [ ] Change default admin password
- [ ] Set strong DB_PASSWORD
- [ ] Generate unique NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Configure SSL/HTTPS with valid certificate
- [ ] Set up automated backups
- [ ] Configure firewall (only expose 80, 443)
- [ ] Set up monitoring/alerting
- [ ] Test health check endpoint
- [ ] Document deployment for team
- [ ] Set up log rotation
- [ ] Configure rate limiting (if needed)

## Useful Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart specific service
docker compose restart app

# View service logs
docker compose logs -f app

# Execute command in container
docker compose exec app sh

# Rebuild without cache
docker compose build --no-cache

# Remove everything including volumes
docker compose down -v

# Scale application (if load balancing)
docker compose up -d --scale app=3
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Internet                                       │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS (443)
                 ▼
         ┌───────────────┐
         │               │
         │    Nginx      │  (Optional)
         │  Reverse      │  - SSL/TLS
         │    Proxy      │  - Caching
         │               │  - Security Headers
         └───────┬───────┘
                 │
                 │ HTTP (3000)
                 ▼
         ┌───────────────┐
         │               │
         │   Next.js     │
         │      App      │  - Port 3000
         │  (Standalone) │  - Node 20
         │               │
         └───────┬───────┘
                 │
                 │ SQL Connection
                 ▼
         ┌───────────────┐
         │               │
         │  SQL Server   │
         │     2022      │  - Port 1433
         │               │  - Persistent Volume
         │               │
         └───────────────┘
```

## Support

For issues, please check:
1. This deployment guide
2. Docker logs: `docker compose logs -f`
3. Application logs in the container
4. Health check endpoint: `/api/health`
5. Project README and CLAUDE.md

---

**Last Updated**: 2025-01-23
**Version**: 1.0.0

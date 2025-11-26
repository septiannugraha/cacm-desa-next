# Deploying with External Database

This guide covers deploying CACMDesa-Next when you **already have a SQL Server database running**.

## Scenarios

This applies if you have:
- ✅ SQL Server already running on the same server
- ✅ SQL Server running on a different server
- ✅ Managed database service (Azure SQL, AWS RDS, etc.)
- ✅ Existing Siswaskeudes_Baru database you want to use

## Quick Start

### 1. Configure Environment

```bash
# Use the external database example
cp .env.production.external-db.example .env.production

# Edit configuration
nano .env.production
```

### 2. Update DATABASE_URL

Choose the appropriate connection string format:

#### Scenario A: Database on Same Server

```env
# Docker needs to use 'host.docker.internal' to reach host's localhost
DATABASE_URL="sqlserver://host.docker.internal:1433;database=CACMDesa;user=sa;password=YourPassword!;encrypt=false;trustServerCertificate=true"
```

#### Scenario B: Database on Different Server

```env
# Use the actual IP address or hostname
DATABASE_URL="sqlserver://192.168.1.100:1433;database=CACMDesa;user=sa;password=YourPassword!;encrypt=false;trustServerCertificate=true"

# Or with hostname
DATABASE_URL="sqlserver://db.example.com:1433;database=CACMDesa;user=sa;password=YourPassword!;encrypt=false;trustServerCertificate=true"
```

#### Scenario C: Secure Remote Database

```env
# Use encryption for remote connections
DATABASE_URL="sqlserver://db.example.com:1433;database=CACMDesa;user=sa;password=YourPassword!;encrypt=true;trustServerCertificate=false"
```

### 3. Deploy Application Only

```bash
# Use the production compose file (no database container)
docker compose -f docker-compose.prod.yml up -d

# Or with nginx
docker compose -f docker-compose.prod.yml --profile with-nginx up -d
```

### 4. Initialize Database (First Time Only)

```bash
# Push Prisma schema to your existing database
docker compose -f docker-compose.prod.yml exec app npx prisma db push

# Seed initial data
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

## Database Configuration Requirements

### 1. Enable TCP/IP Protocol

On your SQL Server, ensure TCP/IP is enabled:

```sql
-- Check if TCP/IP is enabled
SELECT * FROM sys.dm_exec_connections;

-- SQL Server Configuration Manager:
-- 1. Open SQL Server Configuration Manager
-- 2. Go to SQL Server Network Configuration > Protocols
-- 3. Enable "TCP/IP"
-- 4. Restart SQL Server service
```

### 2. Allow Remote Connections

```sql
-- Run in SQL Server Management Studio (SSMS)
EXEC sp_configure 'remote access', 1;
GO
RECONFIGURE;
GO
```

### 3. Create Database (if needed)

```sql
-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CACMDesa')
BEGIN
    CREATE DATABASE CACMDesa;
END
GO

-- Verify
SELECT name, database_id, create_date
FROM sys.databases
WHERE name = 'CACMDesa';
```

### 4. Create Dedicated User (Recommended)

Instead of using `sa`, create a dedicated user:

```sql
-- Create login
CREATE LOGIN cacmdesa_user WITH PASSWORD = 'YourStr0ng!P@ssw0rd';
GO

-- Create user in CACMDesa database
USE CACMDesa;
GO

CREATE USER cacmdesa_user FOR LOGIN cacmdesa_user;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER cacmdesa_user;
GO

-- Test the login
-- Connection string:
-- DATABASE_URL="sqlserver://host:1433;database=CACMDesa;user=cacmdesa_user;password=YourStr0ng!P@ssw0rd;..."
```

## Firewall Configuration

### On Database Server

Allow incoming connections on port 1433:

```bash
# Ubuntu/Debian
sudo ufw allow 1433/tcp
sudo ufw allow from <app-server-ip> to any port 1433

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=1433/tcp
sudo firewall-cmd --reload

# Windows Server
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow
```

### On Application Server

If using host.docker.internal, ensure localhost is accessible:

```bash
# Check if port 1433 is accessible
telnet localhost 1433
# or
nc -zv localhost 1433

# If not, check SQL Server is listening
sudo netstat -tlnp | grep 1433
```

## Testing Connection

### Before Deployment

Test connection from your application server:

```bash
# Install sqlcmd (if not already installed)
# Ubuntu/Debian
sudo apt-get install mssql-tools

# Test connection
sqlcmd -S <database-host> -U sa -P '<password>' -Q "SELECT @@VERSION"
```

### After Deployment

```bash
# Check application health (includes database check)
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-23T...",
#   "database": "connected"
# }

# Check logs
docker compose -f docker-compose.prod.yml logs -f app
```

## Docker Network Considerations

### Understanding host.docker.internal

When your database is on the **same machine** as Docker:

```
┌─────────────────────────────────────┐
│  Host Machine (192.168.1.100)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  SQL Server (localhost:1433) │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Docker Container            │  │
│  │                              │  │
│  │  Next.js App                 │  │
│  │  ↓ Uses:                     │  │
│  │  host.docker.internal:1433   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

❌ **Wrong**: `localhost:1433` (Docker container's localhost, not host's)
✅ **Correct**: `host.docker.internal:1433` (points to host machine)

### Alternative: Use Host Network Mode

If `host.docker.internal` doesn't work, use host network mode:

```yaml
# docker-compose.prod.yml
services:
  app:
    network_mode: "host"
    # DATABASE_URL can now use localhost:1433
```

⚠️ **Note**: Host network mode only works on Linux and may have security implications.

## Makefile Commands for External DB

Update your commands to use the prod compose file:

```bash
# Add to Makefile or use directly

# Start app only (external DB)
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart app
docker compose -f docker-compose.prod.yml restart app

# Stop app
docker compose -f docker-compose.prod.yml down

# Run Prisma commands
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
docker compose -f docker-compose.prod.yml exec app npx prisma studio

# Shell access
docker compose -f docker-compose.prod.yml exec app sh
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to database"

```bash
# Check if database is accessible
telnet <db-host> 1433

# Check firewall
sudo ufw status
sudo firewall-cmd --list-all

# Check Docker logs
docker compose -f docker-compose.prod.yml logs app

# Try with explicit IP instead of hostname
DATABASE_URL="sqlserver://192.168.1.100:1433;..."
```

### Issue 2: "Login failed for user"

```sql
-- Verify user exists and has permissions
USE CACMDesa;
GO

SELECT
    dp.name AS UserName,
    dp.type_desc AS UserType,
    USER_NAME(drm.role_principal_id) AS RoleName
FROM sys.database_principals dp
LEFT JOIN sys.database_role_members drm
    ON dp.principal_id = drm.member_principal_id
WHERE dp.name = 'cacmdesa_user';
```

### Issue 3: "host.docker.internal not found"

```bash
# Option A: Use actual IP address
ip addr show | grep inet

# Use the IP in DATABASE_URL
DATABASE_URL="sqlserver://192.168.1.100:1433;..."

# Option B: Use host network mode (Linux only)
# Update docker-compose.prod.yml:
network_mode: "host"
```

### Issue 4: "SSL/TLS handshake failed"

```env
# For local/trusted network, disable encryption
DATABASE_URL="...;encrypt=false;trustServerCertificate=true"

# For production with proper SSL
DATABASE_URL="...;encrypt=true;trustServerCertificate=false"
```

## Migration from Existing Database

If you have an existing Siswaskeudes_Baru database:

### Option 1: Use Existing Database As-Is

```env
# Point to your existing database
DATABASE_URL="sqlserver://host.docker.internal:1433;database=Siswaskeudes_Baru;user=sa;password=...;encrypt=false;trustServerCertificate=true"
```

### Option 2: Rename Database

```sql
-- Backup first!
BACKUP DATABASE Siswaskeudes_Baru
TO DISK = 'C:\Backup\Siswaskeudes_Baru.bak';

-- Rename
ALTER DATABASE Siswaskeudes_Baru
MODIFY NAME = CACMDesa;
```

### Option 3: Copy to New Database

```sql
-- Restore to new name
RESTORE DATABASE CACMDesa
FROM DISK = 'C:\Backup\Siswaskeudes_Baru.bak'
WITH MOVE 'Siswaskeudes_Baru' TO 'C:\SQLData\CACMDesa.mdf',
     MOVE 'Siswaskeudes_Baru_log' TO 'C:\SQLData\CACMDesa_log.ldf';
```

## Security Best Practices

1. **Use Dedicated User**
   ```sql
   -- Don't use 'sa' in production
   CREATE LOGIN cacmdesa_user WITH PASSWORD = '...';
   ```

2. **Restrict Network Access**
   ```bash
   # Only allow app server IP
   sudo ufw allow from <app-server-ip> to any port 1433
   ```

3. **Use Encryption for Remote Databases**
   ```env
   DATABASE_URL="...;encrypt=true;trustServerCertificate=false"
   ```

4. **Regular Backups**
   ```sql
   -- Set up automated backups on your SQL Server
   BACKUP DATABASE CACMDesa
   TO DISK = 'C:\Backup\CACMDesa_$(date).bak'
   WITH COMPRESSION;
   ```

5. **Monitor Connections**
   ```sql
   -- View active connections
   SELECT
       session_id,
       login_name,
       host_name,
       program_name,
       login_time
   FROM sys.dm_exec_sessions
   WHERE database_id = DB_ID('CACMDesa');
   ```

## Complete Example

Here's a complete example for deploying with external database:

```bash
# 1. Configure environment
cp .env.production.external-db.example .env.production

# 2. Edit DATABASE_URL
nano .env.production
# Set: DATABASE_URL="sqlserver://host.docker.internal:1433;database=CACMDesa;..."

# 3. Test database connection (from host)
sqlcmd -S localhost -U sa -P 'YourPassword!' -Q "SELECT @@VERSION"

# 4. Build and start app
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 5. Initialize database
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npx prisma db seed

# 6. Check health
curl http://localhost:3000/api/health

# 7. View logs
docker compose -f docker-compose.prod.yml logs -f app

# Success! App is running with your existing database
```

## Next Steps

- ✅ Set up automated database backups on your SQL Server
- ✅ Configure monitoring for database connections
- ✅ Set up SSL/HTTPS with nginx (see DEPLOYMENT.md)
- ✅ Configure log rotation
- ✅ Test disaster recovery procedures

---

**Need help?** Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) for general deployment info.

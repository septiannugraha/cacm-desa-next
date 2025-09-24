# Setup Instructions (SAFE VERSION)

## Important Security Notice
Never commit files with real passwords to Git. Always use environment variables.

## Database Setup

1. **Create .env file** (copy from .env.example):
```bash
cp .env.example .env
```

2. **Edit .env file** and set your own strong password:
```
DATABASE_URL="sqlserver://localhost:1433;database=Siswaskeudes_Baru;user=sa;password=YOUR_STRONG_PASSWORD;encrypt=false;trustServerCertificate=true"
```

3. **Generate NextAuth secret**:
```bash
openssl rand -base64 32
```
Add the generated secret to your .env file.

4. **Start SQL Server with Docker**:
```bash
# Create docker-compose.yml from example
cp docker-compose.example.yml docker-compose.yml

# Set your password in .env
echo "DB_PASSWORD=YOUR_STRONG_PASSWORD" >> .env

# Start the container
docker-compose up -d
```

5. **Run database migrations**:
```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

## Security Best Practices

1. **NEVER** commit .env files with real passwords
2. **NEVER** hardcode passwords in scripts
3. **ALWAYS** use environment variables
4. **CHANGE** all default passwords immediately
5. **USE** strong, unique passwords (min 12 characters, mixed case, numbers, symbols)

## If Credentials Were Exposed

If you accidentally committed credentials:
1. **Change all passwords immediately**
2. **Rotate any affected API keys**
3. **Consider the repository compromised**
4. **Use BFG Repo-Cleaner or git-filter-branch to remove from history**
5. **Force push the cleaned history** (coordinate with team)

## Default Test Credentials (CHANGE THESE!)
- Database: Use your own secure password
- Admin user: Set up through seed script with secure password
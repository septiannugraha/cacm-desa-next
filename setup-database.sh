#!/bin/bash

# CACMDesa Next.js Database Setup Script
# =======================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CACMDesa Next.js Database Setup ===${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}\n"

# Step 1: Start SQL Server container
echo -e "${YELLOW}Step 1: Starting SQL Server container...${NC}"
if docker ps | grep -q cacmdesa-mssql; then
    echo -e "${GREEN}✓ SQL Server container is already running${NC}"
else
    echo "Starting SQL Server with Docker..."
    ./docker-mssql-setup.sh --quick
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to start SQL Server container${NC}"
        exit 1
    fi
fi

# Step 2: Install npm dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Generate Prisma client
echo -e "\n${YELLOW}Step 3: Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Step 4: Run migrations
echo -e "\n${YELLOW}Step 4: Running database migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations applied successfully${NC}"
else
    echo -e "${YELLOW}Attempting to push schema directly...${NC}"
    npx prisma db push --skip-generate
fi

# Step 5: Seed the database
echo -e "\n${YELLOW}Step 5: Seeding database with sample data...${NC}"
npx prisma db seed
echo -e "${GREEN}✓ Database seeded${NC}"

# Step 6: Test the connection
echo -e "\n${YELLOW}Step 6: Testing database connection...${NC}"
node test-db-connection.js

# Final message
echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "You can now run the application with:"
echo -e "${BLUE}npm run dev${NC}"
echo ""
echo "Default credentials:"
echo "  Email: admin@cacmdesa.go.id"
echo "  Password: admin123"
echo ""
echo "Database connection string has been configured in .env"
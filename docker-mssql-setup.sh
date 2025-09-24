#!/bin/bash

# Docker SQL Server Setup for CACMDesa
# =====================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CACMDesa SQL Server Docker Setup ===${NC}"
echo ""

# Configuration
CONTAINER_NAME="cacmdesa-mssql"
SA_PASSWORD="YourStrong@Passw0rd2024!"
DB_NAME="CACMDesa"
PORT="1433"

# Function to check if container exists
container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if container is running
container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Option 1: Quick Start with docker run
quick_start() {
    echo -e "${YELLOW}Starting SQL Server with docker run...${NC}"
    
    # Stop and remove existing container if exists
    if container_exists; then
        echo "Stopping existing container..."
        docker stop $CONTAINER_NAME 2>/dev/null
        docker rm $CONTAINER_NAME 2>/dev/null
    fi
    
    # Run SQL Server container
    docker run -d \
        --name $CONTAINER_NAME \
        -e "ACCEPT_EULA=Y" \
        -e "MSSQL_SA_PASSWORD=$SA_PASSWORD" \
        -e "MSSQL_PID=Developer" \
        -p ${PORT}:1433 \
        -v mssql-data:/var/opt/mssql \
        -v "$(pwd)/prisma/migrations:/migrations" \
        --restart unless-stopped \
        mcr.microsoft.com/mssql/server:2022-latest
    
    echo -e "${GREEN}Container started!${NC}"
    echo "Waiting for SQL Server to be ready..."
    sleep 10
}

# Option 2: Start with docker-compose
compose_start() {
    echo -e "${YELLOW}Starting SQL Server with docker-compose...${NC}"
    
    # Update password in docker-compose.yml
    sed -i "s/MSSQL_SA_PASSWORD=.*/MSSQL_SA_PASSWORD=$SA_PASSWORD/g" docker-compose.yml 2>/dev/null
    
    docker-compose up -d mssql
    
    echo -e "${GREEN}Container started with docker-compose!${NC}"
    echo "Waiting for SQL Server to be ready..."
    sleep 10
}

# Create database
create_database() {
    echo -e "${YELLOW}Creating database...${NC}"
    
    docker exec -it $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DB_NAME') CREATE DATABASE $DB_NAME;"
    
    echo -e "${GREEN}Database created or already exists!${NC}"
}

# Run migrations
run_migrations() {
    echo -e "${YELLOW}Running migrations...${NC}"
    
    # Copy migration file to container
    docker cp prisma/migrations/align_with_cacmdesa_v2.sql $CONTAINER_NAME:/tmp/
    
    # Run migration
    docker exec -it $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" \
        -d $DB_NAME \
        -i /tmp/align_with_cacmdesa_v2.sql
    
    echo -e "${GREEN}Migrations completed!${NC}"
}

# Check connection
check_connection() {
    echo -e "${YELLOW}Testing connection...${NC}"
    
    docker exec -it $CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd \
        -S localhost -U sa -P "$SA_PASSWORD" \
        -Q "SELECT @@VERSION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Connection successful!${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection failed!${NC}"
        return 1
    fi
}

# Show connection string
show_connection_string() {
    echo -e "${GREEN}\n=== Connection Details ===${NC}"
    echo "Host: localhost"
    echo "Port: $PORT"
    echo "Username: sa"
    echo "Password: $SA_PASSWORD"
    echo "Database: $DB_NAME"
    echo ""
    echo -e "${YELLOW}Connection String for .env:${NC}"
    echo "DATABASE_URL=\"sqlserver://localhost:${PORT};database=${DB_NAME};user=sa;password=${SA_PASSWORD};encrypt=false;trustServerCertificate=true\""
    echo ""
}

# Main menu
show_menu() {
    echo -e "${GREEN}Choose an option:${NC}"
    echo "1) Quick start with docker run"
    echo "2) Start with docker-compose"
    echo "3) Just create database (container must be running)"
    echo "4) Run migrations only"
    echo "5) Test connection"
    echo "6) Stop container"
    echo "7) Remove container and data"
    echo "8) Show logs"
    echo "9) Exit"
    read -p "Enter choice [1-9]: " choice
}

# Process menu choice
process_choice() {
    case $choice in
        1)
            quick_start
            create_database
            run_migrations
            show_connection_string
            ;;
        2)
            compose_start
            create_database
            run_migrations
            show_connection_string
            ;;
        3)
            create_database
            ;;
        4)
            run_migrations
            ;;
        5)
            check_connection
            ;;
        6)
            docker stop $CONTAINER_NAME
            echo -e "${GREEN}Container stopped${NC}"
            ;;
        7)
            docker stop $CONTAINER_NAME 2>/dev/null
            docker rm $CONTAINER_NAME 2>/dev/null
            docker volume rm mssql-data 2>/dev/null
            echo -e "${GREEN}Container and data removed${NC}"
            ;;
        8)
            docker logs $CONTAINER_NAME --tail 50
            ;;
        9)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

# Main execution
if [ "$1" == "--quick" ]; then
    # Quick setup without menu
    quick_start
    create_database
    run_migrations
    show_connection_string
else
    # Interactive menu
    while true; do
        show_menu
        process_choice
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
fi
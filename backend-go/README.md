# CACMDesa Go Backend

A lightweight Go backend that connects directly to SQL Server database for CACMDesa application.

## Features

- Direct SQL Server connection using `go-mssqldb`
- RESTful API endpoints
- CORS support for frontend integration
- No ORM overhead - raw SQL queries for better performance
- Modular architecture

## Setup

1. Install dependencies:
```bash
go mod download
```

2. Copy `.env.example` to `.env` and configure your database:
```bash
cp .env.example .env
```

3. Run the server:
```bash
go run main.go
```

## API Endpoints

### Atensi
- `GET /api/atensi` - Get list of atensi
- `GET /api/atensi/:id` - Get single atensi
- `POST /api/atensi` - Create new atensi
- `PUT /api/atensi/:id` - Update atensi
- `DELETE /api/atensi/:id` - Delete atensi

### Villages
- `GET /api/villages` - Get list of villages
- `GET /api/villages/:id` - Get single village

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Integrating with Next.js Frontend

Update your Next.js frontend to call the Go backend:

```typescript
// lib/api/config.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// lib/api/atensi.ts
export async function getAtensiList() {
  const response = await fetch(`${API_URL}/atensi`)
  if (!response.ok) {
    throw new Error('Failed to fetch atensi')
  }
  return response.json()
}
```

## Database Schema

Make sure your SQL Server has these tables:

```sql
-- Atensi table
CREATE TABLE Atensi (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255),
    Description NVARCHAR(MAX),
    Priority NVARCHAR(20),
    Status NVARCHAR(20),
    VillageID INT,
    CreatedAt DATETIME,
    CreatedBy NVARCHAR(100)
);

-- Villages table
CREATE TABLE Villages (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255),
    Pemda NVARCHAR(255),
    HeadName NVARCHAR(255),
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    Population INT,
    IsActive BIT
);
```

## Performance Benefits

1. **Direct Database Connection**: No ORM overhead
2. **Compiled Language**: Go compiles to native code
3. **Concurrent Request Handling**: Go's goroutines handle multiple requests efficiently
4. **Lower Memory Footprint**: Compared to Node.js/Next.js API routes
5. **Better SQL Server Support**: Native SQL Server driver

## Deployment

### Using Docker

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY .env .
EXPOSE 8080
CMD ["./main"]
```

### Using systemd (Linux)

Create `/etc/systemd/system/cacmdesa-api.service`:

```ini
[Unit]
Description=CACMDesa API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cacmdesa-api
ExecStart=/opt/cacmdesa-api/main
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
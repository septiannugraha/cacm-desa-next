import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Debug endpoint to test database connection
 * GET /api/debug/db-test
 */
export async function GET(request: NextRequest) {
  try {
    // Try to execute a simple query
    const result = await prisma.$queryRaw`SELECT 1 AS test`;

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: error.message,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      },
      { status: 500 }
    );
  }
}

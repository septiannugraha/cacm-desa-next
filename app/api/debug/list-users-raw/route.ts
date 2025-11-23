import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Debug endpoint to list users using raw SQL query
 * GET /api/debug/list-users-raw
 */
export async function GET(request: NextRequest) {
  try {
    // Try different possible table names
    const possibleQueries = [
      { name: 'User table', query: 'SELECT TOP 10 * FROM [User]' },
      { name: 'Users table', query: 'SELECT TOP 10 * FROM [Users]' },
      { name: 'CACM_User table', query: 'SELECT TOP 10 * FROM CACM_User' },
      { name: 'Ta_User table', query: 'SELECT TOP 10 * FROM Ta_User' },
    ];

    const results: any = {};

    for (const { name, query } of possibleQueries) {
      try {
        const result = await prisma.$queryRawUnsafe(query);
        results[name] = {
          success: true,
          data: result,
        };
      } catch (error: any) {
        results[name] = {
          success: false,
          error: error.message,
        };
      }
    }

    // Also try to list all tables
    try {
      const tables = await prisma.$queryRaw`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME LIKE '%User%'
        ORDER BY TABLE_NAME
      `;
      results['Available User Tables'] = {
        success: true,
        data: tables,
      };
    } catch (error: any) {
      results['Available User Tables'] = {
        success: false,
        error: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error querying database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database query failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

/**
 * Debug endpoint to list users using direct SQL Server connection
 * GET /api/debug/direct-users
 */
export async function GET(request: NextRequest) {
  const dbConfig = {
    server: '31.220.73.89',
    port: 14317,
    database: 'Siswaskeudes_Baru',
    user: 'sa',
    password: '1',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    // Connect to database
    await sql.connect(dbConfig);

    // Try to find user tables
    const tablesQuery = `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND (TABLE_NAME LIKE '%User%' OR TABLE_NAME LIKE '%user%')
      ORDER BY TABLE_NAME
    `;

    const tablesResult = await sql.query(tablesQuery);
    const userTables = tablesResult.recordset.map((r: any) => r.TABLE_NAME);

    // Try to get users from common table names
    const usersData: any = {};

    for (const tableName of userTables.slice(0, 5)) { // Only try first 5 tables
      try {
        const query = `SELECT TOP 10 * FROM [${tableName}]`;
        const result = await sql.query(query);
        usersData[tableName] = {
          success: true,
          count: result.recordset.length,
          columns: result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
          data: result.recordset,
        };
      } catch (error: any) {
        usersData[tableName] = {
          success: false,
          error: error.message,
        };
      }
    }

    await sql.close();

    return NextResponse.json({
      success: true,
      database: dbConfig.database,
      server: `${dbConfig.server}:${dbConfig.port}`,
      userTables,
      usersData,
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: error.message,
        database: dbConfig.database,
        server: `${dbConfig.server}:${dbConfig.port}`,
      },
      { status: 500 }
    );
  }
}

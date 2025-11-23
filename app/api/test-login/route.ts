import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

/**
 * Test login endpoint using direct SQL connection (bypasses Prisma)
 * POST /api/test-login
 * Body: { username: string, password: string }
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Connect to database
    await sql.connect(dbConfig);

    // Find user in CACM_User table (simple query first)
    const result = await sql.query`
      SELECT TOP 1 *
      FROM CACM_User
      WHERE username = ${username}
    `;

    if (result.recordset.length === 0) {
      await sql.close();
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          username,
        },
        { status: 401 }
      );
    }

    const user = result.recordset[0];

    // Check if user is active
    if (!user.active) {
      await sql.close();
      return NextResponse.json(
        {
          success: false,
          error: 'User is not active',
          username,
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    await sql.close();

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
          username,
          passwordHash: user.password,
          passwordTried: password,
          bcryptCompareResult: isValidPassword,
        },
        { status: 401 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'Login successful! Password verified.',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        pemdaId: user.pemdaId,
        active: user.active,
      },
    });
  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection or query failed',
        message: error.message,
        database: dbConfig.database,
        server: `${dbConfig.server}:${dbConfig.port}`,
      },
      { status: 500 }
    );
  }
}

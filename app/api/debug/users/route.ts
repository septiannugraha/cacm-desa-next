import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Debug endpoint to list all users in the database
 * GET /api/debug/users
 */
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
            code: true,
          },
        },
        pemda: {
          select: {
            Kd_Pemda: true,
            Nama_Pemda: true,
          },
        },
        fiscalYear: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleCode: user.role.code,
        pemda: user.pemda?.Nama_Pemda || null,
        fiscalYear: user.fiscalYear,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

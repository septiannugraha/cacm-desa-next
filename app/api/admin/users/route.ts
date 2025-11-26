import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// GET - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.roleCode !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Get users with their roles
    const [users, total] = await Promise.all([
      prisma.cACM_User.findMany({
        where: {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          pemda: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.cACM_User.count({
        where: {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.roleCode !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, name, password, roleId, pemdaId } = body;

    // Validate required fields
    if (!username || !password || !roleId) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.cACM_User.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.cACM_User.create({
      data: {
        id: randomUUID(),
        username,
        email: email || null,
        name: name || username,
        password: hashedPassword,
        role: {
          connect: { id: roleId }
        },
        ...(pemdaId && {
          pemda: {
            connect: { id: pemdaId }
          }
        }),
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        pemda: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

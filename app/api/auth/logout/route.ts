import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.sessionId) {
      // Clear session from database
      await prisma.session.deleteMany({
        where: {
          userId: session.user.id,
        },
      }).catch(err => {
        console.error('Error clearing session:', err)
        // Continue even if DB cleanup fails
      })
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Logout successful' 
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Return success even on error to allow client-side cleanup
    return NextResponse.json({ 
      success: true,
      message: 'Logout completed' 
    })
  }
}
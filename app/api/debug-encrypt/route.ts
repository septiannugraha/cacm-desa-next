// app/api/debug-encrypt/route.ts
import { NextResponse } from 'next/server';
import { encryptServer, decryptServer } from '@/lib/encryption';

export async function GET() {
    const textAsli = "45.94.58.41\SQL2008"
  const encrypted = encryptServer(textAsli, 1); // Escape backslash
  const decrypted = decryptServer(encrypted, 1);
 
  return NextResponse.json({
    input: textAsli,
    encrypted,
    decrypted,
  });
}
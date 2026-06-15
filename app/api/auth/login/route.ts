import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    await signIn(email, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid credentials' },
      { status: 401 }
    );
  }
}

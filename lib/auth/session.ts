import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export interface SessionData {
  isAdmin?: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'sg-admin-session',
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
};

export async function signIn(email: string, password: string): Promise<void> {
  const validEmail = email === process.env.ADMIN_EMAIL;
  const validPass = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  if (!validEmail || !validPass) throw new Error('Invalid credentials');
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.isAdmin = true;
  await session.save();
}

export async function getSession(): Promise<IronSession<SessionData> | null> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session.isAdmin ? session : null;
}

export async function signOut(): Promise<void> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  await session.destroy();
}

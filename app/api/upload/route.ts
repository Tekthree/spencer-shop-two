import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage } from '@/lib/storage/r2';
import { requireAdminApi } from '@/lib/auth/admin-api';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_PREFIX_ROOTS = new Set(['uploads', 'artworks', 'collections', 'blog', 'about']);
const IMAGE_TYPES = {
  'image/jpeg': { extension: 'jpg', matches: (b: Buffer) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: 'png', matches: (b: Buffer) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/gif': { extension: 'gif', matches: (b: Buffer) => b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii')) },
  'image/webp': { extension: 'webp', matches: (b: Buffer) => b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
  'image/avif': { extension: 'avif', matches: (b: Buffer) => b.length >= 16 && b.subarray(4, 8).toString('ascii') === 'ftyp' && /avif|avis/.test(b.subarray(8, Math.min(b.length, 32)).toString('ascii')) },
} as const;

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminApi(req);
  if (unauthorized) return unauthorized;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const prefix = (formData.get('prefix') as string | null) ?? 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const imageType = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
    if (!imageType) {
      return NextResponse.json({ error: 'Use a JPEG, PNG, WebP, GIF, or AVIF image.' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Images must be smaller than 10 MB.' }, { status: 413 });
    }

    const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
    const prefixRoot = normalizedPrefix.split('/')[0];
    if (!ALLOWED_PREFIX_ROOTS.has(prefixRoot) || !/^[a-zA-Z0-9/_-]+$/.test(normalizedPrefix)) {
      return NextResponse.json({ error: 'Invalid upload folder.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!imageType.matches(buffer)) {
      return NextResponse.json({ error: 'The file contents do not match its image type.' }, { status: 400 });
    }

    const key = `${normalizedPrefix}/${uuidv4()}.${imageType.extension}`;

    const url = await uploadImage(key, buffer, file.type);

    return NextResponse.json({ url, key });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

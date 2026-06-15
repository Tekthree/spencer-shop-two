import { NextRequest, NextResponse } from 'next/server';
import { listImages, deleteImage } from '@/lib/storage/r2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') ?? undefined;

    const images = await listImages(prefix);
    return NextResponse.json(images);
  } catch (err) {
    console.error('List images error:', err);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { key } = await req.json() as { key?: string };

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    await deleteImage(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete image error:', err);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

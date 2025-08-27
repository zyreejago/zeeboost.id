import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'public', 'uploads', ...params.path);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const file = await readFile(filePath);
    const ext = params.path[params.path.length - 1].split('.').pop()?.toLowerCase();
    
    let contentType = 'application/octet-stream';
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'avif':
        contentType = 'image/avif';
        break;
    }

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
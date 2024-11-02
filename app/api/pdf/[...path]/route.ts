import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const relativePath = params.path.join('/');
    const filePath = path.join(process.cwd(), 'uploads', relativePath);

    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const stream = fs.createReadStream(filePath);
    
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(path.basename(filePath))}`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ error: 'Error serving PDF' }, { status: 500 });
  }
}

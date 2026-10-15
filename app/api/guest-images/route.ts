import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'public', 'images', 'guest');
  try {
    const files = fs.readdirSync(dirPath);
    return NextResponse.json({ files });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, dirPath });
  }
}

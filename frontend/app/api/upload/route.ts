import { NextRequest, NextResponse } from 'next/server';
import { saveFileInBucket, BUCKET_NAME } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll('files') as unknown as File[];
    const bookstoreSlug: string = data.get('bookstoreSlug') as string;

    if (!files.length) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!bookstoreSlug) {
      return NextResponse.json(
        { error: 'No bookstore slug provided' },
        { status: 400 }
      );
    }
    // Convert file to buffer
    const results = await Promise.allSettled(
      files.map(async (file, idx) => {
        if (!file.type?.startsWith('image/')) {
          throw new Error('File must be an image');
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // server-side unique key: bookstoreSlug/book_YYYYmmddTHHMMSSms_idx.ext
        const ext = file.name.includes('.')
          ? file.name.split('.').pop()
          : 'jpg';
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const key = `${bookstoreSlug}/book_${ts}_${idx}.${ext}`;

        await saveFileInBucket({
          bucketName: BUCKET_NAME,
          fileName: key,
          file: buffer,
        });

        return {
          originalName: file.name,
          key,
          size: file.size,
          type: file.type,
        };
      })
    );

    const uploaded: { originalName: string; key: string; size: number }[] = [];
    const failed: { originalName: string; error: string }[] = [];

    results.forEach((r, i) => {
      const originalName = files[i]?.name ?? `file_${i}`;
      if (r.status === 'fulfilled') {
        uploaded.push({ originalName, key: r.value.key, size: r.value.size });
      } else {
        failed.push({
          originalName,
          error: (r.reason as Error)?.message || 'Upload failed',
        });
      }
    });

    return NextResponse.json({ uploaded, failed });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

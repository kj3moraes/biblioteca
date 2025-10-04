import { NextRequest, NextResponse } from 'next/server';
import { saveFileInBucket, BUCKET_NAME } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const fileName: string = data.get('fileName') as string;
    const bookstoreSlug: string = data.get('bookstoreSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    if (!bookstoreSlug) {
      return NextResponse.json(
        { error: 'No bookstore slug provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create folder structure: bookstoreSlug/filename
    const s3FileName = `${bookstoreSlug}/${fileName}`;

    // Upload to S3/MinIO
    console.log('Uploading file to S3/MinIO');
    await saveFileInBucket({
      bucketName: BUCKET_NAME,
      fileName: s3FileName,
      file: buffer,
    });
    console.log('File uploaded to S3/MinIO');

    // Return success response with file info
    return NextResponse.json({
      success: true,
      fileName: s3FileName,
      bucketName: BUCKET_NAME,
      size: file.size,
      type: file.type,
      bookstoreSlug,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

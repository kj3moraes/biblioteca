import { NextRequest, NextResponse } from 'next/server';
import {
  listFilesInBookstoreFolder,
  getBookstoreImageUrl,
  BUCKET_NAME,
} from '@/lib/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookstoreSlug: string }> }
) {
  try {
    const { bookstoreSlug } = await params;
    const bucketName = BUCKET_NAME;

    if (!bookstoreSlug) {
      return NextResponse.json(
        { error: 'Bookstore slug is required' },
        { status: 400 }
      );
    }

    // List all files in the bookstore folder
    const files = await listFilesInBookstoreFolder({
      bucketName,
      bookstoreSlug,
    });

    // Generate presigned URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (fileName) => {
        const url = await getBookstoreImageUrl({
          bucketName,
          fileName,
          expiry: 60 * 60, // 1 hour
        });

        return {
          fileName,
          url,
          bucketName,
          bookstoreSlug,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: filesWithUrls,
      count: filesWithUrls.length,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

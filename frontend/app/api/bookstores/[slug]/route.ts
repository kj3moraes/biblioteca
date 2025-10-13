import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Bookstore slug is required' },
        { status: 400 }
      );
    }

    const bookstore = await prisma.bookstore.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    if (!bookstore) {
      return NextResponse.json(
        { error: 'Bookstore not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bookstore);
  } catch (error) {
    console.error('Error fetching bookstore:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookstore' },
      { status: 500 }
    );
  }
}


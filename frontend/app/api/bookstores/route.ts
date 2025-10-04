import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const bookstores = await prisma.bookstore.findMany({
      select: {
        name: true,
        slug: true,
        city: true,
        country: true,
        phone: true,
        email: true,
      },
    });
    return NextResponse.json(bookstores);
  } catch (error) {
    console.error('Error fetching bookstores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookstores' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      slug,
      address,
      city,
      country,
      phone,
      email,
      latitude,
      longitude,
    } = await request.json();
    const bookstore = await prisma.bookstore.create({
      data: {
        name,
        slug,
        address,
        city,
        country,
        phone,
        email,
        latitude,
        longitude,
      },
    });
    return NextResponse.json(bookstore);
  } catch (error) {
    console.error('Error creating bookstore:', error);
    return NextResponse.json(
      { error: 'Failed to create bookstore' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

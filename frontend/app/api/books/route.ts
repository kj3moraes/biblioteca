import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const bookstoreSlug = searchParams.get('bookstoreId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Validate required parameters
    if (!bookstoreSlug) {
      return NextResponse.json(
        { error: 'bookstoreId is required' },
        { status: 400 }
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error:
            'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100',
        },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = search
      ? {
          OR: [
            {
              book: {
                title: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              book: {
                subtitle: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              book: {
                authors: {
                  some: {
                    author: {
                      name: { contains: search, mode: 'insensitive' as const },
                    },
                  },
                },
              },
            },
            {
              book: {
                isbn: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const bookstore = await prisma.bookstore.findUnique({
      where: {
        slug: bookstoreSlug as string,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.inventory.count({
      where: {
        bookstoreId: bookstore?.id,
        ...searchConditions,
      },
    });

    // Get paginated results with related data
    const inventory = await prisma.inventory.findMany({
      where: {
        bookstoreId: bookstore?.id,
        ...searchConditions,
      },
      include: {
        book: {
          include: {
            authors: {
              include: {
                author: true,
              },
            },
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
        bookstore: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        book: {
          title: 'asc',
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format the response
    const formattedBooks = inventory.map((item) => ({
      id: item.book.id,
      title: item.book.title,
      subtitle: item.book.subtitle,
      isbn: item.book.isbn,
      language: item.book.language,
      publicationYear: item.book.publicationYear,
      pageCount: item.book.pageCount,
      description: item.book.description,
      authors: item.book.authors.map((ba) => ({
        id: ba.author.id,
        name: ba.author.name,
        bio: ba.author.bio,
      })),
      genres: item.book.genres.map((bg) => ({
        id: bg.genre.id,
        name: bg.genre.name,
      })),
      inventory: {
        id: item.id,
        stockCount: item.stockCount,
        price: item.price,
        lastUpdated: item.lastUpdated,
      },
      bookstore: {
        id: item.bookstore.id,
        name: item.bookstore.name,
        address: item.bookstore.address,
        city: item.bookstore.city,
        country: item.bookstore.country,
      },
      createdAt: item.book.createdAt,
      updatedAt: item.book.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedBooks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        bookstoreId: bookstore?.id,
        search,
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

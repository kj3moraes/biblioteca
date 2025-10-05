import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

interface BookToAdd {
  title: string;
  author: string;
  count: number;
}

interface BookResultAdd {
  title: string;
  author: string;
  count: number;
  inventoryId: number;
  newStockCount: number;
}

interface BookResultError {
  error: string;
  book: BookToAdd;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookstoreSlug,
      books,
    }: { bookstoreSlug: string; books: BookToAdd[] } = body; 

    if (!bookstoreSlug) {
      return NextResponse.json(
        { error: 'Bookstore slug is required' },
        { status: 400 }
      );
    }

    if (!books || !Array.isArray(books) || books.length === 0) {
      return NextResponse.json(
        { error: 'Books array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Find the bookstore
    console.log("bookstore slug is ", bookstoreSlug)
    const bookstore = await prisma.bookstore.findUnique({
      where: { slug: bookstoreSlug },
    });

    if (!bookstore) {
      return NextResponse.json(
        { error: 'Bookstore not found' },
        { status: 400 }
      );
    }

    const results = {
      added: [] as BookResultAdd[],
      errors: [] as BookResultError[],
    };

    // Process each book
    for (const bookData of books) {
      try {
        // Find or create the author
        let author = await prisma.author.findFirst({
          where: { name: bookData.author },
        });

        if (!author) {
          author = await prisma.author.create({
            data: { name: bookData.author },
          });
        }

        // Find or create the book
        let book = await prisma.book.findFirst({
          where: {
            title: bookData.title,
            authors: {
              some: {
                authorId: author.id,
              },
            },
          },
        });

        if (!book) {
          book = await prisma.book.create({
            data: {
              title: bookData.title,
            },
          });

          // Create the book-author relationship
          await prisma.bookAuthor.create({
            data: {
              bookId: book.id,
              authorId: author.id,
            },
          });
        }

        // Find or create inventory entry
        let inventory = await prisma.inventory.findUnique({
          where: {
            bookstoreId_bookId: {
              bookstoreId: bookstore.id,
              bookId: book.id,
            },
          },
        });

        if (inventory) {
          // Update existing inventory
          inventory = await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              stockCount: inventory.stockCount + bookData.count,
              lastUpdated: new Date(),
            },
          });
        } else {
          // Create new inventory entry
          inventory = await prisma.inventory.create({
            data: {
              bookstoreId: bookstore.id,
              bookId: book.id,
              stockCount: bookData.count,
              lastUpdated: new Date(),
            },
          });
        }

        results.added.push({
          title: bookData.title,
          author: bookData.author,
          count: bookData.count,
          inventoryId: inventory.id,
          newStockCount: inventory.stockCount,
        });
      } catch (error) {
        console.error(
          `Error processing book "${bookData.title}" by "${bookData.author}":`,
          error
        );
        results.errors.push({
          book: bookData,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.added.length} books`,
      results,
    });
  } catch (error) {
    console.error('Bulk add books error:', error);
    return NextResponse.json(
      { error: 'Failed to add books to inventory' },
      { status: 500 }
    );
  }
}

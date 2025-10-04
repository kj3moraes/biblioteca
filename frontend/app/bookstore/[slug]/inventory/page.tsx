'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect, useCallback } from 'react';
import { Author, Genre } from '@/generated/prisma';

interface Book {
  id: number;
  title: string;
  subtitle?: string;
  isbn?: string;
  language?: string;
  publicationYear?: number;
  pageCount?: number;
  description?: string;
  authors: Author[];
  genres: Genre[];
  inventory: {
    id: number;
    stockCount: number;
    price?: number;
    lastUpdated: string;
  };
  bookstore: {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Book[];
  pagination: PaginationData;
  filters: {
    bookstoreId: number;
    search: string;
  };
}

export default function Page() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, using bookstore ID 1
  const bookstoreId = 1;

  const fetchBooks = useCallback(
    async (page: number = 1, search: string = '') => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          bookstoreId: bookstoreId.toString(),
          page: page.toString(),
          limit: '10',
        });

        if (search.trim()) {
          params.append('search', search.trim());
        }

        const response = await fetch(`/api/books?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setBooks(data.data);
          setPagination(data.pagination);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [bookstoreId]
  );

  useEffect(() => {
    fetchBooks(1, searchTerm);
  }, [fetchBooks, searchTerm]);

  const handleSearch = () => {
    fetchBooks(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchBooks(newPage, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatAuthors = (authors: Author[]) => {
    return authors.map((author) => author.name).join(', ');
  };

  const formatGenres = (genres: Genre[]) => {
    return genres.map((genre) => genre.name).join(', ');
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  return (
    <div className='mx-auto flex max-w-7xl flex-col items-center p-4'>
      <div className='mb-6 w-full'>
        <h1 className='mb-2 text-3xl font-bold'>Bookstore Inventory</h1>
        <p className='text-muted-foreground'>
          Browse and search through {pagination.totalCount} books in the
          inventory
        </p>
      </div>

      {/* Search Bar */}
      <div className='mb-6 flex w-full max-w-2xl space-x-2'>
        <Input
          className='flex-1'
          placeholder='Search by title, author, or ISBN...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='outline' onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 size={20} className='animate-spin' />
          ) : (
            <Search size={20} />
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className='mb-6 w-full rounded-md border border-red-200 bg-red-50 p-4'>
          <p className='text-red-600'>Error: {error}</p>
        </div>
      )}

      {/* Table */}
      <div className='w-full rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className='py-8 text-center'>
                  <div className='flex items-center justify-center'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Loading books...
                  </div>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-muted-foreground py-8 text-center'
                >
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className='font-medium'>
                    <div>
                      <div className='font-semibold'>{book.title}</div>
                      {book.subtitle && (
                        <div className='text-muted-foreground text-sm'>
                          {book.subtitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatAuthors(book.authors)}</TableCell>
                  <TableCell>{formatGenres(book.genres)}</TableCell>
                  <TableCell>{book.isbn || 'N/A'}</TableCell>
                  <TableCell>{book.publicationYear || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        book.inventory.stockCount > 10
                          ? 'bg-green-100 text-green-800'
                          : book.inventory.stockCount > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.inventory.stockCount}
                    </span>
                  </TableCell>
                  <TableCell>{formatPrice(book.inventory.price)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='mt-6 flex w-full items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalCount
            )}{' '}
            of {pagination.totalCount} results
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Button>

            <div className='flex items-center space-x-1'>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum =
                    Math.max(
                      1,
                      Math.min(pagination.totalPages - 4, pagination.page - 2)
                    ) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.page ? 'default' : 'outline'
                      }
                      size='sm'
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className='h-8 w-8 p-0'
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

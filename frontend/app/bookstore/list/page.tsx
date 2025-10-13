'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Bookstore {
  name: string;
  slug: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
}

export default function BookstoreListPage() {
  const [bookstores, setBookstores] = useState<Bookstore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookstores = async () => {
      try {
        const response = await fetch('/api/bookstores');
        if (!response.ok) {
          throw new Error('Failed to fetch bookstores');
        }
        const data = await response.json();
        setBookstores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookstores();
  }, []);

  if (isLoading) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-lg'>Loading bookstores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-lg text-red-500'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Bookstores</h1>
          <p className='text-sm text-gray-500 mt-2'>
            Browse all bookstores in the database
          </p>
        </div>
        <Link href='/bookstore/add'>
          <Button>Add Bookstore</Button>
        </Link>
      </div>

      {bookstores.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12'>
          <p className='text-lg text-gray-500 mb-4'>No bookstores found</p>
          <Link href='/bookstore/add'>
            <Button>Add Your First Bookstore</Button>
          </Link>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookstores.map((bookstore) => (
                <TableRow key={bookstore.slug}>
                  <TableCell className='font-medium'>
                    {bookstore.name}
                  </TableCell>
                  <TableCell>
                    {bookstore.city}, {bookstore.country}
                  </TableCell>
                  <TableCell>{bookstore.phone || 'N/A'}</TableCell>
                  <TableCell>{bookstore.email || 'N/A'}</TableCell>
                  <TableCell className='text-right'>
                    <Link href={`/bookstore/${bookstore.slug}/inventory`}>
                      <Button variant='outline' size='sm'>
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className='mt-4 text-sm text-gray-500'>
        Total: {bookstores.length} {bookstores.length === 1 ? 'bookstore' : 'bookstores'}
      </div>
    </div>
  );
}


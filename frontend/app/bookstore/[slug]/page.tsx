'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Bookstore {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
}

export default function BookstoreLandingPage() {
  const params = useParams();
  const bookstoreSlug = params.slug as string;
  const [bookstore, setBookstore] = useState<Bookstore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookstore = async () => {
      try {
        const response = await fetch(`/api/bookstores/${bookstoreSlug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Bookstore not found');
          }
          throw new Error('Failed to fetch bookstore');
        }
        const data = await response.json();
        setBookstore(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookstore();
  }, [bookstoreSlug]);

  if (isLoading) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (error || !bookstore) {
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <div className='text-lg text-red-500'>
          {error || 'Bookstore not found'}
        </div>
        <Link href='/bookstore/list' className='mt-4'>
          <Button variant='outline'>Back to Bookstores</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-4xl space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold mb-2'>
            Welcome to {bookstore.name}
          </h1>
          <p className='text-gray-500'>
            {bookstore.address}, {bookstore.city}, {bookstore.country}
          </p>
        </div>

        {/* Action Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Add Books Card */}
          <Link href={`/bookstore/${bookstore.slug}/add`}>
            <div className='group cursor-pointer rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-primary hover:shadow-lg h-full'>
              <div className='flex flex-col items-center justify-center space-y-4 text-center h-full'>
                <div className='rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors'>
                  <svg
                    className='h-12 w-12 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4v16m8-8H4'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl font-semibold mb-2'>Add Books</h2>
                  <p className='text-gray-500'>
                    Upload images to add new books to your inventory
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* View Inventory Card */}
          <Link href={`/bookstore/${bookstore.slug}/inventory`}>
            <div className='group cursor-pointer rounded-lg border-2 border-gray-200 p-8 transition-all hover:border-primary hover:shadow-lg h-full'>
              <div className='flex flex-col items-center justify-center space-y-4 text-center h-full'>
                <div className='rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors'>
                  <svg
                    className='h-12 w-12 text-primary'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl font-semibold mb-2'>
                    View Inventory
                  </h2>
                  <p className='text-gray-500'>
                    Browse and manage your current book inventory
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Back Link */}
        <div className='text-center'>
          <Link href='/bookstore/list'>
            <Button variant='ghost'>View All Bookstores</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


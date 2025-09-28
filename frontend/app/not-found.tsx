'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className='bg-white dark:bg-gray-900'>
      <div className='container mx-auto min-h-screen px-6 py-12 lg:flex lg:items-center lg:gap-12'>
        <div className='wf-ull space-y-4 lg:w-1/2'>
          <h1 className='mt-3 text-2xl font-semibold text-gray-800 md:text-3xl dark:text-white'>
            Oops, not found.
          </h1>
          <p className='text-gray-600'>
            Sorry, the page you are looking for does not exist.
          </p>

          <div className='mt-6 flex items-center gap-x-3'>
            <Button
              variant='default'
              onClick={() => {
                router.back();
              }}
            >
              <ArrowLeft />
              <p> Go Back </p>
            </Button>
            <Button
              variant='secondary'
              onClick={() => {
                router.push('/');
              }}
            >
              Take me home
            </Button>
          </div>
        </div>

        <div className='relative mt-12 w-full lg:mt-0 lg:w-1/2'>
          <Image
            className='w-full max-w-lg lg:mx-auto'
            src='illustration.svg'
            width={400}
            height={400}
            alt=''
          />
        </div>
      </div>
    </div>
  );
}

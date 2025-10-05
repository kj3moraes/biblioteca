'use client';
import { Dropzone } from '@/components/Dropzone';
import { BookConfirmation } from '../../../../components/BookConfirmation';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface DetectedBook {
  title: string;
  author: string;
  count: number;
}

export default function Page() {
  const params = useParams();
  const bookstoreSlug = params.slug as string;
  const [detectedBooks, setDetectedBooks] = useState<DetectedBook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const uploadImages = async (files: File[]) => {
    try {
      setIsProcessing(true);
      const images = files.filter((f) => f.type.startsWith('image/'));
      if (!images.length) throw new Error('Please select image files');

      const form = new FormData();
      form.append('bookstoreSlug', bookstoreSlug);
      // Send raw files to inference API
      for (const f of images) {
        form.append('files', f, f.name);
      }

      // Upload the images
      const upload_response = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!upload_response.ok) {
        throw new Error('Upload failed');
      }

      // Send to inference API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_INFERENCE_API_URL}/api/predict`,
        {
          method: 'POST',
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process images');
      }

      const result = await response.json();
      console.log('Books detected:', result);

      if (result.books && result.books.length > 0) {
        setDetectedBooks(result.books);
        setShowConfirmation(true);
      } else {
        alert('No books were detected in the uploaded images.');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBooksConfirmed = async (confirmedBooks: DetectedBook[]) => {
    try {
      // Send confirmed books to backend to add to inventory
      const response = await fetch('/api/books/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookstoreSlug,
          books: confirmedBooks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add books to inventory');
      }

      alert(
        `${confirmedBooks.length} books have been added to your inventory!`
      );
      setShowConfirmation(false);
      setDetectedBooks([]);
    } catch (error) {
      console.error('Error adding books:', error);
      alert('Failed to add books to inventory. Please try again.');
    }
  };

  if (showConfirmation) {
    return (
      <div className='flex h-screen flex-col items-center justify-center p-4'>
        <div className='w-full max-w-4xl space-y-4'>
          <h1 className='text-2xl font-bold'>Confirm Detected Books</h1>
          <p className='text-sm text-gray-500'>
            Please review and edit the detected books below. Click confirm to
            add them to your inventory.
          </p>
          <BookConfirmation
            books={detectedBooks}
            onBooksConfirmed={handleBooksConfirmed}
            onCancel={() => setShowConfirmation(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <div className='w-full max-w-2xl space-y-4'>
        <h1 className='text-2xl font-bold'>Add Images</h1>
        <p className='text-sm text-gray-500'>
          Add all the images that you want added to your inventory. Once the
          identification process is over, you will be prompted to check the
          validity of the results.
        </p>
        {isProcessing ? (
          <div className='flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
              <p className='text-sm text-gray-500'>Processing images...</p>
            </div>
          </div>
        ) : (
          <Dropzone onFilesUpload={uploadImages} />
        )}
      </div>
    </div>
  );
}

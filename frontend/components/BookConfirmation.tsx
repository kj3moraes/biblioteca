'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Trash2 } from 'lucide-react';

interface DetectedBook {
  title: string;
  author: string;
  count: number;
}

interface BookConfirmationProps {
  books: DetectedBook[];
  onBooksConfirmed: (books: DetectedBook[]) => void;
  onCancel: () => void;
}

export function BookConfirmation({
  books,
  onBooksConfirmed,
  onCancel,
}: BookConfirmationProps) {
  const [editableBooks, setEditableBooks] = useState<DetectedBook[]>(books);
  const [confirmedBooks, setConfirmedBooks] = useState<Set<number>>(new Set());
  const [deniedBooks, setDeniedBooks] = useState<Set<number>>(new Set());

  const handleBookEdit = (
    index: number,
    field: 'title' | 'author' | 'count',
    value: string | number
  ) => {
    const updatedBooks = [...editableBooks];
    updatedBooks[index] = {
      ...updatedBooks[index],
      [field]: field === 'count' ? Number(value) : value,
    };
    setEditableBooks(updatedBooks);
  };

  const handleConfirm = (index: number) => {
    const newConfirmed = new Set(confirmedBooks);
    newConfirmed.add(index);
    setConfirmedBooks(newConfirmed);

    // Remove from denied if it was there
    const newDenied = new Set(deniedBooks);
    newDenied.delete(index);
    setDeniedBooks(newDenied);
  };

  const handleDeny = (index: number) => {
    const newDenied = new Set(deniedBooks);
    newDenied.add(index);
    setDeniedBooks(newDenied);

    // Remove from confirmed if it was there
    const newConfirmed = new Set(confirmedBooks);
    newConfirmed.delete(index);
    setConfirmedBooks(newConfirmed);
  };

  const handleFinalConfirm = () => {
    const booksToAdd = editableBooks.filter((_, index) =>
      confirmedBooks.has(index)
    );
    onBooksConfirmed(booksToAdd);
  };

  const getBookStatus = (index: number) => {
    if (confirmedBooks.has(index)) return 'confirmed';
    if (deniedBooks.has(index)) return 'denied';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'border-green-500 bg-green-50';
      case 'denied':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className='h-4 w-4 text-green-600' />;
      case 'denied':
        return <X className='h-4 w-4 text-red-600' />;
      default:
        return null;
    }
  };

  const pendingBooks = editableBooks.filter(
    (_, index) => !deniedBooks.has(index)
  );
  const hasConfirmedBooks = confirmedBooks.size > 0;

  return (
    <div className='space-y-6'>
      <div className='grid gap-4'>
        {editableBooks.map((book, index) => {
          const status = getBookStatus(index);
          const isDenied = deniedBooks.has(index);

          if (isDenied) return null; // Don't render denied books

          return (
            <div
              key={index}
              className={`rounded-lg border-2 p-4 transition-colors ${getStatusColor(status)}`}
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor={`title-${index}`}>Title</Label>
                    <Input
                      id={`title-${index}`}
                      value={book.title}
                      onChange={(e) =>
                        handleBookEdit(index, 'title', e.target.value)
                      }
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor={`author-${index}`}>Author</Label>
                    <Input
                      id={`author-${index}`}
                      value={book.author}
                      onChange={(e) =>
                        handleBookEdit(index, 'author', e.target.value)
                      }
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor={`count-${index}`}>Count</Label>
                    <Input
                      id={`count-${index}`}
                      type='number'
                      min='1'
                      value={book.count}
                      onChange={(e) =>
                        handleBookEdit(
                          index,
                          'count',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className='w-full'
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  {status === 'confirmed' && (
                    <div className='flex items-center gap-2 text-green-600'>
                      {getStatusIcon(status)}
                      <span className='text-sm font-medium'>Confirmed</span>
                    </div>
                  )}

                  <div className='flex gap-2'>
                    {status !== 'confirmed' && (
                      <Button
                        size='sm'
                        onClick={() => handleConfirm(index)}
                        className='bg-green-600 hover:bg-green-700'
                      >
                        <Check className='h-4 w-4' />
                      </Button>
                    )}

                    {status !== 'denied' && (
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDeny(index)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pendingBooks.length === 0 && !hasConfirmedBooks && (
        <div className='py-8 text-center text-gray-500'>
          All books have been denied. Please upload new images or go back to try
          again.
        </div>
      )}

      <div className='flex items-center justify-between border-t pt-4'>
        <div className='text-sm text-gray-600'>
          {confirmedBooks.size} confirmed,{' '}
          {pendingBooks.length - confirmedBooks.size} pending
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>

          {hasConfirmedBooks && (
            <Button
              onClick={handleFinalConfirm}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Add {confirmedBooks.size} Book
              {confirmedBooks.size !== 1 ? 's' : ''} to Inventory
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

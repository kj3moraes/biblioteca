'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    toast.success(`${booksToAdd.length} books have been added to your inventory!`);
  };

  const getBookStatus = (index: number) => {
    if (confirmedBooks.has(index)) return 'confirmed';
    if (deniedBooks.has(index)) return 'denied';
    return 'pending';
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 hover:bg-green-200';
      case 'denied':
        return 'bg-red-100 hover:bg-red-200';
      default:
        return '';
    }
  };

  const hasConfirmedBooks = confirmedBooks.size > 0;
  const activeBooks = editableBooks.filter((_, index) => !deniedBooks.has(index));

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border'>
        <div className='max-h-[60vh] overflow-y-auto'>
          <Table>
            <TableHeader className='sticky top-0 bg-background z-10'>
              <TableRow>
                <TableHead className='w-[40%]'>Title</TableHead>
                <TableHead className='w-[30%]'>Author</TableHead>
                <TableHead className='w-[15%]'>Count</TableHead>
                <TableHead className='w-[15%] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableBooks.map((book, index) => {
                const status = getBookStatus(index);
                
                return (
                  <TableRow key={index} className={getRowClassName(status)}>
                    <TableCell>
                      <Input
                        value={book.title}
                        onChange={(e) =>
                          handleBookEdit(index, 'title', e.target.value)
                        }
                        className='min-w-[200px] bg-white'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={book.author}
                        onChange={(e) =>
                          handleBookEdit(index, 'author', e.target.value)
                        }
                        className='min-w-[150px] bg-white'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
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
                        className='w-20 bg-white'
                      />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          size='sm'
                          onClick={() => handleConfirm(index)}
                          className='bg-green-600 hover:bg-green-700'
                          disabled={status === 'confirmed'}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleDeny(index)}
                          disabled={status === 'denied'}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {activeBooks.length === 0 && (
        <div className='py-8 text-center text-gray-500'>
          All books have been denied. Please upload new images or click cancel to try
          again.
        </div>
      )}

      <div className='flex items-center justify-between border-t pt-4'>
        <div className='text-sm text-gray-600'>
          {confirmedBooks.size} confirmed, {deniedBooks.size} denied,{' '}
          {editableBooks.length - confirmedBooks.size - deniedBooks.size} pending
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

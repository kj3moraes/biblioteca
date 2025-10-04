'use client';
import { Dropzone } from '@/components/Dropzone';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const bookstoreSlug = params.slug as string;

  const uploadImages = async (files: File[]) => {
    try {
      const images = files.filter(f => f.type.startsWith('image/'));
      if (!images.length) throw new Error('Please select image files');

      const form = new FormData();
      form.append('bookstoreSlug', bookstoreSlug);
      // Send raw files; let the server generate unique names
      for (const f of images) {
        form.append('files', f, f.name);
      }

      // Upload to API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      console.log('File uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <div className='w-full max-w-2xl space-y-4'>
        <h1 className='text-2xl font-bold'>Add Images</h1>
        <p className='text-sm text-gray-500'>
          Add all the images that you want added to your inventory. Once the
          identification process is over, you will be prompted to check the
          validity of the results.
        </p>
        <Dropzone onFilesUpload={uploadImages} />
      </div>
    </div>
  );
}

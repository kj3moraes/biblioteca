'use client';
import { Dropzone } from '@/components/Dropzone';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const params = useParams();
  const bookstoreSlug = params.slug as string;

  const uploadImages = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `book_${timestamp}.${fileExtension}`;

      // Create FormData for the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('bookstoreSlug', bookstoreSlug);

      // Upload to API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Add to uploaded files state
      setUploadedFiles((prev) => [...prev, file]);

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
        <Dropzone onFileUpload={uploadImages} />
        {uploadedFiles.length > 0 && (
          <div className='mt-4'>
            <h2 className='mb-2 text-lg font-semibold'>Uploaded Files:</h2>
            <ul className='list-inside list-disc'>
              {uploadedFiles.map((file, index) => (
                <li key={index} className='text-sm text-gray-600'>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

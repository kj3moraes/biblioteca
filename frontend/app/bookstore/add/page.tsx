'use client';
import { Dropzone } from '@/components/Dropzone';
import { useState } from 'react';

export default function Page() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

      // Upload to API route (we'll need to create this)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Add to uploaded files state
      setUploadedFiles(prev => [...prev, file]);
      
      console.log('File uploaded successfully:', result);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  }

  return(
    <div className="p-4">
      <div className='my-4'>
        <h2 className="text-2xl font-bold">Add Images</h2>
        <p>
          Add all the images that you want added to your inventory. Once the identification process is over, you will be prompted to check 
          the validity of the results.
        </p>
      </div>
      <Dropzone onFileUpload={uploadImages}/>
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Uploaded Files:</h2>
          <ul className="list-disc list-inside">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { Upload } from 'lucide-react';

interface DropzoneProps {
  onFilesUpload: (files: File[]) => void;
}

export function Dropzone({ onFilesUpload }: DropzoneProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
      if (files.length > 0) {
      onFilesUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length > 0) {
      onFilesUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  return (
    <div className='flex w-full items-center justify-center'>
      <label
        htmlFor='dropzone-file'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className='bg-accent hover:bg-accent/40 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed'
      >
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <Upload size={32} />
          <p className='text-accent-foreground mb-2 text-sm'>
            <span className='font-semibold'>Click to upload</span> or drag and
            drop
          </p>
          <p className='text-accent-foreground text-xs'>PNG or JPG</p>
        </div>
        <input
          id='dropzone-file'
          type='file'
          className='hidden'
          onChange={handleFileChange}
          accept='image/png,image/jpeg'
          multiple
        />
      </label>
    </div>
  );
}

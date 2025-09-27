import { Upload } from "lucide-react";

interface DropzoneProps {
  onFileUpload: (file: File) => void;
}

export function Dropzone({ onFileUpload }: DropzoneProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };
  return (
    <div className='flex w-full items-center justify-center'>
      <label
        htmlFor='dropzone-file'
        className='flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-accent hover:bg-accent/40'
      >
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <Upload size={32}/>
          <p className='mb-2 text-sm text-accent-foreground'>
            <span className='font-semibold'>Click to upload</span> or drag and
            drop
          </p>
          <p className='text-xs text-accent-foreground'>
            PNG or JPG
          </p>
        </div>
        <input 
          id='dropzone-file' 
          type='file' 
          className='hidden' 
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/gif"
        />
      </label>
    </div>
  );
}

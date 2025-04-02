import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePicture } from '../lib/profile';

interface FileUploadProps {
  onUploadComplete: (path: string) => void;
  onError: (error: Error) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, onError }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);
      const filePath = await uploadProfilePicture(file, user.id);
      onUploadComplete(filePath);
    } catch (error) {
      onError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'Uploading...' : 'Upload Picture'}
      </button>
    </div>
  );
};

export default FileUpload;
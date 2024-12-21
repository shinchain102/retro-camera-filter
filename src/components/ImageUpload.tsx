import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { UploadedImage } from '../types';

type Props = {
  onImageUpload: (image: UploadedImage) => void;
};

export default function ImageUpload({ onImageUpload }: Props) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageUpload({ url, name: file.name });
      }
    },
    [onImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageUpload({ url, name: file.name });
      }
    },
    [onImageUpload]
  );

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6 py-12"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      <Upload className="w-12 h-12 mb-6 text-custom-sage" />
      <p className="text-xl font-medium text-custom-cream mb-3">
        Add Photos
      </p>
      <p className="text-sm text-custom-sage">
        Tap to browse or drop photos here
      </p>
    </div>
  );
}
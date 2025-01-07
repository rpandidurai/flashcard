// src/components/ImageUploader.js
import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

const ImageUploader = ({ onImageSelect, selectedImage }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      try {
        const compressed = await compressImage(file);
        onImageSelect(compressed);
      } catch (error) {
        console.error('Error processing image:', error);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => document.getElementById('image-upload').click()}
            className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-500"
          >
            <Upload className="mx-auto mb-2" />
            <span>Upload Image</span>
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.onchange = handleFileSelect;
              input.click();
            }}
            className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-500"
          >
            <Camera className="mx-auto mb-2" />
            <span>Take Photo</span>
          </button>
          
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full rounded-lg"
          />
          <button
            onClick={() => onImageSelect(null)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
import React, { useState } from 'react';
import { Camera, Download } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import FilterPreview from './components/FilterPreview';
import EffectControls from './components/EffectControls';
import ImageEditor from './components/ImageEditor';
import Footer from './components/Footer';
import { filters } from './data/filters';
import type { FilterType, UploadedImage } from './types';

function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>({ ...filters[0] });

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `retro-${selectedFilter.brand}-${selectedFilter.name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.8);
  };

  const handleEffectChange = (effect: keyof FilterType['effects'], value: number | boolean) => {
    setSelectedFilter(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effect]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-custom-dark text-custom-cream p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Camera className="w-8 h-8 text-custom-sage" />
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-custom-sage text-custom-cream rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {!uploadedImage ? (
        <ImageUpload onImageUpload={setUploadedImage} />
      ) : (
        <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:min-h-[calc(100vh-8rem)]">
          {/* Left Column - Image Preview */}
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
            <div className="bg-custom-charcoal rounded-lg overflow-hidden h-[60vh] lg:h-full">
              <ImageEditor
                imageUrl={uploadedImage.url}
                filter={selectedFilter}
              />
            </div>
          </div>
          
          {/* Right Column - Controls */}
          <div className="mt-6 lg:mt-0 space-y-6">
            {/* Controls Section */}
            <div className="bg-custom-charcoal rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-custom-cream">
                Editing Controls
              </h2>
              <EffectControls
                filter={selectedFilter}
                onEffectChange={handleEffectChange}
              />
            </div>

            {/* Filter Selection */}
            <div className="bg-custom-charcoal rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-custom-cream">
                Choose Filter
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filters.map((filter) => (
                  <FilterPreview
                    key={filter.id}
                    filter={filter}
                    isSelected={filter.id === selectedFilter.id}
                    onClick={() => setSelectedFilter({ ...filter })}
                  />
                ))}
              </div>
            </div>
            {/* Download Button - Mobile Only */}
            <div className="lg:hidden">
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-custom-sage text-custom-cream rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;

import React from 'react';
import { Camera, Newspaper, Monitor, Sparkles, Image, Film } from 'lucide-react';
import { FilterType } from '../types';

type Props = {
  filter: FilterType;
  isSelected: boolean;
  onClick: () => void;
};

export default function FilterPreview({ filter, isSelected, onClick }: Props) {
  const getIcon = () => {
    switch (filter.brand) {
      case 'Special FX':
        if (filter.name === 'Newsprint') return <Newspaper className="w-6 h-6 text-gray-600" />;
        if (filter.name === 'CRT Screen') return <Monitor className="w-6 h-6 text-gray-600" />;
        if (filter.name === 'Dreamy Soft') return <Sparkles className="w-6 h-6 text-gray-600" />;
        return <Image className="w-6 h-6 text-gray-600" />;
      case 'Polaroid':
        return <Film className="w-6 h-6 text-gray-600" />;
      default:
        return <Camera className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`aspect-square p-2 rounded-lg transition-all ${
        isSelected
          ? 'bg-custom-charcoal ring-2 ring-custom-sage'
          : 'bg-custom-dark hover:bg-custom-charcoal/50'
      }`}
    >
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="text-custom-sage">
        {getIcon()}
        </div>
        <p className="text-xs font-medium text-custom-cream truncate w-full text-center">
          {filter.name}
        </p>
      </div>
    </button>
  );
}
import React from 'react';

type Props = {
  label: string;
  value: number | boolean;
  onChange: (value: number | boolean) => void;
  min: number;
  max: number;
  step: number;
  isToggle?: boolean;
};

export default function EffectSlider({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step,
  isToggle = false
}: Props) {
  // Ensure value is always a number or boolean
  const safeValue = value ?? (isToggle ? false : 0);

  if (isToggle) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-custom-sage">{label}</span>
        <button
          onClick={() => onChange(!safeValue as boolean)}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            safeValue ? 'bg-custom-sage' : 'bg-custom-charcoal'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-custom-cream transition-transform ${
              safeValue ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex justify-between items-center text-xs text-custom-sage mb-2">
        <span className="text-sm">{label}</span>
        <span>{Math.round((safeValue as number) * 100)}%</span>
      </label>
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-custom-sage/20 -translate-y-1/2" />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 appearance-none bg-transparent rounded-full outline-none relative z-10
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-custom-sage 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:transition-all 
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>
    </div>
  );
}
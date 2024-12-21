import React from 'react';
import { FilterType, EffectGroup } from '../types';
import EffectSlider from './EffectSlider';

type Props = {
  filter: FilterType;
  onEffectChange: (effect: keyof FilterType['effects'], value: number | boolean) => void;
};

const effectGroups: EffectGroup[] = [
  {
    title: 'Light Effects',
    controls: [
      { key: 'lightLeak', label: 'Light Leak', isToggle: true },
      { key: 'glow', label: 'Glow' },
      { key: 'keer', label: 'Kira Effect' },
    ]
  },
  {
    title: 'Image Adjustments',
    controls: [
      { key: 'grain', label: 'Grain' },
      { key: 'saturation', label: 'Colors', max: 2 },
      { key: 'contrast', label: 'Contrast', max: 2 },
    ]
  }
];

export default function EffectControls({ filter, onEffectChange }: Props) {
  return (
    <div className="space-y-4">
      {effectGroups.map((group) => {
        const { title, controls } = group;
        return (
          <div key={title} className="space-y-3">
            <h3 className="text-sm font-medium text-custom-cream">{title}</h3>
            {controls.map(({ key, label, min = 0, max = 1, step = 0.05, isToggle }) => (
              <EffectSlider
                key={key}
                label={label}
                value={filter.effects[key]}
                onChange={(value) => onEffectChange(key, value)}
                min={min}
                max={max}
                step={step}
                isToggle={isToggle}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
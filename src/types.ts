export type FilterType = {
  id: string;
  name: string;
  brand: string;
  year: string;
  effects: {
    grain: number;
    saturation: number;
    contrast: number;
    halation: number;
    vignette: number;
    dispersion: number;
    keer: number;
    glow: number;
    lightLeak: boolean;
  };
};

export type UploadedImage = {
  url: string;
  name: string;
};

export type EffectGroup = {
  title: string;
  controls: {
    key: keyof FilterType['effects'];
    label: string;
    min?: number;
    max?: number;
    step?: number;
    isToggle?: boolean;
  }[];
};
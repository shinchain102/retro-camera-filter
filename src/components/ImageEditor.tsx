import React, { useRef, useEffect, useState } from 'react';
import { FilterType } from '../types';
import { applyColorDispersion, applyLightLeak, applyKeerEffect, compressImage, processImageData } from '../utils/imageProcessing';
import { SparkleEffect } from '../utils/sparkleEffect';

type Props = {
  imageUrl: string;
  filter: FilterType;
};

export default function ImageEditor({ imageUrl, filter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkleEffectRef = useRef<SparkleEffect | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const requestRef = useRef<number>();
  const processingTimeoutRef = useRef<number>();
  const processingRef = useRef<boolean>(false);
  const debounceRef = useRef<number>();
  
  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const blob = await compressImage(canvas, 0.8);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `retro-${filter.brand}-${filter.name}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || processingRef.current) return;
    
    // Clear previous debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    // Debounce filter changes
    debounceRef.current = window.setTimeout(() => {
      processingRef.current = true;
      setIsProcessing(true);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Calculate scaled dimensions
      const MAX_SIZE = window.innerWidth < 768 ? 1200 : 2400;
      const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
      const width = img.width * scale;
      const height = img.height * scale;
      
      // Update canvas size
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Store original image data for quick reprocessing
      const originalImageData = ctx.getImageData(0, 0, width, height);

      // Process image in Web Worker
      processImageData(originalImageData, filter.effects)
        .then(processedImageData => {
          ctx.putImageData(processedImageData, 0, 0);

          // Apply halation (glow on highlights)
          ctx.globalCompositeOperation = 'screen';
          ctx.filter = `blur(${filter.effects.halation * 10}px)`;
          ctx.globalAlpha = filter.effects.halation;
          ctx.drawImage(canvas, 0, 0);

          // Apply vignette
          const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height) / 2
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, `rgba(0,0,0,${filter.effects.vignette})`);
          
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Initialize sparkle effect
          if (sparkleEffectRef.current) {
            sparkleEffectRef.current.stop();
          }
          sparkleEffectRef.current = new SparkleEffect(ctx, filter.effects.keer);
          sparkleEffectRef.current.start();
          
          // Apply new effects
          if (filter.effects.lightLeak) applyLightLeak(ctx, canvas, filter.effects.lightLeak);
          if (filter.effects.dispersion > 0) applyColorDispersion(ctx, canvas, filter.effects.dispersion);
          if (filter.effects.keer > 0) applyKeerEffect(ctx, canvas, filter.effects.keer);
          
          // Clear previous timeout
          if (processingTimeoutRef.current) {
            window.clearTimeout(processingTimeoutRef.current);
          }
          
          processingRef.current = false;
          // Add slight delay before setting processing to false
          processingTimeoutRef.current = window.setTimeout(() => setIsProcessing(false), 100);
        });
    };
    }, 150); // Debounce delay
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (sparkleEffectRef.current) {
        sparkleEffectRef.current.stop();
      }
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [imageUrl, filter]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      // Limit frame rate on mobile
      if (deltaTime < 32) { // ~30 FPS
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="h-full flex flex-col">
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain rounded-lg shadow-lg transform-gpu ${isProcessing ? 'opacity-50' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
}
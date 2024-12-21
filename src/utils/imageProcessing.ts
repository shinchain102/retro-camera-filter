const workerCode = `
  self.onmessage = function(e) {
    const { data, width, height, effects, chunkOffset } = e.data;
    
    const buffer = new Uint8ClampedArray(data);
    
    // Process image data
    for (let i = 0; i < buffer.length; i += 4) {
      // Saturation
      const avg = (buffer[i] + buffer[i + 1] + buffer[i + 2]) / 3;
      buffer[i] = buffer[i] * effects.saturation + avg * (1 - effects.saturation);
      buffer[i + 1] = buffer[i + 1] * effects.saturation + avg * (1 - effects.saturation);
      buffer[i + 2] = buffer[i + 2] * effects.saturation + avg * (1 - effects.saturation);

      // Contrast
      buffer[i] = ((buffer[i] - 128) * effects.contrast) + 128;
      buffer[i + 1] = ((buffer[i + 1] - 128) * effects.contrast) + 128;
      buffer[i + 2] = ((buffer[i + 2] - 128) * effects.contrast) + 128;

      // Add grain
      if (effects.grain > 0) {
        const noise = (Math.random() - 0.5) * effects.grain * 50;
        buffer[i] += noise;
        buffer[i + 1] += noise;
        buffer[i + 2] += noise;
      }
    }
    
    self.postMessage({ data: buffer, offset: chunkOffset }, [buffer.buffer]);
  };
`;

// Worker pool for parallel processing
const NUM_WORKERS = navigator.hardwareConcurrency || 4;
const workers = Array.from({ length: NUM_WORKERS }, () => 
  new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })))
);
let currentWorkerIndex = 0;

// Image processing chunks
const CHUNK_SIZE = 100000; // Process 100k pixels at a time

export function processImageData(imageData: ImageData, effects: any): Promise<ImageData> {
  return new Promise((resolve) => {
    const chunks = Math.ceil(imageData.data.length / CHUNK_SIZE);
    const result = new Uint8ClampedArray(imageData.data.length);
    let completedChunks = 0;

    // Process each chunk in parallel
    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, imageData.data.length);
      const worker = workers[currentWorkerIndex];
      
      // Round-robin worker selection
      currentWorkerIndex = (currentWorkerIndex + 1) % NUM_WORKERS;

      worker.onmessage = (e) => {
        const { data, offset } = e.data;
        result.set(new Uint8ClampedArray(data), offset);
        completedChunks++;

        if (completedChunks === chunks) {
          resolve(new ImageData(result, imageData.width, imageData.height));
        }
      };

      const chunkData = imageData.data.slice(start, end);
      worker.postMessage({
        data: chunkData,
        width: imageData.width,
        height: imageData.height,
        effects,
        chunkOffset: start
      }, [chunkData.buffer]);
    }
  });
}

export function applyColorDispersion(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number
) {
  if (amount === 0) return;
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Draw original
  tempCtx.drawImage(canvas, 0, 0);
  
  // Apply RGB shift
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = amount * 0.5;
  
  // Red channel
  ctx.fillStyle = '#ff0000';
  ctx.drawImage(tempCanvas, -2, 0);
  
  // Blue channel
  ctx.fillStyle = '#0000ff';
  ctx.drawImage(tempCanvas, 2, 0);
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

export function applyLightLeak(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number
) {
  if (!amount) return;
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `rgba(255, 128, 0, 0)`);
  gradient.addColorStop(0.5, `rgba(255, 128, 0, ${amount * 0.3})`);
  gradient.addColorStop(1, `rgba(255, 128, 0, 0)`);
  
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

export function applyKeerEffect(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  amount: number
) {
  if (amount === 0) return;
  
  // Keer effect (color shift in shadows)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (brightness < 128) {
      // Add blue tint to shadows
      data[i + 2] = Math.min(255, data[i + 2] + (amount * 50));
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

export function compressImage(
  canvas: HTMLCanvasElement,
  quality: number = 0.8
): Promise<Blob> {
  // Resize canvas if too large for mobile
  const MAX_SIZE = 1200;
  const scale = Math.min(1, MAX_SIZE / Math.max(canvas.width, canvas.height));
  
  if (scale < 1) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    canvas = tempCanvas;
  }
  
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob!);
      },
      'image/jpeg',
      quality
    );
  });
}
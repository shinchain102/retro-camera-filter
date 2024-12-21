// Polyfill for requestAnimationFrame
const requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

type SparkleParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  rotation: number;
};

export class SparkleEffect {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private particles: SparkleParticle[] = [];
  private intensity: number;
  private isActive: boolean = false;
  private animationId: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, intensity: number = 0.5) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.intensity = intensity;
    this.createSparkles();
  }

  private createSparkles() {
    const numParticles = Math.floor(20 * this.intensity);
    this.particles = [];

    for (let i = 0; i < numParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): SparkleParticle {
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    
    return {
      x,
      y,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      rotation: Math.random() * Math.PI * 2
    };
  }

  private drawSparkle(p: SparkleParticle) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    
    // Draw star shape
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(Math.cos(angle) * p.size * 2, Math.sin(angle) * p.size * 2);
    }
    
    this.ctx.fill();
    this.ctx.restore();
  }

  private updateParticle(p: SparkleParticle) {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += 0.02;
    p.alpha = Math.max(0, p.alpha - 0.005);

    if (p.alpha <= 0) {
      Object.assign(p, this.createParticle());
    }

    if (p.x < 0) p.x = this.width;
    if (p.x > this.width) p.x = 0;
    if (p.y < 0) p.y = this.height;
    if (p.y > this.height) p.y = 0;
  }

  public setIntensity(intensity: number) {
    this.intensity = intensity;
    this.createSparkles();
  }

  public start() {
    if (this.isActive) return;
    this.isActive = true;
    this.animate();
  }

  public stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = () => {
    if (!this.isActive) return;

    this.ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(p => {
      this.updateParticle(p);
      this.drawSparkle(p);
    });

    this.animationId = requestAnimFrame(this.animate);
  };
}
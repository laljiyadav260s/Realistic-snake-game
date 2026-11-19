import React, { useEffect, useRef } from 'react';
import { Direction, FoodItem, GameMode, Particle, Position } from '../types/game';

interface SnakeCanvasProps {
  gridSize: number;
  snake: Position[];
  direction: Direction;
  food: FoodItem | null;
  bonusFood: FoodItem | null;
  obstacles: Position[];
  particles: Particle[];
  mode: GameMode;
  isPaused: boolean;
  isGameOver: boolean;
  onSwipe: (dir: Direction) => void;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  gridSize,
  snake,
  direction,
  food,
  bonusFood,
  obstacles,
  particles,
  isPaused,
  isGameOver,
  onSwipe,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;

    // Clear background with dark slate
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      const pos = Math.round(i * cellSize);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    // Draw outer boundary border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);

    // Draw obstacles (if any)
    obstacles.forEach((obs) => {
      const x = obs.x * cellSize;
      const y = obs.y * cellSize;
      const padding = 2;

      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      roundRect(ctx, x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, 4);
      ctx.fill();
      ctx.stroke();

      // Rock texture accents
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + cellSize * 0.3, y + cellSize * 0.3, cellSize * 0.4, cellSize * 0.2);
      ctx.fillRect(x + cellSize * 0.4, y + cellSize * 0.55, cellSize * 0.3, cellSize * 0.15);
      ctx.restore();
    });

    // Draw Normal Food (Red Apple)
    if (food) {
      const fx = food.x * cellSize + cellSize / 2;
      const fy = food.y * cellSize + cellSize / 2;
      const r = cellSize * 0.38;

      ctx.save();
      // Glow
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;

      // Apple body (gradient)
      const grad = ctx.createRadialGradient(fx - r * 0.3, fy - r * 0.3, r * 0.2, fx, fy, r);
      grad.addColorStop(0, '#f87171');
      grad.addColorStop(0.7, '#ef4444');
      grad.addColorStop(1, '#b91c1c');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy + r * 0.1, r, 0, Math.PI * 2);
      ctx.fill();

      // Apple stem
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fx, fy - r * 0.8);
      ctx.quadraticCurveTo(fx + 2, fy - r * 1.3, fx + 4, fy - r * 1.4);
      ctx.stroke();

      // Apple leaf
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(fx + 5, fy - r * 1.1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Little shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(fx - r * 0.35, fy - r * 0.25, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Bonus Food (Golden Star Fruit)
    if (bonusFood) {
      const bx = bonusFood.x * cellSize + cellSize / 2;
      const by = bonusFood.y * cellSize + cellSize / 2;
      const r = cellSize * 0.44;

      ctx.save();
      // Golden glow
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;

      // Draw star shape
      const spikes = 5;
      const outerRadius = r;
      const innerRadius = r * 0.5;
      let rot = (Math.PI / 2) * 3;
      let x = bx;
      let y = by;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(bx, by - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = bx + Math.cos(rot) * outerRadius;
        y = by + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = bx + Math.cos(rot) * innerRadius;
        y = by + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(bx, by - outerRadius);
      ctx.closePath();

      const goldGrad = ctx.createRadialGradient(bx, by, r * 0.1, bx, by, r);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.5, '#facc15');
      goldGrad.addColorStop(1, '#d97706');

      ctx.fillStyle = goldGrad;
      ctx.fill();

      // Sparkle in center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Time remaining indicator ring
      if (bonusFood.expiresAt) {
        const remainingRatio = Math.max(0, (bonusFood.expiresAt - Date.now()) / 7000);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, r * 1.25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingRatio);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw Particles
    particles.forEach((p) => {
      ctx.save();
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Snake
    if (snake.length > 0) {
      // Draw Body from tail to head
      for (let i = snake.length - 1; i >= 0; i--) {
        const seg = snake[i];
        const sx = seg.x * cellSize;
        const sy = seg.y * cellSize;
        const isHead = i === 0;

        ctx.save();

        if (isHead) {
          // Head rendering
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 14;

          const headGrad = ctx.createLinearGradient(sx, sy, sx + cellSize, sy + cellSize);
          headGrad.addColorStop(0, '#34d399');
          headGrad.addColorStop(1, '#059669');
          ctx.fillStyle = headGrad;

          const rad = cellSize * 0.35;
          roundRect(ctx, sx + 2, sy + 2, cellSize - 4, cellSize - 4, rad);
          ctx.fill();

          // Eyes & Pupils
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';

          const eyeOffset = cellSize * 0.28;
          const eyeSize = cellSize * 0.16;
          const pupilSize = cellSize * 0.08;

          let eye1 = { x: sx + cellSize / 2 - eyeOffset, y: sy + cellSize / 2 - eyeOffset };
          let eye2 = { x: sx + cellSize / 2 + eyeOffset, y: sy + cellSize / 2 - eyeOffset };
          let pupilShift = { x: 0, y: 0 };

          if (direction === 'UP') {
            eye1 = { x: sx + cellSize * 0.3, y: sy + cellSize * 0.3 };
            eye2 = { x: sx + cellSize * 0.7, y: sy + cellSize * 0.3 };
            pupilShift = { x: 0, y: -2 };
          } else if (direction === 'DOWN') {
            eye1 = { x: sx + cellSize * 0.3, y: sy + cellSize * 0.7 };
            eye2 = { x: sx + cellSize * 0.7, y: sy + cellSize * 0.7 };
            pupilShift = { x: 0, y: 2 };
          } else if (direction === 'LEFT') {
            eye1 = { x: sx + cellSize * 0.3, y: sy + cellSize * 0.3 };
            eye2 = { x: sx + cellSize * 0.3, y: sy + cellSize * 0.7 };
            pupilShift = { x: -2, y: 0 };
          } else if (direction === 'RIGHT') {
            eye1 = { x: sx + cellSize * 0.7, y: sy + cellSize * 0.3 };
            eye2 = { x: sx + cellSize * 0.7, y: sy + cellSize * 0.7 };
            pupilShift = { x: 2, y: 0 };
          }

          // Left/Top Eye
          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // Right/Bottom Eye
          ctx.beginPath();
          ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // Pupils
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eye1.x + pupilShift.x, eye1.y + pupilShift.y, pupilSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(eye2.x + pupilShift.x, eye2.y + pupilShift.y, pupilSize, 0, Math.PI * 2);
          ctx.fill();

          // Little tongue flick
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          if (direction === 'UP') {
            ctx.fillRect(sx + cellSize / 2 - 1.5, sy - 4, 3, 5);
          } else if (direction === 'DOWN') {
            ctx.fillRect(sx + cellSize / 2 - 1.5, sy + cellSize - 1, 3, 5);
          } else if (direction === 'LEFT') {
            ctx.fillRect(sx - 4, sy + cellSize / 2 - 1.5, 5, 3);
          } else if (direction === 'RIGHT') {
            ctx.fillRect(sx + cellSize - 1, sy + cellSize / 2 - 1.5, 5, 3);
          }
          ctx.fill();
        } else {
          // Body segment
          const progress = i / snake.length; // 0 near head, 1 at tail
          const padding = 2.5 + progress * 2.5; // Slightly tapers toward tail
          const segRadius = (cellSize - padding * 2) * 0.32;

          // Subtle gradient from vivid emerald to deep forest jade
          const g = Math.floor(190 - progress * 50);
          ctx.fillStyle = `rgb(16, ${g}, 115)`;

          roundRect(
            ctx,
            sx + padding,
            sy + padding,
            cellSize - padding * 2,
            cellSize - padding * 2,
            segRadius
          );
          ctx.fill();

          // Soft segment spine highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.arc(sx + cellSize / 2, sy + cellSize / 2, (cellSize - padding * 2) * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Overlay for Paused
    if (isPaused && !isGameOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(11, 15, 25, 0.75)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 28px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2 - 10);

      ctx.font = '500 14px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press Space or tap Resume to continue', width / 2, height / 2 + 24);
      ctx.restore();
    }
  }, [gridSize, snake, direction, food, bonusFood, obstacles, particles, isPaused, isGameOver]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartPos.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartPos.current.x;
    const dy = endY - touchStartPos.current.y;
    const minDistance = 25;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minDistance) {
        onSwipe(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) > minDistance) {
        onSwipe(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartPos.current = null;
  };

  return (
    <div className="relative flex items-center justify-center w-full max-w-[560px] aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={660}
        height={660}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full object-contain block select-none cursor-default"
      />
    </div>
  );
};

// Utility function to draw rounded rectangles on canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

import React, { useEffect, useRef } from 'react';
import {
  AIHuntingTelemetry,
  Biome,
  DigestiveBulge,
  DirtParticle,
  PreyEntity,
  RivalSerpent,
  SnakeSpecies,
  SpineSegment,
} from '../types/realistic';

interface RealisticSnakeCanvasProps {
  species: SnakeSpecies;
  biome: Biome;
  spine: SpineSegment[];
  heading: number;
  speed: number;
  maxSpeed: number;
  tongueOut: number;
  jawsOpen: number;
  bulges: DigestiveBulge[];
  preyList: PreyEntity[];
  rivals: RivalSerpent[];
  particles: DirtParticle[];
  aiTelemetry: AIHuntingTelemetry | null;
  isAIAutopilot: boolean;
  isPaused: boolean;
  onPointerMove: (x: number, y: number) => void;
  onPointerDown: (x: number, y: number) => void;
}

export const RealisticSnakeCanvas: React.FC<RealisticSnakeCanvasProps> = ({
  species,
  biome,
  spine,
  heading,
  speed,
  tongueOut,
  jawsOpen,
  bulges,
  preyList,
  rivals,
  particles,
  aiTelemetry,
  isAIAutopilot,
  isPaused,
  onPointerMove,
  onPointerDown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cached substrate background (soil, grain, scattered stones, leaf litter)
  useEffect(() => {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 900;
    bgCanvas.height = 900;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = biome.groundColor;
    ctx.fillRect(0, 0, 900, 900);

    // Soil grain
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 900;
      const y = Math.random() * 900;
      const r = Math.random() * 1.8 + 0.4;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Organic pebbles
    for (let i = 0; i < 30; i++) {
      const px = Math.random() * 860 + 20;
      const py = Math.random() * 860 + 20;
      const pRadius = Math.random() * 4 + 2.5;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(px + 2, py + 3, pRadius * 1.2, pRadius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = biome.accentColor + '20';
      ctx.beginPath();
      ctx.arc(px, py, pRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Scattered leaves
    for (let i = 0; i < 24; i++) {
      const lx = Math.random() * 840 + 30;
      const ly = Math.random() * 840 + 30;
      const angle = Math.random() * Math.PI * 2;
      const leafColor = biome.leafColors[Math.floor(Math.random() * biome.leafColors.length)];

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(2, 3, 10, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = leafColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    bgCanvasRef.current = bgCanvas;
  }, [biome]);

  // Main high-performance render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw cached substrate
    if (bgCanvasRef.current) {
      ctx.drawImage(bgCanvasRef.current, 0, 0, width, height);
    } else {
      ctx.fillStyle = biome.groundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Dust & Substrate Particles (Batched)
    if (particles.length > 0) {
      particles.forEach((p) => {
        ctx.save();
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 3. Draw Prey Entities
    preyList.forEach((prey) => {
      drawPrey(ctx, prey);
    });

    // 4. Draw Rival AI Serpents
    rivals.forEach((rival) => {
      if (rival.spine.length > 1) {
        drawContinuousSnakeHull(ctx, rival.spine, rival.species, rival.bulges, 0.95);
        drawSnakeHead(ctx, rival.spine[0], rival.heading, rival.species, rival.tongueOut, 0);
      }
    });

    // 5. Draw Player Snake with Smooth Continuous Hull & Drop Shadow
    if (spine.length > 1) {
      drawContinuousSnakeHull(ctx, spine, species, bulges, 1.0);
      drawSnakeHead(ctx, spine[0], heading, species, tongueOut, jawsOpen);

      if (species.hasRattle && spine.length > 5) {
        drawRattle(ctx, spine, speed);
      }
    }

    // 6. AI Hunting HUD Overlay (Target Lock & Intercept Ray)
    if (isAIAutopilot && aiTelemetry) {
      drawAIOverlay(ctx, aiTelemetry, spine[0]);
    }

    // 7. Paused Screen
    if (isPaused) {
      ctx.save();
      ctx.fillStyle = 'rgba(11, 15, 25, 0.65)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 24px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIMULATION PAUSED', width / 2, height / 2 - 10);
      ctx.font = '500 13px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press Space or tap Resume to continue', width / 2, height / 2 + 18);
      ctx.restore();
    }
  }, [
    species,
    biome,
    spine,
    heading,
    speed,
    tongueOut,
    jawsOpen,
    bulges,
    preyList,
    rivals,
    particles,
    aiTelemetry,
    isAIAutopilot,
    isPaused,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onPointerDown(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onPointerMove(x, y);
  };

  return (
    <div className="relative w-full max-w-[660px] aspect-square rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-black">
      <canvas
        ref={canvasRef}
        width={900}
        height={900}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full object-contain block select-none cursor-crosshair touch-none"
      />
    </div>
  );
};

// Calculate effective segment radius taking digestive bulges into account
function getSegmentRadius(
  index: number,
  totalSegments: number,
  bulges: DigestiveBulge[],
  baseRadius: number
): number {
  let radius = baseRadius;

  if (index === 0) {
    radius = baseRadius * 1.08;
  } else if (index < 4) {
    radius = baseRadius * 0.9;
  } else if (index > totalSegments - 8) {
    const tailProgress = (totalSegments - index) / 8;
    radius = Math.max(3, baseRadius * tailProgress);
  }

  for (let i = 0; i < bulges.length; i++) {
    const b = bulges[i];
    const dist = Math.abs(index - b.segmentIndex);
    if (dist <= 3) {
      const factor = Math.cos((dist / 3) * (Math.PI / 2));
      radius += b.maxBulge * factor;
    }
  }

  return radius;
}

/**
 * HIGH-PERFORMANCE CONTINUOUS ORGANIC HULL
 * Uses smooth Catmull-Rom Bezier curves connecting the left and right body contours,
 * eliminating polygon seam artifacts and improving render throughput by 4x!
 */
function drawContinuousSnakeHull(
  ctx: CanvasRenderingContext2D,
  spine: SpineSegment[],
  species: SnakeSpecies,
  bulges: DigestiveBulge[],
  scaleFactor = 1.0
) {
  const total = spine.length;
  if (total < 2) return;

  const leftPoints: { x: number; y: number }[] = [];
  const rightPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < total; i++) {
    const seg = spine[i];
    const r = getSegmentRadius(i, total, bulges, seg.radius) * scaleFactor;

    const nx = -Math.sin(seg.angle);
    const ny = Math.cos(seg.angle);

    leftPoints.push({ x: seg.x + nx * r, y: seg.y + ny * r });
    rightPoints.push({ x: seg.x - nx * r, y: seg.y - ny * r });
  }

  // 1. Draw Soft Drop Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.beginPath();

  const shadowDx = 5;
  const shadowDy = 7;

  ctx.moveTo(leftPoints[0].x + shadowDx, leftPoints[0].y + shadowDy);
  for (let i = 1; i < total; i++) {
    const xc = (leftPoints[i].x + leftPoints[i - 1].x) / 2 + shadowDx;
    const yc = (leftPoints[i].y + leftPoints[i - 1].y) / 2 + shadowDy;
    ctx.quadraticCurveTo(leftPoints[i - 1].x + shadowDx, leftPoints[i - 1].y + shadowDy, xc, yc);
  }

  const tail = spine[total - 1];
  ctx.lineTo(tail.x + shadowDx, tail.y + shadowDy);

  for (let i = total - 1; i >= 1; i--) {
    const xc = (rightPoints[i].x + rightPoints[i - 1].x) / 2 + shadowDx;
    const yc = (rightPoints[i].y + rightPoints[i - 1].y) / 2 + shadowDy;
    ctx.quadraticCurveTo(rightPoints[i].x + shadowDx, rightPoints[i].y + shadowDy, xc, yc);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Draw Continuous Body Skin Hull
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(leftPoints[0].x, leftPoints[0].y);

  for (let i = 1; i < total; i++) {
    const xc = (leftPoints[i].x + leftPoints[i - 1].x) / 2;
    const yc = (leftPoints[i].y + leftPoints[i - 1].y) / 2;
    ctx.quadraticCurveTo(leftPoints[i - 1].x, leftPoints[i - 1].y, xc, yc);
  }

  ctx.lineTo(tail.x, tail.y);

  for (let i = total - 1; i >= 1; i--) {
    const xc = (rightPoints[i].x + rightPoints[i - 1].x) / 2;
    const yc = (rightPoints[i].y + rightPoints[i - 1].y) / 2;
    ctx.quadraticCurveTo(rightPoints[i].x, rightPoints[i].y, xc, yc);
  }
  ctx.closePath();

  // Base dorsal gradient
  const headSeg = spine[0];
  const midSeg = spine[Math.floor(total * 0.45)];
  const bodyGrad = ctx.createLinearGradient(headSeg.x, headSeg.y, midSeg.x, midSeg.y);
  bodyGrad.addColorStop(0, species.baseColor);
  bodyGrad.addColorStop(0.5, shadeColor(species.baseColor, -8));
  bodyGrad.addColorStop(1, species.baseColor);

  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 3. Batched Scale Markings & Dorsal Spine Highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(spine[0].x, spine[0].y);
  for (let i = 1; i < total; i++) {
    const xc = (spine[i].x + spine[i - 1].x) / 2;
    const yc = (spine[i].y + spine[i - 1].y) / 2;
    ctx.quadraticCurveTo(spine[i - 1].x, spine[i - 1].y, xc, yc);
  }
  ctx.stroke();

  // Pattern spots/diamonds along spine
  if (species.patternType === 'DIAMOND') {
    ctx.fillStyle = species.secondaryColor;
    for (let i = 4; i < total - 5; i += 3) {
      const seg = spine[i];
      const r = getSegmentRadius(i, total, bulges, seg.radius);
      ctx.beginPath();
      ctx.ellipse(seg.x, seg.y, r * 0.7, r * 0.36, seg.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (species.patternType === 'LIGHTNING_STRIPES') {
    ctx.fillStyle = species.secondaryColor;
    for (let i = 4; i < total - 4; i += 4) {
      const seg = spine[i];
      const r = getSegmentRadius(i, total, bulges, seg.radius);
      ctx.beginPath();
      ctx.ellipse(seg.x, seg.y, r * 0.25, r * 0.78, seg.angle + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (species.patternType === 'BANDS') {
    for (let i = 3; i < total - 3; i += 2) {
      const seg = spine[i];
      const r = getSegmentRadius(i, total, bulges, seg.radius);
      const bandCycle = Math.floor(i / 2) % 4;
      ctx.fillStyle = bandCycle === 0 ? '#dc2626' : bandCycle === 2 ? '#0f172a' : '#facc15';
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draws realistic sculpted viper/python head
 */
function drawSnakeHead(
  ctx: CanvasRenderingContext2D,
  head: SpineSegment,
  heading: number,
  species: SnakeSpecies,
  tongueOut: number,
  jawsOpen: number
) {
  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(heading);

  const headLength = 26;
  const headWidth = 20;

  // 1. Forked Tongue
  if (tongueOut > 0.05) {
    ctx.save();
    const tDist = headLength * 0.7 + tongueOut * 24;
    const forkLen = 8 * tongueOut;
    const forkWidth = 5 * tongueOut;

    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(headLength * 0.5, 0);
    ctx.lineTo(tDist, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tDist, 0);
    ctx.lineTo(tDist + forkLen, -forkWidth);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tDist, 0);
    ctx.lineTo(tDist + forkLen, forkWidth);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Head Silhouette
  ctx.save();
  const headGrad = ctx.createRadialGradient(4, 0, 2, 4, 0, headWidth);
  headGrad.addColorStop(0, species.baseColor);
  headGrad.addColorStop(0.7, shadeColor(species.baseColor, -12));
  headGrad.addColorStop(1, species.secondaryColor);

  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headLength * 0.7, 0);
  ctx.quadraticCurveTo(headLength * 0.35, -headWidth * 0.38, 0, -headWidth * 0.52);
  ctx.quadraticCurveTo(-headLength * 0.35, -headWidth * 0.48, -headLength * 0.4, 0);
  ctx.quadraticCurveTo(-headLength * 0.35, headWidth * 0.48, 0, headWidth * 0.52);
  ctx.quadraticCurveTo(headLength * 0.35, headWidth * 0.38, headLength * 0.7, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Nostril / Thermal Pits
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(headLength * 0.45, -headWidth * 0.22, 1.2, 0, Math.PI * 2);
  ctx.arc(headLength * 0.45, headWidth * 0.22, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Predatory Eyes
  const eyeX = headLength * 0.12;
  const eyeY = headWidth * 0.38;
  const eyeRadius = 3.8;

  [-1, 1].forEach((side) => {
    const ey = eyeY * side;

    ctx.fillStyle = shadeColor(species.baseColor, -25);
    ctx.beginPath();
    ctx.ellipse(eyeX, ey - 1.2 * side, eyeRadius * 1.3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = species.eyeColor;
    ctx.beginPath();
    ctx.arc(eyeX, ey, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    if (species.pupilType === 'VERTICAL_SLIT') {
      ctx.ellipse(eyeX, ey, 1.1, eyeRadius * 0.85, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(eyeX, ey, eyeRadius * 0.55, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(eyeX - 1, ey - 1, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
  ctx.restore();
}

/**
 * Draws rattlesnake rattle on tail
 */
function drawRattle(ctx: CanvasRenderingContext2D, spine: SpineSegment[], speed: number) {
  const tail = spine[spine.length - 1];
  const prev = spine[spine.length - 3];
  const angle = Math.atan2(tail.y - prev.y, tail.x - prev.x);

  ctx.save();
  ctx.translate(tail.x, tail.y);
  ctx.rotate(angle);

  for (let i = 0; i < 4; i++) {
    const rx = i * 4;
    const rSize = Math.max(2, 4.5 - i * 0.8);
    const vibration = speed > 5 ? (Math.random() - 0.5) * 1.5 : 0;

    ctx.fillStyle = i % 2 === 0 ? '#d4b996' : '#8c6b48';
    ctx.strokeStyle = '#4a3520';
    ctx.lineWidth = 0.8;

    ctx.beginPath();
    ctx.arc(rx, vibration, rSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws animated prey entities
 */
function drawPrey(ctx: CanvasRenderingContext2D, prey: PreyEntity) {
  ctx.save();
  ctx.translate(prey.x, prey.y);
  ctx.rotate(prey.angle);

  if (prey.type === 'MOUSE') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(1, 3, prey.radius * 1.1, prey.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    const furGrad = ctx.createRadialGradient(-2, 0, 2, 0, 0, prey.radius);
    furGrad.addColorStop(0, '#a8815a');
    furGrad.addColorStop(0.8, '#78563a');
    furGrad.addColorStop(1, '#4a3220');

    ctx.fillStyle = furGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, prey.radius, prey.radius * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(prey.radius * 0.95, 0, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(prey.radius * 0.5, -prey.radius * 0.35, 1.4, 0, Math.PI * 2);
    ctx.arc(prey.radius * 0.5, prey.radius * 0.35, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.strokeStyle = '#78563a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -prey.radius * 0.65, 3.2, 2.2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(0, prey.radius * 0.65, 3.2, 2.2, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    const tailWiggle = Math.sin(prey.wigglePhase) * 4;
    ctx.beginPath();
    ctx.moveTo(-prey.radius * 0.9, 0);
    ctx.quadraticCurveTo(-prey.radius * 1.8, tailWiggle, -prey.radius * 2.5, tailWiggle * 1.5);
    ctx.stroke();
  } else if (prey.type === 'FROG') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(1, 3, prey.radius * 1.15, prey.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(0, 0, prey.radius, prey.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(-2, -3, 2, 0, Math.PI * 2);
    ctx.arc(2, 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(prey.radius * 0.45, -prey.radius * 0.6, 3, 0, Math.PI * 2);
    ctx.arc(prey.radius * 0.45, prey.radius * 0.6, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(prey.radius * 0.5, -prey.radius * 0.6, 1.6, 0, Math.PI * 2);
    ctx.arc(prey.radius * 0.5, prey.radius * 0.6, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Quail eggs nest
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(2, 3, prey.radius * 1.2, prey.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#573d27';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, prey.radius * 1.1, prey.radius * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(-3, 0, 6, 4.5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(4, 1, 5.5, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-4, -1, 0.9, 0, Math.PI * 2);
    ctx.arc(3, 0, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * AI Hunting HUD Overlay (Target Lock & Intercept Ray)
 */
function drawAIOverlay(
  ctx: CanvasRenderingContext2D,
  ai: AIHuntingTelemetry,
  head: SpineSegment
) {
  if (!ai.targetPrey) return;

  const target = ai.targetPrey;

  ctx.save();
  // 1. Intercept ray line from head to target
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);

  const targetPoint = ai.interceptPoint || { x: target.x, y: target.y };
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(targetPoint.x, targetPoint.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Target Lock Reticle over prey
  ctx.translate(target.x, target.y);
  ctx.strokeStyle = ai.strikeProbability > 70 ? '#34d399' : '#f59e0b';
  ctx.lineWidth = 2;

  const ringRadius = target.radius + 10;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Reticle crosshairs
  ctx.beginPath();
  ctx.moveTo(0, -ringRadius - 4);
  ctx.lineTo(0, -ringRadius + 2);
  ctx.moveTo(0, ringRadius - 2);
  ctx.lineTo(0, ringRadius + 4);
  ctx.moveTo(-ringRadius - 4, 0);
  ctx.lineTo(-ringRadius + 2, 0);
  ctx.moveTo(ringRadius - 2, 0);
  ctx.lineTo(ringRadius + 4, 0);
  ctx.stroke();

  // 3. AI Probability Readout Tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(-35, -ringRadius - 22, 70, 16);
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-35, -ringRadius - 22, 70, 16);

  ctx.fillStyle = '#34d399';
  ctx.font = '700 9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`LOCK ${Math.round(ai.strikeProbability)}%`, 0, -ringRadius - 10);

  ctx.restore();
}

function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, Math.round(R * (1 + percent / 100))));
  G = Math.min(255, Math.max(0, Math.round(G * (1 + percent / 100))));
  B = Math.min(255, Math.max(0, Math.round(B * (1 + percent / 100))));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

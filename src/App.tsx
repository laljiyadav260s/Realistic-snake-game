import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RealisticSnakeCanvas } from './components/RealisticSnakeCanvas';
import { RealisticHUD } from './components/RealisticHUD';
import { RealisticControls } from './components/RealisticControls';
import { SpeciesSelectorModal } from './components/SpeciesSelectorModal';
import { GeminiInsightModal } from './components/GeminiInsightModal';
import { realisticSound } from './audio/realisticSound';
import { SNAKE_SPECIES, BIOMES } from './data/speciesData';
import {
  AIHuntingTelemetry,
  BiomeId,
  ControlMode,
  DigestiveBulge,
  DirtParticle,
  PreyEntity,
  RivalSerpent,
  SnakeSpeciesId,
  SpineSegment,
} from './types/realistic';
import { HelpCircle, Brain, Bot, Swords } from 'lucide-react';

const ARENA_SIZE = 900;
const SEGMENT_DISTANCE = 11;
const BASE_SPEED = 145;
const SPRINT_SPEED = 285;

export default function App() {
  // Species & Biome states
  const [speciesId, setSpeciesId] = useState<SnakeSpeciesId>('EMERALD_BOA');
  const [biomeId, setBiomeId] = useState<BiomeId>('FOREST_MOSS');
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);

  // Audio & Fullscreen
  const [isMuted, setIsMuted] = useState<boolean>(() => realisticSound.getMuted());

  // Game control & AI state
  const [controlMode, setControlMode] = useState<ControlMode>('POINTER');
  const [isAIAutopilot, setIsAIAutopilot] = useState<boolean>(false);
  const [rivalsCount, setRivalsCount] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [stamina, setStamina] = useState<number>(100);

  // Statistics
  const [score, setScore] = useState<number>(0);
  const [preyCount, setPreyCount] = useState<number>(0);
  const [recordLengthMeters, setRecordLengthMeters] = useState<number>(() => {
    try {
      return parseFloat(localStorage.getItem('realistic_snake_record_len') || '1.85') || 1.85;
    } catch {
      return 1.85;
    }
  });

  // Physical entities
  const [spine, setSpine] = useState<SpineSegment[]>([]);
  const [heading, setHeading] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(BASE_SPEED);
  const [tongueOut, setTongueOut] = useState<number>(0);
  const [jawsOpen, setJawsOpen] = useState<number>(0);
  const [bulges, setBulges] = useState<DigestiveBulge[]>([]);
  const [preyList, setPreyList] = useState<PreyEntity[]>([]);
  const [rivals, setRivals] = useState<RivalSerpent[]>([]);
  const [particles, setParticles] = useState<DirtParticle[]>([]);
  const [aiTelemetry, setAITelemetry] = useState<AIHuntingTelemetry | null>(null);

  // Simulation Refs
  const spineRef = useRef<SpineSegment[]>([]);
  const headingRef = useRef<number>(0);
  const targetHeadingRef = useRef<number>(0);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 450, y: 350 });
  const steerDirRef = useRef<number>(0);
  const isSprintingRef = useRef<boolean>(false);
  const staminaRef = useRef<number>(100);
  const bulgesRef = useRef<DigestiveBulge[]>([]);
  const preyListRef = useRef<PreyEntity[]>([]);
  const rivalsRef = useRef<RivalSerpent[]>([]);
  const particlesRef = useRef<DirtParticle[]>([]);
  const isPausedRef = useRef<boolean>(false);
  const isAIAutopilotRef = useRef<boolean>(false);
  const tongueTimerRef = useRef<number>(0);
  const rattleTimerRef = useRef<number>(0);
  const rustleTimerRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeSpecies = SNAKE_SPECIES[speciesId] || SNAKE_SPECIES.EMERALD_BOA;
  const activeBiome = BIOMES[biomeId] || BIOMES.FOREST_MOSS;

  // Initialize snake spine & prey
  const initSimulation = useCallback(() => {
    const initialSegments: SpineSegment[] = [];
    const initialLength = 36;
    const startX = 450;
    const startY = 500;
    const initAngle = -Math.PI / 2;

    for (let i = 0; i < initialLength; i++) {
      initialSegments.push({
        x: startX,
        y: startY + i * SEGMENT_DISTANCE,
        angle: initAngle,
        radius: Math.max(4.5, 9.5 - (i / initialLength) * 5),
        naturalWidth: Math.max(4.5, 9.5 - (i / initialLength) * 5),
      });
    }

    setSpine(initialSegments);
    spineRef.current = initialSegments;
    headingRef.current = initAngle;
    targetHeadingRef.current = initAngle;
    setHeading(initAngle);
    pointerPosRef.current = { x: startX, y: startY - 150 };

    setBulges([]);
    bulgesRef.current = [];
    setParticles([]);
    particlesRef.current = [];
    setScore(0);
    setPreyCount(0);
    setStamina(100);
    staminaRef.current = 100;
    setIsSprinting(false);
    isSprintingRef.current = false;

    // Spawn initial prey
    const initialPrey: PreyEntity[] = [
      spawnSinglePrey('MOUSE', 300, 280),
      spawnSinglePrey('MOUSE', 620, 360),
      spawnSinglePrey('FROG', 420, 220),
      spawnSinglePrey('EGG', 560, 620),
      spawnSinglePrey('MOUSE', 240, 680),
    ];
    setPreyList(initialPrey);
    preyListRef.current = initialPrey;
  }, []);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isAIAutopilotRef.current = isAIAutopilot;
  }, [isAIAutopilot]);

  // Spawn single prey entity
  function spawnSinglePrey(type: 'MOUSE' | 'FROG' | 'EGG', posX?: number, posY?: number): PreyEntity {
    const x = posX ?? Math.random() * (ARENA_SIZE - 160) + 80;
    const y = posY ?? Math.random() * (ARENA_SIZE - 160) + 80;
    const angle = Math.random() * Math.PI * 2;

    return {
      id: Math.random().toString(36).substring(2, 9),
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      angle,
      speed: type === 'MOUSE' ? 65 : type === 'FROG' ? 40 : 0,
      radius: type === 'MOUSE' ? 9 : type === 'FROG' ? 10 : 8,
      wigglePhase: Math.random() * 10,
      points: type === 'MOUSE' ? 35 : type === 'FROG' ? 45 : 25,
      calories: type === 'MOUSE' ? 120 : type === 'FROG' ? 95 : 75,
    };
  }

  // Toggle Rivals
  const handleToggleRivals = () => {
    if (rivalsCount === 0) {
      // Spawn 1 rival (Eastern Diamondback or Black Mamba)
      const rivalSp = speciesId === 'DIAMONDBACK' ? SNAKE_SPECIES.BLACK_MAMBA : SNAKE_SPECIES.DIAMONDBACK;
      const initialSegments: SpineSegment[] = [];
      const rivalLen = 32;
      const rx = 250;
      const ry = 250;
      for (let i = 0; i < rivalLen; i++) {
        initialSegments.push({
          x: rx,
          y: ry + i * SEGMENT_DISTANCE,
          angle: 0,
          radius: Math.max(4.5, 9.0 - (i / rivalLen) * 4.8),
          naturalWidth: Math.max(4.5, 9.0 - (i / rivalLen) * 4.8),
        });
      }

      const newRival: RivalSerpent = {
        id: 'rival_1',
        species: rivalSp,
        spine: initialSegments,
        heading: 0,
        speed: 130,
        targetPreyId: null,
        bulges: [],
        tongueOut: 0,
      };

      setRivals([newRival]);
      rivalsRef.current = [newRival];
      setRivalsCount(1);
    } else {
      setRivals([]);
      rivalsRef.current = [];
      setRivalsCount(0);
    }
  };

  // Spawn blood/dirt particles
  const spawnImpactParticles = (x: number, y: number, color: string, count = 16) => {
    const newP: DirtParticle[] = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 5 + 1.5;
      newP.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        maxLife: Math.random() * 0.4 + 0.3,
        size: Math.random() * 4 + 2,
        color,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newP];
  };

  // Keyboard navigation & Sprint
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isSprintingRef.current = true;
        setIsSprinting(true);
      } else if (e.code === 'KeyP') {
        setIsPaused((p) => !p);
      } else if (e.code === 'KeyX') {
        // Toggle AI Autopilot shortcut
        setIsAIAutopilot((a) => !a);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        steerDirRef.current = -1;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        steerDirRef.current = 1;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSprintingRef.current = false;
        setIsSprinting(false);
      } else if (
        (e.code === 'ArrowLeft' || e.code === 'KeyA') &&
        steerDirRef.current === -1
      ) {
        steerDirRef.current = 0;
      } else if (
        (e.code === 'ArrowRight' || e.code === 'KeyD') &&
        steerDirRef.current === 1
      ) {
        steerDirRef.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main High-Performance Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let waveTime = 0;

    const loop = (currentTime: number) => {
      // Clamped delta-time for buttery smooth physics without jitter
      const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPausedRef.current && spineRef.current.length > 0) {
        // 1. Stamina & Sprint Logic
        let curSpeed = BASE_SPEED;
        if (isSprintingRef.current && staminaRef.current > 0) {
          curSpeed = SPRINT_SPEED;
          staminaRef.current = Math.max(0, staminaRef.current - dt * 28);
          setStamina(staminaRef.current);

          if (Math.random() < 0.05) {
            realisticSound.playHiss(1.2);
          }
          if (activeSpecies.hasRattle && currentTime - rattleTimerRef.current > 250) {
            rattleTimerRef.current = currentTime;
            realisticSound.playRattle();
          }
        } else {
          staminaRef.current = Math.min(100, staminaRef.current + dt * 14);
          setStamina(staminaRef.current);
          if (staminaRef.current <= 0) {
            isSprintingRef.current = false;
            setIsSprinting(false);
          }
        }
        setSpeed(curSpeed);

        if (currentTime - rustleTimerRef.current > 400 && curSpeed > 80) {
          rustleTimerRef.current = currentTime;
          if (Math.random() < 0.4) {
            realisticSound.playSlitherRustle();
          }
        }

        // 2. Head Steering (Manual vs AI Autopilot)
        const currentSpine = [...spineRef.current];
        const head = { ...currentSpine[0] };
        let curHeading = headingRef.current;

        if (isAIAutopilotRef.current && preyListRef.current.length > 0) {
          // --- APEX HUNTER AI AUTONOMOUS BRAIN ---
          // Evaluate closest and highest value prey with trajectory interception
          let chosenPrey: PreyEntity | null = null;
          let bestScore = -9999;
          let bestIntercept = { x: head.x, y: head.y };

          for (const prey of preyListRef.current) {
            const dx = prey.x - head.x;
            const dy = prey.y - head.y;
            const dist = Math.hypot(dx, dy);

            // Estimated time to intercept
            const t = dist / Math.max(1, curSpeed);
            const ix = prey.x + (prey.type === 'MOUSE' ? Math.cos(prey.angle) * prey.speed * t : 0);
            const iy = prey.y + (prey.type === 'MOUSE' ? Math.sin(prey.angle) * prey.speed * t : 0);

            const directAngle = Math.atan2(iy - head.y, ix - head.x);
            let angleDiff = Math.abs(directAngle - curHeading);
            while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            // Tactical heuristic score: proximity + forward alignment
            const tacticalScore = prey.calories * 10 - dist * 1.8 - angleDiff * 80;

            if (tacticalScore > bestScore) {
              bestScore = tacticalScore;
              chosenPrey = prey;
              bestIntercept = { x: ix, y: iy };
            }
          }

          if (chosenPrey) {
            const targetPrey: PreyEntity = chosenPrey;
            const desiredAngle = Math.atan2(bestIntercept.y - head.y, bestIntercept.x - head.x);
            targetHeadingRef.current = desiredAngle;

            const targetDist = Math.hypot(targetPrey.x - head.x, targetPrey.y - head.y);
            let angleDiff = Math.abs(desiredAngle - curHeading);
            while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            // AI Tactical Sprint Surge: Fire sprint when aligned within strike zone!
            if (angleDiff < 0.35 && targetDist < 140 && targetDist > 30 && staminaRef.current > 35) {
              isSprintingRef.current = true;
              setIsSprinting(true);
            } else if (targetDist > 160 || staminaRef.current < 15) {
              isSprintingRef.current = false;
              setIsSprinting(false);
            }

            // Calculate AI Telemetry
            const strikeProb = Math.max(
              15,
              Math.min(98, Math.round(100 - targetDist / 2.5 - angleDiff * 45))
            );
            setAITelemetry({
              targetPrey,
              interceptPoint: bestIntercept,
              strikeProbability: strikeProb,
              evasionDetected: targetPrey.type === 'MOUSE' && targetDist < 150,
              tacticalState: targetDist < 60 ? 'STRIKING' : targetDist < 150 ? 'STALKING' : 'SEARCHING',
            });
          }
        } else {
          // Manual Steering
          setAITelemetry(null);
          if (controlMode === 'POINTER') {
            const dx = pointerPosRef.current.x - head.x;
            const dy = pointerPosRef.current.y - head.y;
            const distToPointer = Math.hypot(dx, dy);

            if (distToPointer > 18) {
              targetHeadingRef.current = Math.atan2(dy, dx);
            }
          } else {
            if (steerDirRef.current !== 0) {
              targetHeadingRef.current += steerDirRef.current * dt * 4.2;
            }
          }
        }

        // Smooth angular turning rate
        let diff = targetHeadingRef.current - curHeading;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const maxTurnRate = isSprintingRef.current ? 4.4 : 5.6;
        curHeading += Math.max(-maxTurnRate * dt, Math.min(maxTurnRate * dt, diff * 6.8 * dt));
        headingRef.current = curHeading;
        setHeading(curHeading);

        // 3. Serpentine Lateral Wave Displacement
        waveTime += dt * (curSpeed / BASE_SPEED) * 8.5;
        const waveFreq = 0.28;
        const waveAmp = isSprintingRef.current ? 3.8 : 2.4;

        head.x += Math.cos(curHeading) * curSpeed * dt;
        head.y += Math.sin(curHeading) * curSpeed * dt;

        // Arena boundary soft containment
        const margin = 28;
        if (head.x < margin) {
          head.x = margin;
          targetHeadingRef.current = 0;
        } else if (head.x > ARENA_SIZE - margin) {
          head.x = ARENA_SIZE - margin;
          targetHeadingRef.current = Math.PI;
        }
        if (head.y < margin) {
          head.y = margin;
          targetHeadingRef.current = Math.PI / 2;
        } else if (head.y > ARENA_SIZE - margin) {
          head.y = ARENA_SIZE - margin;
          targetHeadingRef.current = -Math.PI / 2;
        }

        currentSpine[0] = head;

        // 4. Inverse Kinematics Spine Tracking
        for (let i = 1; i < currentSpine.length; i++) {
          const prev = currentSpine[i - 1];
          const curr = currentSpine[i];

          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.hypot(dx, dy);

          const segAngle = Math.atan2(-dy, -dx);
          curr.angle = segAngle;

          if (dist > 0) {
            const factor = SEGMENT_DISTANCE / dist;
            curr.x = prev.x + dx * factor;
            curr.y = prev.y + dy * factor;

            const lateralOffset = Math.sin(waveTime - i * waveFreq) * waveAmp;
            curr.x += -Math.sin(segAngle) * lateralOffset * dt * 40;
            curr.y += Math.cos(segAngle) * lateralOffset * dt * 40;
          }
        }
        spineRef.current = currentSpine;
        setSpine(currentSpine);

        // 5. Forked Tongue & Jaws Anticipation
        tongueTimerRef.current += dt;
        let tongueVal = 0;
        const tongueCycle = tongueTimerRef.current % 3.2;
        if (tongueCycle < 0.6) {
          tongueVal = Math.sin((tongueCycle / 0.6) * Math.PI);
        }

        let closestPreyDist = 9999;
        preyListRef.current.forEach((p) => {
          const d = Math.hypot(p.x - head.x, p.y - head.y);
          if (d < closestPreyDist) closestPreyDist = d;
        });

        if (closestPreyDist < 160 && tongueCycle > 1.2 && tongueCycle < 2.0) {
          tongueVal = Math.sin(((tongueCycle - 1.2) / 0.8) * Math.PI);
        }
        setTongueOut(tongueVal);

        const jawVal = closestPreyDist < 45 ? Math.max(0, 1 - closestPreyDist / 45) : 0;
        setJawsOpen(jawVal);

        // 6. Prey AI & Predation (Player + Rivals)
        const currentPrey = [...preyListRef.current];
        const survivingPrey: PreyEntity[] = [];

        currentPrey.forEach((prey) => {
          const distToSnakeHead = Math.hypot(prey.x - head.x, prey.y - head.y);

          // Player Strike!
          if (distToSnakeHead < 20 + prey.radius) {
            realisticSound.playStrike();
            realisticSound.playSwallow();
            if (prey.type === 'MOUSE') {
              realisticSound.playMouseSqueak();
            }

            spawnImpactParticles(prey.x, prey.y, prey.type === 'MOUSE' ? '#b45309' : '#16a34a', 18);

            const newBulge: DigestiveBulge = {
              id: Math.random().toString(36),
              segmentIndex: 3,
              maxBulge: prey.type === 'MOUSE' ? 6 : prey.type === 'FROG' ? 7.5 : 5,
              progress: 0,
              preyName: prey.type,
            };
            bulgesRef.current = [...bulgesRef.current, newBulge];
            setBulges(bulgesRef.current);

            setScore((s) => s + prey.calories);
            setPreyCount((c) => c + 1);

            const currentLenMeters = currentSpine.length * 0.052;
            if (currentLenMeters > recordLengthMeters) {
              setRecordLengthMeters(currentLenMeters);
              try {
                localStorage.setItem('realistic_snake_record_len', currentLenMeters.toFixed(2));
              } catch {
                // ignore
              }
            }

            const types: ('MOUSE' | 'FROG' | 'EGG')[] = ['MOUSE', 'FROG', 'EGG', 'MOUSE'];
            const randType = types[Math.floor(Math.random() * types.length)];
            survivingPrey.push(spawnSinglePrey(randType));
            return;
          }

          // Check if any Rival serpent ate this prey
          let eatenByRival = false;
          rivalsRef.current.forEach((rival) => {
            const rh = rival.spine[0];
            if (rh && Math.hypot(prey.x - rh.x, prey.y - rh.y) < 20 + prey.radius) {
              eatenByRival = true;
              realisticSound.playStrike();
              spawnImpactParticles(prey.x, prey.y, '#b45309', 14);
              rival.bulges.push({
                id: Math.random().toString(36),
                segmentIndex: 3,
                maxBulge: 6,
                progress: 0,
                preyName: prey.type,
              });
            }
          });

          if (eatenByRival) {
            const types: ('MOUSE' | 'FROG' | 'EGG')[] = ['MOUSE', 'FROG', 'EGG'];
            survivingPrey.push(spawnSinglePrey(types[Math.floor(Math.random() * types.length)]));
            return;
          }

          // Prey AI movement
          if (prey.type === 'MOUSE') {
            prey.wigglePhase += dt * 12;

            if (distToSnakeHead < 150) {
              const fleeAngle = Math.atan2(prey.y - head.y, prey.x - head.x);
              prey.angle = fleeAngle;
              prey.x += Math.cos(fleeAngle) * 155 * dt;
              prey.y += Math.sin(fleeAngle) * 155 * dt;
            } else {
              prey.x += Math.cos(prey.angle) * prey.speed * dt;
              prey.y += Math.sin(prey.angle) * prey.speed * dt;
              if (Math.random() < 0.03) {
                prey.angle += (Math.random() - 0.5) * 1.8;
              }
            }
          } else if (prey.type === 'FROG') {
            prey.wigglePhase += dt * 3;
            if (Math.random() < 0.015) {
              prey.angle += (Math.random() - 0.5) * 2;
              prey.x += Math.cos(prey.angle) * 35;
              prey.y += Math.sin(prey.angle) * 35;
            }
          }

          prey.x = Math.max(40, Math.min(ARENA_SIZE - 40, prey.x));
          prey.y = Math.max(40, Math.min(ARENA_SIZE - 40, prey.y));

          survivingPrey.push(prey);
        });

        preyListRef.current = survivingPrey;
        setPreyList(survivingPrey);

        // 7. Advance Digestive Bulges Down the Body
        if (bulgesRef.current.length > 0) {
          const updatedBulges: DigestiveBulge[] = [];
          bulgesRef.current.forEach((b) => {
            b.progress += dt * 0.06;
            const targetSeg = Math.floor(3 + b.progress * (currentSpine.length - 8));
            b.segmentIndex = targetSeg;

            if (b.progress < 1 && targetSeg < currentSpine.length - 4) {
              updatedBulges.push(b);
            } else {
              const tail = currentSpine[currentSpine.length - 1];
              const prevTail = currentSpine[currentSpine.length - 2] || tail;
              const angle = Math.atan2(tail.y - prevTail.y, tail.x - prevTail.x);

              for (let k = 1; k <= 2; k++) {
                currentSpine.push({
                  x: tail.x + Math.cos(angle) * SEGMENT_DISTANCE * k,
                  y: tail.y + Math.sin(angle) * SEGMENT_DISTANCE * k,
                  angle,
                  radius: Math.max(3, tail.radius * 0.9),
                  naturalWidth: Math.max(3, tail.radius * 0.9),
                });
              }
              spineRef.current = currentSpine;
            }
          });
          bulgesRef.current = updatedBulges;
          setBulges(updatedBulges);
        }

        // 8. Update Rival AI Serpents
        if (rivalsRef.current.length > 0) {
          const updatedRivals = rivalsRef.current.map((rival) => {
            const rHead = { ...rival.spine[0] };
            let rHeading = rival.heading;

            // Target nearest prey
            let closestP: PreyEntity | null = null;
            let minDist = 9999;
            survivingPrey.forEach((p) => {
              const d = Math.hypot(p.x - rHead.x, p.y - rHead.y);
              if (d < minDist) {
                minDist = d;
                closestP = p;
              }
            });

            if (closestP) {
              const targetA = Math.atan2((closestP as PreyEntity).y - rHead.y, (closestP as PreyEntity).x - rHead.x);
              let aDiff = targetA - rHeading;
              while (aDiff < -Math.PI) aDiff += Math.PI * 2;
              while (aDiff > Math.PI) aDiff -= Math.PI * 2;
              rHeading += Math.max(-4.5 * dt, Math.min(4.5 * dt, aDiff * 5.5 * dt));
            }

            rHead.x += Math.cos(rHeading) * rival.speed * dt;
            rHead.y += Math.sin(rHeading) * rival.speed * dt;

            // Contain in arena
            rHead.x = Math.max(35, Math.min(ARENA_SIZE - 35, rHead.x));
            rHead.y = Math.max(35, Math.min(ARENA_SIZE - 35, rHead.y));

            const rSpine = [...rival.spine];
            rSpine[0] = rHead;

            for (let i = 1; i < rSpine.length; i++) {
              const prev = rSpine[i - 1];
              const curr = rSpine[i];
              const dx = curr.x - prev.x;
              const dy = curr.y - prev.y;
              const d = Math.hypot(dx, dy);
              curr.angle = Math.atan2(-dy, -dx);
              if (d > 0) {
                const fac = SEGMENT_DISTANCE / d;
                curr.x = prev.x + dx * fac;
                curr.y = prev.y + dy * fac;
              }
            }

            return {
              ...rival,
              heading: rHeading,
              spine: rSpine,
              tongueOut: Math.random() < 0.05 ? 1 : 0,
            };
          });

          rivalsRef.current = updatedRivals;
          setRivals(updatedRivals);
        }

        // 9. Update Particles
        if (particlesRef.current.length > 0) {
          particlesRef.current = particlesRef.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life - dt,
            }))
            .filter((p) => p.life > 0);
          setParticles(particlesRef.current);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeSpecies, controlMode, recordLengthMeters]);

  const handlePointerMove = (x: number, y: number) => {
    pointerPosRef.current = { x, y };
  };

  const handlePointerDown = (x: number, y: number) => {
    pointerPosRef.current = { x, y };
  };

  const handleSteerLeft = () => {
    targetHeadingRef.current -= 0.6;
  };

  const handleSteerRight = () => {
    targetHeadingRef.current += 0.6;
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentLengthMeters = spine.length * 0.052;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between selection:bg-emerald-500/30 selection:text-emerald-200"
    >
      {/* Top Bar Contract */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeSpecies.baseColor }}
            />
            <span className="font-extrabold tracking-tight text-white text-base sm:text-lg whitespace-nowrap">
              Realistic Snake Simulator
            </span>
          </div>

          {/* Zone 2: Species Nav Quick-Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            {Object.values(SNAKE_SPECIES).map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSpeciesId(sp.id)}
                className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
                  speciesId === sp.id ? 'text-emerald-400 font-bold' : ''
                }`}
              >
                {sp.commonName}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowGeminiModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Gemini AI Herpetologist Insights"
            >
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>AI Insights</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              title="Serpent Guide"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Simulation Stage */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-4xl mx-auto gap-4">
        {/* HUD */}
        <RealisticHUD
          species={activeSpecies}
          biome={activeBiome}
          score={score}
          preyCount={preyCount}
          lengthMeters={currentLengthMeters}
          recordLengthMeters={recordLengthMeters}
          stamina={stamina}
          isSprinting={isSprinting}
          isMuted={isMuted}
          isAIAutopilot={isAIAutopilot}
          rivalsCount={rivalsCount}
          bulges={bulges}
          onToggleMute={() => {
            const m = realisticSound.toggleMute();
            setIsMuted(m);
          }}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleAIAutopilot={() => setIsAIAutopilot((a) => !a)}
          onToggleRivals={handleToggleRivals}
          onOpenSpeciesModal={() => setIsSpeciesModalOpen(true)}
          onOpenGeminiModal={() => setShowGeminiModal(true)}
        />

        {/* Playfield Viewport */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-4xl">
          <RealisticSnakeCanvas
            species={activeSpecies}
            biome={activeBiome}
            spine={spine}
            heading={heading}
            speed={speed}
            maxSpeed={SPRINT_SPEED}
            tongueOut={tongueOut}
            jawsOpen={jawsOpen}
            bulges={bulges}
            preyList={preyList}
            rivals={rivals}
            particles={particles}
            aiTelemetry={aiTelemetry}
            isAIAutopilot={isAIAutopilot}
            isPaused={isPaused}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
          />

          {/* Controls Card */}
          <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
            <RealisticControls
              controlMode={controlMode}
              isPaused={isPaused}
              isSprinting={isSprinting}
              stamina={stamina}
              onTogglePause={() => setIsPaused((p) => !p)}
              onReset={initSimulation}
              onSetControlMode={setControlMode}
              onStartSprint={() => {
                isSprintingRef.current = true;
                setIsSprinting(true);
              }}
              onStopSprint={() => {
                isSprintingRef.current = false;
                setIsSprinting(false);
              }}
              onSteerLeft={handleSteerLeft}
              onSteerRight={handleSteerRight}
            />

            {/* AI Autopilot Quick Indicator */}
            {isAIAutopilot && aiTelemetry && (
              <div className="w-full max-w-[340px] bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5 text-[11px] text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Apex Hunter AI Engaged</span>
                </span>
                <span className="font-mono-numbers text-white">
                  LOCK: {Math.round(aiTelemetry.strikeProbability)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        <span>Realistic Serpent Kinematics & Scale Shading</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>Gemini 3.8 Flash AI Herpetology Engine</span>
      </footer>

      {/* Species & Biome Modal */}
      {isSpeciesModalOpen && (
        <SpeciesSelectorModal
          currentSpecies={speciesId}
          currentBiome={biomeId}
          onSelectSpecies={(id) => setSpeciesId(id)}
          onSelectBiome={(id) => setBiomeId(id)}
          onClose={() => setIsSpeciesModalOpen(false)}
        />
      )}

      {/* Gemini AI Herpetologist Modal */}
      {showGeminiModal && (
        <GeminiInsightModal
          species={activeSpecies}
          biome={activeBiome}
          lengthMeters={currentLengthMeters}
          preyCount={preyCount}
          calories={score}
          digestiveCount={bulges.length}
          onClose={() => setShowGeminiModal(false)}
        />
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Serpent Simulator & AI Features</h3>
            <div className="text-xs text-slate-300 space-y-3 mb-6">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>Apex Hunter AI (Autopilot)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Toggle on AI Autopilot to watch the serpent autonomously stalk and calculate strike trajectories with dynamic target lock! Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">X</kbd> anytime.
                </p>

                <div className="text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                  <Swords className="w-4 h-4" />
                  <span>Territorial Rival Serpents</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Spawn competitor AI snakes that hunt and claim live prey in your territory in real time.
                </p>

                <div className="text-sky-400 font-semibold flex items-center gap-1.5 pt-1">
                  <Brain className="w-4 h-4" />
                  <span>Gemini AI Herpetology Engine</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Click 'AI Insights' to have Gemini analyze your serpent's metabolic performance, peristalsis efficiency, and predation tactics.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors cursor-pointer font-bold"
            >
              Continue Hunting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

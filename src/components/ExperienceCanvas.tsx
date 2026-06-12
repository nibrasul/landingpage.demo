"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { drawCardFront, drawCardBack, drawNFCCore } from "@/utils/cardCanvas";
import { drawProfileScreen } from "@/utils/profileCanvas";

export interface CardState {
  cameraZ: number;
  cameraY: number;
  cameraX: number;

  scale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  positionY: number;
  positionZ: number;

  // Chapter 2: Tech Inside
  splitProgress: number; // 0 to 1
  nfcZoom: number; // 0 to 1
  antennaGlow: number; // 0 to 1
  scanProgress: number; // 0 to 1 (vertical laser line scan)
  illuminateStage: number; // 0 to 4

  // Chapter 3: Showcase
  showcaseProgress: number; // 0 to 1

  // Chapter 5: Profile Phone
  phoneVisible: number; // 0 to 1
  phoneScrollProgress: number; // 0 to 5

  // Chapter 6: Industries
  industryProgress: number; // 0 to 1
  industryIndex: number;

  // Chapter 7: Pricing
  pricingIndex: number; // 1: PVC, 2: Metal, 3: Teams
  pricingProgress: number; // 0 to 1

  // Chapter 8: Comparison
  comparisonProgress: number; // 0 to 1 (paper crumples, TapFolio card appears)

  // Chapter 9: Card Configurator
  configuratorActive: number; // 0 or 1

  // Chapter 11: Stats
  statsProgress: number; // 0 to 1

  // Chapter 12: Finale
  finaleProgress: number; // 0 to 1
}

interface CanvasProps {
  cardState: React.MutableRefObject<CardState>;
  config: {
    name: string;
    role: string;
    company: string;
    color: string;
    material: "pvc" | "metal";
    finish: "glossy" | "matte" | "brushed";
    logoUrl: string | null;
  };
}

// Subcomponent to gain access to Three.js render loops (useFrame)
function SceneContent({ cardState, config }: CanvasProps) {
  const { camera } = useThree();
  const cardGroupRef = useRef<THREE.Group>(null);
  
  // 4-Layer separate meshes
  const frontMeshRef = useRef<THREE.Mesh>(null);
  const antennaMeshRef = useRef<THREE.Mesh>(null);
  const chipMeshRef = useRef<THREE.Mesh>(null);
  const backMeshRef = useRef<THREE.Mesh>(null);

  // Phone ref
  const phoneRef = useRef<THREE.Group>(null);
  const phoneScreenRef = useRef<THREE.Mesh>(null);

  // Showcase elements
  const showcaseGroupRef = useRef<THREE.Group>(null);
  const pvcShowcaseCardRef = useRef<THREE.Mesh>(null);
  const metalShowcaseCardRef = useRef<THREE.Mesh>(null);
  const teamShowcaseGroupRef = useRef<THREE.Group>(null);

  // Pricing Elements
  const pricingGroupRef = useRef<THREE.Group>(null);
  const pricingPvcRef = useRef<THREE.Mesh>(null);
  const pricingMetalRef = useRef<THREE.Mesh>(null);
  const pricingTeamGroupRef = useRef<THREE.Group>(null);

  // Comparison elements
  const comparisonGroupRef = useRef<THREE.Group>(null);
  const paperMeshRef = useRef<THREE.Mesh>(null);
  const comparisonCardRef = useRef<THREE.Mesh>(null);

  // Finale galaxy group
  const galaxyGroupRef = useRef<THREE.Group>(null);
  const galaxyRefs = useRef<THREE.Mesh[]>([]);

  // Laser scanner visual plane
  const laserRef = useRef<THREE.Mesh>(null);

  // Load custom logo
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (config.logoUrl) {
      const img = new Image();
      img.src = config.logoUrl;
      img.onload = () => setLogoImg(img);
    } else {
      setLogoImg(null);
    }
  }, [config.logoUrl]);

  // Load avatar and project placeholder images
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);
  const [projectImg, setProjectImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const aImg = new Image();
    aImg.src = "/avatar.png";
    aImg.onload = () => setAvatarImg(aImg);

    const pImg = new Image();
    pImg.src = "/project.png";
    pImg.onload = () => setProjectImg(pImg);
  }, []);

  // Create canvas texture elements
  const canvases = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      front: document.createElement("canvas"),
      back: document.createElement("canvas"),
      core: document.createElement("canvas"),
      phone: document.createElement("canvas"),
    };
  }, []);

  // Set Canvas Dimensions
  useEffect(() => {
    if (!canvases) return;
    canvases.front.width = 1024;
    canvases.front.height = 646;
    canvases.back.width = 1024;
    canvases.back.height = 646;
    canvases.core.width = 1024;
    canvases.core.height = 646;
    canvases.phone.width = 512;
    canvases.phone.height = 1024;
  }, [canvases]);

  // Create Canvas Textures
  const textures = useMemo(() => {
    if (!canvases) return null;
    return {
      front: new THREE.CanvasTexture(canvases.front),
      back: new THREE.CanvasTexture(canvases.back),
      core: new THREE.CanvasTexture(canvases.core),
      phone: new THREE.CanvasTexture(canvases.phone),
    };
  }, [canvases]);

  // Redraw textures on config update
  useEffect(() => {
    if (!canvases || !textures) return;
    drawCardFront(
      canvases.front,
      config.name,
      config.role,
      config.company,
      config.color,
      config.material,
      config.finish,
      logoImg
    );
    textures.front.needsUpdate = true;
  }, [canvases, textures, config, logoImg]);

  useEffect(() => {
    if (!canvases || !textures) return;
    drawCardBack(
      canvases.back,
      config.color,
      config.material,
      config.finish,
      config.name
    );
    textures.back.needsUpdate = true;
  }, [canvases, textures, config]);

  // Handle Antenna Glow
  const lastGlow = useRef(-1);
  const updateNFCTexture = (glow: number) => {
    if (!canvases || !textures) return;
    if (Math.abs(glow - lastGlow.current) < 0.05) return;
    lastGlow.current = glow;
    drawNFCCore(canvases.core, glow);
    textures.core.needsUpdate = true;
  };

  // Handle Phone screen draw
  const lastPhoneScroll = useRef(-1);
  const updatePhoneTexture = (scrollProgress: number) => {
    if (!canvases || !textures) return;
    const scrollY = scrollProgress * 1200;
    if (Math.abs(scrollY - lastPhoneScroll.current) < 1) return;
    lastPhoneScroll.current = scrollY;
    drawProfileScreen(
      canvases.phone,
      scrollY,
      config.name,
      config.role,
      config.company,
      config.color,
      avatarImg,
      projectImg
    );
    textures.phone.needsUpdate = true;
  };

  // Generate Finale galaxy cards
  const galaxyCards = useMemo(() => {
    const cards = [];
    for (let i = 0; i < 15; i++) {
      cards.push({
        id: i,
        angle: (i / 15) * Math.PI * 2 + Math.random() * 0.3,
        radius: 4.5 + Math.random() * 2.5,
        yOffset: (Math.random() - 0.5) * 3,
        rotSpeedX: 0.2 + Math.random() * 0.5,
        rotSpeedY: 0.1 + Math.random() * 0.4,
        color: i % 3 === 0 ? "#111111" : i % 3 === 1 ? "#2563EB" : "#f5f5f7",
        material: i % 2 === 0 ? "pvc" : "metal",
      });
    }
    return cards;
  }, []);

  // Frame Render Loop
  useFrame((state) => {
    const progress = cardState.current;
    const time = state.clock.getElapsedTime();

    // 1. Eased Camera Position System (Locks to Z parameters per chapter)
    const targetZ = progress.cameraZ;
    const targetY = progress.cameraY;
    const targetX = progress.cameraX;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);

    // 2. Main Card Floating and Transforms
    let floatX = 0;
    let floatY = 0;
    let floatRotZ = 0;
    if (progress.configuratorActive === 0) {
      floatY = Math.sin(time * 1.2) * 0.05;
      floatX = Math.cos(time * 0.7) * 0.03;
      floatRotZ = Math.sin(time * 0.8) * 0.01;
    }

    if (cardGroupRef.current && progress.configuratorActive === 0) {
      cardGroupRef.current.position.x = THREE.MathUtils.lerp(cardGroupRef.current.position.x, progress.positionX + floatX, 0.1);
      cardGroupRef.current.position.y = THREE.MathUtils.lerp(cardGroupRef.current.position.y, progress.positionY + floatY, 0.1);
      cardGroupRef.current.position.z = THREE.MathUtils.lerp(cardGroupRef.current.position.z, progress.positionZ, 0.1);

      cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(cardGroupRef.current.rotation.x, progress.rotationX, 0.1);
      cardGroupRef.current.rotation.y = THREE.MathUtils.lerp(cardGroupRef.current.rotation.y, progress.rotationY, 0.1);
      cardGroupRef.current.rotation.z = THREE.MathUtils.lerp(cardGroupRef.current.rotation.z, progress.rotationZ + floatRotZ, 0.1);

      cardGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(cardGroupRef.current.scale.x, progress.scale, 0.1));
    }

    // 3. Chapter 2: Card Layer Separation & Materials Glow (Tech teardown)
    if (frontMeshRef.current && backMeshRef.current && antennaMeshRef.current && chipMeshRef.current) {
      const separation = progress.splitProgress * 0.8; // 80px equivalent separation

      // Displace layers along Z axis
      frontMeshRef.current.position.z = 0.02 + separation * 1.5;
      antennaMeshRef.current.position.z = 0.0 + separation * 0.5;
      chipMeshRef.current.position.z = -0.005;
      backMeshRef.current.position.z = -0.02 - separation * 1.5;

      // Animate PVC transparencies for X-ray effect
      const pMatFront = frontMeshRef.current.material as THREE.MeshStandardMaterial;
      const pMatBack = backMeshRef.current.material as THREE.MeshStandardMaterial;

      if (progress.splitProgress > 0.01 || progress.scanProgress > 0.01) {
        // Drop PVC layer opacity to 0.15 for translucent shell look
        pMatFront.transparent = true;
        pMatBack.transparent = true;
        pMatFront.opacity = THREE.MathUtils.lerp(pMatFront.opacity, 0.15, 0.1);
        pMatBack.opacity = THREE.MathUtils.lerp(pMatBack.opacity, 0.15, 0.1);
      } else {
        // Reset full opacity
        pMatFront.opacity = THREE.MathUtils.lerp(pMatFront.opacity, 1.0, 0.1);
        pMatBack.opacity = THREE.MathUtils.lerp(pMatBack.opacity, 1.0, 0.1);
        if (pMatFront.opacity > 0.99) {
          pMatFront.transparent = false;
          pMatBack.transparent = false;
        }
      }

      // Sync glowing induction loops
      updateNFCTexture(progress.antennaGlow);
    }

    // 4. Laser Scanning Line Visualizer
    if (laserRef.current) {
      const scan = progress.scanProgress;
      laserRef.current.visible = scan > 0.01 && scan < 0.99;
      if (scan > 0.01) {
        // Slide laser scanner plane vertically from top (1.06) to bottom (-1.06)
        const verticalPos = (0.5 - scan) * 2.125 * 1.2;
        laserRef.current.position.y = verticalPos;
        
        // Emits glowing light pulses based on laser position
        const laserPulse = Math.sin(time * 25.0) * 0.1 + 0.9;
        const mat = laserRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = laserPulse;
      }
    }

    // 5. Phone Animations
    if (phoneRef.current) {
      const targetPhoneY = progress.phoneVisible > 0 ? -0.4 : -8;
      phoneRef.current.position.y = THREE.MathUtils.lerp(phoneRef.current.position.y, targetPhoneY, 0.08);
      phoneRef.current.position.z = THREE.MathUtils.lerp(phoneRef.current.position.z, progress.phoneVisible > 0 ? 1.0 : -4.0, 0.08);

      phoneRef.current.rotation.y = Math.sin(time * 0.8) * 0.04;
      phoneRef.current.rotation.x = -0.1 + Math.cos(time * 0.6) * 0.02;

      if (progress.phoneVisible > 0) {
        updatePhoneTexture(progress.phoneScrollProgress);
      }
    }

    // 6. Chapter 3: Product Showcase Group
    if (showcaseGroupRef.current) {
      const isShowcase = progress.showcaseProgress > 0 && progress.pricingProgress === 0 && progress.comparisonProgress === 0 && progress.finaleProgress === 0;
      showcaseGroupRef.current.position.y = THREE.MathUtils.lerp(showcaseGroupRef.current.position.y, isShowcase ? 0 : 8, 0.08);
      showcaseGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(showcaseGroupRef.current.scale.x, isShowcase ? 1 : 0.01, 0.08));

      if (isShowcase) {
        if (pvcShowcaseCardRef.current) {
          pvcShowcaseCardRef.current.rotation.y = time * 0.4;
          pvcShowcaseCardRef.current.rotation.x = Math.sin(time * 0.6) * 0.08;
        }
        if (metalShowcaseCardRef.current) {
          const depth = -4.0 + progress.showcaseProgress * 4.0;
          metalShowcaseCardRef.current.position.z = THREE.MathUtils.lerp(metalShowcaseCardRef.current.position.z, depth, 0.05);
          metalShowcaseCardRef.current.rotation.y = -0.3 + Math.sin(time * 0.5) * 0.04;
        }
        if (teamShowcaseGroupRef.current) {
          teamShowcaseGroupRef.current.rotation.y = time * 0.3;
          teamShowcaseGroupRef.current.children.forEach((child, idx) => {
            child.rotation.y = -time * 0.3 + (idx * Math.PI / 2);
          });
        }
      }
    }

    // 7. Chapter 7: Pricing visual representations
    if (pricingGroupRef.current) {
      const isPricing = progress.pricingProgress > 0;
      pricingGroupRef.current.position.y = THREE.MathUtils.lerp(pricingGroupRef.current.position.y, isPricing ? 0 : 8, 0.08);
      pricingGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(pricingGroupRef.current.scale.x, isPricing ? 1 : 0.01, 0.08));

      if (isPricing) {
        const index = progress.pricingIndex;
        // PVC Card (Floats normally)
        if (pricingPvcRef.current) {
          pricingPvcRef.current.position.y = Math.sin(time * 1.5) * 0.15;
          pricingPvcRef.current.rotation.y = time * 0.5;
          pricingPvcRef.current.scale.setScalar(THREE.MathUtils.lerp(pricingPvcRef.current.scale.x, index === 1 ? 1.3 : 0.8, 0.1));
        }
        // Metal Card (Reflects light)
        if (pricingMetalRef.current) {
          pricingMetalRef.current.rotation.y = Math.PI / 4 + Math.sin(time * 0.8) * 0.3;
          // Rotate normal light values slowly to draw brushed reflections
          pricingMetalRef.current.scale.setScalar(THREE.MathUtils.lerp(pricingMetalRef.current.scale.x, index === 2 ? 1.3 : 0.8, 0.1));
        }
        // Team cards (Orbit together)
        if (pricingTeamGroupRef.current) {
          pricingTeamGroupRef.current.rotation.y = time * 0.6;
          pricingTeamGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(pricingTeamGroupRef.current.scale.x, index === 3 ? 1.3 : 0.8, 0.1));
          pricingTeamGroupRef.current.children.forEach((card, i) => {
            card.position.y = Math.sin(time * 1.8 + i * 2.0) * 0.1;
          });
        }
      }
    }

    // 8. Chapter 8: Comparison Paper crumple deformation
    if (comparisonGroupRef.current) {
      const isComp = progress.comparisonProgress > 0;
      comparisonGroupRef.current.position.y = THREE.MathUtils.lerp(comparisonGroupRef.current.position.y, isComp ? 0 : -8, 0.08);

      if (isComp && paperMeshRef.current && comparisonCardRef.current) {
        const comp = progress.comparisonProgress; // 0 to 1
        
        // 1. Paper card crumples, folds, collapses
        paperMeshRef.current.position.x = -2.2 + comp * 1.5;
        paperMeshRef.current.position.y = -comp * 0.4;
        paperMeshRef.current.scale.setScalar(Math.max(0.001, 1 - comp));
        paperMeshRef.current.rotation.x = comp * 4.0;
        paperMeshRef.current.rotation.y = comp * 2.5;

        // Custom vertex distortion of paper mesh coordinates
        const pos = paperMeshRef.current.geometry.attributes.position;
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            const zVal = Math.sin(i * 0.4 + comp * 12.0) * comp * 0.16;
            pos.setZ(i, zVal);
          }
          pos.needsUpdate = true;
        }

        // 2. TapFolio card appears, rotates, glows
        comparisonCardRef.current.position.x = 2.0 - (1 - comp) * 1.5;
        comparisonCardRef.current.scale.setScalar(0.2 + comp * 0.95);
        comparisonCardRef.current.rotation.y = comp * Math.PI * 2 + time * 0.2;
        
        const cardMat = comparisonCardRef.current.material as THREE.MeshStandardMaterial;
        cardMat.emissiveIntensity = comp * 0.4;
      }
    }

    // 9. Chapter 12: Finale galaxy orbits and disappearing act
    if (galaxyGroupRef.current) {
      const isFinale = progress.finaleProgress > 0;
      galaxyGroupRef.current.visible = isFinale;

      if (isFinale) {
        const mergeFactor = progress.finaleProgress; // 0 to 1

        galaxyRefs.current.forEach((ref, idx) => {
          if (!ref) return;
          const cardData = galaxyCards[idx];

          const currentAngle = cardData.angle + time * 0.25 * cardData.rotSpeedY;
          
          // Outer orbit translates upwards
          const floatUpY = time * 0.3; 
          
          // Collapse to single central card coordinate
          const targetR = THREE.MathUtils.lerp(cardData.radius, 0.0, mergeFactor);
          const targetY = THREE.MathUtils.lerp(cardData.yOffset + floatUpY, floatY, mergeFactor);
          const targetZ = THREE.MathUtils.lerp(0.0, floatX, mergeFactor);

          const px = Math.cos(currentAngle) * targetR;
          const pz = Math.sin(currentAngle) * targetR + targetZ;

          ref.position.x = THREE.MathUtils.lerp(ref.position.x, px, 0.1);
          ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetY, 0.1);
          ref.position.z = THREE.MathUtils.lerp(ref.position.z, pz, 0.1);

          ref.rotation.x = THREE.MathUtils.lerp(ref.rotation.x, cardData.rotSpeedX * time, mergeFactor);
          ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, currentAngle, mergeFactor);
          ref.rotation.z = THREE.MathUtils.lerp(ref.rotation.z, 0.0, mergeFactor);

          // Disappear: cards scale down to 0 at the end of merge transition
          const scale = THREE.MathUtils.lerp(0.8, 0.0, Math.max(0, (mergeFactor - 0.7) / 0.3));
          ref.scale.setScalar(scale);
        });

        // Main card rotation in final stage
        if (cardGroupRef.current && mergeFactor > 0.8) {
          // Everything fades, card rotating slowly in center
          cardGroupRef.current.rotation.y = time * 0.4;
          // Scale card down slightly to become logo
          const logoScale = THREE.MathUtils.lerp(progress.scale, 0.0, Math.max(0, (mergeFactor - 0.9) / 0.1));
          cardGroupRef.current.scale.setScalar(logoScale);
        }
      }
    }
  });

  return (
    <>
      {/* Premium Studio Lighting setup */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.7} color="#dbeafe" />
      <spotLight
        position={[0, 8, 4]}
        angle={Math.PI / 6}
        penumbra={1}
        intensity={2.8}
        color="#ffffff"
        castShadow
      />

      {/* Background Floating Dust Particles */}
      <Sparkles
        count={200}
        scale={10}
        size={1.3}
        speed={0.3}
        color={config.color === "#ffffff" ? "#000000" : "#2563EB"}
        opacity={0.3}
      />

      {/* Orbit Controls for configurator section */}
      {cardState.current.configuratorActive === 1 && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      )}

      {/* Laser plane scanner bar */}
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]} visible={false}>
        <planeGeometry args={[3.5, 0.06]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Main Procedural 4-Layer Card Mesh */}
      <group ref={cardGroupRef}>
        {/* Front PVC Layer */}
        {textures && (
          <mesh ref={frontMeshRef} castShadow>
            <boxGeometry args={[3.37, 2.125, 0.015]} />
            <meshStandardMaterial
              map={textures.front}
              roughness={config.finish === "glossy" ? 0.08 : config.finish === "matte" ? 0.8 : 0.35}
              metalness={config.material === "metal" ? 0.85 : 0.05}
              transparent
              opacity={1}
            />
          </mesh>
        )}

        {/* Internal Copper Antenna Core */}
        {textures && (
          <mesh ref={antennaMeshRef}>
            <boxGeometry args={[3.35, 2.1, 0.008]} />
            <meshStandardMaterial
              transparent
              opacity={0.9}
              color="#0d0d0f"
              roughness={0.2}
              emissive={new THREE.Color(212/255, 175/255, 55/255)}
              emissiveIntensity={cardState.current.antennaGlow * 1.5}
              map={textures.core}
            />
          </mesh>
        )}

        {/* Silicon Microchip mesh */}
        <mesh ref={chipMeshRef} position={[0, 0, -0.005]}>
          <boxGeometry args={[0.2, 0.2, 0.012]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Back PVC Layer */}
        {textures && (
          <mesh ref={backMeshRef} castShadow>
            <boxGeometry args={[3.37, 2.125, 0.015]} />
            <meshStandardMaterial
              map={textures.back}
              roughness={config.finish === "glossy" ? 0.08 : config.finish === "matte" ? 0.8 : 0.35}
              metalness={config.material === "metal" ? 0.85 : 0.05}
              transparent
              opacity={1}
            />
          </mesh>
        )}
      </group>

      {/* Phone Model */}
      <group ref={phoneRef} position={[0, -8, -4]}>
        <mesh castShadow>
          <boxGeometry args={[2.3, 4.5, 0.12]} />
          <meshStandardMaterial color="#1f1f24" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.065]}>
          <boxGeometry args={[2.34, 4.54, 0.02]} />
          <meshStandardMaterial color="#000" metalness={0.1} roughness={0.9} />
        </mesh>
        {textures && (
          <mesh ref={phoneScreenRef} position={[0, 0, 0.062]}>
            <planeGeometry args={[2.18, 4.38]} />
            <meshStandardMaterial
              map={textures.phone}
              roughness={0.05}
              metalness={0}
            />
          </mesh>
        )}
      </group>

      {/* Chapter 3 Showcase Group */}
      {textures && (
        <group ref={showcaseGroupRef} position={[0, 8, 0]}>
          {/* Showcase PVC Card */}
          <mesh ref={pvcShowcaseCardRef} position={[-2.6, 0.8, -2]} rotation={[0.2, 0.4, 0]}>
            <boxGeometry args={[3.0, 1.9, 0.03]} />
            <meshStandardMaterial map={textures.front} roughness={0.5} metalness={0.0} />
          </mesh>

          {/* Showcase Metal Card */}
          <mesh ref={metalShowcaseCardRef} position={[2.6, -0.6, -4]} rotation={[-0.1, -0.4, 0.1]}>
            <boxGeometry args={[3.0, 1.9, 0.03]} />
            <meshStandardMaterial map={textures.front} roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Showcase Teams orbit layouts */}
          <group ref={teamShowcaseGroupRef} position={[0, -1.8, -2.5]}>
            <mesh position={[-1.2, 0, 0]}>
              <boxGeometry args={[1.5, 0.95, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} metalness={0.1} color="#ff3b30" />
            </mesh>
            <mesh position={[1.2, 0, 0]}>
              <boxGeometry args={[1.5, 0.95, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} metalness={0.1} color="#34c759" />
            </mesh>
            <mesh position={[0, 0, -1.2]}>
              <boxGeometry args={[1.5, 0.95, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} metalness={0.1} color="#2563eb" />
            </mesh>
            <mesh position={[0, 0, 1.2]}>
              <boxGeometry args={[1.5, 0.95, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} metalness={0.1} color="#ffcc00" />
            </mesh>
          </group>
        </group>
      )}

      {/* Chapter 7 Pricing Group */}
      {textures && (
        <group ref={pricingGroupRef} position={[0, 8, 0]}>
          {/* PVC Tier Card */}
          <mesh ref={pricingPvcRef} position={[-2.8, 0.5, -2]}>
            <boxGeometry args={[2.5, 1.58, 0.02]} />
            <meshStandardMaterial map={textures.front} roughness={0.65} metalness={0.0} />
          </mesh>

          {/* Metal Tier Card */}
          <mesh ref={pricingMetalRef} position={[0, 0, -1.5]}>
            <boxGeometry args={[2.5, 1.58, 0.02]} />
            <meshStandardMaterial map={textures.front} roughness={0.18} metalness={0.9} />
          </mesh>

          {/* Teams Package Card Cluster */}
          <group ref={pricingTeamGroupRef} position={[2.8, -0.5, -2]}>
            <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0.2, 0]}>
              <boxGeometry args={[1.8, 1.13, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} color="#111111" />
            </mesh>
            <mesh position={[0.3, -0.2, -0.3]} rotation={[0, -0.2, 0.1]}>
              <boxGeometry args={[1.8, 1.13, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} color="#2563eb" />
            </mesh>
            <mesh position={[0, 0, 0.3]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[1.8, 1.13, 0.015]} />
              <meshStandardMaterial map={textures.front} roughness={0.5} color="#eaeaea" />
            </mesh>
          </group>
        </group>
      )}

      {/* Chapter 8 Comparison Group */}
      {textures && (
        <group ref={comparisonGroupRef} position={[0, -8, 0]}>
          {/* Left: Paper Business Card (deforms and crumples) */}
          <mesh ref={paperMeshRef} position={[-2.2, 0, 0]}>
            <planeGeometry args={[2.5, 1.58, 10, 10]} />
            <meshStandardMaterial color="#f0f0ed" roughness={0.95} metalness={0.0} side={THREE.DoubleSide} flatShading />
          </mesh>

          {/* Right: Glowing TapFolio Card */}
          <mesh ref={comparisonCardRef} position={[2.0, 0, 0]}>
            <boxGeometry args={[2.5, 1.58, 0.02]} />
            <meshStandardMaterial
              map={textures.front}
              roughness={0.2}
              metalness={0.5}
              emissive={new THREE.Color("#2563eb")}
              emissiveIntensity={0}
            />
          </mesh>
        </group>
      )}

      {/* Chapter 12 Finale Orbit Galaxy Group */}
      <group ref={galaxyGroupRef} visible={false}>
        {textures && galaxyCards.map((card, idx) => (
          <mesh
            key={card.id}
            ref={(el) => {
              if (el) galaxyRefs.current[idx] = el;
            }}
          >
            <boxGeometry args={[2.0, 1.26, 0.02]} />
            <meshStandardMaterial
              map={textures.front}
              color={card.color}
              roughness={card.material === "metal" ? 0.2 : 0.6}
              metalness={card.material === "metal" ? 0.85 : 0.05}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function ExperienceCanvas({ cardState, config }: CanvasProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: cardState.current.configuratorActive === 1 ? "auto" : "none",
        backgroundColor: "#ffffff",
        transition: "background-color 1s ease",
      }}
      id="three-canvas-container"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent cardState={cardState} config={config} />
      </Canvas>
    </div>
  );
}

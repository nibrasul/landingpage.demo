import { gsap } from "gsap";
import { CardState } from "../components/ExperienceCanvas";

export const initTechTimeline = (trigger: string, state: CardState) => {
  const techTl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
  });

  techTl
    // Stage 1: Card centers and freezes (Z = 4)
    .to(state, {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      rotationX: 0.2,
      rotationY: 0.4,
      rotationZ: 0,
      scale: 1.4,
      phoneVisible: 0,
      cameraZ: 4,
      duration: 1.0,
      ease: "power2.out",
    })
    .to("#tech-scene-1", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    
    // Stage 2: Laser scan beam & X-Ray effect
    .to(state, {
      scanProgress: 1.0,
      antennaGlow: 0.8,
      duration: 2.0,
      ease: "power2.out",
    })
    .to("#tech-scene-1", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-2", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    
    // Stage 3: Card opens (PVC layers separate)
    .to(state, {
      splitProgress: 1.0,
      rotationY: 0.8,
      duration: 2.0,
      ease: "power2.out",
    })
    .to("#tech-scene-2", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-3", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    
    // Stage 4: Zoom chip (Camera Z = 1)
    .to(state, {
      cameraZ: 1,
      rotationY: 0.15,
      rotationX: 0.05,
      duration: 2.0,
      ease: "power2.out",
    })
    .to("#tech-scene-3", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-4", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    
    // Stage 5 & 6: Signal antenna glow & phone link
    .to(state, {
      antennaGlow: 1.5,
      phoneVisible: 1,
      phoneScrollProgress: 0.5,
      duration: 2.0,
      ease: "power2.out",
    })
    .to("#tech-scene-4", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-5", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    
    // Stage 7: Card rebuilds back to normal
    .to(state, {
      splitProgress: 0,
      cameraZ: 4,
      antennaGlow: 0,
      scanProgress: 0,
      phoneVisible: 0,
      rotationY: 0,
      rotationX: 0,
      scale: 1.0,
      duration: 2.0,
      ease: "power3.out",
    })
    .to("#tech-scene-5", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-6", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
    .to("#tech-scene-6", { opacity: 0, delay: 0.8, duration: 0.5, ease: "power2.out" });

  return techTl;
};

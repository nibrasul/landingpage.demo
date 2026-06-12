import { gsap } from "gsap";
import { CardState } from "../components/ExperienceCanvas";

export const initFinaleTimeline = (trigger: string, state: CardState) => {
  const finaleTl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
  });

  finaleTl
    .to(state, {
      positionX: 0,
      positionY: 0.2,
      positionZ: 0,
      rotationX: 0.15,
      rotationY: Math.PI * 2,
      rotationZ: 0,
      scale: 1.5,
      finaleProgress: 1.0,
      duration: 3.0,
      ease: "power2.out",
    })
    // Title fades in
    .to("#finale-text-headline", {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: "power2.out",
    }, "-=1.5")
    // Brand icon in center morphs to CTA button
    .to("#finale-logo-icon", {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      ease: "expo.out",
    }, "-=0.8")
    .to("#finale-cta-box", {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.0,
      ease: "power3.out",
    }, "-=0.4");

  return finaleTl;
};

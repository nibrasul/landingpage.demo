import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CardState } from "../components/ExperienceCanvas";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export interface HeroTimelineConfig {
  trigger: string;
  state: CardState;
  start?: string;
  end?: string;
  scrub?: number | boolean;
  markers?: boolean;
  onComplete?: () => void;
}

export const initHeroTimeline = ({
  trigger,
  state,
  start = "top top",
  end = "bottom bottom",
  scrub = 0.5,
  markers = false,
  onComplete
}: HeroTimelineConfig) => {

  // Ensure state values are properly initialized
  const initialState = {
    scale: state.scale || 1,
    rotationY: state.rotationY || 0,
    rotationX: state.rotationX || 0,
    cameraZ: state.cameraZ || 8,
    positionX: state.positionX || 0,
    positionY: state.positionY || 0,
    positionZ: state.positionZ || 0,
    phoneVisible: state.phoneVisible || 0,
    antennaGlow: state.antennaGlow || 0
  };

  // Create main timeline with ScrollTrigger
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub,
      markers,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Optional: Add scroll progress logging for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`Hero scroll progress: ${self.progress.toFixed(2)}`);
        }
      },
      onLeave: () => {
        // When scrolling past the section
        gsap.to(state, {
          phoneVisible: 1,
          cameraZ: 4,
          duration: 0.5,
          ease: "power2.out"
        });
      },
      onEnterBack: () => {
        // When scrolling back into the section
        gsap.to(state, {
          phoneVisible: 0,
          cameraZ: 8,
          duration: 0.5,
          ease: "power2.out"
        });
      },
      onComplete: () => {
        if (onComplete) onComplete();
      }
    },
  });

  // Animation sequence with corrected timing and easing
  heroTl
    // Stage 1: Card scales up and approaches camera (0-30%)
    .to(state, {
      scale: 1.35,
      rotationY: 0.4,
      rotationX: 0.1,
      cameraZ: 7.5,
      duration: 1.2,
      ease: "power2.out"
    })

    // Stage 2: Card rotates to show back side (30-60%)
    .to(state, {
      rotationY: Math.PI,
      rotationX: 0,
      scale: 1.25,
      duration: 1.8,
      ease: "back.inOut"
    }, "+=0.1")

    // Stage 3: Phone enters from right side (60-75%)
    .to(state, {
      positionX: -1.3,
      positionY: 0.2,
      rotationY: Math.PI * 1.15,
      rotationX: 0.15,
      phoneVisible: 1,
      duration: 1.0,
      ease: "expo.inOut"
    }, "-=0.5")

    // Stage 4: NFC tap animation - phone approaches card (75-85%)
    .to(state, {
      positionX: -0.15,
      positionY: -0.1,
      positionZ: 1.05,
      rotationY: Math.PI,
      rotationX: -0.1,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    })

    // Stage 5: Antenna glow effect on tap (85-90%)
    .to(state, {
      antennaGlow: 1.0,
      duration: 0.25,
      ease: "power2.out"
    })
    .to(state, {
      antennaGlow: 0.7,
      duration: 0.15,
      ease: "none"
    })
    .to(state, {
      antennaGlow: 1.0,
      duration: 0.2,
      ease: "power2.out"
    })

    // Stage 6: Phone returns to initial position (90-100%)
    .to(state, {
      positionX: -1.3,
      positionY: 0.3,
      positionZ: 0,
      rotationY: Math.PI * 1.1,
      antennaGlow: 0,
      duration: 0.8,
      ease: "back.in(0.8)"
    })

    // Stage 7: Final polish - slight rotation settle
    .to(state, {
      rotationY: Math.PI,
      rotationX: 0.05,
      scale: 1.2,
      duration: 0.5,
      ease: "sine.inOut"
    }, "-=0.3");

  // Add a pulse effect for the NFC antenna
  const pulseGlow = () => {
    gsap.to(state, {
      antennaGlow: 0.5,
      duration: 0.2,
      repeat: 2,
      yoyo: true,
      ease: "power1.inOut"
    });
  };

  // Trigger pulse at specific scroll points
  ScrollTrigger.create({
    trigger,
    start: "center center",
    onEnter: pulseGlow,
    once: true
  });

  return heroTl;
};

// Helper function to kill all ScrollTriggers and timelines
export const killHeroTimeline = (timeline?: gsap.core.Timeline) => {
  if (timeline) {
    timeline.kill();
  }
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars.trigger === "[data-hero-trigger]") {
      trigger.kill();
    }
  });
};

// Alternative: Responsive timeline with breakpoint support
export const initResponsiveHeroTimeline = (config: HeroTimelineConfig) => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  const adjustedConfig = {
    ...config,
    scrub: isMobile ? 0.8 : 0.5,
    start: isMobile ? "top 20%" : "top top"
  };

  // Adjust animation values based on device
  const timeline = initHeroTimeline(adjustedConfig);

  // Override timeline values for mobile
  if (isMobile) {
    timeline.progress(0);
    // Mobile-specific adjustments would go here
  }

  return timeline;
};

// Debug function to log state changes
export const debugHeroState = (state: CardState) => {
  const debugInterval = setInterval(() => {
    console.table({
      scale: state.scale?.toFixed(3),
      rotationY: ((state.rotationY || 0) / Math.PI).toFixed(3) + "π",
      rotationX: ((state.rotationX || 0) / Math.PI).toFixed(3) + "π",
      cameraZ: state.cameraZ?.toFixed(2),
      phoneVisible: state.phoneVisible,
      antennaGlow: state.antennaGlow?.toFixed(2),
      positionX: state.positionX?.toFixed(2),
      positionY: state.positionY?.toFixed(2),
      positionZ: state.positionZ?.toFixed(2)
    });
  }, 1000);

  return () => clearInterval(debugInterval);
};
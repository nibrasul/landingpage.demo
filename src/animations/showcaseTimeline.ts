import { gsap } from "gsap";
import { CardState } from "../components/ExperienceCanvas";

export const initShowcaseTimeline = (trigger: string, state: CardState) => {
  const showcaseTl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
    },
  });

  showcaseTl
    .to(".horizontal-scroll-container", {
      x: "-300vw", // Slides across 4 products
      ease: "none",
      duration: 4.0,
    })
    .to(state, {
      showcaseProgress: 1.0,
      positionY: 8, // move main card out of viewport
      duration: 1.0,
      ease: "power2.out",
    }, 0);

  return showcaseTl;
};

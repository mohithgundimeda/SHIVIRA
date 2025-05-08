import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "../Styles/Introduction.module.css";
import { useIsMobile } from "./useIsMobile";
import { ReactComponent as ShiviraSvg } from "../shivira-optimized.svg";

const Introduction = ({ onComplete }) => {
  const logoRef = useRef(null);
  const shiviraRef = useRef(null);
  const bgRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {

    if(!logoRef.current || !bgRef.current || !shiviraRef.current) return;
   
    const paths = shiviraRef.current.querySelectorAll("path");

    if (paths.length === 0) {
      console.error("No paths found in the SVG. Check the SVG file structure.");
      return;
    }

   const ctx = gsap.context(()=>{


     // Set initial styles for the paths to ensure the animation is visible
     gsap.set(paths, {
      strokeDashoffset: (i,target) => target.getTotalLength(),
      strokeDasharray: (i, target) => target.getTotalLength(),
      fill: "transparent",
      stroke: "#fff", 
      strokeWidth: "0.18mm",
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.from(logoRef.current, { autoAlpha: 0, duration: 2,ease: "power2.inOut" })
      // .to(logoRef.current, { autoAlpha: 1, duration: 2,  }, "-=2")
      .to(logoRef.current, {
        rotateY: 90,
        duration: 0.5,
        onComplete: () => {
          gsap.set(logoRef.current, { display: "none" });
        },
      })
      .to(
        bgRef.current,
        {
          backgroundColor: "#1E2A26",
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            gsap.set(shiviraRef.current, { display: "block" });
          },
        },
        "-=0.5"
      )
      .fromTo(
        paths,
        {
          strokeDashoffset: (i, target) => target.getTotalLength(),
        },
        {
          strokeDashoffset: 0,
          duration: 1.7,
          ease: "power2.in",
          stagger: 0.2,
        },
        "-=1.5"
      )
      .to(
        paths,
        {
          fill: "#fff",
          duration: 0.5,
          ease: "power2.inOut",
        },
        "-=0.5"
      )
      .to(shiviraRef.current, { autoAlpha: 0, duration: 0.2 }, "+=2")
      .to(bgRef.current, { autoAlpha: 0, duration: 0.5 }, "-=0.2");

   },[bgRef.current]);

    return () => {
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div ref={bgRef} className={styles.brandBackground} role="dialog" aria-label="Loading animation">
      <div className={styles.brandLogo}>
        <img
          ref={logoRef}
          className={styles.logo}
          src="/static/logo4.png"
          alt="Shivira logo"
          aria-hidden="true"
        />
      </div>
      <div className={styles.brandName}>
        <ShiviraSvg
          ref={shiviraRef}
          className={styles.name}
          style={{ width: isMobile ? "150px" : "200px", height: "auto" }}
          aria-label="SHIVIRA"
        />
      </div>
    </div>
  );
};

export default Introduction;

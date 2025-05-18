import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactComponent as LogoSVG } from "./logo2.svg";
import styles from "../Styles/LogoAnimation.module.css";
gsap.registerPlugin(ScrollTrigger);

const LogoAnimation = () => {
  const logoRef = useRef(null);
  const logoContainerRef = useRef(null);

  useEffect(() => {
    if (!logoRef.current) return;

    const paths = logoRef.current.querySelectorAll("path");

    if (paths.length === 0) {
      console.error("No paths found in the SVG. Check the SVG file structure.");
      return;
    }

    const ctx = gsap.context(() => {
      
    if(!paths.length || !logoContainerRef.current) {
        console.log('error at initialization')
        return;
    };
      gsap.set(paths, {
        strokeDashoffset: (i, target) => target.getTotalLength(),
        strokeDasharray: (i, target) => target.getTotalLength(),
        fill: "none",
        stroke: "#fff",
        strokeWidth: 10, 
      });

      const tl = gsap.timeline({
        scrollTrigger:{
            trigger:logoContainerRef.current,
            start:'top center+=150px',
            end:'+=250px',
            scrub:true
        }
      });

      tl.fromTo(
        paths,
        { strokeDashoffset: (i, target) => target.getTotalLength() },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.in",
        }
      )
      .to(
        paths,
        {
          fill: "#fff",
          duration: 0.5,
          ease: "power2.inOut",
        }
      ); // Removed "-=0.5" to separate stroke and fill animations
    }, logoRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={logoContainerRef} className={styles.logoAnimationContainer}>
      <LogoSVG ref={logoRef} viewBox="0 0 1000 900" className={styles.logo} preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default LogoAnimation;
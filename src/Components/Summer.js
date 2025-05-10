import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from '../Styles/Summer.module.css';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SummerContent from './SummerContent';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const CONTROL_POINT_FACTOR = 0.05;
const SCRUB_DELAY = 5;

export default function Summer({sunSrc = 'static/summer/sun.png', moonSrc = 'static/summer/moon.png'}) {
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);

  const [svgDimensions, setSvgDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth || DEFAULT_WIDTH : DEFAULT_WIDTH,
    height: typeof window !== 'undefined' ? window.innerHeight || DEFAULT_HEIGHT : DEFAULT_HEIGHT,
  });

  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth || DEFAULT_WIDTH;
    const newHeight = window.innerHeight || DEFAULT_HEIGHT;
    if (newWidth !== svgDimensions.width || newHeight !== svgDimensions.height) {
      setSvgDimensions({ width: newWidth, height: newHeight });
    }
  }, [svgDimensions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const scrollDistance = useMemo(() => {
    return (typeof window !== 'undefined' ? window.innerHeight : DEFAULT_HEIGHT) * SCRUB_DELAY * 1.5;
  }, []);

  useEffect(() => {
    if (!moonRef.current || !sunRef.current || !contentRef.current || !overlayRef.current) {
      console.warn('One or more refs are missing');
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(sunRef.current, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
      gsap.set(moonRef.current, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

      gsap.to(sunRef.current, {
        immediateRender: true,
        motionPath: {
          path: '#motionPath',
          align: '#motionPath',
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
          start: 1,
          end: 0,
        },
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top top',
          end: `top+=${scrollDistance} bottom`,
          pin: true,
          anticipatePin: 1,
          immediateRender: true,
          pinSpacing: true,
          scrub: SCRUB_DELAY,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!contentRef.current || !overlayRef.current || !sunRef.current || !moonRef.current) return;

            try {
              const progress = self.progress;
              const angle = progress * 180 + 90;
              gsap.to(contentRef.current, {
                backgroundImage: `linear-gradient(${angle}deg, rgb(19, 30, 39) 0%, #517fa4 100%)`,
                duration: 0.5,
                ease: 'power1.inOut',
              });

              const sunRect = sunRef.current.getBoundingClientRect();
              const moonRect = moonRef.current.getBoundingClientRect();
              const sunCenter = { x: sunRect.left + sunRect.width / 2, y: sunRect.top + sunRect.height / 2 };
              const moonCenter = { x: moonRect.left + moonRect.width / 2, y: moonRect.top + moonRect.height / 2 };

              const dx = sunCenter.x - moonCenter.x;
              const dy = sunCenter.y - moonCenter.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              const maxDistance = 200;
              const distanceFactor = Math.max(0, 1 - distance / maxDistance);

              gsap.to(overlayRef.current, {
                opacity: distanceFactor * 1,
                duration: 0.1,
                ease: 'power1.inOut',
              });

              const brightness = 1 - distanceFactor;
              gsap.to(moonRef.current, {
                filter: `brightness(${brightness})`,
                duration: 0.1,
              });
            } catch (error) {
              console.warn('Error in onUpdate:', error);
            }
          },
        },
      });

      gsap.to(moonRef.current, {
        immediateRender: true,
        motionPath: {
          path: '#motionPath',
          align: '#motionPath',
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 1,
        },
        rotation: 90,
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top top',
          end: `top+=${scrollDistance} bottom`,
          immediateRender: true,
          scrub: SCRUB_DELAY,
          invalidateOnRefresh: true,
        },
      });

    }, contentRef);

    return () => ctx.revert();
  }, [scrollDistance, svgDimensions]);

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.src = 'static/logo2.png';
  };

  return (
    <div ref={contentRef} className={styles.container}>
      <div ref={overlayRef} className={styles.eclipseOverlay} />
      <div className={styles.content}>
        <img
          ref={sunRef}
          src={sunSrc}
          alt="Sun moving across the sky"
          className={styles.sun}
          onError={handleImageError}
        />
        <img
          ref={moonRef}
          src={moonSrc}
          alt="Moon moving across the sky"
          className={styles.moon}
          onError={handleImageError}
        />
        <svg
          width="100%"
          height="100%"
          opacity={0}
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
          aria-hidden="true"
        >
          <path
            id="motionPath"
            d={`M-200,${svgDimensions.height / 3} Q${svgDimensions.width / 2},${svgDimensions.height * CONTROL_POINT_FACTOR} ${svgDimensions.width + 200},${svgDimensions.height / 3}`}
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
        </svg>
      </div>
      <SummerContent contentRef={contentRef} scrollDistance={scrollDistance} svgDimensions={svgDimensions} />
    </div>
  );
};

Summer.propTypes = {
  sunSrc: PropTypes.string,
  moonSrc: PropTypes.string,
};

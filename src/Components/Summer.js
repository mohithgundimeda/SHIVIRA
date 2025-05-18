import React, { useLayoutEffect, useRef, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../Styles/Summer.module.css';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SummerContent from './SummerContent';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const CONTROL_POINT_FACTOR = 0.15;
const SCRUB_DELAY = 3;

export default function Summer({ sunSrc = '/static/summer/sun.png', moonSrc = '/static/summer/moon.png' }) {
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const contentRef = useRef(null);
  const overlayRef = useRef(null);

  const [svgDimensions, setSvgDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth || DEFAULT_WIDTH : DEFAULT_WIDTH,
    height: typeof window !== 'undefined' ? window.innerHeight || DEFAULT_HEIGHT : DEFAULT_HEIGHT,
  });

  const handleResize = useCallback(() => {
    let timeout;
    let isMounted = true;
    const resizeHandler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isMounted) return;
        const newWidth = window.innerWidth || DEFAULT_WIDTH;
        const newHeight = window.innerHeight || DEFAULT_HEIGHT;
        if (newWidth !== svgDimensions.width || newHeight !== svgDimensions.height) {
          setSvgDimensions({ width: newWidth, height: newHeight });
        }
      }, 100);
    };
    return [resizeHandler, () => (isMounted = false)];
  }, [svgDimensions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const [resizeHandler, cleanupMounted] = handleResize();
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    return () => {
      cleanupMounted();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [handleResize]);

  useEffect(() => {
    [sunSrc, moonSrc].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [sunSrc, moonSrc]);

  const scrollDistance = useMemo(() => {
    return (typeof window !== 'undefined' ? window.innerHeight : DEFAULT_HEIGHT) * SCRUB_DELAY * 1.5;
  }, []);

useLayoutEffect(() => {
  if (!moonRef.current || !sunRef.current || !contentRef.current || !overlayRef.current) {
    console.warn('[Summer] Missing refs, skipping animations');
    return;
  }

  // Capture ref values inside the effect
  const content = contentRef.current;
  const sun = sunRef.current;
  const moon = moonRef.current;
  const overlay = overlayRef.current;

  const ctx = gsap.context(() => {
    gsap.set([sun, moon], {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
      willChange: 'transform',
      force3D: true,
    });

    gsap.to(sun, {
      motionPath: {
        path: '#motionPath',
        align: '#motionPath',
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
        start: 1,
        end: 0,
      },
      scrollTrigger: {
        trigger: content,
        start: 'top top',
        end: `top+=${scrollDistance} bottom`,
        pin: true,
        anticipatePin: 1,
        pinSpacing: true,
        scrub: SCRUB_DELAY,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          try {
            const sunRect = sun.getBoundingClientRect();
            const moonRect = moon.getBoundingClientRect();
            const sunCenter = { x: sunRect.left + sunRect.width / 2, y: sunRect.top + sunRect.height / 2 };
            const moonCenter = { x: moonRect.left + moonRect.width / 2, y: moonRect.top + moonRect.height / 2 };

            const dx = sunCenter.x - moonCenter.x;
            const dy = sunCenter.y - moonCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            const distanceFactor = Math.max(0, 1 - distance / maxDistance);

            gsap.to(overlay, {
              opacity: distanceFactor,
              duration: 0.1,
              ease: 'power1.inOut',
            });

            gsap.to(moon, {
              filter: `brightness(${1 - distanceFactor})`,
              duration: 0.1,
            });
          } catch (error) {
            console.warn('[Summer] onUpdate error:', error);
          }
        },
      },
    });

    gsap.to(moon, {
      motionPath: {
        path: '#motionPath',
        align: '#motionPath',
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 1,
      },
      rotation: 90,
      scrollTrigger: {
        trigger: content,
        start: 'top top',
        end: `top+=${scrollDistance} bottom`,
        scrub: SCRUB_DELAY,
        invalidateOnRefresh: true,
      },
    });
  }, content);

  return () => {
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === content) {
        st.kill();
      }
    });
    gsap.killTweensOf([sun, moon, overlay]);
    ctx.revert();
  };
}, [scrollDistance, svgDimensions]);
  const handleImageError = useCallback((e) => {
    console.error('[Summer] Image failed to load:', e.target.src);
    e.target.src = '/static/logo2.png';
  }, []);

  return (
    <div ref={contentRef} className={styles.container} role="region" aria-label="Summer section">
      <div ref={overlayRef} className={styles.eclipseOverlay} aria-hidden="true" />
      <div className={styles.content}>
        <img
          ref={sunRef}
          src={sunSrc}
          alt="Sun moving across the sky"
          className={styles.sun}
          onError={handleImageError}
          loading="eager"
          decoding="async"
        />
        <img
          ref={moonRef}
          src={moonSrc}
          alt="Moon moving across the sky"
          className={styles.moon}
          onError={handleImageError}
          loading="eager"
          decoding="async"
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
            stroke="none"
            strokeWidth="0"
          />
        </svg>
      </div>
      <SummerContent contentRef={contentRef} scrollDistance={scrollDistance} svgDimensions={svgDimensions} />
    </div>
  );
}

Summer.propTypes = {
  sunSrc: PropTypes.string,
  moonSrc: PropTypes.string,
};
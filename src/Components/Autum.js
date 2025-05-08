import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import styles from '../Styles/Autumn.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Constants for configuration
const PLACES_DATA = [
  'lake bled',
  'bavaria',
  'ontario',
  'new england',
  'alsace',
];

const ASSET_PATH = '/static/autumn';

// Component
export default function Autumn() {
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);
  const panelRef = useRef([]);
  const bladeRef = useRef([]);
  const imageRef = useRef([]);
  const isInitialized = useRef(false);

  // Memoized places data
  const placesData = useMemo(() => PLACES_DATA, []);

  // Memoized image data
  const groupedImages = useMemo(() => {
    if (!placesData.length) return [];
    return placesData.map((name) => ({
      alt: name,
      jpg: `${ASSET_PATH}/${name}/${name}-jpg/${name}-jpg-large/${name}1.jpg`,
    }));
  }, [placesData]);

  // Memoized panels
  const panels = useMemo(() => {
    if (!placesData.length) return null;
    const panelArray = [];
    for (let i = 0; i < placesData.length * 2; i++) {
      const isColored = i % 2 === 0;
      const placeIndex = Math.floor(i / 2);
      panelArray.push(
        <div
          key={`panel-${i}`}
          ref={(el) => (panelRef.current[i] = el)}
          className={`${styles.panel} ${isColored ? styles.colored : styles.transparent}`}
        >
          {isColored && (
            <>
              <p className={styles.panelText}>{placesData[placeIndex]}</p>
              <p className={styles.seemore}>SEE MORE</p>
            </>
          )}
        </div>
      );
    }
    return panelArray;
  }, [placesData]);

  // Memoized blades
  const blades = useMemo(() => {
    if (!placesData.length || !groupedImages.length) return null;
    const bladeArray = [];
    for (let i = 0; i < placesData.length; i++) {
      const item = groupedImages[i];
      bladeArray.push(
        <div
          key={`blade-${i}`}
          ref={(el) => (bladeRef.current[i] = el)}
          className={styles.blade}
          style={{ zIndex: placesData.length - i }}
        >
          <picture>
            <img
              ref={(el) => (imageRef.current[i] = el)}
              src={item.jpg}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              className={styles.bladeImage}
              onError={(e) => {
                e.target.src = '/static/logo4.png';
                console.warn(`Failed to load image: ${item.jpg}`);
              }}
            />
          </picture>
        </div>
      );
    }
    return bladeArray;
  }, [placesData, groupedImages]);

  // Setup GSAP animations
  const setupAnimations = useCallback(() => {
    if (
      !containerRef.current ||
      !backgroundRef.current ||
      panelRef.current.length !== placesData.length * 2 ||
      bladeRef.current.length !== placesData.length ||
      imageRef.current.length !== placesData.length
    ) {
      console.warn('Animation setup failed: Missing refs or incorrect lengths', {
        container: !!containerRef.current,
        background: !!backgroundRef.current,
        panels: panelRef.current.length,
        blades: bladeRef.current.length,
        images: imageRef.current.length,
      });
      return null;
    }

    const totalHeight = window.innerHeight * (placesData.length * 2 - 1);

    // Create GSAP context
    const ctx = gsap.context(() => {
      // Initialize background
      gsap.set(backgroundRef.current, { autoAlpha: 0 });

      // Pin background with adjusted pinSpacing
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalHeight}`,
        pin: backgroundRef.current,
        pinSpacing: true, // Changed to true to ensure scroll height is respected
        anticipatePin: 1,
        onRefresh: () => {
          // Notify Lenis of updated scroll height
          if (window.lenis) {
            window.lenis.resize();
          }
        },
      });

      // Fade in background
      gsap.to(backgroundRef.current, {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: panelRef.current[0] || null,
          start: 'bottom bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      // Background color transition
      gsap.to(containerRef.current, {
        backgroundColor: 'black',
        ease: 'expo.inOut',
        scrollTrigger: {
          trigger: panelRef.current[panelRef.current.length - 2] || null,
          start: 'bottom top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Image scale animations
      imageRef.current.forEach((image, index) => {
        if (image && index < placesData.length) {
          const panelItem = index * 2;
          const currentPanel = panelRef.current[panelItem];
          if (currentPanel) {
            gsap.fromTo(
              image,
              { scale: 1.5 },
              {
                scale: 1,
                scrollTrigger: {
                  trigger: currentPanel,
                  start: 'bottom bottom',
                  end: 'bottom top',
                  scrub: 5,
                },
              }
            );
          }
        }
      });

      // Blade fade animations
      bladeRef.current.forEach((blade, index) => {
        if (blade && index < placesData.length - 1) {
          const panelItem = index * 2 + 2;
          const currentPanel = panelRef.current[panelItem];
          if (currentPanel) {
            gsap.to(blade, {
              autoAlpha: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: currentPanel,
                start: 'top top',
                end: 'top top',
                scrub: true,
              },
            });
          }
        }
      });
    }, containerRef.current);

    // Force ScrollTrigger refresh after setup
    setTimeout(() => {
      ScrollTrigger.refresh();
      if (window.lenis) {
        window.lenis.resize();
      }
    }, 100);

    return ctx;
  }, [placesData]);

  // Effect for animations and cleanup
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Delay animation setup to ensure DOM is fully rendered
    const timeout = setTimeout(() => {
      const ctx = setupAnimations();

      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
          if (window.lenis) {
            window.lenis.resize();
          }
        }, 200);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (ctx) ctx.revert();
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
        isInitialized.current = false;
        panelRef.current = [];
        bladeRef.current = [];
        imageRef.current = [];
      };
    }, 100);

    return () => clearTimeout(timeout);
  }, [setupAnimations]);

  // Fallback UI for errors
  if (!placesData.length || !panels || !blades) {
    return (
      <div className={styles.errorContainer}>
        Error: Unable to load content. Please try again later.
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.Container}>
      <div ref={backgroundRef} className={styles.backgroundContainer}>
        {blades}
      </div>
      <div style={{ zIndex: 1 }}>{panels}</div>
    </div>
  );
}
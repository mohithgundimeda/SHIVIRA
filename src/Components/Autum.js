
import React, { useMemo, useRef, useEffect, useCallback, forwardRef, useLayoutEffect } from 'react';
import styles from '../Styles/Autumn.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchItinerary } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Constants for configuration
const PLACES_DATA = [
  'lake_bled',
  'bavaria',
  'ontario',
  'new_england',
  'alsace',
];

const ASSET_PATH = '/static/admin';

const cleanQuery = (text) => {
  return text?.replace('_', ' ').toLowerCase() || '';
};

// Component
const Autum = forwardRef(({ ...props }, ref) => {
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);
  const panelRef = useRef([]);
  const bladeRef = useRef([]);
  const imageRef = useRef([]);
  const navigate = useNavigate();
  const placesData = useMemo(() => PLACES_DATA, []);

  // Forward ref
  useEffect(() => {
    if (ref) {
      ref.current = containerRef.current;
    }
  }, [ref]);

  // Ensure ref arrays are initialized with correct lengths
  useEffect(() => {
    panelRef.current = new Array(PLACES_DATA.length * 2).fill(null);
    bladeRef.current = new Array(PLACES_DATA.length).fill(null);
    imageRef.current = new Array(PLACES_DATA.length).fill(null);
  }, []);

  const groupedImages = useMemo(() => {
    if (!placesData.length) return [];
    return placesData.map((name) => ({
      alt: name,
      jpg: `${ASSET_PATH}/${name}/${name}-large/${name}1.jpg`,
    }));
  }, [placesData]);

  const handleNavigate = useCallback(async (place) => {
    if (!place || typeof place !== 'string') {
      console.error('Invalid place name provided for navigation');
      return;
    }

    const abortController = new AbortController();
    try {
      const cleanedQuery = cleanQuery(place);
      if (!cleanedQuery) {
        throw new Error('Folder Name Cleaning Problem');
      }
      const object = await fetchItinerary(cleanedQuery, abortController.signal);
      navigate(`/${place}-itinerary`, { state: { itineraryData: object } });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch itinerary:', err.message);
        navigate(`/${place}-itinerary`, { state: { error: 'Failed to load itinerary data' } });
      }
    } finally {
      abortController.abort();
    }
  }, [navigate]);

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
              <p className={styles.panelText}>{cleanQuery(placesData[placeIndex])}</p>
              <p onClick={() => handleNavigate(placesData[placeIndex])} className={styles.seemore}>
                SEE MORE
              </p>
            </>
          )}
        </div>
      );
    }
    return panelArray;
  }, [placesData, handleNavigate]);

  const blades = useMemo(() => {
    if (!placesData.length || !groupedImages.length) return null;
    const bladeArray = [];
    for (let i = 0; i < placesData.length; i++) {
      const item = groupedImages[i];
      const handleImageError = (e) => {
        console.error(`Failed to load JPG`);
        e.target.src = '/static/logo4.png';
        console.log(`Falling back to logo: /static/logo4.png`);
      };
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
              onError={handleImageError}
            />
          </picture>
        </div>
      );
    }
    return bladeArray;
  }, [placesData, groupedImages]);

  const setupAnimations = useCallback(() => {
    if (
      !containerRef.current ||
      !backgroundRef.current ||
      panelRef.current.length !== placesData.length * 2 ||
      panelRef.current.some((el) => !el) ||
      bladeRef.current.length !== placesData.length ||
      bladeRef.current.some((el) => !el) ||
      imageRef.current.length !== placesData.length ||
      imageRef.current.some((el) => !el)
    ) {
      console.warn('Animation setup skipped: Missing or incomplete refs', {
        container: !!containerRef.current,
        background: !!backgroundRef.current,
        panels: panelRef.current.length,
        panelsValid: panelRef.current.every((el) => !!el),
        blades: bladeRef.current.length,
        bladesValid: bladeRef.current.every((el) => !!el),
        images: imageRef.current.length,
        imagesValid: imageRef.current.every((el) => !!el),
      });
      return;
    }

    const totalHeight = window.innerHeight * (placesData.length * 2 - 1);

    // Create GSAP context
    const ctx = gsap.context(() => {
      // Initialize background
      gsap.set(backgroundRef.current, { autoAlpha: 0 });

      // Pin background
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalHeight}`,
        pin: backgroundRef.current,
        pinSpacing: true,
        anticipatePin: 1,
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

    return ctx;
  }, [placesData]);

  useLayoutEffect(() => {
    const ctx = setupAnimations();

    // Refresh ScrollTrigger on resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (ctx) ctx.revert();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [setupAnimations]);

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
});

export default Autum;
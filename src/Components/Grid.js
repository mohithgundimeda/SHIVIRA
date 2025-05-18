import React, { useState, useRef, useEffect, useCallback, forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../Styles/Grids.module.css';
import destinations, { getImagePaths } from './DestinationsData';
import { useIsMobile } from './useIsMobile';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FontFaceObserver from 'fontfaceobserver';
import Skeleton from '@mui/material/Skeleton';

gsap.registerPlugin(ScrollTrigger);

const GRID_CONFIG = {
  mobileMaxImages: 14,
  desktopMaxImages: 17,
  animationDelay: 0.3,
  mobileIndices: [13, 10, 9, 8, 11, 12],
  desktopIndices: [12, 14, 13, 16, 15],
  transitionSquareText: 'EXPLORE TRENDING PACKAGES',
};

const logError = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Grid] ${message}`);
  }
};

let hasAnimated = false;

const Grid = forwardRef((props, ref) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const localGridRef = useRef(null);
  const mainRef = useRef(null);
  const transitionSquareRef = useRef(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [errorImages, setErrorImages] = useState({});

  const imagePaths = useMemo(() => destinations.map((dest) => getImagePaths(dest.folder)), []);
  const visibleImages = useMemo(
    () => (isMobile ? imagePaths.slice(0, GRID_CONFIG.mobileMaxImages) : imagePaths.slice(0, GRID_CONFIG.desktopMaxImages)),
    [isMobile, imagePaths]
  );

  const gridItemRefs = useRef(visibleImages.map(() => React.createRef()));

  useEffect(() => {
    if (ref) {
      ref.current = mainRef.current;
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('[Grid] No ref prop passed to Grid. Consider removing forwardRef if unused.');
    }
  }, [ref]);


  useEffect(() => {
    const fontObserver = new FontFaceObserver('decorya');
    fontObserver
      .load()
      .then(() => setFontLoaded(true))
      .catch((err) => {
        logError(`Font failed to load: ${err.message}`);
        setFontLoaded(true);
      });
  }, []);

  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((index, imageUrl) => {
    setErrorImages((prev) => ({ ...prev, [index]: true }));
    setLoadedImages((prev) => ({ ...prev, [index]: false }));
    logError(`Failed to load image ${index}: ${imageUrl}`);
  }, []);

  const handleNavigateToCard = useCallback(
    (destination, index) => {
      if (!destination?.folder || !destination?.placeName) {
        logError(`Invalid destination data at index ${index}`);
        return;
      }

      const sizes = ['small', 'medium', 'large'];
      const basePath = `/static/destinations/${destination.folder}`;
      const images = Array.from({ length: destination.imageCount || 0 }, (_, i) => {
        const imageNum = i + 1;
        return sizes
          .map((size) => [
            `${basePath}/${destination.folder}-webp/${destination.folder}-webp-${size}/${destination.folder}${imageNum}.webp`,
            `${basePath}/${destination.folder}-jpg/${destination.folder}-jpg-${size}/${destination.folder}${imageNum}.jpg`,
          ])
          .flat();
      }).flat();

      navigate(`/Destinations/${destination.placeName}`, {
        state: {
          countryName: destination.countryName,
          regionName: destination.regionName,
          placeName: destination.placeName,
          idx: index,
          images,
        },
      });
    },
    [navigate]
  );

  const handleKeyDown = useCallback(
    (event, destination, index) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavigateToCard(destination, index);
      }
    },
    [handleNavigateToCard]
  );

  // Enter animation
  useEffect(() => {
    if (hasAnimated || !fontLoaded || !mainRef.current || !localGridRef.current) return;

    const ctx = gsap.context(() => {
      const gridItems = gridItemRefs.current
        .map((ref) => ref.current)
        .filter((el) => el !== null);

      if (gridItems.length === 0) {
        logError('No grid items found for enter animation');
        return;
      }

      const finalGridItems = isMobile ? gridItems.slice(0, 2) : gridItems.slice(0, 3);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top bottom',
          toggleActions: 'play none none none',
          fastScrollEnd: true,
          onComplete: () => ScrollTrigger.refresh(),
        },
      });

      tl.from(finalGridItems, {
        opacity: 0,
        y: isMobile ? 50 : 200,
        duration: isMobile ? 1 : 0.5,
        stagger: isMobile ? 0.5 : 0.3,
        ease: 'expo.out',
      }).then(() => {
        hasAnimated = true;
      });
    }, mainRef);

    return () => ctx.revert();
  }, [isMobile, fontLoaded]);

 
  useEffect(() => {
    if (!mainRef.current) return;

    const ctx = gsap.context(() => {
      const indices = isMobile ? GRID_CONFIG.mobileIndices : GRID_CONFIG.desktopIndices;
      const gridElements = indices
        .map((index) => gridItemRefs.current[index]?.current)
        .filter((el) => el !== null);
      const trendingCell = isMobile ? null : transitionSquareRef.current;

      
      if (isMobile && gridElements.length < GRID_CONFIG.mobileIndices.length) {
        logError(`Missing grid elements for mobile ending animation: found ${gridElements.length}/${GRID_CONFIG.mobileIndices.length}`);
      }
      if (!isMobile && (gridElements.length < GRID_CONFIG.desktopIndices.length || !trendingCell)) {
        logError(`Missing elements for desktop ending animation: found ${gridElements.length}/${GRID_CONFIG.desktopIndices.length}, trendingCell: ${!!trendingCell}`);
      }

      
      if (gridElements.length === 0 && !trendingCell) {
        logError('No valid elements for ending animation');
        return;
      }

      
      const cellsToFadeFirst = isMobile
        ? gridElements.slice(0, 3).filter(Boolean)
        : [gridElements[0], trendingCell, gridElements[1]].filter(Boolean);
      const cellsToFadeSecond = isMobile
        ? gridElements.slice(3).filter(Boolean)
        : [gridElements[2], gridElements[3], gridElements[4]].filter(Boolean);

      
      gsap.to(mainRef.current, {
        backgroundColor: '#d7d1bf',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'bottom-=300px bottom',
          toggleActions: 'play reverse play reverse',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'bottom bottom',
          end: '+=600px',
          scrub: true,
          pin: true,
          refreshPriority: 3,
          invalidateOnRefresh: true,
          toggleActions: 'play reverse play reverse',
        },
      });

      if (cellsToFadeFirst.length > 0) {
       
        tl.fromTo(
          cellsToFadeFirst,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: 'expo.in' }
        );
      }
      if (cellsToFadeSecond.length > 0) {
        
        tl.fromTo(
          cellsToFadeSecond,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: 'expo.in' },
          '>-0.1'
        );
      }
    }, mainRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Generate grid items
  const gridItems = useMemo(() => {
    return visibleImages.map((paths, index) => {
      const destination = destinations[index];
      if (!destination || !paths) {
        logError(`Missing destination or paths at index ${index}`);
        return null;
      }

      const isImageLoaded = !!loadedImages[index];
      const hasImageError = !!errorImages[index];

      return (
        <div
          key={`grid-${destination.placeName}-${index}`}
          ref={gridItemRefs.current[index]}
          className={styles.gridItem}
          id={`gridId${index}`}
          role="gridcell"
          aria-label={`Navigate to ${destination.placeName}, ${destination.countryName}`}
        >
          <div
            className={styles.imageContainer}
            onClick={() => handleNavigateToCard(destination, index)}
            onKeyDown={(e) => handleKeyDown(e, destination, index)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${destination.placeName}`}
          >
            <picture>
              <source media="(max-width: 480px)" srcSet={paths.small.webp} type="image/webp" />
              <source media="(max-width: 480px)" srcSet={paths.small.jpg} type="image/jpeg" />
              <source media="(max-width: 768px)" srcSet={paths.medium.webp} type="image/webp" />
              <source media="(max-width: 768px)" srcSet={paths.medium.jpg} type="image/jpeg" />
              <source media="(min-width: 768px)" srcSet={paths.large.webp} type="image/webp" />
              <source media="(min-width: 768px)" srcSet={paths.large.jpg} type="image/jpeg" />
              <img
                src={paths.large.jpg}
                alt={`${destination.placeName}, ${destination.countryName}`}
                className={styles.gridImage}
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index, paths.large.jpg)}
                style={{ opacity: isImageLoaded && !hasImageError ? 1 : 0 }}
              />
            </picture>
            {(!isImageLoaded || hasImageError) && (
              <Skeleton
                variant="rectangular"
                width="98%"
                height="98%"
                animation="wave"
                sx={{ borderRadius: '10px', position: 'absolute', top: 0, left: 0 }}
              />
            )}
            <div
              className={styles.location}
              style={{ opacity: isImageLoaded && !hasImageError ? 1 : 0 }}
            >
              <div className={styles.place}>
                <p>{destination.placeName},</p>
              </div>
              <div className={styles.country}>
                <p>{destination.countryName}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }).filter((item) => item !== null);
  }, [visibleImages, loadedImages, errorImages, handleNavigateToCard, handleKeyDown, handleImageError, handleImageLoad]);

  const finalGridItems = useMemo(() => {
    if (visibleImages.length === GRID_CONFIG.desktopMaxImages && !isMobile) {
      const items = [...gridItems];
      items.splice(
        16,
        0,
        <div key="transition-square-wrapper" className={styles.transitionSquareWrapper}>
          <div ref={transitionSquareRef} className={styles.transitionSquare}>
            <div className={styles.squareTextContainer}>
              <p className={styles.squareText}>{GRID_CONFIG.transitionSquareText}</p>
            </div>
          </div>
        </div>
      );
      return items;
    }
    return gridItems;
  }, [gridItems, isMobile, visibleImages.length]);

  return (
    <section ref={mainRef} className={styles.gridMainContainer} aria-label="Destination grid section">
      <div ref={localGridRef} className={styles.gridContainer} role="grid" aria-label="Destination images grid">
        {finalGridItems}
      </div>
    </section>
  );
});

Grid.propTypes = {
  ref: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

Grid.displayName = 'Grid';

export default Grid;
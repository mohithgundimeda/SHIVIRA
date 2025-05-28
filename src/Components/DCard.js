import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../Styles/DCard.module.css';
import Lenis from 'lenis/dist/lenis';
import destinations from './DestinationsData';
import CardMobile from './DCardMobile';
import { useIsMobile } from './useIsMobile';
import ImageWithSkeleton from './ImageWithSkeleton';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiTransportationOutlinedIcon from '@mui/icons-material/EmojiTransportationOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

// Constants centralized for easy maintenance
const CONFIG = {
  LOGO_SRC: '../static/logo4.png',
  FALLBACK_IMAGE: '../static/logo4.png',
  DEBOUNCE_DELAY: 100,
  LENIS_OPTIONS: {
    direction: 'horizontal',
    orientation: 'horizontal',
    smoothWheel: true,
    lerp: 0.1, // Smoother scrolling
    wheelMultiplier: 0.8, // Reduced for less abrupt stops
    infinite: false,
    autoResize: true,
  },
  SESSION_STORAGE_KEYS: {
    SCROLL_RESET: 'dCardScrollReset',
    PREVIEW_SHOWN: 'dCardPreviewShown',
    IMAGE_ERRORS: 'dCardImageErrors',
  },
  FONTS: {
    KABUR: '"Kabur"',
    SABUR: '"sabur"',
    QUICKSAND: '"Quicksand", sans-serif',
    JOST: '"Jost", sans-serif',
  },
};

// Lightweight debounce implementation
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility for logging in development only
const logError = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[DCard] ${message}`);
  }
};

// sessionStorage utilities
const hasErrorLogged = (imageSrc) => {
  if (typeof window === 'undefined') return false;
  const errors = JSON.parse(sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEYS.IMAGE_ERRORS) || '[]');
  return errors.includes(imageSrc);
};

const logImageError = (imageSrc) => {
  if (typeof window === 'undefined') return;
  const errors = JSON.parse(sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEYS.IMAGE_ERRORS) || '[]');
  if (!errors.includes(imageSrc)) {
    errors.push(imageSrc);
    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEYS.IMAGE_ERRORS, JSON.stringify(errors));
  }
};

const hasScrollReset = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEYS.SCROLL_RESET) === 'true';
};

const setScrollReset = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEYS.SCROLL_RESET, 'true');
  }
};

const hasPreviewShown = () => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEYS.PREVIEW_SHOWN) === 'true';
};

const setPreviewShown = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEYS.PREVIEW_SHOWN, 'true');
  }
};

/**
 * Card component for displaying destination details with smooth horizontal scrolling.
 * @param {Object} props - Component props
 * @param {string} props.countryName - Country name
 * @param {string} props.regionName - Region name
 * @param {string} props.placeName - Place name
 * @param {string[]} props.images - Array of image URLs
 * @param {number} [props.idx=0] - Index of the destination
 * @returns {JSX.Element} Rendered Card component
 */
const Card = React.memo(({ countryName, regionName, placeName, images, idx = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const brandRef = useRef(null);
  const previewImgRef = useRef(null);
  const nextButtonRef = useRef(null);
  const lenisRef = useRef(null);
  const isMobile = useIsMobile();
  const [previewImageSrc, setPreviewImageSrc] = useState(CONFIG.FALLBACK_IMAGE);

  // Memoize final props
  const finalProps = useMemo(() => {
    const cardProps = location.state || {};
    return {
      countryName: cardProps.countryName || countryName || 'Unknown Country',
      regionName: cardProps.regionName || regionName || 'Unknown Region',
      placeName: cardProps.placeName || placeName || 'Unknown Place',
      images: cardProps.images || images || [],
      idx: cardProps.idx !== undefined ? cardProps.idx : idx,
    };
  }, [location.state, countryName, regionName, placeName, images, idx]);

  // Memoize grouped images
  const groupedImages = useMemo(() => {
    const imageMap = new Map();
    finalProps.images.forEach((src) => {
      const parts = src.split('/');
      const fileName = parts[parts.length - 1];
      const match = fileName.match(/^[^1-9]+(\d+)\.(webp|jpg)$/);
      if (match) {
        const imageNum = match[1];
        const size = parts[parts.length - 2].split('-').pop();
        const format = match[2];

        if (!imageMap.has(imageNum)) {
          imageMap.set(imageNum, { small: {}, medium: {}, large: {} });
        }
        imageMap.get(imageNum)[size][format] = src;
      }
    });

    return Array.from(imageMap.values()).map((sizes) => ({
      small: { webp: sizes.small.webp, jpg: sizes.small.jpg },
      medium: { webp: sizes.medium.webp, jpg: sizes.medium.jpg },
      large: { webp: sizes.large.webp, jpg: sizes.large.jpg },
    }));
  }, [finalProps.images]);

  // Memoize destination highlights
  const destinationHighlights = useMemo(() => {
    const destination = destinations.find(
      (d) => d.placeName.toLowerCase() === finalProps.placeName.toLowerCase()
    );
    return destination ? destination.highlights : [];
  }, [finalProps.placeName]);

  // Memoize next destination for preview image
  const nextDestination = useMemo(() => {
    const nextIdx = finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1;
    return destinations[nextIdx];
  }, [finalProps.idx]);

  // Navigation to next destination
  const takeToNext = useCallback(() => {
    const nextIdx = finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1;
    const destination = destinations[nextIdx];
    if (!destination) {
      logError(`No destination found at index ${nextIdx}`);
      return;
    }

    const sizes = ['small', 'medium', 'large'];
    const basePath = `/static/destinations/${destination.folder}`;
    const cardProps = {
      countryName: destination.countryName,
      regionName: destination.regionName,
      placeName: destination.placeName,
      idx: nextIdx,
      images: Array.from({ length: destination.imageCount || 0 }, (_, i) => {
        const imageNum = i + 1;
        return sizes.flatMap((size) => [
          `${basePath}/${destination.folder}-webp/${destination.folder}-webp-${size}/${destination.folder}${imageNum}.webp`,
          `${basePath}/${destination.folder}-jpg/${destination.folder}-jpg-${size}/${destination.folder}${imageNum}.jpg`,
        ]);
      }).flat(),
    };
    navigate(`/Destinations/${destination.placeName}`, { state: cardProps });
  }, [navigate, finalProps.idx]);

  const takeToBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle image errors
  const handleImageError = useCallback(
    (e, imageSrc, imageDescription) => {
      if (!hasErrorLogged(imageSrc)) {
        logError(`Failed to load ${imageDescription}: ${imageSrc}`);
        logImageError(imageSrc);
      }
      e.target.src = CONFIG.FALLBACK_IMAGE;
      e.target.onerror = null;
    },
    []
  );

  // Handle preview image error
  const handlePreviewImageError = useCallback(
    (e) => {
      handleImageError(e, previewImageSrc, 'preview image');
      setPreviewImageSrc(CONFIG.FALLBACK_IMAGE);
    },
    [previewImageSrc, handleImageError]
  );

  const handleBookNow = useCallback((destinationName) => {
    if (!destinationName || typeof destinationName !== 'string') {
      logError('Invalid destination name provided for booking');
      return;
    }
    navigate('/Form', {
      state: {
        destination: destinationName.trim(),
      },
    });
  }, [navigate]);

  // Lenis for smooth horizontal scrolling
  useEffect(() => {
    if (isMobile || !containerRef.current || typeof window === 'undefined') {
      return;
    }

    const contentElement = containerRef.current.querySelector(`.${styles.content}`);
    if (!contentElement) {
      logError('Content element not found, skipping Lenis initialization');
      return;
    }

    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: contentElement,
      ...CONFIG.LENIS_OPTIONS,
    });
    lenisRef.current = lenis;

    // Lazy load images with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            lenis.resize();
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );

    const images = containerRef.current.querySelectorAll('img');
    if (!images.length) {
      logError('No images found, initializing Lenis without resize');
      lenis.resize();
    } else {
      images.forEach((img) => observer.observe(img));
    }

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    const handleResize = debounce(() => {
      lenis.resize();
    }, CONFIG.DEBOUNCE_DELAY);

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.removeEventListener('resize', handleResize);
      // handleResize.cancel();
      images.forEach((img) => observer.unobserve(img));
      observer.disconnect();
    };
  }, [isMobile]);

  // Handle scroll reset and preview image
  useEffect(() => {
    if (isMobile || !containerRef.current || !lenisRef.current || typeof window === 'undefined') {
      return;
    }

    // Reset scroll on route change
    const resetScroll = () => {
      lenisRef.current.scrollTo(0, { immediate: true });
      if (!hasScrollReset()) {
        setScrollReset();
      }
    };
    resetScroll();

   
    if (nextDestination){
      const basePath = `/static/destinations/${nextDestination.folder}`;
      const previewSrc = `${basePath}/${nextDestination.folder}-jpg/${nextDestination.folder}-jpg-large/${nextDestination.folder}1.jpg`;
      setPreviewImageSrc(previewSrc);
    }

    const nextElement = containerRef.current.querySelector(`.${styles.next}`);
    const previewImg = previewImgRef.current;
    if (!nextElement || !previewImg) return;

    
    // const shouldShowPreview = !hasPreviewShown();
    const showPreview = (e) => {
      // if (!shouldShowPreview) return;
      previewImg.style.display = 'block';
      previewImg.style.left = `${e.clientX + 10}px`;
      previewImg.style.top = `${e.clientY + 10}px`;
      setPreviewShown();
    };
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const movePreview = (e) => {
      // if (!shouldShowPreview) return;
      previewImg.style.left = `${clamp(e.clientX + 10, 0, window.innerWidth - previewImg.offsetWidth)}px`;
      previewImg.style.top = `${clamp(e.clientY + 10, 0, window.innerHeight - previewImg.offsetHeight)}px`;
    };
    const hidePreview = () => {
      previewImg.style.display = 'none';
    };

    nextElement.addEventListener('mouseenter', showPreview, { passive: true });
    nextElement.addEventListener('mousemove', movePreview, { passive: true });
    nextElement.addEventListener('mouseleave', hidePreview, { passive: true });

    // Focus management for accessibility
    const handleFocus = () => {
      nextElement.focus();
    };
    nextElement.addEventListener('focus', handleFocus);

    return () => {
      nextElement.removeEventListener('mouseenter', showPreview);
      nextElement.removeEventListener('mousemove', movePreview);
      nextElement.removeEventListener('mouseleave', hidePreview);
      nextElement.removeEventListener('focus', handleFocus);
    };
  }, [isMobile, location.pathname, nextDestination]);

  // Early returns for invalid cases
  if (!groupedImages || groupedImages.length === 0) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        No valid images provided
      </div>
    );
  }

  if (!location.state) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        Invalid destination data. Please select a destination.
      </div>
    );
  }

  if (isMobile) {
    return <CardMobile {...finalProps} />;
  }

  return (
    <div className={styles.cardWrapper}>
      <button ref={brandRef} className={styles.gettingBack} aria-label="Go Back" onClick={()=>takeToBack()}>
        Go Back
      </button>
      <div ref={brandRef} className={styles.brand} aria-label="SHIVIRA logo">
        SHIVIRA
      </div>
      <div ref={containerRef} className={styles.container} role="region" aria-label="Destination details">
        <div className={styles.content}>
          <div className={styles.intro}>
            <div className={styles.display}>
              <div className={styles.countryRegion}>
                <div className={styles.country}>{finalProps.countryName.toUpperCase()}</div>
                <div className={styles.region}>{finalProps.regionName}</div>
              </div>
              <div className={styles.placeName}>{finalProps.placeName.toUpperCase()}</div>
              <button
                className={styles.itinerary}
                aria-label={`Book now for ${finalProps.placeName}`}
                onClick={()=>handleBookNow(finalProps.placeName.toUpperCase())}
              >
                BOOK NOW
              </button>
            </div>
          </div>
          <div className={styles.mainImage}>
            <ImageWithSkeleton
              src={groupedImages[0].large.jpg || CONFIG.FALLBACK_IMAGE}
              
              alt={`Main image of ${finalProps.placeName}`}
              className={styles.image1}
              sources={[
                {
                  media: '(max-width: 480px)',
                  srcSet: groupedImages[0].small.webp || groupedImages[0].small.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 480px)',
                  srcSet: groupedImages[0].small.jpg,
                  type: 'image/jpeg',
                },
                {
                  media: '(max-width: 768px)',
                  srcSet: groupedImages[0].medium.webp || groupedImages[0].medium.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 768px)',
                  srcSet: groupedImages[0].medium.jpg,
                  type: 'image/jpeg',
                },
                {
                  media: '(min-width: 768px)',
                  srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(min-width: 768px)',
                  srcSet: groupedImages[0].large.jpg,
                  type: 'image/jpeg',
                },
              ]}
              onError={(e) =>
                handleImageError(e, groupedImages[0].large.jpg || CONFIG.FALLBACK_IMAGE, `main image for ${finalProps.placeName}`)
              }
              loading="lazy"
              decoding="async"
            />
          </div>
          {groupedImages.length > 1 && (
            <div className={styles.sideImages}>
              {groupedImages.slice(1).map((image, idx) => (
                <div key={`${finalProps.placeName}-${idx}`} className={styles.sideImageWrapper}>
                  <ImageWithSkeleton
                    src={image.large.jpg || CONFIG.FALLBACK_IMAGE}
                    alt={`Image ${idx + 1} of ${finalProps.placeName}`}
                    className={styles.virus}
                    sources={[
                      {
                        media: '(max-width: 480px)',
                        srcSet: image.small.webp || image.small.jpg,
                        type: 'image/webp',
                      },
                      {
                        media: '(max-width: 480px)',
                        srcSet: image.small.jpg,
                        type: 'image/jpeg',
                      },
                      {
                        media: '(max-width: 768px)',
                        srcSet: image.medium.webp || image.medium.jpg,
                        type: 'image/webp',
                      },
                      {
                        media: '(max-width: 768px)',
                        srcSet: image.small.jpg,
                        type: 'image/jpeg',
                      },
                      {
                        media: '(min-width: 769px)',
                        srcSet: image.large.webp || image.large.jpg,
                        type: 'image/webp',
                      },
                      {
                        media: '(min-width: 769px)',
                        srcSet: image.large.jpg,
                        type: 'image/jpeg',
                      },
                    ]}
                    onError={(e) =>
                      handleImageError(e, image.large.jpg || CONFIG.FALLBACK_IMAGE, `image ${idx + 1} for ${finalProps.placeName}`)
                    }
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
              <div key="highlights" className={styles.highlightsWrapper}>
                <div className={styles.highlightsBlock}>
                  <p className={styles.highlightsTitle} id="highlights-title">
                    HIGHLIGHTS
                  </p>
                  <ul
                    className={styles.highlightsList}
                    aria-live="polite"
                    aria-describedby="highlights-title"
                  >
                    {destinationHighlights.map((highlight, i) => (
                      <li key={`highlight-${i}`} className={styles.highlightItem}>
                        <img
                          src="/static/logo4.png"
                          alt="Highlight pointer"
                          className={styles.highlightPointer}
                          loading="lazy"
                          decoding="async"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.inclusionTitle}>INCLUSIONS</p>
                  <div className={styles.icons}>
                    <div className={styles.iconsContainer}>
                      <ApartmentOutlinedIcon className={styles.icon} aria-hidden="true" />
                      <p className={styles.iconText}>ACCOMMODATION</p>
                    </div>
                    <div className={styles.iconsContainer}>
                      <RemoveRedEyeOutlinedIcon className={styles.icon} aria-hidden="true" />
                      <p className={styles.iconText}>SIGHTSEEING</p>
                    </div>
                    <div className={styles.iconsContainer}>
                      <EmojiTransportationOutlinedIcon className={styles.icon} aria-hidden="true" />
                      <p className={styles.iconText}>TRANSPORT</p>
                    </div>
                    <div className={styles.iconsContainer}>
                      <SupportAgentOutlinedIcon className={styles.icon} aria-hidden="true" />
                      <p className={styles.iconText}>SEAMLESS SUPPORT</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.nextWrapper}>
                <p
                  ref={nextButtonRef}
                  className={styles.next}
                  tabIndex={0}
                  role="button"
                  aria-label={`Navigate to next location: ${nextDestination?.placeName || 'Next'}`}
                  onClick={takeToNext}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      takeToNext();
                    }
                  }}
                >
                  NEXT LOCATION
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <img
        ref={previewImgRef}
        src={previewImageSrc}
        alt="Preview of next destination"
        className={styles.previewImage}
        loading="lazy"
        decoding="async"
        aria-hidden={!hasPreviewShown()}
        onError={handlePreviewImageError}
      />
    </div>
  );
});

// PropTypes for type safety
Card.propTypes = {
  countryName: PropTypes.string.isRequired,
  regionName: PropTypes.string.isRequired,
  placeName: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  idx: PropTypes.number,
};

Card.defaultProps = {
  idx: 0,
};

Card.displayName = 'Card';

// Error boundary component
class CardErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(`Error in Card component: ${error}, Info: ${info.componentStack}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.error} role="alert" aria-live="assertive">
          An error occurred while displaying the destination. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const DCardWithErrorBoundary = (props) => (
  <CardErrorBoundary>
    <Card {...props} />
  </CardErrorBoundary>
);

export default DCardWithErrorBoundary;
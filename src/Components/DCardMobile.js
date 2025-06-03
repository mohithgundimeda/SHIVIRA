import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../Styles/DCardMobile.module.css';
import destinationsData from './DestinationsData';
import ImageWithSkeleton from './ImageWithSkeleton';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiTransportationOutlinedIcon from '@mui/icons-material/EmojiTransportationOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const destinations = destinationsData.slice(0,14);

// Constants centralized for easy maintenance
const CONFIG = {
  FALLBACK_IMAGE: '../static/logo4.png',
  SESSION_STORAGE_KEYS: {
    SCROLL_RESET: 'mobileCardScrollReset',
    PREVIEW_SHOWN: 'mobileCardPreviewShown',
    IMAGE_ERRORS: 'mobileCardImageErrors',
  },
  FONTS: {
    KABUR: '"Kabur", sans-serif',
    BEBAS_NEUE: '"BebasNeue", sans-serif',
    JOST: '"Jost", sans-serif',
  },
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

// Utility for logging in development only
const logError = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[CardMobile] ${message}`);
  }
};

/**
 * Mobile card component for displaying destination details with vertical scroll snapping.
 * @param {Object} props - Component props
 * @param {string} props.countryName - Country name
 * @param {string} props.regionName - Region name
 * @param {string} props.placeName - Place name
 * @param {string[]} props.images - Array of image URLs
 * @param {number} [props.idx=0] - Index of the destination
 * @param {string} [props.brandName] - Brand name (optional, defaults to SHIVIRA)
 * @returns {JSX.Element} Rendered CardMobile component
 */
const CardMobile = React.memo(({ countryName, regionName, placeName, images, idx = 0, brandName = 'SHIVIRA' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const infoSlideRef = useRef(null);
  const nextButtonRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  
    // Extract placeName from URL
    const { placeName: paramPlace } = useParams();

    // Normalize URL parameter to match destinations
    const normalizedPlace = paramPlace
      ? paramPlace.replace(/\s+/g, '_').toLowerCase()
      : placeName.toLowerCase();

    // Find matching destination
    const destination = destinations.find(
      (d) =>
        d.folder.toLowerCase() === normalizedPlace ||
        d.placeName.replace(/\s+/g, '_').toLowerCase() === normalizedPlace
    );

    const finalProps = useMemo(() => {
      const cardProps = location.state || {};
      // Use props from Card.js if valid (non-default)
      if (cardProps.placeName || (countryName && countryName !== 'Unknown Country' && images?.length > 0)) {
        const selectedDestination = destinations.find(
          (d) =>
            d.placeName.toLowerCase() === (cardProps.placeName || placeName).toLowerCase() ||
            d.folder.toLowerCase() === (cardProps.placeName || placeName).replace(/\s+/g, '_').toLowerCase()
        );
        if (!selectedDestination) {
          logError(`Destination not in mobile's 14 destinations: ${cardProps.placeName || placeName}`);
          return {
            countryName: 'Unknown Country',
            regionName: 'Unknown Region',
            placeName: cardProps.placeName || placeName || 'Unknown Place',
            images: [],
            idx: 0,
            brandName: cardProps.brandName || brandName,
          };
        }
        return {
          countryName: cardProps.countryName || countryName || 'Unknown Country',
          regionName: cardProps.regionName || regionName || 'Unknown Region',
          placeName: cardProps.placeName || placeName || 'Unknown Place',
          images: cardProps.images || images || [],
          idx: cardProps.idx != null ? cardProps.idx : idx,
          brandName: cardProps.brandName || brandName,
        };
      }

      if (!destination) {
        logError(`No destination found for place: ${paramPlace}`);
        return {
          countryName: 'Unknown Country',
          regionName: 'Unknown Region',
          placeName: paramPlace || 'Unknown Place',
          images: [],
          idx: 0,
          brandName,
        };
      }

      const sizes = ['small', 'medium', 'large'];
      const basePath = `/static/destinations/${destination.folder}`;
      const generatedImages = Array.from({ length: destination.imageCount || 0 }, (_, i) => {
        const imageNum = i + 1;
        return sizes.flatMap((size) => [
          `${basePath}/${destination.folder}-webp/${destination.folder}-webp-${size}/${destination.folder}${imageNum}.webp`,
          `${basePath}/${destination.folder}-jpg/${destination.folder}-jpg-${size}/${destination.folder}${imageNum}.jpg`,
        ]);
      }).flat();

      return {
        countryName: destination.countryName,
        regionName: destination.regionName,
        placeName: destination.placeName,
        images: generatedImages,
        idx: destinations.findIndex((d) => d.folder === destination.folder),
        brandName,
      };
    }, [location.state, paramPlace, destination, countryName, regionName, placeName, images, idx, brandName]);

  // Memoize grouped images
  const groupedImages = useMemo(() => {
    if (!Array.isArray(finalProps.images)) return [];
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
      small: { webp: sizes.small.webp || '', jpg: sizes.small.jpg || '' },
      medium: { webp: sizes.medium.webp || '', jpg: sizes.medium.jpg || '' },
      large: { webp: sizes.large.webp || '', jpg: sizes.large.jpg || '' },
    }));
  }, [finalProps.images]);

  // Memoize destination highlights
  const destinationHighlights = useMemo(() => {
    const destination = destinations.find(
      (d) => d.placeName.toLowerCase() === finalProps.placeName.toLowerCase()
    );
    return destination ? destination.highlights : [];
  }, [finalProps.placeName]);

  // Memoize next destination
  const nextDestination = useMemo(() => {
    const nextIdx = finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1;
    return destinations[nextIdx];
  }, [finalProps.idx]);

  // Navigation to next destination
  const takeToNext = useCallback(() => {
    const nextIdx = finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1;
    const obj = destinations[nextIdx];
    if (!obj) {
      logError(`No destination found at index ${nextIdx}`);
      return;
    }



    const sizes = ['small', 'medium', 'large'];
    const basePath = `/static/destinations/${obj.folder}`;
    const nextCardProps = {
      countryName: obj.countryName,
      regionName: obj.regionName,
      placeName: obj.placeName,
      idx: nextIdx,
      brandName: finalProps.brandName,
      images: Array.from({ length: obj.imageCount || 0 }, (_, i) => {
        const imageNum = i + 1;
        return sizes.flatMap((size) => [
          `${basePath}/${obj.folder}-webp/${obj.folder}-webp-${size}/${obj.folder}${imageNum}.webp`,
          `${basePath}/${obj.folder}-jpg/${obj.folder}-jpg-${size}/${obj.folder}${imageNum}.jpg`,
        ]);
      }).flat(),
    };
    navigate(`/Destinations/${obj.placeName}`, { state: nextCardProps, replace: false });
  }, [navigate, finalProps.idx, finalProps.brandName]);

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

  // Scroll reset and tap preview
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Reset scroll on route change
    const resetScroll = () => {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      if (!hasScrollReset()) {
        setScrollReset();
      }
    };
    resetScroll();

    // IntersectionObserver for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );

    const images = containerRef.current.querySelectorAll('img');
    images.forEach((img) => observer.observe(img));

    // Tap preview for next button
    const nextElement = nextButtonRef.current;
    if (!nextElement) return;

    const shouldShowPreview = !hasPreviewShown();
    const showPreview = (e) => {
      if (!shouldShowPreview) return;
      const touch = e.touches ? e.touches[0] : e;
      setPreviewPosition({ x: touch.clientX + 10, y: touch.clientY + 10 });
      setPreviewVisible(true);
      setPreviewShown();
      setTimeout(() => setPreviewVisible(false), 1000); // Hide after 1s
    };

    nextElement.addEventListener('touchstart', showPreview, { passive: true });
    nextElement.addEventListener('click', showPreview, { passive: true });

    return () => {
      images.forEach((img) => observer.unobserve(img));
      observer.disconnect();
      nextElement.removeEventListener('touchstart', showPreview);
      nextElement.removeEventListener('click', showPreview);
    };
  }, [location.pathname]);

  // Early returns for invalid cases
  if (!groupedImages || groupedImages.length === 0) {
    return (
      <div className={styles.error} role="alert" aria-live="assertive">
        Invalid destination data. Please select a valid destination.
      </div>
    );
  }

  return (
    <div className={styles.mobileWrapper}>
      <div className={styles.brand} aria-label="SHIVIRA logo">
        {finalProps.brandName}
      </div>
      <button
        className={styles.itinerary}
        aria-label={`Book now for ${finalProps.placeName}`}
        onClick={() => handleBookNow(finalProps.placeName)}
      >
        BOOK NOW
      </button>
      <div
        ref={nextButtonRef}
        className={styles.next}
        role="button"
        aria-label={`Navigate to next location: ${nextDestination?.placeName || 'Next'}`}
        onClick={()=>takeToNext()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            takeToNext();
          }
        }}
        tabIndex={0}
      >
        NEXT LOCATION &gt;&gt;
      </div>
      <div ref={containerRef} className={styles.container} role="region" aria-label="Mobile destination details">
        <section className={styles.mainImage}>
          <ImageWithSkeleton
            src={groupedImages[0].large.jpg || CONFIG.FALLBACK_IMAGE}
            alt={`Main view of ${finalProps.placeName}`}
            className={styles.image1}
            sources={[
              {
                media: '(max-width: 480px) and (min-resolution: 3x)',
                srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                type: 'image/webp',
              },
              {
                media: '(max-width: 480px) and (min-resolution: 2x)',
                srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                type: 'image/webp',
              },
              {
                media: '(max-width: 480px)',
                srcSet: groupedImages[0].small.webp || groupedImages[0].small.jpg,
                type: 'image/webp',
              },
              {
                media: '(max-width: 768px) and (min-resolution: 2x)',
                srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                type: 'image/webp',
              },
              {
                media: '(max-width: 768px)',
                srcSet: groupedImages[0].medium.webp || groupedImages[0].medium.jpg,
                type: 'image/webp',
              },
              {
                media: '(min-width: 768px)',
                srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                type: 'image/webp',
              },
            ]}
            onError={(e) =>
              handleImageError(e, groupedImages[0].large.jpg || CONFIG.FALLBACK_IMAGE, `main image for ${finalProps.placeName}`)
            }
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className={styles.intro}>
            <div className={styles.display}>
              <div className={styles.countryRegion}>
                <div className={styles.country}>{finalProps.countryName.toUpperCase()} |</div>
                <div className={styles.region}>{finalProps.regionName}</div>
              </div>
              <div className={styles.placeName}>{finalProps.placeName.toUpperCase()}</div>
            </div>
          </div>
        </section>
        {groupedImages.slice(1).map((image, index) => (
          <section key={index} className={styles.imageContainer}>
            <ImageWithSkeleton
              src={image.large.jpg || CONFIG.FALLBACK_IMAGE}
              alt={`View ${index + 2} of ${finalProps.placeName}`}
              className={styles.virus}
              sources={[
                {
                  media: '(max-width: 480px) and (min-resolution: 3x)',
                  srcSet: image.large.webp || image.large.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 480px) and (min-resolution: 2x)',
                  srcSet: image.large.webp || image.large.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 480px)',
                  srcSet: image.small.webp || image.small.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 768px) and (min-resolution: 2x)',
                  srcSet: image.large.webp || image.large.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(max-width: 768px)',
                  srcSet: image.medium.webp || image.medium.jpg,
                  type: 'image/webp',
                },
                {
                  media: '(min-width: 1200px)',
                  srcSet: image.large.webp || image.large.jpg,
                  type: 'image/webp',
                },
              ]}
              onError={(e) =>
                handleImageError(e, image.large.jpg || CONFIG.FALLBACK_IMAGE, `side image ${index + 2} for ${finalProps.placeName}`)
              }
              loading="lazy"
              decoding="async"
            />
          </section>
        ))}
        <section ref={infoSlideRef} className={styles.infoSlide} aria-label="Highlights and Inclusions">
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle} id="highlights-title">
              HIGHLIGHTS
            </h2>
            <div className={styles.infoListContainer}>
              <ul className={styles.infoList} aria-live="polite" aria-describedby="highlights-title">
                {destinationHighlights.map((highlight, i) => (
                  <li key={`highlight-${i}`} className={styles.infoItem}>
                    <img
                      src="/static/logo4.png"
                      alt="Highlight pointer"
                      className={styles.infoPointer}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => handleImageError(e, '/static/logo4.png', `bullet logo for highlight ${i}`)}
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <h2 className={styles.infoTitle}>INCLUSIONS</h2>
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
        </section>
      </div>
      {previewVisible && (
        <img
          src={
            nextDestination
              ? `/static/destinations/${nextDestination.folder}/${nextDestination.folder}-jpg/${nextDestination.folder}-jpg-large/${nextDestination.folder}1.jpg`
              : CONFIG.FALLBACK_IMAGE
          }
          alt="Preview of next destination"
          className={styles.previewImage}
          style={{ left: `${previewPosition.x}px`, top: `${previewPosition.y}px` }}
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          onError={(e) => handleImageError(e, nextDestination?.folder || CONFIG.FALLBACK_IMAGE, 'preview image')}
        />
      )}
    </div>
  );
});


CardMobile.propTypes = {
  countryName: PropTypes.string.isRequired,
  regionName: PropTypes.string.isRequired,
  placeName: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  idx: PropTypes.number,
  brandName: PropTypes.string,
};

CardMobile.defaultProps = {
  idx: 0,
  brandName: 'SHIVIRA',
};

CardMobile.displayName = 'CardMobile';


class CardMobileErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(`Error in CardMobile component: ${error}, Info: ${info.componentStack}`);
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

const CardMobileWithErrorBoundary = (props) => (
  <CardMobileErrorBoundary>
    <CardMobile {...props} />
  </CardMobileErrorBoundary>
);

export default CardMobileWithErrorBoundary;

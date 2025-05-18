import React, { useMemo, useCallback, useRef, useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import styles from "../Styles/SlideShowTrending.module.css";
import { useIsMobile } from "./useIsMobile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STAGGER_DELAY = 0.1;
const ANIMATION_Y = 200;
const ANIMATION_DURATION = 0.5;
const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 770,
};



const SLIDE_DATA = [
  { name: "goldenbridge", caption: "Da Nang, Vietnam" },
  { name: "hotairbaloon", caption: "Göreme, Turkey" },
  { name: "waterfallB&W", caption: "Jagdalpur, India" },
  { name: "eiffelTower", caption: "Paris, France" },
  { name: "boatOcean", caption: "Rhode Island, USA" },
];


const getImagePath = (name, size) => `/static/trending/trending-${size}/trending-${size}-jpg/slideshow/${name}.jpg`;


const FALLBACK_IMAGE = "/static/logo4.png";

class SlideShowErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("SlideShowTrending Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className={styles.emptyContainer}>Failed to load slideshow</div>;
    }
    return this.props.children;
  }
}

// Main Component
const SlideShowTrending = () => {
  const imageRefs = useRef([]);
  const containerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  // Preload first image
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = isMobile ? getImagePath(SLIDE_DATA[0].name, "small") : getImagePath(SLIDE_DATA[0].name, "large");
  }, [isMobile]);

  // Memoized image data
  const groupedImages = useMemo(() => {
    if (!SLIDE_DATA.length) return [];
    return SLIDE_DATA.map(({ name }) => ({
      alt: `Scenic view of ${name.replace(/([A-Z])/g, " $1").toLowerCase()}`,
      small: { jpg: getImagePath(name, "small") },
      medium: { jpg: getImagePath(name, "medium") },
      large: { jpg: getImagePath(name, "large") },
    }));
  }, []);

  // Responsive data
  const displayData = isMobile ? SLIDE_DATA.slice(0, 4) : SLIDE_DATA;

  // Event handlers
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((e, src) => {
    console.error(`Failed to load image: ${src}`);
    e.currentTarget.src = FALLBACK_IMAGE;
    const index = parseInt(e.currentTarget.dataset.index || "-1", 10);
    if (index >= 0) {
      setLoadedImages((prev) => ({ ...prev, [index]: true }));
    }
  }, []);

  const handleImageClick = useCallback((index) => {
    if (isMobile) {
      setActiveIndex((prev) => (prev === index ? null : index));
    }
  }, [isMobile]);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleImageClick(index);
    }
  }, [handleImageClick]);

  // GSAP Animation for Desktop
  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const imageItems = imageRefs.current.filter((el) => el !== null);
    if (!imageItems.length) return;

    // Wait for at least one image to load
    if (!Object.values(loadedImages).some(Boolean)) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageItems,
        { y: ANIMATION_Y },
        {
          y: 0,
          duration: ANIMATION_DURATION,
          ease: "ease.out",
          stagger: { each: STAGGER_DELAY, from: "center" },
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top bottom-=${ANIMATION_Y}px`,
            end: "+=50px",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef.current);

    return () => ctx.revert();
  }, [isMobile, loadedImages]);

  
  if (!groupedImages.length) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>No images available</p>
      </div>
    );
  }

  
  const imageElements = displayData.map(({ name, caption }, index) => {
    const isImageLoaded = !!loadedImages[index];
    const isActive = isMobile && activeIndex === index;

    return (
      <div
        key={index}
        ref={(el) => (imageRefs.current[index] = el)}
        className={`${styles.imageContainer} ${isActive ? styles.active : ""}`}
        onClick={() => handleImageClick(index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        role="button"
        tabIndex={0}
        aria-label={`Expand image of ${caption}`}
      >
        <picture>
          <source
            media={`(min-width: ${BREAKPOINTS.TABLET + 1}px)`}
            srcSet={groupedImages[index].large.jpg}
            type="image/jpeg"
          />
          <source
            media={`(min-width: ${BREAKPOINTS.MOBILE + 1}px)`}
            srcSet={groupedImages[index].medium.jpg}
            type="image/jpeg"
          />
          <source
            media={`(max-width: ${BREAKPOINTS.MOBILE}px)`}
            srcSet={groupedImages[index].small.jpg}
            type="image/jpeg"
          />
          <img
            src={groupedImages[index].large.jpg}
            alt={groupedImages[index].alt}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => handleImageLoad(index)}
            onError={(e) => handleImageError(e, groupedImages[index].large.jpg)}
            className={styles.slideShowImages}
            style={{ opacity: isImageLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            data-index={String(index)}
          />
        </picture>
        <div className={styles.captionOverlay} aria-label={`Location: ${caption}`}>
          <p className={styles.caption}>{caption.toUpperCase()}</p>
        </div>
        {!isImageLoaded && (
          <div className={styles.skeletonWrapper} aria-hidden="true">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
              className={styles.skeletonImage}
            />
            <div className={styles.skeletonCaption}>
              <Skeleton variant="text" width="7rem" height="1.5rem" animation="wave" />
              <Skeleton variant="text" width="7rem" height="1.5rem" animation="wave" />
            </div>
          </div>
        )}
      </div>
    );
  });

  
  if (isMobile) {
    const rows = [imageElements.slice(0, 2), imageElements.slice(2, 4)];
    return (
      <SlideShowErrorBoundary>
        <div className={styles.container}>
          <div className={styles.slideShow}>
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.gridRow}>
                {row}
              </div>
            ))}
          </div>
        </div>
      </SlideShowErrorBoundary>
    );
  }

  // Desktop
  return (
    <SlideShowErrorBoundary>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.slideShow}>{imageElements}</div>
      </div>
    </SlideShowErrorBoundary>
  );
};

SlideShowTrending.propTypes = {};

export default SlideShowTrending;
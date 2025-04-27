import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../Styles/DCard.module.css";
import Lenis from "lenis/dist/lenis";
import debounce from "lodash/debounce";
import destinations from "./DestinationsData";
import CardMobile from "./DCardMobile";
import { useIsMobile } from "./useIsMobile";
import ImageWithSkeleton from "./ImageWithSkeleton";
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiTransportationOutlinedIcon from '@mui/icons-material/EmojiTransportationOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

// Constants centralized for easy maintenance
const CONFIG = {
  LOGO_SRC: "../static/logo4.png",
  FALLBACK_IMAGE: "../static/logo4.png",
  RESIZE_TIMEOUT: 2000,
  FORCE_RESIZE_TIMEOUT: 1000,
  DEBOUNCE_DELAY: 100,
  TITLE_COLOR_DEBOUNCE: 50,
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
  const lenisRef = useRef(null);
  const isMobile = useIsMobile();
  const errorLogged = useRef(new Set());

  
  const finalProps = useMemo(() => {
    const cardProps = location.state || {};
    return {
      countryName: cardProps.countryName || countryName,
      regionName: cardProps.regionName || regionName,
      placeName: cardProps.placeName || placeName,
      images: cardProps.images || images,
      idx: cardProps.idx !== undefined ? cardProps.idx : idx,
    };
  }, [location.state, countryName, regionName, placeName, images, idx]);

  

  
  const groupedImages = useMemo(() => {
    const imageMap = new Map();
    finalProps.images.forEach((src) => {
      const match = src.match(/[^/]+(\d+)\.(webp|jpg)$/);
      if (match) {
        const imageNum = match[1];
        const sizeMatch = src.match(/-webp-([^/]+)/) || src.match(/-jpg-([^/]+)/);
        const size = sizeMatch ? sizeMatch[1] : "large";
        const format = src.endsWith(".webp") ? "webp" : "jpg";

        if (!imageMap.has(imageNum)) {
          imageMap.set(imageNum, { small: {}, medium: {}, large: {}});
        }
        if (!imageMap.get(imageNum)[size][format]) {
          imageMap.get(imageNum)[size][format] = src;
        }
      }
    });

    return Array.from(imageMap.entries()).map(([_, sizes]) => ({
      small: { webp: sizes.small.webp, jpg: sizes.small.jpg },
      medium: { webp: sizes.medium.webp, jpg: sizes.medium.jpg },
      large: { webp: sizes.large.webp, jpg: sizes.large.jpg },
    }));
  }, [finalProps.images]);

  const destinationHighlights = useMemo(() => {
    const destination = destinations.find(d => d.placeName.toLowerCase() === finalProps.placeName.toLowerCase());
    return destination ? destination.highlights : [];
  }, [finalProps.placeName]);

  
  const takeToNext = useCallback(
    (nextIdx) => {
      const destination = destinations[nextIdx];
      if (!destination) return;

      const sizes = ["small", "medium", "large"];
      const basePath = `/static/destinations/${destination.folder}`;
      const cardProps = {
        countryName: destination.countryName,
        regionName: destination.regionName,
        placeName: destination.placeName,
        idx: nextIdx,
        images: Array.from({ length: destination.imageCount }, (_, i) => {
          const imageNum = i + 1;
          return sizes.flatMap((size) => [
            `${basePath}/${destination.folder}-webp/${destination.folder}-webp-${size}/${destination.folder}${imageNum}.webp`,
            `${basePath}/${destination.folder}-jpg/${destination.folder}-jpg-${size}/${destination.folder}${imageNum}.jpg`,
          ]);
        }).flat(),
      };
      navigate(`/Destinations/${destination.placeName}`, { state: cardProps });
    },
    [navigate]
  );

  //Lenis for smooth horizontal scrolling
  useEffect(() => {
    if (isMobile || !containerRef.current) {
      console.debug("Skipping Lenis: Mobile or containerRef is null");
      return;
    }

    const contentElement = containerRef.current.querySelector(`.${styles.content}`);
    if (!contentElement) {
      console.warn("Content element not found, skipping Lenis initialization");
      return;
    }
    console.debug("Initializing Lenis with content:", contentElement);

    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: contentElement,
      direction: "horizontal",
      orientation: "horizontal",
      smoothWheel: true,
      lerp: 0.05,
      wheelMultiplier: 1,
      infinite: false,
      autoResize: true,
    });
    lenisRef.current = lenis;

    const updateDimensions = () => {
      const images = containerRef.current.querySelectorAll("img");
      if (!images.length) {
        console.debug("No images found, skipping resize");
        return;
      }
      console.debug("Images found:", images.length);

      const timeout = setTimeout(() => lenis.resize(), CONFIG.RESIZE_TIMEOUT);

      Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      )
        .then(() => {
          clearTimeout(timeout);
          lenis.resize();
        })
        .catch((err) => {
          console.error("Image loading error:", err);
          lenis.resize();
        });
    };

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    const handleResize = debounce(updateDimensions, CONFIG.DEBOUNCE_DELAY);

    window.addEventListener("resize", handleResize);
    updateDimensions();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [isMobile]);

  // Force resize after initial load
  useEffect(() => {
    if (isMobile || !lenisRef.current) return;

    const forceResize = setTimeout(() => lenisRef.current.resize(), CONFIG.FORCE_RESIZE_TIMEOUT);
    return () => clearTimeout(forceResize);
  }, [isMobile]);

  // Handle title color effect, preview image, and scroll reset on navigation
  useEffect(() => {
    if (isMobile || !location.state || !containerRef.current || !lenisRef.current) {
      if (!location.state) navigate("/");
      return;
    }

    const resetScroll = () => lenisRef.current.scrollTo(0, { immediate: true });
    const timeout = setTimeout(resetScroll, 0);

    const updateTitleColor = debounce(() => {
      const title = brandRef.current;
      if (!title) return;

      const rect = title.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      let [r, g, b] = [255, 255, 255];

      const imgs = containerRef.current.querySelectorAll("img");
      imgs.forEach((img) => {
        const imgRect = img.getBoundingClientRect();
        if (x >= imgRect.left && x <= imgRect.right && y >= imgRect.top && y <= imgRect.bottom) {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, x - imgRect.left, y - imgRect.top, 1, 1, 0, 0, 1, 1);
          [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        }
      });

      title.style.color = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
    }, CONFIG.TITLE_COLOR_DEBOUNCE);

    lenisRef.current.on("scroll", updateTitleColor);
    updateTitleColor();

    const nextElement = containerRef.current.querySelector(`.${styles.next}`);
    const previewImg = previewImgRef.current;
    const showPreview = (e) => {
      previewImg.style.display = "block";
      previewImg.style.left = `${e.clientX + 10}px`;
      previewImg.style.top = `${e.clientY + 10}px`;
    };
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const movePreview = (e) => {
      previewImg.style.left = `${clamp(e.clientX + 10, 0, window.innerWidth - previewImg.width)}px`;
      previewImg.style.top = `${clamp(e.clientY + 10, 0, window.innerHeight - previewImg.height)}px`;
    };
    const hidePreview = () => (previewImg.style.display = "none");

    if (nextElement) {
      nextElement.addEventListener("mouseenter", showPreview);
      nextElement.addEventListener("mousemove", movePreview);
      nextElement.addEventListener("mouseleave", hidePreview);
    }

    return () => {
      clearTimeout(timeout);
      updateTitleColor.cancel();
      if (nextElement) {
        nextElement.removeEventListener("mouseenter", showPreview);
        nextElement.removeEventListener("mousemove", movePreview);
        nextElement.removeEventListener("mouseleave", hidePreview);
      }
    };
  }, [isMobile, location.state, navigate, takeToNext, location.pathname]);

  // Early returns for invalid cases
  if (!groupedImages || groupedImages.length === 0) {
    return <div className={styles.error}>No valid images provided</div>;
  }

  if (isMobile) {
    return <CardMobile {...finalProps} />;
  }

  // Helper function to handle image errors
  const handleImageError = (e, imageSrc, imageDescription) => {
    if (!errorLogged.current.has(imageSrc)) {
      console.error(`Failed to load ${imageDescription}: ${imageSrc}`);
      errorLogged.current.add(imageSrc);
    }
    e.target.src = CONFIG.FALLBACK_IMAGE;
    e.target.onerror = null;
  };

  return (
    <div>
      <div ref={brandRef} className={styles.brand}>SHIVIRA</div>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.content}>
          <div className={styles.intro}>
            <div className={styles.display}>
              <div className={styles.countryRegion}>
                <div className={styles.country}>{finalProps.countryName.toUpperCase()}</div>
                <div className={styles.region}>{finalProps.regionName}</div>
              </div>
              <div className={styles.placeName}>{finalProps.placeName.toUpperCase()}</div>
              <button className={styles.itinerary}>BOOK NOW</button>
            </div>
          </div>
          <div className={styles.mainImage}>
            <ImageWithSkeleton
                src={groupedImages[0].large.jpg || CONFIG.FALLBACK_IMAGE}
                alt={`${finalProps.placeName}`}
                className={styles.image1}
                sources={[
                  {
                    media: "(max-width: 480px)",
                    srcSet: groupedImages[0].small.webp || groupedImages[0].small.jpg,
                    type: "image/webp",
                  },
                  {
                    media: "(max-width: 480px)",
                    srcSet: groupedImages[0].small.jpg,
                    type: "image/jpeg",
                  },
                  {
                    media: "(max-width: 768px)",
                    srcSet: groupedImages[0].medium.webp || groupedImages[0].medium.jpg,
                    type: "image/webp",
                  },
                  {
                    media: "(max-width: 768px)",
                    srcSet: groupedImages[0].medium.jpg,
                    type: "image/jpeg",
                  },
                  {
                    media: "(min-width: 768px)",
                    srcSet: groupedImages[0].large.webp || groupedImages[0].large.jpg,
                    type: "image/webp",
                  },
                  {
                    media: "(min-width: 768px)",
                    srcSet: groupedImages[0].large.jpg,
                    type: "image/jpeg",
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
                    alt={`${idx + 1} of ${finalProps.placeName}`}
                    className={styles.virus}
                    sources={[
                      {
                        media: "(max-width: 480px)",
                        srcSet: image.small.webp || image.small.jpg,
                        type: "image/webp",
                      },
                      {
                        media: "(max-width: 480px)",
                        srcSet: image.small.jpg,
                        type: "image/jpeg",
                      },
                      {
                        media: "(max-width: 768px)",
                        srcSet: image.medium.webp || image.medium.jpg,
                        type: "image/webp",
                      },
                      {
                        media: "(max-width: 768px)",
                        srcSet: image.medium.jpg,
                        type: "image/jpeg",
                      },
                      {
                        media: "(min-width: 768px)",
                        srcSet: image.large.webp || image.large.jpg,
                        type: "image/webp",
                      },
                      {
                        media: "(min-width: 768px)",
                        srcSet: image.large.jpg,
                        type: "image/jpeg",
                      },
                    ]}
                    onError={(e) =>
                      handleImageError(e, image.large.jpg || CONFIG.FALLBACK_IMAGE, `${idx + 1} for ${finalProps.placeName}`)
                    }
                    loading="lazy"
                    decoding="async"
                  />

                </div>
              ))}

                <div key="highlights" className={styles.highlightsWrapper}>
                  <div className={styles.highlightsBlock}>
                      <p className={styles.highlightsTitle}>HIGHLIGHTS</p>

                      <ul className={styles.highlightsList}>
                        <div>
                        {destinationHighlights.map((highlight, i) => (
                          <li key={`highlight-${i}`} className={styles.highlightItem}>
                            <img src="/static/logo4.png"alt="pointer" loading="lazy" style={{rotate:'-90deg', width:'1rem', height:'1rem'}}/>{highlight}
                          </li>
                        ))}
                        </div>
                      </ul>
                    
                      <p className={styles.inclusionTitle}>INCLUSIONS</p>
                      <div className={styles.icons}>

                        <div className={styles.iconsContainer}>
                          <ApartmentOutlinedIcon className={styles.icon}/>  
                          <p className={styles.iconText}>ACCOMMODATION</p>
                        </div>
                        <div className={styles.iconsContainer}>
                        <RemoveRedEyeOutlinedIcon className={styles.icon}/>
                        <p className={styles.iconText}>SIGHTSEEING</p>
                        </div>
                        <div className={styles.iconsContainer}>
                        <EmojiTransportationOutlinedIcon className={styles.icon}/>
                        <p className={styles.iconText} >TRANSPORT</p>
                        </div>
                        <div className={styles.iconsContainer}>
                        <SupportAgentOutlinedIcon className={styles.icon}/> 
                        <p className={styles.iconText} >SEAMLESS SUPPORT</p>
                        </div>

                      </div>
                      
                  </div>
                </div>

              <div className={styles.nextWrapper}>
                <p
                  className={styles.next}
                  tabIndex={0}
                  role="button"
                  onClick={() => takeToNext(finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && takeToNext(finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1)
                  }
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
        src={CONFIG.LOGO_SRC}
        alt="Hover preview"
        className={styles.previewImage}
        loading="lazy"
        decoding="async"
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


Card.displayName = "Card";

export default Card;
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../Styles/DCardMobile.module.css";
import destinationsData from "./DestinationsData";
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiTransportationOutlinedIcon from '@mui/icons-material/EmojiTransportationOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const destinations = destinationsData.slice(0, 14);
const FALLBACK_IMAGE = "../static/logo4.png";

export const CardMobile = ({
  countryName,
  regionName,
  placeName,
  images,
  idx = 0,
  brandName = "SHIVIRA",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const infoSlideRef = useRef(null); // Add ref to debug infoSlide
  const errorRef = useRef(null);
  const errorLogged = useRef(new Set());

  const finalProps = useMemo(() => {
    const cardProps = location.state || {};
    return {
      countryName: cardProps.countryName || countryName,
      regionName: cardProps.regionName || regionName,
      placeName: cardProps.placeName || placeName,
      images: cardProps.images || images,
      brandName: cardProps.brandName || brandName,
      idx: cardProps.idx != null ? cardProps.idx : idx,
    };
  }, [location.state, countryName, regionName, placeName, images, idx, brandName]);

  const groupedImages = useMemo(() => {
    if (!Array.isArray(finalProps.images)) return [];
    const imageMap = new Map();
    finalProps.images.forEach((src) => {
      const match = src.match(/[^/]+(\d+)\.(webp|jpg)$/);
      if (match) {
        const imageNum = match[1];
        const sizeMatch = src.match(/-webp-([^/]+)/) || src.match(/-jpg-([^/]+)/);
        const size = sizeMatch ? sizeMatch[1] : "large";
        const format = src.endsWith(".webp") ? "webp" : "jpg";

        if (!imageMap.has(imageNum)) {
          imageMap.set(imageNum, { small: {}, medium: {}, large: {} });
        }
        imageMap.get(imageNum)[size][format] = src;
      }
    });

    return Array.from(imageMap.entries()).map(([_, sizes]) => ({
      small: { webp: sizes.small.webp || "", jpg: sizes.small.jpg || "" },
      medium: { webp: sizes.medium.webp || "", jpg: sizes.medium.jpg || "" },
      large: { webp: sizes.large.webp || "", jpg: sizes.large.jpg || "" },
    }));
  }, [finalProps.images]);

  const destinationHighlights = useMemo(() => {
    const destination = destinations.find(d => d.placeName.toLowerCase() === finalProps.placeName.toLowerCase());
    return destination ? destination.highlights : [];
  }, [finalProps.placeName]);

  const takeToNext = useCallback(() => {
    const nextIdx = finalProps.idx === destinations.length - 1 ? 0 : finalProps.idx + 1;
    const obj = destinations[nextIdx];
    if (obj) {
      const sizes = ["small", "medium", "large"];
      const basePath = `/static/destinations/${obj.folder}`;
      const nextCardProps = {
        countryName: obj.countryName,
        regionName: obj.regionName,
        placeName: obj.placeName,
        idx: nextIdx,
        images: Array.from({ length: obj.imageCount }, (_, i) => {
          const imageNum = i + 1;
          return sizes.map((size) => [
            `${basePath}/${obj.folder}-webp/${obj.folder}-webp-${size}/${obj.folder}${imageNum}.webp`,
            `${basePath}/${obj.folder}-jpg/${obj.folder}-jpg-${size}/${obj.folder}${imageNum}.jpg`,
          ]).flat();
        }).flat(),
      };
      navigate(`/Destinations/${obj.placeName}`, {
        state: nextCardProps,
        replace: false,
      });
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [navigate, finalProps.idx]);

  useEffect(() => {
    if (!location.state && location.pathname !== "/") {
      navigate("/", { replace: true });
      return;
    }

    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }

  }, [location.state, navigate, location.pathname]);

  if (!groupedImages || groupedImages.length === 0) {
    if (errorRef.current) {
      errorRef.current.style.display = "block";
    }
    return null; // Prevent rendering invalid content
  }

  const handleImageError = (e, imageSrc, imageDescription) => {
    if (!errorLogged.current.has(imageSrc) && process.env.NODE_ENV !== "production") {
      console.error(`Failed to load ${imageDescription}: ${imageSrc}`);
      errorLogged.current.add(imageSrc);
    }
    e.target.src = FALLBACK_IMAGE;
    e.target.onerror = null;
  };

  return (
    <>
      <div ref={errorRef} className={styles.error} style={{ display: "none" }}>
        Something went wrong. Please refresh.
      </div>

      <div className={styles.brand}>{finalProps.brandName}</div>
      <div className={styles.itinerary}>BOOK NOW</div>
      <div
        className={styles.next}
        role="button"
        onClick={takeToNext}
        aria-label="Next Location"
      >
        {`NEXT LOCATION >>`}
      </div>
      
      <div ref={containerRef} className={styles.container}>
        <section className={styles.mainImage}>
          <picture>
            <source
              media="(max-width: 480px) and (min-resolution: 3x)"
              srcSet={groupedImages[0].large.webp || groupedImages[0].large.jpg}
              type={groupedImages[0].large.webp ? "image/webp" : "image/jpeg"}
            />
            <source
              media="(max-width: 480px) and (min-resolution: 2x)"
              srcSet={groupedImages[0].large.webp || groupedImages[0].large.jpg}
              type={groupedImages[0].large.webp ? "image/webp" : "image/jpeg"}
            />
            <source media="(max-width: 480px)" srcSet={groupedImages[0].small.webp || groupedImages[0].small.jpg} type={groupedImages[0].small.webp ? "image/webp" : "image/jpeg"} />
            <source
              media="(max-width: 768px) and (min-resolution: 2x)"
              srcSet={groupedImages[0].large.webp || groupedImages[0].large.jpg}
              type={groupedImages[0].large.webp ? "image/webp" : "image/jpeg"}
            />
            <source media="(max-width: 768px)" srcSet={groupedImages[0].medium.webp || groupedImages[0].medium.jpg} type={groupedImages[0].medium.webp ? "image/webp" : "image/jpeg"} />
            <source media="(min-width: 768px)" srcSet={groupedImages[0].large.webp || groupedImages[0].large.jpg} type={groupedImages[0].large.webp ? "image/webp" : "image/jpeg"} />
            <img
              className={styles.image1}
              src={groupedImages[0].large.jpg || groupedImages[0].large.webp || FALLBACK_IMAGE}
              alt={`Main view of ${finalProps.placeName}`}
              loading="lazy"
              decoding="async"
              fetchPriority="high"
              onError={(e) =>
                handleImageError(e, groupedImages[0].large.jpg || groupedImages[0].large.webp || "", `main image for ${finalProps.placeName}`)
              }
            />
          </picture>
          <div className={styles.intro}>
            <div className={styles.display}>
              <div className={styles.countryRegion}>
                <div className={styles.country}>
                  {finalProps.countryName.toUpperCase()} |
                </div>
                <div className={styles.region}>{finalProps.regionName}</div>
              </div>
              <div className={styles.placeName}>
                {finalProps.placeName.toUpperCase()}
              </div>
            </div>
          </div>
        </section>

        {groupedImages.slice(1).map((image, index) => (
          <section key={index} className={styles.imageContainer}>
            <picture>
              <source
                media="(max-width: 480px) and (min-resolution: 3x)"
                srcSet={image.large.webp || image.large.jpg}
                type={image.large.webp ? "image/webp" : "image/jpeg"}
              />
              <source
                media="(max-width: 480px) and (min-resolution: 2x)"
                srcSet={image.large.webp || image.large.jpg}
                type={image.large.webp ? "image/webp" : "image/jpeg"}
              />
              <source media="(max-width: 480px)" srcSet={image.small.webp || image.small.jpg} type={image.small.webp ? "image/webp" : "image/jpeg"} />
              <source
                media="(max-width: 768px) and (min-resolution: 2x)"
                srcSet={image.large.webp || image.large.jpg}
                type={image.large.webp ? "image/webp" : "image/jpeg"}
              />
              <source media="(max-width: 768px)" srcSet={image.medium.webp || image.medium.jpg} type={image.medium.webp ? "image/webp" : "image/jpeg"} />
              <source media="(min-width: 1200px)" srcSet={image.large.webp || image.large.jpg} type={image.large.webp ? "image/webp" : "image/jpeg"} />
              <img
                className={styles.virus}
                src={image.large.jpg || image.large.webp || FALLBACK_IMAGE}
                alt={`View ${index + 2} of ${finalProps.placeName}`}
                loading="lazy"
                decoding="async"
                onError={(e) =>
                  handleImageError(e, image.large.jpg || image.large.webp || "", `side image ${index + 2} for ${finalProps.placeName}`)
                }
              />
            </picture>
          </section>
        ))}

        {/* New slide for highlights and inclusions */}
        <section ref={infoSlideRef} className={styles.infoSlide}>

          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>HIGHLIGHTS</h2>
            <div className={styles.infoListContainer}>
            <ul className={styles.infoList}>
              {destinationHighlights.map((highlight, i) => (
                <li key={`highlight-${i}`} className={styles.infoItem}>
                  <img
                    src="/static/logo4.png"
                    alt="pointer"
                    loading="lazy"
                    style={{ transform: 'rotate(-90deg)', width: '0.9rem', height: '0.9rem', marginRight: '0.5rem' }}
                    onError={(e) => handleImageError(e, "/static/logo4.png", `bullet logo for highlight ${i}`)}
                  />
                  {highlight}
                </li>
              ))}
            </ul>
            </div>
            <h2 className={styles.infoTitle}>INCLUSIONS</h2>
            <div className={styles.icons}>
              <div className={styles.iconsContainer}>
                <ApartmentOutlinedIcon className={styles.icon} />
                <p className={styles.iconText}>ACCOMMODATION</p>
              </div>
              <div className={styles.iconsContainer}>
                <RemoveRedEyeOutlinedIcon className={styles.icon} />
                <p className={styles.iconText}>SIGHTSEEING</p>
              </div>
              <div className={styles.iconsContainer}>
                <EmojiTransportationOutlinedIcon className={styles.icon} />
                <p className={styles.iconText}>TRANSPORT</p>
              </div>
              <div className={styles.iconsContainer}>
                <SupportAgentOutlinedIcon className={styles.icon} />
                <p className={styles.iconText}>SEAMLESS SUPPORT</p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </>
  );
};

CardMobile.propTypes = {
  countryName: PropTypes.string.isRequired,
  regionName: PropTypes.string.isRequired,
  placeName: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  idx: PropTypes.number,
  brandName: PropTypes.string,
};

export default CardMobile;
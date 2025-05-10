import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Skeleton from "@mui/material/Skeleton"; 
import styles from "../Styles/ReverseSlideShow.module.css";
import { useIsMobile } from "./useIsMobile";

gsap.registerPlugin(ScrollTrigger);

export default function ReverseSlideShowTrending({ pinComplete, pinnedContainer }) {
  const slideShowRef = useRef(null);
  const containerRef = useRef(null);
  const imageRefs = useRef([]);
  const [loadedImages, setLoadedImages] = useState({});
  const isMobile = useIsMobile();

  const captions = useMemo(
    () => [
      "St Peter's Basilica, Vatican City",
      "Page, USA",
      "Jaipur, India",
      "San Nicola Arcella, Italy",
      "Da Nang, Vietnam",
    ],
    []
  );

  const images = useMemo(
    () => ["vatican", "antalope", "jaipur", "calabria", "goldenbridge"],
    []
  );

  const sizes = useMemo(() => ["small", "medium","large"], []);

  const groupedImages = useMemo(() => {
    return images.map((name) => {
      const imageObj = { alt: name };
      sizes.forEach((size) => {
        imageObj[size] = {
          jpg: `/static/trending/trending-${size}/trending-${size}-jpg/slideshow2/${name}.jpg`,
        };
      });
      return imageObj;
    });
  }, [images, sizes]);

  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((e, src) => {
    console.error(`Failed to load image: ${src}`);
    setLoadedImages((prev) => ({ ...prev, [e.target.dataset.index]: true }));
  }, []);

  useEffect(() => {
    if (!slideShowRef.current || !containerRef.current || !pinComplete) return;

    const ctx = gsap.context(() => {
      const slideShow = slideShowRef.current;
      const container = containerRef.current;
      const totalWidth = slideShow.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = totalWidth - viewportWidth;

      if (scrollDistance <= 0) {
        console.warn("ReverseSlideShow content is smaller than viewport, skipping animation");
        return;
      }

      const verticalScrollDistance = window.innerHeight * (scrollDistance / viewportWidth);

      if(!isMobile){
        gsap.set(slideShow, { x: -scrollDistance });
        gsap.to(slideShow, {
          x: 0,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: container,
            start: "center center",
            end: `+=${verticalScrollDistance}`,
            scrub: 1,
            pin: true,
            refreshPriority: 2,
            anticipatePin: 1,
            pinSpacing: true,
            invalidateOnRefresh: true,
          },
        });
      }else{

        gsap.set(slideShow, { x: -scrollDistance });

        gsap.to(slideShow, {
          x: 0,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: container,
            start: "top bottom-=300px",
            end: `+=500px`,
            scrub: 5,
          },
        });


      }

    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, [slideShowRef, containerRef, pinComplete, isMobile]);

  if (groupedImages.length === 0) {
    return (
      <div className={styles.container}>
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container} style={{marginTop: isMobile ? '5rem' : '10rem'}}>
      <div ref={slideShowRef} className={styles.slideShow}>
        {groupedImages.map((image, index) => {
          const isImageLoaded = !!loadedImages[index];
          return (
            <div
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              className={styles.imageContainer}
              data-caption={captions[index].toUpperCase()}
            >
              <picture>
                <source
                  media="(min-width: 1020px)"
                  srcSet={image.large.jpg}
                  type="image/jpeg"
                />
                <source
                  media="(min-width: 601px)"
                  srcSet={image.medium.jpg}
                  type="image/jpeg"
                />
                <source
                  media="(max-width: 600px)"
                  srcSet={image.small.jpg}
                  type="image/jpeg"
                />
                <img
                  src={image.large.jpg}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => handleImageLoad(index)}
                  className={styles.slideShowImages}
                  onError={(e) => handleImageError(e, image.large.jpg)}
                  style={{ opacity: isImageLoaded ? 1 : 0, transition: "opacity 0.3s" }}
                />
              </picture>
              {!isImageLoaded && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#d7d1bf",
                    zIndex: 100,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    style={{ borderRadius: "10px", position: "relative", zIndex: 0 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.5rem",
                      left: "1rem",
                      width: "100%",
                      height: "1.5rem",
                      zIndex: 1,
                      display: "flex",
                      gap:"0.5rem",
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width="7rem"
                      height="100%"
                      animation="wave"
                    />

                    <Skeleton
                      variant="text"
                      width="7rem"
                      height="100%"
                      animation="wave"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
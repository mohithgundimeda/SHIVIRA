import React, { useRef, useEffect, useState, useMemo, useCallback, forwardRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/Trending.module.css";
import { useIsMobile } from "./useIsMobile";
import SlideShowTrending from "./SlideShowTrending";
import ThreeDImaging from "./ThreeDImaging";

gsap.registerPlugin(ScrollTrigger);

const Trending = forwardRef(({ ...props }, ref) => {
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const imageExpoRef = useRef(null);
  const imageRefs = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const sectionNameRef = useRef(null);
  const textHolderRef = useRef(null);
  const textRef = useRef(null);
  const trendingContentRef = useRef(null);


  useEffect(() => {
    if (ref) {
      ref.current = containerRef.current;
    }
  }, [ref]);



  const cities = useMemo(() => ["burjkhalifa", "colosseum", "tajmahal"], []);
  const indices = useMemo(() => [1, 0, 2], []);
  const imageNames = useMemo(() => [...cities], [cities]);
  const sizes = useMemo(() => ["small", "medium", "large"], []);

  const groupedImages = useMemo(() => {
    return imageNames.map((name, index) => {
      const imageObj = { alt: name, zIndex: indices[index] };
      sizes.forEach((size) => {
        imageObj[size] = {
          webp: `/static/trending/trending-${size}/trending-${size}-webp/${name}.webp`,
          jpg: `/static/trending/trending-${size}/trending-${size}-jpg/${name}.jpg`,
        };
      });
      return imageObj;
    });
  }, [imageNames, sizes, indices]);

  const splitText = useCallback((element) => {
    if (!element) return;
    const text = element.textContent;
    const characters = text.split(" ");
    element.innerHTML = characters
      .map(
        (char) =>
          `<span style="display: inline-block; white-space: pre;" aria-hidden="true">${char}</span>`
      )
      .join(" ");
  }, []);

  const setUpImageAnimation = useCallback(() => {
    if (!imageExpoRef.current || !imageRefs.current.length) return;

    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
    const scaleFactor = isMobile ? (isTablet ? 0.9 : 0.8) : 1;
    const distance = isMobile ? (isTablet ? 200 : 150) : 300;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: imageExpoRef.current,
        start: "top 80%",
        end: "center center",
        scrub: 1,
        invalidateOnRefresh: true,
        toggleActions: "play reverse play reverse",
      },
    });

    tl.to(imageRefs.current[0], {
      y: -distance,
      scale: 1.05 * scaleFactor,
      opacity: 1,
      duration: 1,
      ease: "power3.inOut",
    })
      .to(
        imageRefs.current[1],
        {
          x: -distance,
          rotate: -10,
          scale: 0.95 * scaleFactor,
          opacity: 0.9,
          duration: 1,
          ease: "power3.inOut",
        },
        "<"
      )
      .to(
        imageRefs.current[2],
        {
          x: distance,
          rotate: 10,
          scale: 0.95 * scaleFactor,
          opacity: 0.9,
          duration: 1,
          ease: "power3.inOut",
        },
        "<"
      );
  }, [isMobile]);

  useEffect(() => {
    if (!textRef.current || !containerRef.current || !textHolderRef.current) return;

    splitText(textRef.current);

    const setupTextAnimation = () => {
      const characters = textRef.current.querySelectorAll("span");
      if (!characters.length) {
        console.warn("[Trending] No characters found for animation");
        return;
      }

      gsap.fromTo(
        characters,
        { color: "#6c52344a" },
        {
          color: "#6C5234",
          duration: 1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: textHolderRef.current,
            start: "top 80%",
            end: "bottom center",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    };

    const ctx = gsap.context(() => {
      gsap.set(textRef.current, { color: "#6c52344a" });
      setupTextAnimation();
    }, containerRef.current);

    return () => {
      ctx.revert();
    };
  }, [isMobile, splitText]);

  useEffect(() => {
    if (!imageExpoRef.current || imagesLoaded !== groupedImages.length) return;

    const ctx = gsap.context(() => {
      setUpImageAnimation();
    
    }, imageExpoRef.current);

    return () => {
      ctx.revert();
    };
  }, [imagesLoaded, setUpImageAnimation, groupedImages.length]);

  const handleImageLoad = useCallback(() => {
    setImagesLoaded((prev) => {
      const newCount = prev + 1;

      return newCount;
    });
  }, []);

  const handleImageError = useCallback((e, src) => {
    setImagesLoaded((prev) => {
      const newCount = prev + 1;
      return newCount;
    });
  }, []);



  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={imageExpoRef} className={styles.imageExpoContainer}>
        <p ref={sectionNameRef} className={styles.sectionName}>
          TRENDING
        </p>
        {groupedImages.map((image, index) => (
          <div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            style={{ zIndex: image.zIndex }}
            className={styles.trendingImagesCont}
          >
            <picture>
              <source media="(min-width: 1020px)" srcSet={image.large.webp} type="image/webp" />
              <source media="(min-width: 1020px)" srcSet={image.large.jpg} type="image/jpeg" />
              <source media="(min-width: 601px)" srcSet={image.medium.webp} type="image/webp" />
              <source media="(min-width: 601px)" srcSet={image.medium.jpg} type="image/jpeg" />
              <source media="(max-width: 600px)" srcSet={image.small.webp} type="image/webp" />
              <source media="(max-width: 600px)" srcSet={image.small.jpg} type="image/jpeg" />
              <img
                src={image.large.jpg}
                alt={image.alt}
                loading="eager"
                decoding="async"
                className={styles.trendingImages}
                onLoad={handleImageLoad}
                onError={(e) => handleImageError(e, image.large.jpg)}
              />
            </picture>
          </div>
        ))}
      </div>

      <div ref={textHolderRef} className={styles.textHolder}>
        <p ref={textRef} className={styles.text}>
          {!isMobile
            ? 'featuring popular destinations and well-regarded travel options, These places highlight current favorites among travelers, offering a range of experiences to suit your preferences!! Carefully selected to reflect the latest travel trends, our packages include a variety of destinations that are gaining attention for their unique appeal, from cultural landmarks to natural wonders - Each itinerary is designed with flexibility in mind, allowing you to customize your journey based on your interests.'
            : 'featuring popular destinations and well-regarded travel options, These places highlight current favorites among travelers, offering a range of experiences to suit your preferences.'}
        </p>
      </div>
      
      <SlideShowTrending/>
     
      <div className={styles.trendingContent}>
       <ThreeDImaging trendingContentRef={trendingContentRef} />
      </div>
      
    </div>
  );
});

export default Trending;
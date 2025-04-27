import React, { useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/ThreeDImaging.module.css";

export default function ThreeDImaging({ trendingContentRef }) {
  const containerRef = useRef(null);
  const mainRef = useRef(null);
  const ctx = useRef(null);
  const imageName = useMemo(() => ['mahal-foreground-edited'], []);
  const sizes = useMemo(() => ["small", "medium", "large", "xlarge"], []);
  
  const groupedImages = useMemo(() => {
    return imageName.map((name) => {
      const imageObj = { alt: `Foreground of ${name}` };
      sizes.forEach((size) => {
        imageObj[size] = {
          webp: `/static/trending/trending-${size}/trending-${size}-webp/${name}.webp`,
          png: `/static/trending/trending-${size}/trending-${size}-jpg/${name}.png`,
        };
      });
      return imageObj;
    });
  }, [imageName, sizes]);

  useLayoutEffect(() => {
    if (!gsap || !ScrollTrigger || !containerRef.current || !mainRef.current) return;
    gsap.registerPlugin(ScrollTrigger);


    ctx.current = gsap.context(() => {

      gsap.to([trendingContentRef?.current, mainRef.current].filter(Boolean), {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center-=100px",
          end: "+=50px",
          scrub: true,
        },
        backgroundColor: "#3a5f86",
        ease: "expo.inOut",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: () => {
              if (!mainRef.current) {
                console.warn("mainRef.current is null, using default end value");
                return "+=1000px";
              }
              const height = mainRef.current.getBoundingClientRect().height;
              return `${height - 200}px center`;
            },
          scrub: 1,
          pin: true,
          refreshPriority: 0,
          anticipatePin: true,
          invalidateOnRefresh: true,
        },
      });
      tl.to(containerRef.current, { x: 0, y: 0, ease: "expo.in" }).to(
        containerRef.current,{
          autoAlpha:0,
        }
      ,'>+=2');
    }, mainRef);

    return () => ctx.current?.revert();
  }, [trendingContentRef, mainRef, containerRef]);

  const handleImageError = useCallback((e, src) => {
    console.error(`Failed to load image: ${src}`);
  }, []);

  return (
    <div id="mainId" ref={mainRef} className={styles.container}>

      <div ref={containerRef} className={styles.endQuoteContainer}>
        <p className={styles.endQuote}>if it's trending, it's already</p>
        <p className={styles.endQuote2}>shivira</p>
      </div>

     {groupedImages.length > 0 && (
        <div className={styles.imageWrapper}>
        <div className={styles.imageForeContainer}>
          <picture>
            <source media="(min-width: 1441px)" srcSet={groupedImages[0].xlarge.webp} type="image/webp" />
            <source media="(min-width: 1020px)" srcSet={groupedImages[0].large.webp} type="image/webp" />
            <source media="(min-width: 601px)" srcSet={groupedImages[0].medium.webp} type="image/webp" />
            <source media="(max-width: 600px)" srcSet={groupedImages[0].medium.webp} type="image/webp" />
            <source media="(min-width: 1441px)" srcSet={groupedImages[0].xlarge.png} type="image/png" />
            <source media="(min-width: 1020px)" srcSet={groupedImages[0].large.png} type="image/png" />
            <source media="(min-width: 601px)" srcSet={groupedImages[0].medium.png} type="image/png" />
            <source media="(max-width: 600px)" srcSet={groupedImages[0].medium.png} type="image/png" />
            <img
              src={groupedImages[0].large.png}
              alt={groupedImages[0].alt}
              loading="lazy"
              decoding="async"
              className={styles.imageFore}
              onError={(e) => handleImageError(e, groupedImages[0].large.png)}
            />
          </picture>
        </div>
      </div>
     )}

    </div>
  );
}
import React, { useLayoutEffect, useMemo, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/ThreeDImaging.module.css";
import { useIsMobile } from "./useIsMobile";

gsap.registerPlugin(ScrollTrigger);

function ThreeDImaging() {
  const containerRef = useRef(null);
  const mainRef = useRef(null);
  const textRef = useRef(null);
  const numberRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const ctx = useRef(null);
  const isMobile = useIsMobile();

  const imageName = useMemo(() => ["mahal-foreground-edited"], []);
  const sizes = useMemo(() => ["small", "medium", "large"], []);
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

  const splitTextIntoWords = useCallback((text, className) => {
    return text.split(" ").map((word, index) => {
      const isNumber = word === "12";
      return (
        <span
          key={`${word}-${index}`}
          ref={isNumber ? numberRef : null}
          className={`${className} ${styles.word} ${isNumber ? styles.number : ""}`}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {word}
          {word === "shivira" ? "" : " "}
        </span>
      );
    });
  }, []);

  const handleImageError = useCallback((e, src) => {
    console.error(`Failed to load image: ${src}`);
  }, []);


  useLayoutEffect(() => {
    if (
      !gsap ||
      !ScrollTrigger ||
      !textRef.current ||
      !mainRef.current ||
      !imageWrapperRef.current ||
      !numberRef.current
    ) {
      console.warn("Missing dependencies or refs for animations");
      return;
    }

   
    const textTopLocation = textRef.current.getBoundingClientRect().top;
    const imageBottomLocation = imageWrapperRef.current.getBoundingClientRect().bottom;
    const scrollDistance = imageBottomLocation - textTopLocation;

    ctx.current = gsap.context(() => {
      const words = gsap.utils.toArray(`.${styles.word}`, textRef.current);

      
      gsap.set(words, { opacity: 0 });

     
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: "center bottom-=100px",
          end: "center bottom-=200px",
          toggleActions: "play none none none",
          invalidateOnRefresh: true,
        },
      });

      tl.to(words, {
        opacity: 1,
        ease: "expo.inOut",
        stagger: 0.6,
      }).to(
        numberRef.current,
        {
          duration: 2,
          ease: "power1.inOut",
          onUpdate: function () {
            const value = Math.round(1 + (12 - 1) * this.progress());
            numberRef.current.textContent = `${value} `;
          },
        },
        "<"
      );

      
      const moveTl = gsap.timeline({
        scrollTrigger: {
          trigger: imageWrapperRef.current,
          start: isMobile ? "top center+=300px" : "top center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      moveTl.to(textRef.current, {
        y: scrollDistance,
        ease: "power2.out",
      });
    }, mainRef);

    
    return () => {
      ctx.current?.revert();
    };
  }, [isMobile]);

  return (
    <div id="mainId" ref={mainRef} className={styles.container}>
      <div ref={containerRef} className={styles.endQuoteContainer}>
        <div className={styles.editForMobile} style={{ textAlign: "center" }}>
          <p ref={textRef}>
            {splitTextIntoWords("12 years expertise.", styles.endQuote)}
            <br/>
            {splitTextIntoWords("countless memories.", styles.endQuote)}
            <br />
            {splitTextIntoWords("shivira", styles.endQuote2)}
          </p>
        </div>
      </div>

      {groupedImages.length > 0 && (
        <div ref={imageWrapperRef} className={styles.imageWrapper}>
          <div className={styles.imageForeContainer}>
            <picture>
              <source
                media="(min-width: 1020px)"
                srcSet={groupedImages[0].large.webp}
                type="image/webp"
              />
              <source
                media="(min-width: 1020px)"
                srcSet={groupedImages[0].large.png}
                type="image/png"
              />
              <source
                media="(min-width: 601px)"
                srcSet={groupedImages[0].medium.webp}
                type="image/webp"
              />
              <source
                media="(min-width: 601px)"
                srcSet={groupedImages[0].medium.png}
                type="image/png"
              />
              <source
                media="(max-width: 600px)"
                srcSet={groupedImages[0].medium.webp}
                type="image/webp"
              />
              <source
                media="(max-width: 600px)"
                srcSet={groupedImages[0].medium.png}
                type="image/png"
              />
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


export default ThreeDImaging;
import React, { useRef, useMemo, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/AutumnMobile.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function AutumnMobile() {
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const places = useMemo(() => ['lake bled', 'bavaria', 'ontario', 'new england', 'alsace'], []);
  const ShowingPlaces = useMemo(() => ['LAKE BLED', 'BAVARIA', 'ONTARIO', 'NEW ENGLAND', 'ALSACE'], []);
  const formats = useMemo(() => ['webp', 'jpg'], []);
  const daysAndNights = useMemo(() => [[[4, 5], [7, 8]], [[6, 7], [9, 10]], [[5, 6], [8, 9]], [[6, 7], [10, 11]], [[4, 5], [7, 8]]], []);
  const imageInfoRef = useRef([]);
  const imageRefs = useRef([]);

  const groupedImages = useMemo(() => {
    if (!places.length || !formats.length) return [];
    return places.map((name) => {
      const placeObj = { alt: name };
      formats.forEach((form) => {
        placeObj[form] = `/static/autumn/${name}/${name}-${form}/${name}-${form}-medium/${name}1.${form}`;
      });
      return placeObj;
    });
  }, [places, formats]);

  const content = places.length && groupedImages.length && ShowingPlaces.length && daysAndNights.length ? places.map((place, index) => (
    <React.Fragment key={index}>
      <div ref={(el) => (imageInfoRef.current[index] = el)} className={styles.imageinfo}>
        <p className={styles.place}>{ShowingPlaces[index]}</p>
        <p className={styles.info}>
          {`Packages typically range from ${daysAndNights[index][0][0]}N / ${daysAndNights[index][0][1]}D to ${daysAndNights[index][1][0]}N / ${daysAndNights[index][1][1]}D, click to see more`}
        </p>
      </div>
      <div ref={(el) => (imageRefs.current[index] = el)} className={styles.imageContainer}>
        
          <img
            src={groupedImages[index].webp}
            alt={groupedImages[index].alt}
            className={styles.image}
            onError={(e) => {
              e.target.src = groupedImages[index].jpg;
              console.log(`Switching to JPG: ${groupedImages[index].jpg}`);
              e.target.onerror = () => {
                console.error(`Failed to load JPG: ${groupedImages[index].jpg}`);
                e.target.src = '/static/logo4.png';
                console.log(`Falling back to logo: /static/logo4.png`);
              };
            }}
            loading="lazy"
            decoding="async"
          />
      
      </div>
    </React.Fragment>
  )) : null;

  const animateText = (chars) => {
    if (!chars || !containerRef.current) return;
    gsap.set(chars, { opacity: 0 });
    gsap.to(chars, {
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center-=100px',
        toggleActions: 'play none none none',
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  };

  const animateElements = (elements, options = {}) => {
    if (!elements.length || !gridRef.current) return;
    const { start = 'top center', duration = 0.5 } = options;
    gsap.set(elements, { opacity: 0 });
    gsap.to(elements, {
      opacity: 1,
      duration,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: gridRef.current,
        start,
        end: '+=1px',
        toggleActions: 'play none none none',
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  };

  const animateElementsEnd = (refs) => {
    if (!refs.length || !containerRef.current) return;
    refs.forEach((ref) => {
      if (ref.current) {
        gsap.to(ref.current, {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'bottom bottom',
            end: '+=1px',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    });
  };

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !gridRef.current) {
      console.warn('Required refs are missing, skipping animation setup');
      return;
    }

    const infoElements = imageInfoRef.current.filter(Boolean);
    const imageElements = imageRefs.current.filter(Boolean);

    if (infoElements.length !== places.length || imageElements.length !== places.length) {
      console.warn('Mismatch in ref counts, some elements may not animate', {
        infoElements: infoElements.length,
        imageElements: imageElements.length,
        expected: places.length,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const text = textRef.current.textContent || '';
      if (!text) {
        console.warn('No text content found for animation');
        return;
      }

      try {
        textRef.current.innerHTML = text
          .split('')
          .map(char => `<span class="${styles.char}">${char}</span>`)
          .join('');
      } catch (error) {
        console.warn('Error splitting text:', error);
        return;
      }

      const chars = gsap.utils.toArray(`.${styles.char}`, textRef.current);
      animateText(chars);
      animateElements(infoElements);
      animateElements(imageElements);
      animateElementsEnd([textRef, gridRef]);

      gsap.to(containerRef.current, {
        backgroundColor:'black',
        ease: 'expo.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom bottom',
          end: '+=1px',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      imageInfoRef.current = [];
      imageRefs.current = [];
    };
  }, [places]);

  if (!places.length || !content) {
    return (
      <div className={styles.errorContainer}>
        Error: Unable to load content. Please try again later.
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sectionName}>
        <p ref={textRef} className={styles.text}>AUTUMN</p>
      </div>
      <div ref={gridRef} className={styles.grid}>
        {content}
      </div>
    </div>
  );
}
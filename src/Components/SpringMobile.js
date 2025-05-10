import React, { useRef, useMemo, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/SpringMobile.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function SpringMobile() {
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const places = useMemo(() => ['kerala', 'bhutan', 'nainital', 'nepal', 'ooty'], []);
  const formats = useMemo(() => ['webp', 'jpg'], []);
  const daysAndNights = useMemo(() => [[[5, 6], [8, 9]], [[5, 6], [8, 9]], [[5,6],[10,11]], [[5,6],[10,11]], [[4,5],[6,7]]], []);
  const imageInfoRef = useRef(places.map(() => React.createRef(null)));
  const imageRefs = useRef(places.map(() => React.createRef(null)));

  const groupedImages = useMemo(() => {
    return places.map((name) => {
      const placeObj = { alt: name };
      formats.forEach((form) => {
        placeObj[form] = `/static/spring/${name}/${name}-${form}/${name}-${form}-medium/${name}1.${form}`;
      });
      return placeObj;
    });
  }, [places, formats]);

  const content = useMemo(() => {
    return places.map((place, index) => {
      const infoRef = imageInfoRef.current[index];
      const imageRef = imageRefs.current[index];
      return (
        <React.Fragment key={index}>
          <div ref={infoRef} className={styles.imageinfo}>
            <p className={styles.place}>{place}</p>
            <p className={styles.info}>
              {`Packages typically range from ${daysAndNights[index][0][0]}N / ${daysAndNights[index][0][1]}D to ${daysAndNights[index][1][0]}N / ${daysAndNights[index][1][1]}D, click to see more`}
            </p>
          </div>
          <div ref={imageRef} className={styles.imageContainer}>
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
      );
    });
  }, [places, groupedImages, daysAndNights]);

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

    const infoElements = imageInfoRef.current.map(ref => ref.current).filter(Boolean);
    const imageElements = imageRefs.current.map(ref => ref.current).filter(Boolean);

    if (infoElements.length !== places.length || imageElements.length !== places.length) {
      console.warn('Mismatch in ref counts, some elements may not animate');
    }

    const ctx = gsap.context(() => {
      const text = textRef.current.textContent || '';
      if (!text) return;

      textRef.current.innerHTML = text
        .split('')
        .map(char => `<span class="${styles.char}">${char}</span>`)
        .join('');

      const chars = gsap.utils.toArray(`.${styles.char}`, textRef.current);
      animateText(chars);
      animateElements(infoElements);
      animateElements(imageElements);
      animateElementsEnd([textRef, gridRef]);

      gsap.to(containerRef.current, {
        backgroundImage: 'linear-gradient(90deg,rgb(19, 30, 39) 0%, #517fa4 100%)',
        ease: 'expo.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom bottom',
          end: '+=1px',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, [places]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sectionName}>
        <p ref={textRef} className={styles.text}>SPRING</p>
      </div>
      <div ref={gridRef} className={styles.grid}>
        {content}
      </div>
    </div>
  );
}
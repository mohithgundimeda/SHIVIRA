import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../Styles/Spring.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Spring() {
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const animationContainerRef = useRef(null);
  const emptyRef = useRef(null);
  const summerRef = useRef(null);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const places = useMemo(() => ['kerala', 'bhutan', 'nainital', 'nepal', 'ooty'], []);
  const formats = useMemo(() => ['webp', 'jpg'], []);
  const daysAndNights = useMemo(() => [[[5, 6], [8, 9]], [[5, 6], [8, 9]], [[5,6],[10,11]], [[5,6],[10,11]], [[4,5],[6,7]]], []);
  const imageInfoRef = useRef(places.map(() => React.createRef(null)));
  const imageRefs = useRef(places.map(() => React.createRef(null)));
  const basePetals = useMemo(() => ['brownpetal', 'whitepetal', 'whitepetal2'], []);

  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);



  const animateElements = useCallback((elements, options = {}) => {
    if (!elements?.length) return;
    const { start = 'top bottom', duration = 0.2 } = options;
    elements.forEach((element) => {
      if (element) {
        gsap.set(element, { opacity: 0 });
        gsap.to(element, {
          opacity: 1,
          duration,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start,
            toggleActions: 'play none none none',
            immediateRender: false,
            invalidateOnRefresh: true,
          },
        });
      }
    });
  }, []);

  // Text animation
  const animateText = useCallback((chars) => {
    if (!chars?.length || !textRef.current) return;
    gsap.set(chars, { opacity: 0 });
    gsap.to(chars, {
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top center',
        toggleActions: 'play none none none',
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  // Petal animation
  const animatePetals = useCallback((petalElements) => {
    if (!petalElements?.length || !viewportDimensions || !emptyRef.current || !summerRef.current) return;
    petalElements.forEach((petal) => {
      const offScreenDistance = -1.5 * viewportDimensions.width;
      gsap.set(petal, {
        x: gsap.utils.random(offScreenDistance, -viewportDimensions.width),
        y: viewportDimensions.height + gsap.utils.random(0, 200),
        rotation: gsap.utils.random(-45, 45),
        scale: gsap.utils.random(0.5, 2.1),
      });

      const aspectRatio = viewportDimensions.width / viewportDimensions.height;
      const diagonalYEnd = -viewportDimensions.height * aspectRatio + 1000;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: emptyRef.current,
          start: 'top top',
          end: '+=1000px',
          scrub: 3,
        },
      });

      tl.to(petal, {
        x: viewportDimensions.width + 100,
        y: diagonalYEnd,
        duration: 5,
        ease: 'none',
      }).add(
        gsap.to(
          emptyRef.current,{
            backgroundImage:'linear-gradient(90deg,rgb(19, 30, 39) 0%, #517fa4 100%)',
            duration:5,
            ease:'expo.inOut',
            immediateRender: false,
            scrollTrigger: {
              trigger: emptyRef.current,
              start: 'top top',
              end: '+=1000px',
              scrub: 3,
            },
          }),'<'
      ).to(
         summerRef.current,{
          opacity:1,
          duration:1,
          ease:'expo.in'
        }
      ,'<+=2').to(petal,{
        autoAlpha:0,
        duration:1
      });
    });
  }, [viewportDimensions]);

  // Main animation setup
  useEffect(() => {
    if (!textRef.current || !gridRef.current || !animationContainerRef.current || !emptyRef.current) {
      console.warn('Required refs are missing, skipping animation setup');
      return;
    }

    const infoElements = imageInfoRef.current.map(ref => ref.current).filter(Boolean);
    const imageElements = imageRefs.current.map(ref => ref.current).filter(Boolean);
    if (infoElements.length !== places.length || imageElements.length !== places.length) {
      console.warn('Mismatch in ref counts, some elements may not animate');
    }

    const text = textRef.current.textContent || '';
    if (!text) {
      console.warn('Text content is empty, skipping text animation');
      return;
    }

    textRef.current.innerHTML = text
      .split('')
      .map(char => char === ' ' ? char : `<span class="${styles.char}">${char}</span>`)
      .join('');

    const chars = gsap.utils.toArray(`.${styles.char}`, textRef.current);
    const petalElements = gsap.utils.toArray(`.${styles.petal}`, animationContainerRef.current);

    const ctx = gsap.context(() => {
      animateText(chars);
      animateElements(infoElements);
      animateElements(imageElements);
      animatePetals(petalElements);

      gsap.to(emptyRef.current, {
        scrollTrigger: {
          trigger: emptyRef.current,
          start: 'top top',
          end: '+=1000px',
          pin: emptyRef.current,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, [animateText, animateElements, animatePetals, places, viewportDimensions]);

  const groupedImages = useMemo(() => {
    return places.map((name) => {
      const placeObj = { alt: name };
      formats.forEach((form) => {
        placeObj[form] = `/static/spring/${name}/${name}-${form}/${name}-${form}-large/${name}1.${form}`;
      });
      return placeObj;
    });
  }, [places, formats]);

  // Content generation with <picture> tag
  const content = useMemo(() => {
    return places.map((place, index) => {
      const infoRef = imageInfoRef.current[index];
      const imageRef = imageRefs.current[index];
      return (
        <React.Fragment key={index}>
          <div ref={infoRef} className={styles.imageinfo}>
            <p className={styles.place}>{place}</p>
            <p className={styles.info}>{`Packages typically range from 
            ${daysAndNights[index][0][0]}N / ${daysAndNights[index][0][1]}D to ${daysAndNights[index][1][0]}N / ${daysAndNights[index][1][1]}D. click to see more`}</p>
          </div>
          <div ref={imageRef} className={styles.imageContainer}>
            <picture>
              <source srcSet={groupedImages[index].webp} type="image/webp" />
              <img
                src={groupedImages[index].jpg}
                alt={`Spring destination in ${place}`}
                className={styles.image}
                onError={(e) => { e.target.src = '/static/spring/fallback.jpg'; }}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </React.Fragment>
      );
    });
  }, [places, groupedImages, daysAndNights]);

  const petals = useMemo(() => {
    const petalCount = 60;
    const regularPetals = Array.from({ length: petalCount }, (_, i) => (
      <img
        key={`petal-${i}`}
        className={styles.petal}
        src={`/static/spring/${basePetals[Math.floor(Math.random() * basePetals.length)]}.png`}
        alt="Decorative spring petal"
        onError={(e) => { e.target.src = '/static/logo2.png'; }}
        loading="lazy"
        decoding="async"
      />
    ));
    return [...regularPetals];
  }, [basePetals]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sectionName}>
        <p ref={textRef} className={styles.text}>SPRING</p>
      </div>
      <div ref={gridRef} className={styles.grid} style={{ marginTop: '15rem' }}>
        {content}
      </div>
      <div ref={emptyRef} className={styles.emptyContainer}>
        <div ref={animationContainerRef} className={styles.animationContainer}>
          {petals}
        </div>
        <div className={styles.sectionNameContainer}>
          <p ref={summerRef} className={styles.summer}>SUMMER</p> 
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../Styles/Spring.module.css';
import { useIsMobile } from './useIsMobile';

gsap.registerPlugin(ScrollTrigger);

export default function Spring() {
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const animationContainerRef = useRef(null);
  const emptyRef = useRef(null);
  const largePetalRef = useRef(null);
  const isMobile = useIsMobile();
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const places = useMemo(() => ['KERALA', 'PROVENCE', 'KYOTO', 'AMSTERDAM', 'LISBON'], []);
  const paths = useMemo(() => [
    '/static/spring/munnar.jpg',
    '/static/spring/provence.jpg',
    '/static/destinations/kyoto/kyoto-jpg/kyoto-jpg-large/kyoto1.jpg',
    '/static/spring/netherlands2.webp',
    '/static/spring/lisbon.jpg',
  ], []);
  const imageInfoRef = useRef(places.map(() => React.createRef(null)));
  const imageRefs = useRef(places.map(() => React.createRef(null)));
  const basePetals = useMemo(() => ['brownpetal', 'whitepetal', 'whitepetal2'], []);

  // Debounced resize handler for performance
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Unified animation function for elements
  const animateElements = useCallback((elements, options = {}) => {
    if (!elements?.length) return;
    const { start = 'top center+=100px', duration = 0.5 } = options;
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
    if (!petalElements?.length || !viewportDimensions || !emptyRef.current) return;
    petalElements.forEach((petal) => {
      const offScreenDistance = isMobile ? -0.75 * viewportDimensions.width : -1.5 * viewportDimensions.width;
      gsap.set(petal, {
        x: gsap.utils.random(offScreenDistance, -viewportDimensions.width),
        y: viewportDimensions.height + gsap.utils.random(0, 200),
        rotation: gsap.utils.random(-45, 45),
        scale: gsap.utils.random(0.5, 2),
      });

      const aspectRatio = viewportDimensions.width / viewportDimensions.height;
      const diagonalYEnd = -viewportDimensions.height * aspectRatio;

      gsap.to(petal, {
        x: viewportDimensions.width,
        y: diagonalYEnd,
        duration: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: emptyRef.current,
          start: 'top top',
          end: '+=1000px',
          scrub: 5,
          invalidateOnRefresh: true,
        },
      });
    });
  }, [isMobile, viewportDimensions]);

  // Large petal animation
  const animateLargePetal = useCallback(() => {
    if (!largePetalRef.current || !viewportDimensions || !emptyRef.current) return;
    gsap.set(largePetalRef.current, {
      x: -viewportDimensions.width,
      y: viewportDimensions.height,
      scale: 1,
      transform: 'translate(-50%, -50%)',
    });
    const aspectRatio = viewportDimensions.width / viewportDimensions.height;
    const diagonalYEnd = -viewportDimensions.height * aspectRatio;
    gsap.to(largePetalRef.current, {
      x: viewportDimensions.width,
      y: diagonalYEnd,
      duration: 5,
      transform: 'translate(-50%, -50%)',
      rotation: 90,
      scale: 1.1,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: emptyRef.current,
        start: 'top top',
        end: '+=1000px',
        scrub: 5,
        invalidateOnRefresh: true,
      },
    });
  }, [viewportDimensions]);

  // Main animation setup
  useEffect(() => {
    if (!textRef.current || !gridRef.current || !animationContainerRef.current || !emptyRef.current || !largePetalRef.current) {
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
      animateLargePetal();

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
  }, [animateText, animateElements, animatePetals, animateLargePetal, places, isMobile, viewportDimensions]);

  // Content generation
  const content = useMemo(() => {
    return places.map((place, index) => {
      const infoRef = imageInfoRef.current[index];
      const imageRef = imageRefs.current[index];
      return (
        <React.Fragment key={index}>
          <div ref={infoRef} className={styles.imageinfo}>
            <p className={styles.place}>{place}</p>
            <p className={styles.info}>Packages typically range from 5N / 6D to 9N / 10D</p>
          </div>
          <div ref={imageRef} className={styles.imageContainer}>
            <img
              src={paths[index]}
              className={styles.image}
              alt={`Spring destination in ${place}`}
              onError={(e) => { e.target.src = '/static/spring/fallback.jpg'; }}
              loading="lazy"
              decoding="async"
            />
          </div>
        </React.Fragment>
      );
    });
  }, [places, paths]);

  // Petals generation with reduced count
  const petals = useMemo(() => {
    const petalCount = isMobile ? 10 : 50; // Further reduced for production performance
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
    const largePetal = (
      <img
        ref={largePetalRef}
        key="largePetal"
        className={styles.largePetal}
        src={`/static/spring/${basePetals[1]}.png`}
        alt="Large decorative spring petal"
        onError={(e) => { e.target.src = '/static/logo2.png'; }}
        loading="lazy"
        decoding="async"
      />
    );
    return [...regularPetals, largePetal];
  }, [basePetals, isMobile]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sectionName}>
        <p ref={textRef} className={styles.text}>SPRING</p>
      </div>
      <div ref={gridRef} className={styles.grid} style={{ marginTop: isMobile ? '5rem' : '15rem' }}>
        {content}
      </div>
      <div ref={emptyRef} className={styles.emptyContainer}>
        <div ref={animationContainerRef} className={styles.animationContainer}>
          {petals}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useMemo } from "react";
import styles from '../Styles/Summer.module.css';
import gsap from "gsap";
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const NUM_PACKAGES = 5;

export default function SummerContent({ contentRef, scrollDistance, svgDimensions }) {
  const fenceBlockRef = useRef(Array(NUM_PACKAGES).fill().map(() => React.createRef(null)));
  const fenceContainerRef = useRef(null);
  const autumnRef = useRef(null);
  const titleRef = useRef(null);
  const leafRef = useRef(null);
  const prevSvgDimensions = useRef(svgDimensions);

  const placesData = useMemo(() => [
    { name: 'brazil', display: 'RIO DE JANEIRO' },
    { name: 'leh', display: 'LADAKH' },
    { name: 'monte', display: 'MONTE CARLO' },
    { name: 'nz', display: 'NEW ZEALAND' },
    { name: 'yellowstone', display: 'YELLOWSTONE' },
  ], []);

  const groupedImages = useMemo(() => placesData.map(({ name }) => ({
    alt: name,
    webp: `/static/summer/${name}/${name}-webp/${name}-webp-large/${name}1.webp`,
    jpg: `/static/summer/${name}/${name}-jpg/${name}-jpg-large/${name}1.jpg`,
  })), [placesData]);

useEffect(() => {
  if (
    !contentRef.current ||
    !fenceContainerRef.current ||
    !scrollDistance ||
    !leafRef.current ||
    !autumnRef.current ||
    !titleRef.current ||
    !svgDimensions
  ) {
    console.warn('Missing required refs or props for SummerContent animations');
    return;
  }

  // Validate svgDimensions consistency
  if (
    prevSvgDimensions.current &&
    (prevSvgDimensions.current.width !== svgDimensions.width ||
     prevSvgDimensions.current.height !== svgDimensions.height)
  )
  prevSvgDimensions.current = svgDimensions;

  // Capture ref values inside the effect
  const fenceContainer = fenceContainerRef.current;
  const leaf = leafRef.current;
  const autumn = autumnRef.current;
  const title = titleRef.current;
  const fenceBlocks = fenceBlockRef.current;

  const viewportHeight = window.innerHeight || 1080;
  const targetY = -0.5 * viewportHeight;

  const ctx = gsap.context(() => {

    gsap.set(leaf, {
      motionPath: {
        path: '#leafPath',
        align: '#leafPath',
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 0,
        immediateRender: true,
      },
    });

    gsap.set(autumn, { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contentRef.current,
        start: 'top top',
        end: `top+=${scrollDistance} bottom`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    fenceBlocks.forEach((ref, index) => {
      if (ref.current) {
        const cycleDuration = 12;
        const startPosition = index * cycleDuration;

        tl.fromTo(
          ref.current,
          { y: 70 },
          { y: targetY, duration: cycleDuration / 2, ease: 'expo.inOut' },
          startPosition
        ).to(
          ref.current,
          { y: 0, duration: cycleDuration / 2, ease: 'expo.inOut' },
          startPosition + cycleDuration
        );
      }
    });

    tl.to(leaf, {
      duration: 5,
      ease: 'linear',
      motionPath: {
        path: '#leafPath',
        align: '#leafPath',
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 1,
      },
      rotation: 30,
    })
    .to(fenceContainer, { autoAlpha: 0, ease: 'expo.inOut' }, '<')
    .to(leaf, { scale: 3, duration: 7, ease: 'expo.inOut' }, '<')
    .to(autumn, { autoAlpha: 1, duration: 0.1 }, '>')
    .to(autumn, {
      backgroundColor: '#574964',
      // backgroundImage: 'linear-gradient(to bottom, #c79081 0%, #dfa579 100%)',
      duration: 1,
      ease: 'expo.out',
    }, '>+=1');

  }, contentRef);

  return () => {
    gsap.killTweensOf([fenceContainer, leaf, autumn, title]);
    fenceBlocks.forEach((ref) => {
      if (ref.current) {
        gsap.killTweensOf(ref.current);
      }
    });
    ctx.revert();
  }
}, [contentRef, scrollDistance, svgDimensions]);

  const blocks = placesData.map(({ name, display }, index) => {
    const handleImageError = (e) => {
      e.target.src = groupedImages[index].jpg;
      console.log(`Switching to JPG: ${groupedImages[index].jpg}`);
      e.target.onerror = () => {
        console.error(`Failed to load JPG: ${groupedImages[index].jpg}`);
        e.target.src = '/static/logo4.png';
        console.log(`Falling back to logo: /static/logo4.png`);
      };
    };

    return (
      <div key={name} ref={fenceBlockRef.current[index]} className={styles.fenceBlock}>
        <img
          src={groupedImages[index].webp}
          alt={groupedImages[index].alt}
          className={styles.fenceImage}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.placeName}>
          <p>{display}</p>
        </div>
        <div className={styles.clickContainer}>
          <p>CLICK TO SEE MORE</p>
        </div>
      </div>
    );
  });

  return (
    <div className={styles.nestedContainer}>
      <div ref={fenceContainerRef} className={styles.fenceContainer}>
        <div className={styles.fence}>{blocks}</div>
      </div>
      <div className={styles.leafContainer}>
        <div ref={autumnRef} className={styles.autumn}>
          <p ref={titleRef}>AUTUMN</p>
        </div>
        <img
          src="static/summer/leaf.png"
          alt="autumn leaf"
          loading="lazy"
          className={styles.leaf}
          ref={leafRef}
          onError={(e) => { e.target.src = '/static/logo4.png'; }}
        />
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, left: 0, top: 0, opacity: 0 }}
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
          aria-hidden="true"
        >
          <path
            id="leafPath"
            d={`M${svgDimensions.width / 2},${svgDimensions.height + 200}
                C${svgDimensions.width * 0.48},${svgDimensions.height * 0.8}
                ${svgDimensions.width * 0.42},${svgDimensions.height * 0.65}
                ${svgDimensions.width * 0.45},${svgDimensions.height * 0.5},
                C${svgDimensions.width * 0.48},${svgDimensions.height * 0.35}
                ${svgDimensions.width * 0.52},${svgDimensions.height * 0.35}
                ${svgDimensions.width / 2},${svgDimensions.height / 2}`}
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
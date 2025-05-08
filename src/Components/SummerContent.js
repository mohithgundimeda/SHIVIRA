// import React, { useEffect, useRef, useMemo } from "react";
// import styles from '../Styles/Summer.module.css';
// import gsap from "gsap";
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const NUM_PACKAGES = 5;

// export default function SummerContent({ contentRef, scrollDistance, svgDimensions }) {
//   const fenceBlockRef = useRef(Array(NUM_PACKAGES).fill().map(() => React.createRef(null)));
//   const fenceContainerRef = useRef(null);
//   const autumnRef = useRef(null);
//   const titleRef = useRef(null);
//   const leafRef = useRef(null);

//   const placesData = useMemo(() => [
//     { name: 'brazil', display: 'RIO DE JANEIRO' },
//     { name: 'leh', display: 'LADAKH' },
//     { name: 'monte', display: 'MONTE CARLO' },
//     { name: 'nz', display: 'NEW ZEALAND' },
//     { name: 'yellowstone', display: 'YELLOWSTONE' },
//   ], []);

//   const groupedImages = useMemo(() => placesData.map(({ name }) => ({
//     alt: name,
//     webp: `/static/summer/${name}/${name}-webp/${name}-webp-large/${name}1.webp`,
//     jpg: `/static/summer/${name}/${name}-jpg/${name}-jpg-large/${name}1.jpg`,
//   })), [placesData]);

//   useEffect(() => {
//     if (!contentRef.current || !fenceContainerRef.current || !scrollDistance || !leafRef.current || !autumnRef.current || !titleRef.current) return;

//     const viewportHeight = window.innerHeight || 1080;
//     const targetY = -0.5 * viewportHeight;

//     const ctx = gsap.context(() => {
//       gsap.set(leafRef.current, { 
//         xPercent: -50, 
//         yPercent: -50, 
//         transformOrigin: 'center center',
//         autoAlpha: 1,
//         motionPath: {
//           path: '#leafPath',
//           alignOrigin: [0.5, 0.5],
//           start: 0,
//           end: 0,
//           immediateRender: true,
//         }
//       });

//       gsap.set(autumnRef.current, { autoAlpha: 0 });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentRef.current,
//           start: 'top top',
//           end: `+=${scrollDistance} bottom`,
//           scrub: 1,
//           invalidateOnRefresh: true,
//         },
//       });

//       fenceBlockRef.current.forEach((ref, index) => {
//         if (ref.current) {
//           const cycleDuration = 12;
//           const startPosition = index * cycleDuration;

//           tl.fromTo(
//             ref.current,
//             { y: 70 },
//             { y: targetY, duration: cycleDuration / 2, ease: 'expo.inOut' },
//             startPosition
//           ).to(
//             ref.current,
//             { y: 0, duration: cycleDuration / 2, ease: 'expo.inOut' },
//             startPosition + cycleDuration
//           );
//         }
//       });

//       tl.to(leafRef.current, {
//         duration: 5,
//         ease: 'linear',
//         motionPath: {
//           path: '#leafPath',
//           align: '#leafPath',
//           alignOrigin: [0.5, 0.5],
//           autoRotate: true,
//           start: 0,
//           end: 1,
//           offsetY: 100,
//         },
//         rotation: 100,
//       })
//       .to(fenceContainerRef.current, { autoAlpha: 0, ease: 'expo.inOut' }, '<')
//       .to(leafRef.current, { scale: 3, duration: 7, ease: 'expo.inOut' }, '<')
//       .to(autumnRef.current, { autoAlpha: 1, duration: 0.1 }, '>')
//       .to(autumnRef.current, {
//         backgroundImage: 'linear-gradient(to bottom, #c79081 0%, #dfa579 100%)',
//         duration: 1,
//         ease: 'expo.out',
//       }, '>+=1');

//       setTimeout(() => {
//         ScrollTrigger.refresh();
//         ScrollTrigger.update();
//         if (leafRef.current && gsap.getProperty(leafRef.current, 'x') < svgDimensions.width) {
//           try {
//             gsap.set(leafRef.current, {
//               motionPath: {
//                 path: '#leafPath',
//                 align: '#leafPath',
//                 alignOrigin: [0.5, 0.5],
//                 start: 0,
//                 end: 0,
//                 immediateRender: true,
//               }
//             });
//           } catch (error) {
//             console.warn('Error resetting leaf motion path:', error);
//           }
//         }
//       }, 100);
//     }, contentRef);

//     return () => ctx.revert();
//   }, [contentRef, scrollDistance, svgDimensions]);

//   const blocks = placesData.map(({ name, display }, index) => (
//     <div key={name} ref={fenceBlockRef.current[index]} className={styles.fenceBlock}>
//       <picture>
//         <source srcSet={groupedImages[index].webp} type="image/webp" />
//         <img
//           src={groupedImages[index].jpg}
//           alt={groupedImages[index].alt}
//           className={styles.fenceImage}
//           onError={(e) => { e.target.src = '/static/logo4.png'; }}
//           loading="lazy"
//           decoding="async"
//         />
//       </picture>
//       <div className={styles.placeName}>
//         <p>{display}</p>
//       </div>
//       <div className={styles.clickContainer}>
//         <p>CLICK TO SEE MORE</p>
//       </div>
//     </div>
//   ));

//   return (
//     <div className={styles.nestedContainer}>
//       <div ref={fenceContainerRef} className={styles.fenceContainer}>
//         <div className={styles.fence}>{blocks}</div>
//       </div>
//       <div className={styles.leafContainer}>
//         <div ref={autumnRef} className={styles.autumn}>
//           <p ref={titleRef}>AUTUMN</p>
//         </div>
//         <img
//           src="static/summer/leaf-reduced2.png"
//           alt="autumn leaf"
//           loading="lazy"
//           className={styles.leaf}
//           ref={leafRef}
//           onError={(e) => { e.target.src = '/static/logo4.png'; }}
//         />
//         <svg
//           width="100%"
//           height="100%"
//           style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, left: 0, top: 0, opacity: 0 }}
//           viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
//           aria-hidden="true"
//         >
//           <path
//             id="leafPath"
//             d={`M${svgDimensions.width + 300},${svgDimensions.height / 2}
//                 C${svgDimensions.width * 0.75},${svgDimensions.height * 0.3}
//                 ${svgDimensions.width * 0.65},${svgDimensions.height * 0.7}
//                 ${svgDimensions.width / 2},${svgDimensions.height / 2}`}
//             fill="none"
//             stroke="black"
//             strokeWidth="1"
//           />
//         </svg>
//       </div>
//     </div>
//   );
// };


// import React, { useEffect, useRef, useMemo } from "react";
// import styles from '../Styles/Summer.module.css';
// import gsap from "gsap";
// import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

// const NUM_PACKAGES = 5;

// export default function SummerContent({ contentRef, scrollDistance, svgDimensions }) {
//   const fenceBlockRef = useRef(Array(NUM_PACKAGES).fill().map(() => React.createRef(null)));
//   const fenceContainerRef = useRef(null);
//   const autumnRef = useRef(null);
//   const titleRef = useRef(null);
//   const leafRef = useRef(null);

//   const placesData = useMemo(() => [
//     { name: 'brazil', display: 'RIO DE JANEIRO' },
//     { name: 'leh', display: 'LADAKH' },
//     { name: 'monte', display: 'MONTE CARLO' },
//     { name: 'nz', display: 'NEW ZEALAND' },
//     { name: 'yellowstone', display: 'YELLOWSTONE' },
//   ], []);

//   const groupedImages = useMemo(() => placesData.map(({ name }) => ({
//     alt: name,
//     webp: `/static/summer/${name}/${name}-webp/${name}-webp-large/${name}1.webp`,
//     jpg: `/static/summer/${name}/${name}-jpg/${name}-jpg-large/${name}1.jpg`,
//   })), [placesData]);

//   useEffect(() => {
//     if (
//       !contentRef.current ||
//       !fenceContainerRef.current ||
//       !scrollDistance ||
//       !leafRef.current ||
//       !autumnRef.current ||
//       !titleRef.current ||
//       !svgDimensions
//     ) {
//       console.warn('Missing required refs or props for SummerContent animations');
//       return;
//     }

//     const viewportHeight = window.innerHeight || 1080;
//     const targetY = -0.5 * viewportHeight;

//     const ctx = gsap.context(() => {
//       gsap.set(leafRef.current, { 
//         xPercent: -50, 
//         yPercent: -50, 
//         transformOrigin: 'center center',
//         autoAlpha: 0,
//         motionPath: {
//           path: '#leafPath',
//           alignOrigin: [0.5, 0.5],
//           start: 0,
//           end: 0,
//           immediateRender: true,
//         },
//       });

//       gsap.set(autumnRef.current, { autoAlpha: 0 });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentRef.current,
//           start: 'top top',
//           end: `+=${scrollDistance} bottom`,
//           scrub: 1,
//           invalidateOnRefresh: true,
//           onEnter: () => {
//             gsap.set(leafRef.current, {
//               motionPath: {
//                 path: '#leafPath',
//                 align: '#leafPath',
//                 alignOrigin: [0.5, 0.5],
//                 start: 0,
//                 end: 0,
//                 immediateRender: true,
//               },
//               autoAlpha: 1,
//             });
//           },
//           onRefresh: (self) => {
//             if (leafRef.current) {
//               const progress = self.progress;
//               gsap.set(leafRef.current, {
//                 motionPath: {
//                   path: '#leafPath',
//                   align: '#leafPath',
//                   alignOrigin: [0.5, 0.5],
//                   autoRotate: true,
//                   start: progress,
//                   end: progress,
//                   immediateRender: true,
//                 },
//                 scale: gsap.utils.interpolate(1, 3, progress),
//                 rotation: gsap.utils.interpolate(0, 30, progress),
//                 autoAlpha: progress > 0 ? 1 : 0,
//               });
//             }
//             tl.progress(self.progress);
//           },
//         },
//       });

//       fenceBlockRef.current.forEach((ref, index) => {
//         if (ref.current) {
//           const cycleDuration = 12;
//           const startPosition = index * cycleDuration;

//           tl.fromTo(
//             ref.current,
//             { y: 70 },
//             { y: targetY, duration: cycleDuration / 2, ease: 'expo.inOut' },
//             startPosition
//           ).to(
//             ref.current,
//             { y: 0, duration: cycleDuration / 2, ease: 'expo.inOut' },
//             startPosition + cycleDuration
//           );
//         }
//       });

//       tl.to(leafRef.current, {
//         duration: 5,
//         ease: 'linear',
//         motionPath: {
//           path: '#leafPath',
//           align: '#leafPath',
//           alignOrigin: [0.5, 0.5],
//           start: 0,
//           end: 1,
//           offsetY: 100,
//         },
//         rotation: 30,
//       })
//       .to(fenceContainerRef.current, { autoAlpha: 0, ease: 'expo.inOut' }, '<')
//       .to(leafRef.current, { scale: 3, duration: 7, ease: 'expo.inOut' }, '<')
//       .to(autumnRef.current, { autoAlpha: 1, duration: 0.1 }, '>')
//       .to(autumnRef.current, {
//         backgroundImage: 'linear-gradient(to bottom, #c79081 0%, #dfa579 100%)',
//         duration: 1,
//         ease: 'expo.out',
//       }, '>+=1');

//     }, contentRef);

//     return () => ctx.revert();
//   }, [contentRef, scrollDistance, svgDimensions]);

//   const blocks = placesData.map(({ name, display }, index) => (
//     <div key={name} ref={fenceBlockRef.current[index]} className={styles.fenceBlock}>
//       <picture>
//         <source srcSet={groupedImages[index].webp} type="image/webp" />
//         <img
//           src={groupedImages[index].jpg}
//           alt={groupedImages[index].alt}
//           className={styles.fenceImage}
//           onError={(e) => { e.target.src = '/static/logo4.png'; }}
//           loading="lazy"
//           decoding="async"
//         />
//       </picture>
//       <div className={styles.placeName}>
//         <p>{display}</p>
//       </div>
//       <div className={styles.clickContainer}>
//         <p>CLICK TO SEE MORE</p>
//       </div>
//     </div>
//   ));

//   return (
//     <div className={styles.nestedContainer}>
//       <div ref={fenceContainerRef} className={styles.fenceContainer}>
//         <div className={styles.fence}>{blocks}</div>
//       </div>
//       <div className={styles.leafContainer}>
//         <div ref={autumnRef} className={styles.autumn}>
//           <p ref={titleRef}>AUTUMN</p>
//         </div>
//         <img
//           src="static/summer/leaf-reduced2.png"
//           alt="autumn leaf"
//           loading="lazy"
//           className={styles.leaf}
//           ref={leafRef}
//           onError={(e) => { e.target.src = '/static/logo4.png'; }}
//         />
//         <svg
//           width="100%"
//           height="100%"
//           style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, left: 0, top: 0, opacity: 0 }}
//           viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
//           aria-hidden="true"
//         >
//           <path
//             id="leafPath"
//             d={`M${svgDimensions.width / 2},${svgDimensions.height + 200}
//                 C${svgDimensions.width * 0.48},${svgDimensions.height * 0.8}
//                 ${svgDimensions.width * 0.42},${svgDimensions.height * 0.65}
//                 ${svgDimensions.width * 0.45},${svgDimensions.height * 0.5}
//                 C${svgDimensions.width * 0.48},${svgDimensions.height * 0.35}
//                 ${svgDimensions.width * 0.52},${svgDimensions.height * 0.35}
//                 ${svgDimensions.width / 2},${svgDimensions.height / 2}`}
//             fill="none"
//             stroke="black"
//             strokeWidth="1"
//           />
//         </svg>
//       </div>
//     </div>
//   );
// }
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

    const viewportHeight = window.innerHeight || 1080;
    const targetY = -0.5 * viewportHeight;

    const ctx = gsap.context(() => {
      gsap.set(leafRef.current, { 
        xPercent: -50, 
        yPercent: -50, 
        transformOrigin: 'center center',
        autoAlpha: 0,
        motionPath: {
          path: '#leafPath',
          alignOrigin: [0.5, 0.5],
          start: 0,
          end: 0,
          immediateRender: true,
        },
      });

      gsap.set(autumnRef.current, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top top',
          end: `+=${scrollDistance} bottom`,
          scrub: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.set(leafRef.current, {
              motionPath: {
                path: '#leafPath',
                align: '#leafPath',
                alignOrigin: [0.5, 0.5],
                start: 0,
                end: 0,
                immediateRender: true,
              },
              autoAlpha: 1,
            });
          },
          onRefresh: (self) => {
            if (leafRef.current) {
              const progress = self.progress;
              const isInView = self.isActive;
              if (isInView) {
                gsap.set(leafRef.current, {
                  motionPath: {
                    path: '#leafPath',
                    align: '#leafPath',
                    alignOrigin: [0.5, 0.5],
                    autoRotate: true,
                    start: progress,
                    end: progress,
                    immediateRender: true,
                  },
                  scale: gsap.utils.interpolate(1, 3, progress),
                  rotation: gsap.utils.interpolate(0, 30, progress),
                  autoAlpha: progress > 0 ? 1 : 0,
                });
                if (progress === 1) {
                  gsap.set(leafRef.current, {
                    x: svgDimensions.width / 2,
                    y: svgDimensions.height / 2,
                    scale: 3,
                    rotation: 30,
                    autoAlpha: 1,
                  });
                }
              } else {
                gsap.set(leafRef.current, {
                  motionPath: {
                    path: '#leafPath',
                    align: '#leafPath',
                    alignOrigin: [0.5, 0.5],
                    start: 0,
                    end: 0,
                    immediateRender: true,
                  },
                  scale: 1,
                  rotation: 0,
                  autoAlpha: 0,
                });
                tl.progress(0);
              }
              tl.progress(self.progress);
            }
          },
        },
      });

      fenceBlockRef.current.forEach((ref, index) => {
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

      tl.to(leafRef.current, {
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
      .to(fenceContainerRef.current, { autoAlpha: 0, ease: 'expo.inOut' }, '<')
      .to(leafRef.current, { scale: 3, duration: 7, ease: 'expo.inOut' }, '<')
      .to(autumnRef.current, { autoAlpha: 1, duration: 0.1 }, '>')
      .to(autumnRef.current, {
        backgroundImage: 'linear-gradient(to bottom, #c79081 0%, #dfa579 100%)',
        duration: 1,
        ease: 'expo.out',
      }, '>+=1');

    }, contentRef);

    return () => ctx.revert();
  }, [contentRef, scrollDistance, svgDimensions]);

  const blocks = placesData.map(({ name, display }, index) => (
    <div key={name} ref={fenceBlockRef.current[index]} className={styles.fenceBlock}>
      <picture>
        <source srcSet={groupedImages[index].webp} type="image/webp" />
        <img
          src={groupedImages[index].jpg}
          alt={groupedImages[index].alt}
          className={styles.fenceImage}
          onError={(e) => { e.target.src = '/static/logo4.png'; }}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className={styles.placeName}>
        <p>{display}</p>
      </div>
      <div className={styles.clickContainer}>
        <p>CLICK TO SEE MORE</p>
      </div>
    </div>
  ));

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
          src="static/summer/leaf-reduced2.png"
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
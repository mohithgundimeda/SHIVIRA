import React, { useLayoutEffect, useEffect, useRef, useState, useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/Spring.module.css";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  PLACES: ["kerala", "bhutan", "nainital", "nepal", "ooty"],
  DAYS_NIGHTS: [
    [[5, 6], [8, 9]],
    [[5, 6], [8, 9]],
    [[5, 6], [10, 11]],
    [[5, 6], [10, 11]],
    [[4, 5], [6, 7]],
  ],
  FORMATS: ["webp", "jpg"],
  FALLBACK_IMAGE: "/static/spring/fallback.jpg",
  IMAGE_BASE_PATH: "/static/admin",
  BASE_PETALS: ["brownpetal", "whitepetal", "whitepetal2"],
  PETAL_COUNT: 20,
  PETAL_FALLBACK: "/static/logo2.png",
};

const Spring = forwardRef(({ className, summer, ...props }, ref) => {
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const emptyRef = useRef(null);
  const animationContainerRef = useRef(null);
  const summerContainerRef = useRef(null);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const loadedPetalsRef = useRef(0);
  const loadedImagesRef = useRef(0);
  const hasAppliedTransformsRef = useRef(false);
  const hasAnimatedPetalsRef = useRef(false);
  const itemRefs = useRef(
    CONFIG.PLACES.map(() => ({ info: React.createRef(), image: React.createRef() }))
  );
  const ctx = useRef(null);

 
  if (CONFIG.PLACES.length !== CONFIG.DAYS_NIGHTS.length) {
    console.error("[Spring] Mismatch between PLACES and DAYS_NIGHTS arrays");
  }
  if (!CONFIG.BASE_PETALS.length) {
    console.error("[Spring] BASE_PETALS is empty");
  }


  useLayoutEffect(() => {
    setViewportDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      console.debug("[Spring] Initial ScrollTrigger refresh");
    });
  }, []);

 
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(() => {
        setViewportDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        ScrollTrigger.refresh(true);
        console.debug("[Spring] ScrollTrigger refreshed on resize");
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(resizeTimeout);
    };
  }, []);

 
  useLayoutEffect(() => {
    if (ref) {
      ref.current = containerRef.current;
    }
    if (summer) {
      summer.current = summerContainerRef.current;
    }
    return () => {
      if (summer) {
        summer.current = null;
      }
    };
  }, [ref, summer]);


  const animateText = useCallback(() => {
    if (!textRef.current) {
      console.warn("[Spring] Missing textRef for animation");
      return;
    }
    const text = textRef.current.textContent || "";
    if (!text) {
      console.warn("[Spring] No text content for animation");
      return;
    }
    textRef.current.innerHTML = text
      .split("")
      .map((char) => (char === " " ? char : `<span class="${styles.char}">${char}</span>`))
      .join("");
    const chars = gsap.utils.toArray(`.${styles.char}`, textRef.current);
    if (!chars.length) {
      console.warn("[Spring] No characters found for text animation");
      return;
    }
    gsap.set(chars, { opacity: 0 });
    gsap.to(chars, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: textRef.current,
        start: "top center+=50px",
        toggleActions: "play none none none",
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  const animateElements = useCallback(() => {
    if (!gridRef.current) {
      console.warn("[Spring] Missing gridRef for animation");
      return;
    }
    const infoElements = itemRefs.current.map((item) => item.info.current).filter(Boolean);
    const imageElements = itemRefs.current.map((item) => item.image.current).filter(Boolean);
    if (infoElements.length !== CONFIG.PLACES.length || imageElements.length !== CONFIG.PLACES.length) {
      console.warn("[Spring] Mismatch in ref counts, some elements may not animate");
    }
    if (infoElements.length) {
      gsap.set(infoElements, { opacity: 0 });
      gsap.to(infoElements, {
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top center",
          end: "+=200px",
          toggleActions: "play none none none",
          immediateRender: false,
          invalidateOnRefresh: true,
        },
      });
    }
    if (imageElements.length) {
      gsap.set(imageElements, { opacity: 0 });
      gsap.to(imageElements, {
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top center",
          end: "+=200px",
          toggleActions: "play none none none",
          immediateRender: false,
          invalidateOnRefresh: true,
        },
      });
    }
  }, []);

  
  const applyTransforms = useCallback(() => {
    if (!animationContainerRef.current) {
      console.warn("[Spring] Missing animationContainerRef for petal transforms");
      return;
    }
    const petalElements = gsap.utils.toArray(`.${styles.petal}`, animationContainerRef.current);
    if (!petalElements.length) {
      console.warn("[Spring] No petal elements found for transforms");
      return;
    }
    if (hasAppliedTransformsRef.current) {
      console.debug("[Spring] Transforms already applied, skipping");
      return;
    }
    hasAppliedTransformsRef.current = true;
    requestAnimationFrame(() => {
      gsap.set(petalElements, {
        clearProps: "transform,x,y,rotation,scale",
        immediateRender: true,
      });
      petalElements.forEach((petal, index) => {
        gsap.set(petal, {
          x: gsap.utils.random(-viewportDimensions.width * 0.25, viewportDimensions.width),
          y: gsap.utils.random(viewportDimensions.height, 2.5 * viewportDimensions.height),
          rotation: gsap.utils.random(-45, 45),
          scale: gsap.utils.random(1.5, 2.5),
          force3D: true,
          immediateRender: true,
        });
        console.debug("[Spring] Petal transform set:", index, petal.style.transform, petal.getBoundingClientRect());
      });
    });
  }, [viewportDimensions]);


  const animatePetals = useCallback(() => {
    if (!animationContainerRef.current || !emptyRef.current) {
      console.warn("[Spring] Missing refs for petal animation");
      return;
    }
    const petalElements = gsap.utils.toArray(`.${styles.petal}`, animationContainerRef.current);
    if (!petalElements.length) {
      console.warn("[Spring] No petal elements found for animation");
      return;
    }
    if (hasAnimatedPetalsRef.current) {
      console.debug("[Spring] Petals already animated, skipping");
      return;
    }
    hasAnimatedPetalsRef.current = true;
    requestAnimationFrame(() => {
      petalElements.forEach((petal, index) => {
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: emptyRef.current,
            start: "top center+=200px",
            end: "top top",
            scrub: 2,
            invalidateOnRefresh: true,
            
          },
        });
        tl.to(petal, {
          y: -viewportDimensions.height,
          duration: 4,
        },'<')
          .add(
            gsap.to(emptyRef.current, {
              background:"linear-gradient(to bottom,#A2A695,#243949)",
              duration: 3,
              ease: "expo.inOut",
            }),
            "<"
          )
          .to(
            petal,
            {
              autoAlpha: 0,
              duration: 1,
            },
            ">"
          );
      });
    });
  }, [viewportDimensions]);

  // Setup animations
  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current || !gridRef.current || !emptyRef.current || !animationContainerRef.current) {
      console.warn("[Spring] Missing required refs, skipping animations");
      return;
    }

    ctx.current = gsap.context(() => {
      animateText();
      animateElements();
    }, containerRef.current);

    return () => {
      ctx.current?.revert();
    };
  }, [animateText, animateElements]);

  // Apply petal transforms and animations
  useEffect(() => {
    if (!animationContainerRef.current) {
      console.warn("[Spring] Missing animationContainerRef for petal setup");
      return;
    }

    const timer = setTimeout(() => {
      applyTransforms();
      animatePetals();
    }, 2000);

    return () => clearTimeout(timer);
  }, [applyTransforms, animatePetals, viewportDimensions]);

  // Precompute images
  const groupedImages = CONFIG.PLACES.map((name) => {
    const placeObj = { alt: name };
    CONFIG.FORMATS.forEach((form) => {
      placeObj[form] = `${CONFIG.IMAGE_BASE_PATH}/${name}/${name}-${form}/${name}-${form}-large/${name}1.${form}`;
    });
    return placeObj;
  });

  // Generate grid content
  const content = CONFIG.PLACES.map((place, index) => (
    <React.Fragment key={place}>
      <div
        ref={itemRefs.current[index].info}
        className={styles.imageinfo}
        role="button"
        tabIndex={0}
        aria-label={`View ${place} spring package details`}
      >
        <p className={styles.place}>{place}</p>
        <p className={styles.info} aria-live="polite">
          {`Packages typically range from ${CONFIG.DAYS_NIGHTS[index][0][0]}N / ${CONFIG.DAYS_NIGHTS[index][0][1]}D to ${CONFIG.DAYS_NIGHTS[index][1][0]}N / ${CONFIG.DAYS_NIGHTS[index][1][1]}D, click to see more`}
        </p>
      </div>
      <div ref={itemRefs.current[index].image} className={styles.imageContainer}>
        <picture>
          <source srcSet={groupedImages[index].webp} type="image/webp" />
          <img
            src={groupedImages[index].jpg}
            alt={`Spring destination in ${place}`}
            className={styles.image}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ aspectRatio: "16/9" }}
            onLoad={() => {
              loadedImagesRef.current += 1;
              console.debug("[Spring] Grid image loaded:", loadedImagesRef.current, `/${CONFIG.PLACES.length}`);
            }}
            onError={(e) => {
              e.target.src = CONFIG.FALLBACK_IMAGE;
              console.warn(`[Spring] Failed to load image for ${place}, using fallback`);
              loadedImagesRef.current += 1;
              console.debug("[Spring] Grid image loaded (fallback):", loadedImagesRef.current, `/${CONFIG.PLACES.length}`);
            }}
          />
        </picture>
      </div>
    </React.Fragment>
  ));

  // Generate petals
  const petals = Array.from({ length: CONFIG.PETAL_COUNT }, (_, i) => (
    <img
      key={`petal-${i}`}
      className={styles.petal}
      src={`/static/spring/${CONFIG.BASE_PETALS[Math.floor(Math.random() * CONFIG.BASE_PETALS.length)]}.png`}
      alt="Decorative spring petal"
      aria-hidden="true"
      loading="eager"
      fetchPriority="high"
      decoding="async"
      onLoad={() => {
        loadedPetalsRef.current += 1;
        console.debug("[Spring] Petal loaded:", loadedPetalsRef.current, `/${CONFIG.PETAL_COUNT}`);
        if (loadedPetalsRef.current >= CONFIG.PETAL_COUNT * 0.9) {
          applyTransforms();
          animatePetals();
        }
      }}
      onError={(e) => {
        e.target.src = CONFIG.PETAL_FALLBACK;
        console.warn(`[Spring] Failed to load petal image, using fallback`);
        loadedPetalsRef.current += 1;
        console.debug("[Spring] Petal loaded (fallback):", loadedPetalsRef.current, `/${CONFIG.PETAL_COUNT}`);
        if (loadedPetalsRef.current >= CONFIG.PETAL_COUNT * 0.9) {
          applyTransforms();
          animatePetals();
        }
      }}
    />
  ));

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ""}`}>
      <div className={styles.sectionName}>
        <p ref={textRef} className={styles.text}>
          SPRING
        </p>
      </div>
      <div ref={gridRef} className={styles.grid}>
        {content}
      </div>
      <div ref={emptyRef} className={styles.emptyContainer}>
        <div ref={animationContainerRef} className={styles.animationContainer}>
          {petals}
        </div>
        <div ref={summerContainerRef} className={styles.sectionNameContainer}>
          <p
            className={styles.summer}
            aria-label="Summer section indicator"
          >
            SUMMER
          </p>
        </div>
      </div>
    </div>
  );
});

Spring.propTypes = {
  className: PropTypes.string,
  summer: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};

Spring.displayName = "Spring";

export default Spring;
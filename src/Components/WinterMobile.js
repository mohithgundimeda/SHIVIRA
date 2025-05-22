import React, { useLayoutEffect, useEffect, useRef, useCallback, forwardRef, useMemo} from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../Styles/WinterMobile.module.css";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  PLACES: ["darjeeling", "gangtok", "manali", "shimla", "srinagar"],
  DAYS_NIGHTS: [
    [[5, 6], [8, 9]],
    [[5, 6], [8, 9]],
    [[5, 6], [10, 11]],
    [[5, 6], [10, 11]],
    [[4, 5], [6, 7]],
  ],
  FORMATS: ["webp", "jpg"],
  LOGO_FALLBACK: "/static/logo4.png",
  IMAGE_BASE_PATH: "/static/winter",
};

/**
 * WinterMobile component for mobile devices, displaying winter destinations with animations.
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class for the container
 */
const WinterMobile = forwardRef(({className}, ref)=>{
  const location = useLocation();
  const textRef = useRef(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const itemRefs = useRef(
    CONFIG.PLACES.map(() => ({ info: React.createRef(), image: React.createRef() }))
  );
  const ctx = useRef(null);

  useEffect(()=>{
    if(ref){
      ref.current = containerRef.current
    }
  },[ref]);

  // Validate data consistency
  if (CONFIG.PLACES.length !== CONFIG.DAYS_NIGHTS.length) {
    console.error("[WinterMobile] Mismatch between PLACES and DAYS_NIGHTS arrays");
  }

  // Precompute grouped images
const groupedImages = useMemo(() => {
  return CONFIG.PLACES.map((name) => {
    const placeObj = { alt: name };
    CONFIG.FORMATS.forEach((form) => {
      placeObj[form] = `${CONFIG.IMAGE_BASE_PATH}/${name}/${name}-${form}/${name}-${form}-medium/${name}1.${form}`;
    });
    return placeObj;
  });
}, []);

  // Handle image errors
  const handleImageError = useCallback((e, index) => {
    const jpgPath = groupedImages[index].jpg;
    e.target.src = jpgPath;
    console.warn(`[WinterMobile] Switching to JPG: ${jpgPath}`);
    e.target.onerror = () => {
      console.error(`[WinterMobile] Failed to load JPG: ${jpgPath}`);
      e.target.src = CONFIG.LOGO_FALLBACK;
      console.warn(`[WinterMobile] Falling back to logo: ${CONFIG.LOGO_FALLBACK}`);
    };
  }, [groupedImages]);

  // Animate text characters
  const animateText = useCallback((chars) => {
    if (!chars?.length || !containerRef.current) {
      console.warn("[WinterMobile] Missing chars or containerRef for text animation");
      return;
    }
    gsap.set(chars, { opacity: 0 });
    gsap.to(chars, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        toggleActions: "play none none none",
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  // Animate elements (info or images)
  const animateElements = useCallback((elements, options = {}) => {
    if (!elements?.length || !gridRef.current) {
      console.warn("[WinterMobile] Missing elements or gridRef for animation");
      return;
    }
    const { start = "top center", duration = 0.6 } = options;
    gsap.set(elements, { opacity: 0 });
    gsap.to(elements, {
      opacity: 1,
      duration,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: gridRef.current,
        start,
        end: "+=200px",
        toggleActions: "play none none none",
        immediateRender: false,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  
  const animateElementsEnd = useCallback((ref) => {
    if (!ref?.current || !containerRef.current) {
      console.warn("[WinterMobile] Missing ref or containerRef for end animation");
      return;
    }
    gsap.to(ref.current, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "bottom center+=100px",
        end: "bottom center",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }, []);

  // Animation setup
  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current || !gridRef.current) {
      console.warn("[WinterMobile] Missing required refs, skipping animations");
      return;
    }

    const infoElements = itemRefs.current.map((item) => item.info.current).filter(Boolean);
    const imageElements = itemRefs.current.map((item) => item.image.current).filter(Boolean);

    if (infoElements.length !== CONFIG.PLACES.length || imageElements.length !== CONFIG.PLACES.length) {
      console.warn("[WinterMobile] Mismatch in ref counts, some elements may not animate");
    }

    ctx.current = gsap.context(() => {
      // Text animation
      const text = textRef.current?.textContent || "";
      if (!text) {
        console.warn("[WinterMobile] No text content for animation");
        return;
      }
      textRef.current.innerHTML = text
        .split("")
        .map((char) => `<span class="${styles.char}">${char}</span>`)
        .join("");
      
       const chars = gsap.utils.toArray("span", textRef.current);
      animateText(chars);

      // Info and image animations
      animateElements(infoElements, { start: "top center" });
      animateElements(imageElements, { start: "top center+=50px" });

      // End animation (text only)
      animateElementsEnd(gridRef);

      
    }, containerRef.current);

    return () => ctx.current?.revert();
  }, [animateText, animateElements, animateElementsEnd]);

  // Refresh ScrollTrigger on route change
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Generate content
  const content = CONFIG.PLACES.map((place, index) => (
    <React.Fragment key={place}>
      <div
        ref={itemRefs.current[index].info}
        className={styles.imageinfo}
        role="button"
        tabIndex={0}
        aria-label={`View ${place} winter package details`}
      >
        <p className={styles.place}>{place}</p>
        <p className={styles.info} aria-live="polite">
          {`Packages typically range from ${CONFIG.DAYS_NIGHTS[index][0][0]}N / ${CONFIG.DAYS_NIGHTS[index][0][1]}D to ${CONFIG.DAYS_NIGHTS[index][1][0]}N / ${CONFIG.DAYS_NIGHTS[index][1][1]}D, click to see more`}
        </p>
      </div>
      <div ref={itemRefs.current[index].image} className={styles.imageContainer}>
        <img
          src={groupedImages[index].webp}
          alt={groupedImages[index].alt}
          className={styles.image}
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
          onError={(e) => handleImageError(e, index)}
        />
      </div>
    </React.Fragment>
  ));

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ""}`}>
      <div className={styles.sectionName}>
        <p ref={textRef}>WINTER</p>
      </div>
      <div ref={gridRef} className={styles.grid}>
        {content}
      </div>
    </div>
  );
}
);


export default WinterMobile; 
import React, { useLayoutEffect, useEffect, useRef, useCallback, forwardRef } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "../Styles/Winter.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  LOGO_FALLBACK: "/static/logo4.png",
  IMAGE_BASE_PATH: "/static/admin",
  PLACES: ["darjeeling", "srinagar", "gangtok", "manali", "shimla"],
  DAYS_NIGHTS: [
    [[5, 6], [8, 9]],
    [[5, 6], [8, 9]],
    [[5, 6], [10, 11]],
    [[5, 6], [10, 11]],
    [[4, 5], [6, 7]],
  ],
};

const Winter = forwardRef(({ className, ...props }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const foreGroundRef = useRef(null);
  const sectionNameRef = useRef(null);
  const introRef = useRef(null);
  const backGroundRef = useRef(null);
  const winterContentRef = useRef(null);
  const displayImageRef = useRef(null);
  const displayTextRef = useRef(null);
  const locationRefs = useRef(CONFIG.PLACES.map(() => React.createRef()));
  const ctx = useRef(null);

  // Validate data consistency
  if (CONFIG.PLACES.length !== CONFIG.DAYS_NIGHTS.length) {
    console.error("[Winter] Mismatch between PLACES and DAYS_NIGHTS arrays");
  }

  // Forward ref
  useEffect(() => {
    if (ref) {
      ref.current = containerRef.current;
    }
  }, [ref]);


  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  
  const handleMouseEnter = useCallback((index) => {
    if (!displayImageRef.current || !displayTextRef.current) {
      console.error("[Winter] Missing display refs");
      return;
    }
    const place = CONFIG.PLACES[index];
    const daysNights = CONFIG.DAYS_NIGHTS[index];
    if (!place || !daysNights) {
      console.error(`[Winter] Invalid data at index ${index}`);
      return;
    }

    const imagePath = `${CONFIG.IMAGE_BASE_PATH}/${place}/${place}-jpg/${place}-jpg-large/${place}1.jpg`;
    displayImageRef.current.src = imagePath;
    displayTextRef.current.textContent = `PACKAGES TYPICALLY RANGE FROM ${daysNights[0][0]}N / ${daysNights[0][1]}D TO ${daysNights[1][0]}N / ${daysNights[1][1]}D, CLICK TO SEE MORE.`;
  }, []);


  useEffect(() => {
    const locations = locationRefs.current.map((ref) => ref.current).filter(Boolean);
    if (locations.length === 0) {
      console.warn("[Winter] No location refs found for event listeners");
      return;
    }

    locations.forEach((location, index) => {
      location.addEventListener("mouseenter", () => handleMouseEnter(index));
    });

    return () => {
      locations.forEach((location, index) => {
        location.removeEventListener("mouseenter", () => handleMouseEnter(index));
      });
    };
  }, [handleMouseEnter]);


  useLayoutEffect(() => {
    if (!containerRef.current) {
      console.warn("[Winter] containerRef missing");
      return;
    }

    ctx.current = gsap.context(() => {
      const mainTl = gsap.timeline();

      
      if (sectionNameRef.current) {
        mainTl.from(sectionNameRef.current, {
          y: "100vh",
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top+=200px",
            end: "+=100px",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      } else {
        console.warn("[Winter] sectionNameRef missing");
      }

      
      if (introRef.current && foreGroundRef.current && sectionNameRef.current && backGroundRef.current) {
        mainTl.add(
          gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end:"200px",
              scrub: 2,
              pin: true,
              pinSpacing: true,
              anticipatePin: true,
              refreshPriority: 2,
              immediateRender: false,
              invalidateOnRefresh: true,
              onComplete: () => ScrollTrigger.refresh(),
            },
          })
            .to(foreGroundRef.current, {
                scale: 3,
                y: "100",
                duration: 5,
              })
              .to(sectionNameRef.current, {
                autoAlpha: 0,
                duration: 2,
              }, 0)
              .to(foreGroundRef.current, {
                autoAlpha: 0,
                duration: 3,
              }, "<+=2")
              .to(
                introRef.current,
                {
                  autoAlpha: 0,
                  duration: 1,
                },
                '<'
              )
        );
      } else {
        console.warn("[Winter] Missing refs for intro animation");
      }
    }, containerRef);

    return () => ctx.current?.revert();
  }, []);

  const handleClick = useCallback((place) => {
      if (!place || typeof place !== 'string') {
        console.error('Invalid place name provided for booking');
        return;
      }
      navigate(`/${place}-itinerary`);
    }, [navigate]);

  
  const content = CONFIG.PLACES.map((place, index) => (
    <div key={place} className={styles.locationContainer}>
      <p
        className={styles.location}
        ref={locationRefs.current[index]}
        role="button"
        tabIndex={0}
        onClick={()=>handleClick(place)}
        aria-label={`View ${place} winter package details`}
      >
        {place}
      </p>
    </div>
  ));

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ""}`}>
      <div ref={introRef} className={styles.intro} style={{ pointerEvents: "none" }}>
        <div className={styles.background}>
          <img
            src="/static/winter/template-background.png"
            alt="Winter scene background"
            className={styles.image}
            ref={backGroundRef}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              e.target.src = CONFIG.LOGO_FALLBACK;
              console.error("[Winter] Failed to load intro background image");
            }}
          />
        </div>
        <div className={styles.sectionContainer}>
          <p ref={sectionNameRef} className={styles.sectionName} style={{ willChange: "transform, opacity" }}>
            WINTER
          </p>
        </div>
        <div className={styles.foreGround}>
          <img
            src="/static/winter/template-foreground.png"
            alt="Winter scene foreground"
            className={styles.image}
            ref={foreGroundRef}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              e.target.src = CONFIG.LOGO_FALLBACK;
              console.error("[Winter] Failed to load intro foreground image");
            }}
          />
        </div>
      </div>

      <div className={styles.WinterContent} ref={winterContentRef}>
        {content}
      </div>

      <div className={styles.display}>
        <div className={styles.displayImageContainer}>
          <img
            src={`${CONFIG.IMAGE_BASE_PATH}/darjeeling/darjeeling-jpg/darjeeling-jpg-large/darjeeling1.jpg`}
            alt="Winter destination"
            className={styles.displayImage}
            ref={displayImageRef}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = CONFIG.LOGO_FALLBACK;
              console.error("[Winter] Failed to load display image");
            }}
          />
        </div>
        <div className={styles.displayTextContainer}>
          <p
            className={styles.displayText}
            ref={displayTextRef}
            aria-live="polite"
          >
            {`PACKAGES TYPICALLY RANGE FROM ${CONFIG.DAYS_NIGHTS[0][0][0]}N / ${CONFIG.DAYS_NIGHTS[0][0][1]}D TO ${CONFIG.DAYS_NIGHTS[0][1][0]}N / ${CONFIG.DAYS_NIGHTS[0][1][1]}D, CLICK TO SEE MORE.`}
          </p>
        </div>
      </div>
    </div>
  );
});

Winter.propTypes = {
  className: PropTypes.string,
  ref: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

Winter.displayName = "Winter";

export default Winter;
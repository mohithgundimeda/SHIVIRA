import React, { useLayoutEffect, useMemo, useRef, useEffect, useCallback, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../Styles/Starter.module.css';
import Skeleton from '@mui/material/Skeleton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsMobile } from './useIsMobile';
import LogoAnimation from './LogoAnimation';


gsap.registerPlugin(ScrollTrigger);


const VIDEO_PATHS = {
  small: '/static/droneIntro/droneIntro-mp4/droneIntro-mp4-small/drone.mp4',
  medium: '/static/droneIntro/droneIntro-mp4/droneIntro-mp4-medium/drone.mp4',
  large: '/static/droneIntro/droneIntro-mp4/droneIntro-mp4-large/drone.mp4',
};

const TEXT_CONTENT = {
  quote: 'To Travel Is To Live',
  desktop:
    'At Shivira, we believe travel isn’t just about destinations – it’s about the moments that transform you along the way. With 12+ years of experience, we are more than a travel company, we are your partners in creating memories that will last a lifetime. From the very first spark of inspiration to the unforgettable moments you collect along the way, Shivira is here to guide you. We understand that each journey is as unique as the person embarking on it, and we dedicate ourselves to crafting an experience that reflects your dreams, your passions, and your soul’s desire for discovery. Whether it’s a serene escape, an adrenaline-fueled adventure, or a journey into the unknown, Shivira will be there, walking beside you, curating every detail, ensuring you travel with peace of mind and a heart full of wonder. We will help you create your perfect travel experience. We’re here to guide you every step of the way on your travel journey – because at Shivira, it’s not just about the places you visit, it’s about the person you become along the way.',
  mobile:
    'You know where you want to go. At shivira we make sure getting there feels right. The kind of planning you don’t have to double-check. The kind of details you don’t even notice — because they’re already handled, it’s how travel should feel.',
  destinations: 'DESTINATIONS',
};

// Utility for logging in development only
const logError = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Starter] ${message}`);
  }
};

// Utility to debounce functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Starter = forwardRef(({ B2Home, whyShiviraTravel }, ref) => {
  const starterRef = useRef(null);
  const quoteRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollRefMobile = useRef(null);
  const videoRef = useRef(null);
  const scrollUpRef = useRef(null);
  const textRef = useRef(null);
  const textRefsMobile = useRef(null);
  const whyShiviraRef = useRef(null);
  const DcontainerRef = useRef(null);
  const DsectionNameRef = useRef(null);
  const isMobile = useIsMobile();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Select video source based on device and DPR
  const videoSource = useMemo(() => {
    if (typeof window === 'undefined') return VIDEO_PATHS.large;
    const width = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    if (isMobile) {
      return dpr >= 2 ? VIDEO_PATHS.medium : VIDEO_PATHS.small;
    }
    if (width <= 1200) {
      return dpr >= 2.5 ? VIDEO_PATHS.large : VIDEO_PATHS.medium;
    }
    return VIDEO_PATHS.large;
  }, [isMobile]);

  // Assign refs to props
  useEffect(() => {
    if (whyShiviraTravel) whyShiviraTravel.current = whyShiviraRef.current;
    if (B2Home) B2Home.current = starterRef.current;
  }, [whyShiviraTravel, B2Home]);

  // Handle window resize for video source
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = debounce(() => {
      // Trigger re-render by updating isMobile or relying on useMemo
    }, 200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Video load/error handlers
  const handleVideoLoad = useCallback(() => {
    setIsVideoLoading(false);
  }, []);

  const handleVideoError = useCallback(() => {
    setIsVideoLoading(false);
    setHasError(true);
    logError('Failed to load video');
  }, []);

  // Split text into spans for animation
  const splitText = useCallback((ref, chars = false) => {
    if (!ref.current) return;
    const text = ref.current.textContent;
    ref.current.innerHTML = text
      .split(chars ? '' : /\s+/)
      .map((word) => `<span style="display: inline-block; white-space: nowrap;" aria-hidden="true">${word}</span>`)
      .join(chars ? '' : ' ');
  }, []);

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (isMobile) {
        // Mobile animations
        splitText(textRefsMobile);
        splitText(DsectionNameRef, true);
        gsap.set(DsectionNameRef.current?.children, { y: 100, opacity: 0 });

        const tl = gsap.timeline();

        if (quoteRef.current) {
          tl.to(quoteRef.current, {
            autoAlpha: 0,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'top bottom-=10px',
              end: 'top bottom-=20px',
              scrub: true,
            },
          });
        }

        if (textRefsMobile.current?.children) {
          tl.fromTo(
            textRefsMobile.current.children,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.1,
              stagger: 0.01,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: textRefsMobile.current,
                start: 'top bottom-=100',
                end: 'top center+=100px',
                scrub: true,
              },
            }
          );
        }

        if (scrollUpRef.current) {
          tl.to(scrollUpRef.current, {
            autoAlpha: 0,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'top center+=200px',
              end: 'top center',
              scrub: true,
            },
          });
        }

        if (videoRef.current && scrollRefMobile.current) {
          const destinationsTl = gsap.timeline({ paused: true });
          destinationsTl.to(DsectionNameRef.current?.children, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: { each: 0.04, from: 'random' },
            ease: 'expo.out',
          });

          tl.to([videoRef.current, scrollRefMobile.current], {
            autoAlpha: 0,
            ease: 'expo.inOut',
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'bottom-=50px bottom',
              end: 'bottom bottom',
              scrub: true,
              onUpdate: (self) => {
                if (self.progress >= 0.99 && destinationsTl.paused()) {
                  destinationsTl.play();
                }
              },
            },
          });
        }
      } else {
        // Desktop animations
        splitText(textRef);
        splitText(DsectionNameRef, true);
        gsap.set(DsectionNameRef.current?.children, { y: 100, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top bottom-=50px',
            end: 'top center-=20px',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (textRef.current?.children) {
          tl.fromTo(
            textRef.current.children,
            { opacity: 0 },
            { opacity: 1, duration: 0.1, stagger: 0.1, ease: 'power2.out' }
          );
        }

        gsap.to('#starterArrow', {
          y: -10,
          duration: 1,
          ease: 'bounce.out',
          yoyo: true,
          repeat: -1,
        });

        if (scrollUpRef.current) {
          gsap.to(scrollUpRef.current, {
            autoAlpha: 0,
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'top center',
              end: 'top center',
              scrub: true,
            },
          });
        }

        if (quoteRef.current) {
          gsap.to(quoteRef.current, {
            autoAlpha: 0,
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'top bottom-=10px',
              end: 'top bottom-=20px',
              scrub: true,
            },
          });
        }

        if (videoRef.current && scrollRef.current) {
          const destinationsTl = gsap.timeline({ paused: true });
          destinationsTl.to(DsectionNameRef.current?.children, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: { each: 0.04, from: 'random' },
            ease: 'expo.out',
          });

          gsap.to([videoRef.current, scrollRef.current], {
            autoAlpha: 0,
            ease: 'expo.inOut',
            scrollTrigger: {
              trigger: whyShiviraRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              onUpdate: (self) => {
                if (self.progress >= 0.99 && destinationsTl.paused()) {
                  destinationsTl.play();
                }
              },
            },
          });
        }
      }
    }, starterRef);

    return () => ctx.revert();
  }, [isMobile, splitText]);

  return (
    <section ref={starterRef} className={styles.starter} aria-label="Introduction section">
      <div ref={videoRef} className={styles.videoContainer}>
        {isVideoLoading && !hasError && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              bgcolor: 'rgb(109, 124, 138)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            animation="wave"
          />
        )}
        {hasError && (
          <div className={styles.errorFallback} aria-live="polite">
            Failed to load video. Please try refreshing the page.
          </div>
        )}
        <video
          className={styles.video}
          loop
          muted
          autoPlay
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          key={videoSource}
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <p ref={quoteRef} className={styles.quote}>
          {TEXT_CONTENT.quote}
        </p>

        <div
          ref={scrollUpRef}
          className={isMobile ? styles.scrollUpMobile : styles.scrollUp}
          role="presentation"
        >
          <div id="starterArrow">↑</div> Scroll Up
        </div>
      </div>

      <div ref={whyShiviraRef} className={styles.template}>
        {isMobile ? (
          <div>
            <section ref={scrollRefMobile} className={styles.whyShiviraMobile}>
              <LogoAnimation />
              <div className={styles.splitTextMobile}>
                <p ref={textRefsMobile}>{TEXT_CONTENT.mobile}</p>
              </div>
            </section>
            <div ref={DcontainerRef} className={styles.Dcontainer}>
              <div ref={DsectionNameRef} className={styles.DsectionName}>
                {TEXT_CONTENT.destinations}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <section ref={scrollRef} id="starterWhyShivira" className={styles.whyShivira}>
              <LogoAnimation />
              <p ref={textRef} className={styles.splitText}>
                {TEXT_CONTENT.desktop}
              </p>
            </section>
            <div ref={DcontainerRef} className={styles.Dcontainer}>
              <div ref={DsectionNameRef} className={styles.DsectionName}>
                {TEXT_CONTENT.destinations}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

Starter.propTypes = {
  B2Home: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  whyShiviraTravel: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default Starter;
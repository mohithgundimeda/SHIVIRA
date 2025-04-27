import React, { useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "../Styles/Starter.module.css";
import Skeleton from "@mui/material/Skeleton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "./useIsMobile";

gsap.registerPlugin(ScrollTrigger);

export default function Starter() {
  const quoteRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollRefMobile = useRef(null);
  const videoRef = useRef(null);
  const scrollUpRef = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const textRefs = useMemo(() => [ref1, ref2], []);
  const starterRef = useRef(null);
  const textRefsMobile = useRef(null);
  const textRefsMobileNew = useRef(null);
  const isMobile = useIsMobile();
  const [videoSource, setVideoSource] = useState("/static/droneIntro/droneIntro-mp4/droneIntro-mp4-large/drone.mp4");
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const selectVideoSource = useCallback(() => {
    const width = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    let size;

    if (isMobile) {
      size = dpr >= 2 ? "medium" : "small";
    } else if (width <= 1200) {
      size = dpr >= 2.5 ? "large" : "medium";
    } else {
      size = "large";
    }

    const videoPaths = {
      small: "/static/droneIntro/droneIntro-mp4/droneIntro-mp4-small/drone.mp4",
     medium: "/static/droneIntro/droneIntro-mp4/droneIntro-mp4-medium/drone.mp4",
      large: "/static/droneIntro/droneIntro-mp4/droneIntro-mp4-large/drone.mp4",
    };
    setVideoSource(videoPaths[size]);
  }, [isMobile]);

  useLayoutEffect(() => {
    selectVideoSource();
    window.addEventListener("resize", selectVideoSource);
    return () => window.removeEventListener("resize", selectVideoSource);
  }, [selectVideoSource]);

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setHasError(true);
  };

  useLayoutEffect(() => {
    if (isMobile) {
      const ctx = gsap.context(() => {
        if (quoteRef.current) {
          gsap.fromTo(
            quoteRef.current,
            { y: 0 },
            {
              y: "-20vh",
              scrollTrigger: {
                trigger: scrollRefMobile.current,
                start: "top center+=150px",
                end: "top top",
                scrub: true,
                toggleActions: "play reverse play reverse",
              },
            }
          );
        }

        const tl = gsap.timeline();
        if (textRefsMobile.current && textRefsMobileNew.current) {
          tl.add(
            gsap.fromTo(
              [textRefsMobile.current, textRefsMobileNew.current],
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                scrollTrigger: {
                  trigger: scrollRefMobile.current,
                  start: "top center+=200",
                  end: "top center",
                  scrub: true,
                },
              }
            )
          );
        }

        if (videoRef.current) {
          tl.add(
            gsap.to(videoRef.current, {
              autoAlpha: 0,
              ease: "expo.out",
              scrollTrigger: {
                trigger: scrollRefMobile.current,
                start: "top center+=100px",
                end: "+=100px",
                scrub: true,
              },
            })
          );
        }

        if (starterRef.current) {
          tl.add(
            gsap.to(starterRef.current, {
              backgroundColor: "#bdd3e5",
              scrollTrigger: {
                trigger: scrollRefMobile.current,
                start: "top center+=150px",
                end: "+=100px",
                scrub: true,
              },
              ease: "expo.out",
            }),
            "<"
          );
        }

        if (scrollUpRef.current) {
          gsap.to(scrollUpRef.current, {
            autoAlpha: 0,
            scrollTrigger: {
              trigger: scrollRefMobile.current,
              start: "top bottom-=70px",
              end: "top bottom-=70px",
              scrub: true,
            },
          });
        }

        if (quoteRef.current) {
          gsap.fromTo(
            quoteRef.current,
            { autoAlpha: 1 },
            {
              autoAlpha: 0,
              scrollTrigger: {
                trigger: scrollRefMobile.current,
                start: "center-=50px center-=40px",
                end: "+=0px",
                scrub: true,
                toggleActions: "play reverse play reverse",
                onEnterBack: () => {
                  gsap.to(quoteRef.current, { autoAlpha: 1 });
                },
              },
            }
          );
        }

        if (starterRef.current) {
          gsap.to(starterRef.current, {
            autoAlpha: 0,
            ease: "expo.out",
            scrollTrigger: {
              trigger: scrollRefMobile.current,
              start: "center-=90px center-=40px",
              end: "+=90px",
              scrub: true,
            },
          });
        }
      }, starterRef);

      return () => ctx.revert();
    } else {
      const splitText = (ref) => {
        if (!ref.current) return;
        const text = ref.current.textContent;
        ref.current.innerHTML = text
          .split(/\s+/)
          .map((word) => `<span style="display: inline-block; white-space: nowrap;" aria-hidden="true">${word}</span>`)
          .join(" "); 
      };

      textRefs.forEach((ref) => ref.current && splitText(ref));

      const ctx = gsap.context(() => {
        if (quoteRef.current) {
          gsap.fromTo(quoteRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: textRefs[0].current,
            start: "top bottom-=50px",
            end: "top center-=20px",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (textRefs[0].current?.children) {
          tl.fromTo(
            textRefs[0].current.children,
            { opacity: 0 },
            { opacity: 1, duration: 0.1, stagger: 0.1, ease: "power2.out" }
          );
        }

        if (textRefs[1].current?.children) {
          tl.fromTo(
            textRefs[1].current.children,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, stagger: 0.3, ease: "power2.out" }
          );
        }

        if (scrollRef.current) {
          gsap.fromTo(
            scrollRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              scrollTrigger: {
                trigger: scrollRef.current,
                start: "top bottom",
                end: "top center",
                scrub: true,
              },
            }
          );
        }

        gsap.to("#arrow", {
          y: -10,
          duration: 1,
          ease: "bounce",
          yoyo: true,
          repeat: -1,
        });

        if (scrollUpRef.current) {
          gsap.to(scrollUpRef.current, {
            autoAlpha: 0,
            scrollTrigger: {
              trigger: scrollRef.current,
              start: "top bottom-=10px",
              end: "top bottom-=20px",
              scrub: true,
            },
          });
        }

        if (quoteRef.current) {
          gsap.fromTo(
            quoteRef.current,
            { y: 0 },
            {
              y: "-30vh",
              scrollTrigger: {
                trigger: scrollRef.current,
                start: "top center",
                end: "bottom center",
                scrub: true,
                toggleActions: "play reverse play reverse",
              },
            }
          );
        }

        if (textRefs[0].current && textRefs[1].current && quoteRef.current) {
          gsap.fromTo(
            [textRefs[0].current, textRefs[1].current, quoteRef.current],
            { autoAlpha: 1 },
            {
              autoAlpha: 0,
              ease: "expo.out",
              scrollTrigger: {
                trigger: textRefs[0].current,
                start: "center-=90px center-=30px",
                end: "+=70px",
                toggleActions: "play reverse play reverse",
                scrub: true,
                onEnterBack: () => {
                  gsap.to(quoteRef.current, { autoAlpha: 1, y: 0 });
                },
              },
            }
          );
        }

        if (starterRef.current) {
          gsap.to(starterRef.current, {
            autoAlpha: 0,
            ease: "expo.out",
            scrollTrigger: {
              trigger: textRefs[0].current,
              start: "center-=90px center-=30px",
              end: "+=90px",
              scrub: true,
            },
          });
        }
      }, starterRef);

      return () => ctx.revert();
    }
  }, [isMobile, textRefs, videoSource]);

  return (
    <div ref={starterRef} className={styles.starter}>
      <div className={styles.videoContainer}>
        {isVideoLoading && !hasError && (
          <>
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{
                bgcolor: "rgb(109, 124, 138)",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              animation="wave"
            />
            <p
              style={{
                color: "white",
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "start",
                alignItems: "start",
                fontSize: "1rem",
                letterSpacing: "0.1rem",
                fontFamily: "Kaushan Script, serif",
                paddingTop: `${isMobile ? "5rem" : "2rem"}`,
                paddingLeft: "2rem",
              }}
            >
              Loading...
            </p>
          </>
        )}
        {hasError && (
          <div className={styles.errorFallback} aria-live="polite">
            Failed to load video. Please try refreshing the page.
          </div>
        )}
        <video
          ref={videoRef}
          className={styles.video}
          loop
          muted
          autoPlay
          playsInline
          preload="auto"
          aria-label="Background video of travel scenery"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          key={videoSource}
        >
          <source src={videoSource} type={videoSource.endsWith(".webm") ? "video/webm" : "video/mp4"} />
          Your browser does not support the video tag.
        </video>
        <p ref={quoteRef} className={styles.quote}>
          To Travel Is To Live
        </p>
        {!isMobile ? (
          <div ref={scrollUpRef} className={styles.scrollUp}>
            <div id="arrow">↑</div> Scroll Up
          </div>
        ) : (
          <div ref={scrollUpRef} className={styles.scrollUpMobile}>
            <div id="arrow">↑</div> Scroll Up
          </div>
        )}
      </div>

      <div className={styles.template} style={isMobile ? { height: "65vh" } : { height: "115vh" }}>
        {isMobile ? (
          <section ref={scrollRefMobile} className={styles.whyShiviraMobile}>
            <div className={styles.splitTextMobile}>
              <p ref={textRefsMobile}>
                At Shivira, with over 12 years of expertise, we’re your trusted partners in crafting unforgettable travel
                memories tailored just for you. Rest assured, we prioritize your peace of mind with personalized
                guidance, whether it’s a tranquil getaway or an exciting adventure.
              </p>
              <p ref={textRefsMobileNew}>✶ ✶ ✶ ✶ ✶</p>
            </div>
          </section>
        ) : (
          <section ref={scrollRef} id="whyShiviraId" className={styles.whyShivira}>
            <div>
              <p ref={textRefs[0]} className={styles.splitText}>
                At Shivira, we believe travel isn’t just about destinations – it’s about the moments that transform you
                along the way. With 12+ years of experience, we are more than a travel company; we are your partners in
                creating memories that will last a lifetime. From the very first spark of inspiration to the
                unforgettable moments you collect along the way, Shivira is here to guide you. We understand that each
                journey is as unique as the person embarking on it, and we dedicate ourselves to crafting an experience
                that reflects your dreams, your passions, and your soul’s desire for discovery. Whether it’s a serene
                escape, an adrenaline-fueled adventure, or a journey into the unknown, Shivira will be there, walking
                beside you, curating every detail, ensuring you travel with peace of mind and a heart full of wonder. We
                will help you create your perfect travel experience. We’re here to guide you every step of the way on
                your travel journey – because at Shivira, it’s not just about the places you visit; it’s about the person
                you become along the way.
              </p>
              <p ref={textRefs[1]} className={styles.splitText}>
                ✶ ✶ ✶ ✶ ✶
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
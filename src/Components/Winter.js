import React, { useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import styles from "../Styles/Winter.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

gsap.registerPlugin(ScrollTrigger);

// Static data
const WinterPlaces = ["darjeeling", "gangtok", "manali", "shimla", "srinagar"];
const WinterdaysAndNights = [
  [[5, 6], [8, 9]],
  [[5, 6], [8, 9]],
  [[5, 6], [10, 11]],
  [[5, 6], [10, 11]],
  [[4, 5], [6, 7]],
];

const LOGO_FALLBACK = 'static/logo4.png';

// Component for each place's content
const PlaceContent = ({ place, index, layerRef, curtonRef, WinterdaysAndNights }) => {
  return (
    <div
      ref={layerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: "pointer",
        zIndex: WinterPlaces.length - index,
      }}
    >
      <div className={styles.locationName}>
        <p>{place.toUpperCase()}</p>
      </div>
      <div
        ref={curtonRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 2,
          cursor: "default",
        }}
      >
        <img
          src={`static/winter/${place}/${place}-jpg/${place}-jpg-large/${place}-edited.jpg`}
          alt={`${place} winter curtain`}
          className={styles.contentimage}
          loading="lazy"
          onError={(e) => {
            e.target.src = LOGO_FALLBACK;
            console.error(`Failed to load curtain image for ${place}`);
          }}
        />
      </div>
      <div className={styles.contentText}>
        <div className={styles.flex}>

        <p className={styles.duration}>
          {`${
            WinterdaysAndNights?.[0]?.[0] || 0
          }N / ${WinterdaysAndNights?.[0]?.[1] || 0}D`}
        </p>

        <p className={styles.to}>to</p>
        
        <p className={styles.duration}>
          {`${
            WinterdaysAndNights?.[1]?.[0] || 0
          }N / ${WinterdaysAndNights?.[1]?.[1] || 0}D`}
        </p>

        </div>
         <button
            className={styles.seeMore}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                console.log(`See more about ${place}`);
              }
            }}
            aria-label={`See more about ${place}`}
          >
            see more
            <KeyboardArrowRightIcon className={styles.mui}/>
          </button> 
          

      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          cursor: "default",
        }}
      >
        <img
          src={`static/winter/${place}/${place}-jpg/${place}-jpg-large/${place}1.jpg`}
          alt={`${place} winter background`}
          className={styles.contentimage}
          loading="lazy"
          onError={(e) => {
            e.target.src = LOGO_FALLBACK;
            console.error(`Failed to load background image for ${place}`);
          }}
        />
      </div>
    </div>
  );
};

PlaceContent.propTypes = {
  place: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  layerRef: PropTypes.object.isRequired,
  curtonRef: PropTypes.object.isRequired,
  WinterdaysAndNights: PropTypes.array.isRequired,
};

export default function Winter() {
  const containerRef = useRef(null);
  const foreGroundRef = useRef(null);
  const sectionNameRef = useRef(null);
  const introRef = useRef(null);
  const backGroundRef = useRef(null);
  const WinterContentRef = useRef(null);
  const curtonRefs = useMemo(() => WinterPlaces.map(() => React.createRef()), []);
  const layerRefs = useMemo(() => WinterPlaces.map(() => React.createRef()), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const mainTl = gsap.timeline();

      // Intro animation
      try {
        if (sectionNameRef.current) {
          mainTl.add(
            gsap.from(sectionNameRef.current, {
              y: "100vh",
              duration: 1,
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top+=150px",
                end: "+=100px",
                scrub: 2,
                invalidateOnRefresh: true,
              },
            })
          );
        }

        if (introRef.current && foreGroundRef.current && sectionNameRef.current && backGroundRef.current) {
          mainTl.add(
            gsap.timeline({
              scrollTrigger: {
                trigger: introRef.current,
                start: "top top",
                scrub: 2,
                pin: true,
                anticipatePin: true,
                refreshPriority: 1,
                immediateRender: false,
                invalidateOnRefresh: true,
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
              .to(backGroundRef.current, {
                autoAlpha: 0,
                duration: 5,
              }, 0)
          );
        }

        // Curtain animation
        if (WinterContentRef.current) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: WinterContentRef.current,
              start: "top top-=1",
              end: `+=${WinterPlaces.length * 100}%`,
              scrub: true,
              pin: true,
              anticipatePin: true,
              invalidateOnRefresh: true,
            },
          });

          WinterPlaces.forEach((_, index) => {
            if (curtonRefs[index]?.current && layerRefs[index]?.current) {
              tl.to(curtonRefs[index].current, {
                height: 0,
                duration: 1,
              }).to(layerRefs[index].current, {
                autoAlpha: 0,
              }, ">+=1");
            }
          });
        }
      } catch (error) {
        console.error("GSAP animation error:", error);
      }
    }, containerRef.current);

    return () => ctx.revert();
  }, [curtonRefs, layerRefs]);

  const contents = useMemo(
    () =>
      WinterPlaces.map((place, index) => (
        <PlaceContent
          key={place}
          place={place}
          index={index}
          layerRef={layerRefs[index]}
          curtonRef={curtonRefs[index]}
          WinterdaysAndNights={WinterdaysAndNights[index]}
        />
      )),
    [layerRefs, curtonRefs]
  );

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={introRef} className={styles.intro}>
        <div className={styles.background}>
          <img
            src={'static/winter/template-background.png'}
            alt="Winter scene background"
            className={styles.image}
            ref={backGroundRef}
            loading="eager"
            decoding="async"
            onError={(e) => {
              e.target.src = LOGO_FALLBACK;
              console.error("Failed to load intro background image");
            }}
          />
        </div>
        <div className={styles.sectionContainer}>
          <p ref={sectionNameRef} className={styles.sectionName}>
            WINTER
          </p>
        </div>
        <div className={styles.foreGround}>
          <img
            src='static/winter/template-foreground.png'
            alt="Winter scene foreground"
            className={styles.image}
            ref={foreGroundRef}
            loading="eager"
            decoding="async"
            onError={(e) => {
              e.target.src = LOGO_FALLBACK;
              console.error("Failed to load intro foreground image");
            }}
          />
        </div>
      </div>
      <div ref={WinterContentRef} className={styles.WinterContent}>
        {contents}
      </div>
    </div>
  );
}
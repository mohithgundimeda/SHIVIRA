import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Grids.module.css";
import destinations from "./DestinationsData";
import { useIsMobile } from "./useIsMobile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FontFaceObserver from "fontfaceobserver";
import Skeleton from '@mui/material/Skeleton';

gsap.registerPlugin(ScrollTrigger);

let hasAnimated = false;


const Grid = ({ visibleImages}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const localGridRef = useRef(null);
  const mainRef = useRef(null);
  const containerRef = useRef(null);
  const sectionNameRef = useRef(null);
  const transitionSquareRef = useRef(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleNavigateToCard = useCallback(

    (destination, index) => {

      const sizes = ["small", "medium", "large"];
      const basePath = `/static/destinations/${destination.folder}`;

      const images = Array.from({ length: destination.imageCount }, (_, i) => {
        const imageNum = i + 1;
        return sizes.map((size) => [
          `${basePath}/${destination.folder}-webp/${destination.folder}-webp-${size}/${destination.folder}${imageNum}.webp`,
          `${basePath}/${destination.folder}-jpg/${destination.folder}-jpg-${size}/${destination.folder}${imageNum}.jpg`,
        ]).flat();
      }).flat();


      navigate(`/Destinations/${destination.placeName}`, {
        state: {
          countryName: destination.countryName,
          regionName: destination.regionName,
          placeName: destination.placeName,
          idx: index,
          images,
        },
      });
    },
    [navigate]
  );

  


  
  const splitText = (element) => {
    if (!element) return;
    const text = element.textContent;
    element.innerHTML = text
      .split("")
      .map((char) => `<span style="display: inline-block;" aria-hidden="true">${char}</span>`)
      .join("");
  };


  
  useEffect(() => {
    const fontObserver = new FontFaceObserver("decorya");
    fontObserver
      .load()
      .then(() => setFontLoaded(true))
      .catch((err) => {
        console.error("Font failed to load:", err);
        setFontLoaded(true);
      });
  }, []);

   

   // enter animation

  useEffect(() => {

    if (hasAnimated || !fontLoaded || !mainRef.current || !sectionNameRef.current || !containerRef.current) return;

    splitText(sectionNameRef.current);

    const ctx = gsap.context(() => {

      if (!localGridRef.current) return;

      const gridItems = gsap.utils.toArray(`.${styles.gridItem}`, localGridRef.current);

      const tl = gsap.timeline({
        onStart: () => {
          gsap.set(containerRef.current, { display: "block" });
      },
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top center+=100px",
          toggleActions: "play none none none",
          fastScrollEnd: true,
          onComplete: () => ScrollTrigger.refresh(),
        },
      });

      

      if (!isMobile) {

        tl.from(sectionNameRef.current.children, {
          y: 100,
          duration: 0.8,
          stagger: { each: 0.04, from: "random" },
          ease: "expo.out",
        })
          .to(sectionNameRef.current.children, {
            y: -100,
            stagger: { each: 0.03, from: "random" },
            ease: "expo.in",
            duration: 0.8,
          }, "+=0.4")
          .from(localGridRef.current, {
            y: "100vh",
            opacity: 0,
            duration: 1,
            ease: "expo.out",
          }, "<")
          .to(containerRef.current, { autoAlpha: 0 })
          .from(gridItems, {
            opacity: 0,
            y: "100vh",
            duration: 0.5,
            stagger: 0.3,
            ease: "power2.out",
          }, "<") ;
          
      } else {
        
        tl.from(sectionNameRef.current.children, {
          y: 100,
          duration: 0.3,
          stagger: { each: 0.03, from: "random" },
          ease: "expo.out",
        })
          .to(sectionNameRef.current.children, {
            y: -50,
            duration: 0.3,
            stagger: { each: 0.03, from: "random" },
            ease: "expo.in",
          }, "+=0.4")
          .fromTo(gridItems,{
            y:50,
            
            autoAlpha:0,
          } ,{
            autoAlpha:1,
            stagger:0.2,
            y:0,
            duration: 0.5,
            ease: "expo.out",
          }, ">")
          .to(containerRef.current, { autoAlpha: 0 });
      }
 

      tl.then(() => {
        hasAnimated = true;
      });
    }, mainRef.current);

    return () => ctx.revert(); 
  }, [isMobile, fontLoaded]);


  

  // ending animation
  useEffect(() => {

    if (!fontLoaded || !mainRef.current || (isMobile ? null : !transitionSquareRef.current)) return;

    if(!isMobile){

      

      const indices = [12, 14, 13, 16, 15];
      const gridElements = indices
        .map((index) => document.querySelector(`#gridId${index}`))
        .filter((el) => el !== null);
      const trendingCell = transitionSquareRef.current;
  
      if (gridElements.length < 5 || !trendingCell) {
        console.warn("Missing elements for animation.");
        return;
      }
  
      const cellsToFadeFirst = [gridElements[0], trendingCell, gridElements[1]];
      const cellsToFadeSecond = [gridElements[2], gridElements[3], gridElements[4]];
  
      const ctx = gsap.context(() => {


        gsap.to(mainRef.current, {
          backgroundColor: '#d7d1bf',
          scrollTrigger: {
            trigger: mainRef.current,
            start: "bottom-=300px bottom",
            toggleActions: "play reverse play reverse",
            scrub: true,
            invalidateOnRefresh: true,
            onLeaveBack: () => gsap.set(mainRef.current, { backgroundColor: 'white' }),
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mainRef.current,
            start: "bottom bottom",
            end: "+=100%",
            scrub: 1,
            pin: true,
            pinSpacing:true,
            refreshPriority:5,
            immediateRender: false,
            toggleActions: "play reverse play reverse",
            onStart: () => gsap.set([...cellsToFadeFirst, ...cellsToFadeSecond], { autoAlpha: 1 }),
          },
        });
  
        tl.fromTo(
          cellsToFadeFirst,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: "expo.in" }
        ).fromTo(
          cellsToFadeSecond,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: "expo.in" },
          ">"
        );
  
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }, mainRef.current);

      return () => ctx.revert(); 

    }
    else
    {
      const indices = [13, 10, 9, 8, 11, 12];

      const gridElements = indices
        .map((index) => document.querySelector(`#gridId${index}`))
        .filter((el) => el !== null);

      if (gridElements.length < 6) {
        console.warn("Missing elements for animation.");
        return;
      }

      const cellsToFadeFirst = [gridElements[0], gridElements[1], gridElements[2]];
      const cellsToFadeSecond = [gridElements[3], gridElements[4], gridElements[5]];

      const ctx = gsap.context(() => {

        if (!mainRef.current) return;

        gsap.to(mainRef.current, {
          backgroundColor: '#d7d1bf',
          scrollTrigger: {
            trigger: mainRef.current,
            start: "bottom-=300px bottom",
            toggleActions: "play reverse play reverse",
            scrub: true,
            onLeaveBack: () => gsap.set(mainRef.current, { backgroundColor: 'white' }),
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mainRef.current,
            start: "bottom bottom",
            end: "+=100%",
            scrub: 1,
            pin: true,
            immediateRender: false,
            toggleActions: "play reverse play reverse",
            onStart: () => gsap.set([...cellsToFadeFirst, ...cellsToFadeSecond], { autoAlpha: 1 }),
          },
        });
  
        tl.fromTo(
          cellsToFadeFirst,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: "expo.in" }
        ).fromTo(
          cellsToFadeSecond,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.5, ease: "expo.in" },
          ">"
        );
  
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }, mainRef.current);

      return () => ctx.revert(); 

    }

  }, [fontLoaded, isMobile]);


  const gridItems = visibleImages.map((paths, index) => {
    const destination = destinations[index];
    if (!destination || !paths) return null;

    const isImageLoaded = !!loadedImages[index];
  
    return (
      <div
        key={destination.placeName}
        className={styles.gridItem}
        id={`gridId${index}`}
        role="gridcell"
      >
        <div
          className={styles.imageContainer}
          onClick={() => handleNavigateToCard(destination, index)}
        >
          <picture>
            <source media="(max-width: 480px)" srcSet={paths.small.webp} type="image/webp" />
            <source media="(max-width: 480px)" srcSet={paths.small.jpg} type="image/jpeg" />
            <source media="(max-width: 768px)" srcSet={paths.medium.webp} type="image/webp" />
            <source media="(max-width: 768px)" srcSet={paths.medium.jpg} type="image/jpeg" />
            <source media="(min-width: 768px)" srcSet={paths.large.webp} type="image/webp" />
            <source media="(min-width: 768px)" srcSet={paths.large.jpg} type="image/jpeg" />
           
            <img
              src={paths.large.jpg}
              alt={`${destination.placeName}, ${destination.countryName}`}
              className={styles.gridImage}
              loading="lazy"
              onLoad={() => handleImageLoad(index)}
              onError={() => console.error(`Failed to load image ${index}: ${paths.large.jpg}`)}
              style={{ opacity: isImageLoaded ? 1 : 0 ,
                      }}
            />
          </picture>
          {!isImageLoaded && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <Skeleton
                variant="rectangular"
                width="98%"
                height="95%"
                animation="wave"
                style={{ borderRadius: '10px 10px 0px 0px' }}
              />
              <Skeleton animation="wave" width="98%" />
            </div>
          )}
          <div className={styles.location}>
            <div className={styles.place}>
              <p>{destination.placeName},</p>
            </div>
            <div className={styles.country}>
              <p>{destination.countryName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }).filter(item => item !== null);

   
  if (visibleImages.length === 17) {
    gridItems.splice(
      16,
      0,
      <div key="transition-square-wrapper">
        <div ref={transitionSquareRef} className={styles.transitionSquare}>
          <div className={styles.squareTextContainer}>
            <p className={styles.squareText}>
              EXPLORE TRENDING PACKAGES
            </p>
          </div>
        </div>
      </div>
    );
  }
   
  return (
    <div ref={mainRef} className={styles.mainContainer}>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.section}>
          <div ref={sectionNameRef} className={styles.sectionName}>
            DESTINATIONS
          </div>
        </div>
      </div>
      <div ref={localGridRef} className={styles.gridContainer} role="grid" aria-label="Destination images grid">
        {gridItems}
      </div>
    </div>
  );
};

Grid.displayName = "Grid";

export default React.memo(Grid);
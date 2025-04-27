import React, { useRef, useEffect, useState,useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styles from "../Styles/Trending.module.css";
import { useIsMobile } from "./useIsMobile";
import SlideShowTrending from "./SlideShowTrending";
import ReverseSlideShowTrending from "./ReverseSlideShowTrending";
import ThreeDImaging from "./ThreeDImaging";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const Trending = () => {

    const isMobile = useIsMobile();
    const textRef = useRef(null);
    const containerRef = useRef(null);
    const imageExpoRef = useRef(null);
    const imageRefs = useRef([]);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const sectionNameRef = useRef(null);
    const trendingContentRef = useRef(null);
    const textHolderRef = useRef(null);
    const [pinComplete, setPinComplete] = useState(false);


    const cities = useMemo(() => {
      return !isMobile
        ? ["jaipur", "montsaint", "colosseum", "burjkhalifa", "tajmahal", "thailand"]
        : ["montsaint", "colosseum", "tajmahal"];
    }, [isMobile]);
  
   
    const whichIsFirst = useMemo(() => {
      return !isMobile ? [0, 1, 3, 4, 5, 2] : [1, 0, 2];
    }, [isMobile]);

    const indices = useMemo(() => [...whichIsFirst], [whichIsFirst]);
    const imageNames = useMemo(() => [...cities], [cities]);
    const sizes = useMemo(() => ["small", "medium", "large"], []);
  
  const groupedImages = useMemo(() => {
    return imageNames.map((name, index) => {
      const imageObj = { alt: name, zIndex: indices[index] };
      sizes.forEach((size) => {
        imageObj[size] = {
          webp: `/static/trending/trending-${size}/trending-${size}-webp/${name}.webp`,
          jpg: `/static/trending/trending-${size}/trending-${size}-jpg/${name}.jpg`,
        };
      });
      return imageObj;
    });
  }, [imageNames,sizes, indices]);

   
   const splitText = (element) => {
    if (!element) return;
    const text = element.textContent;
     
    const words = text.split(/(\s+)/);
    element.innerHTML = words
      .map((word) => {
        if (word.match(/\s+/)) {
          
          return word;
        }
         
        const characters = word
          .split("")
          .map(
            (char) =>
              `<span style="display: inline-block;" aria-hidden="true">${char}</span>`
          )
          .join("");
         
        return `<span style="display: inline; white-space: nowrap;">${characters}</span>`;
      })
      .join("");
  };


  const setUpImageAnimation = useCallback(() => {
    if (!imageExpoRef.current || !imageRefs.current.length) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: imageExpoRef.current,
        start: `center center`,
        end: `+=50%`,
        scrub: 3,
        pin:true,
        refreshPriority:4,
        pinSpacing:true,
        anticipatePin: true,
        invalidateOnRefresh: true,
        toggleActions: "play reverse play reverse",
      },
    });

    tl.to([imageRefs.current[0], imageRefs.current[3]], {
      motionPath: { path: "M 0 0 L -275 275" , curviness: 1 },
      duration: 0.7,
      ease: "expo.inOut",
    })
      .to(
        [imageRefs.current[1], imageRefs.current[5]],
        {
          motionPath: { path:"M 0 0 L 0 -300", curviness: 0 },
          rotate: 180,
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      ).to(
        [imageRefs.current[2], imageRefs.current[4]],
        {
          motionPath: { path:"M 0 0 L 275 275", curviness: 1 },
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      )
      .to(
        imageRefs.current[3],
        {
          motionPath: { path:"M -275 275 L -500 -300", curviness: 1 },
          duration: 1,
          ease: "expo.inOut",
        }
      )
      .to(
        imageRefs.current[4],
        {
          motionPath: { path:"M 275 275 L 500 -300", curviness: 1 },
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      ).to(imageRefs.current[5],//thai

        {
          motionPath: { path:"M 0 -300 L 0 275" , curviness: 0 },
          duration: 1,
          ease: "expo.inOut", 
        }
    ,'>').to(
      imageRefs.current[0],{

        
          motionPath: { path:"M -275 275 L -400 275", curviness: 0 },
          duration: 0.7,
          ease: "expo.inOut", 
        

      },'<'
    ).to(
      imageRefs.current[2],{
        motionPath: { path:"M 275 275 L 400 275", curviness: 1 },
        duration: 0.7,
        ease: "expo.inOut",
      },'<'
    );
  }, []); 
   

  const setUpMobileImageAnimation = useCallback(() => {
    if (!containerRef.current || !imageRefs.current.length) return;
    const screenWidth = window.innerWidth;
    
    const isTablet = screenWidth >= 768 && screenWidth <= 1024;
  
    
    let verticalDistance = -200;
    let horizontalDistance = 180;
  
   
    if (isTablet) {
      verticalDistance = -300; 
      horizontalDistance = 250;
    }
  
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: `top+=400px top+=600px`,
        end: `+=15%`,
        scrub: 3,
        toggleActions: "play reverse play reverse",
      },
    });
  
    tl.to(imageRefs.current[0], {
      motionPath: { path: `M 0 0 L 0 ${verticalDistance}`, curviness: 0 },
      rotate: 180,
      duration: 1,
      ease: "expo.inOut",
    })
      .to(
        imageRefs.current[1],
        {
          motionPath: { path: `M 0 0 L ${horizontalDistance} 0`, curviness: 0 },
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      )
      .to(
        imageRefs.current[2],
        {
          motionPath: { path: `M 0 0 L -${horizontalDistance} 0`, curviness: 0 },
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      );
  }, []);

  useEffect(() => {
    if ( !textRef.current || !containerRef.current || !textHolderRef.current) return;

    splitText(textRef.current);

    const setupTextAnimation = () => {
        const characters = textRef.current.querySelectorAll("span > span");
        if (!characters.length) return;

            gsap.fromTo(
                characters,
                { color: "#6c52344a" },
                {
                    color: "#6C5234",
                    duration: 1,
                    stagger: 0.05,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: textHolderRef.current,
                        start: "top bottom-=100px",
                        end: "center center",
                        scrub: true,
                        invalidateOnRefresh: true,
                        
                    },
                }
            );
    };

    const ctx = gsap.context(() => {
        setupTextAnimation();
    }, containerRef.current);

    return () => ctx.revert();
}, [ isMobile]);

useEffect(() => {
  if ( !imageExpoRef.current || imagesLoaded !== groupedImages.length || !sectionNameRef.current) return;

  const ctx = gsap.context(() => {
    
    if(!isMobile){
      setUpImageAnimation();
    }
    else{
    setUpMobileImageAnimation();

    }
    setPinComplete(true);

   
  }, containerRef.current);

  return () => {ctx.revert(); setPinComplete(false);};
}, [imagesLoaded, setUpImageAnimation, groupedImages.length,setUpMobileImageAnimation, isMobile]);


const handleImageLoad = useCallback(() => {
  setImagesLoaded((prev) => prev + 1);
}, []);

const handleImageError = useCallback((e, src) => {
  console.error(`Failed to load image: ${src}`);
  setImagesLoaded((prev) => prev + 1);
}, []);

    return (
        <div ref={containerRef} className={styles.container}>

        <div ref={imageExpoRef} className={styles.imageExpoContainer}>
            
            
          
            <p ref={sectionNameRef} className={styles.sectionName}>TRENDING</p>
            

          {groupedImages.map((image, index) => (
              <div
                key={index}
                ref={(el) => (imageRefs.current[index] = el)}
                style={{ zIndex: image.zIndex }}
                className={styles.trendingImagesCont}
              >
                  <picture>
                        <source
                          media="(min-width: 1020px)"
                          srcSet={image.large.webp}
                          type="image/webp"
                        />
                        <source
                          media="(min-width: 601px)"
                          srcSet={image.medium.webp}
                          type="image/webp"
                        />
                        <source
                          media="(max-width: 600px)"
                          srcSet={image.small.webp}
                          type="image/webp"
                        />
                        <source
                          media="(min-width: 1020px)"
                          srcSet={image.large.jpg}
                          type="image/jpeg"
                        />
                        <source
                          media="(min-width: 601px)"
                          srcSet={image.medium.jpg}
                          type="image/jpeg"
                        />
                        <source
                          media="(max-width: 600px)"
                          srcSet={image.small.jpg}
                          type="image/jpeg"
                        />
                        <img
                          src={image.large.jpg}
                          alt={image.alt}
                          loading="lazy"
                          decoding="async"
                          className={styles.trendingImages}
                          onLoad={handleImageLoad}
                          onError={(e) => handleImageError(e, image.large.jpg)}
                        />
                  </picture>
              </div>
          ))}



          </div>

          <div ref={textHolderRef} className={styles.textHolder}>
              <p ref={textRef} className={styles.text}>
                  { !isMobile ? 'featuring popular destinations and well-regarded travel options, These places highlight current favorites among travelers, offering a range of experiences to suit your preferences!! Carefully selected to reflect the latest travel trends, our packages include a variety of destinations that are gaining attention for their unique appeal, from cultural landmarks to natural wonders - Each itinerary is designed with flexibility in mind, allowing you to customize your journey based on your interests.'
                              : 'featuring popular destinations and well-regarded travel options, These places highlight current favorites among travelers, offering a range of experiences to suit your preferences.'}
              </p>
          </div>

          

          
          <div  className={styles.trendingContent}>

          
          <SlideShowTrending pinComplete={pinComplete} pinnedContainer={imageExpoRef.current}/>
                          
          </div>

           <div  ref={trendingContentRef} className={styles.trendingContent}>

          
            <ReverseSlideShowTrending pinComplete={pinComplete} pinnedContainer={imageExpoRef.current}/>
                          
          </div>

          <div  className={styles.trendingContent}>

            <ThreeDImaging trendingContentRef={trendingContentRef} />

          </div>
            
        </div>
    );
};

export default Trending;

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Introduction from './Components/Introduction.js';
import Starter from './Components/Starter.js';
import MenuBar from './Components/MenuBar.js';
import styles from './Styles/Main.module.css';
import Grid from './Components/Grid.js';
import Trending from './Components/Trending.js';
import Winter from './Components/Winter.js';
import WinterMobile from './Components/WinterMobile.js';
import Spring from './Components/Spring.js';
import SpringMobile from './Components/SpringMobile.js';
import { useIsMobile } from './Components/useIsMobile.js';
import Summer from './Components/Summer.js';
import SummerMobile from './Components/SummerMobile.js';
import Autum from './Components/Autum.js';
import AutumnMobile from './Components/AutumnMobile.js';
import Contact from './Components/Contact.js';

export default function Main() {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const B2Home = useRef(null);
  const whyShiviraTravel = useRef(null);
  const gridRef = useRef(null);
  const TrendRef = useRef(null);
  const winterRef = useRef(null);
  const springRef = useRef(null);
  const summer = useRef(null);
  const autumnRef = useRef(null);
  const contactRef = useRef(null);
  

  useEffect(() => {
    try {
      const introShown = sessionStorage.getItem('introShown');
      if (!introShown) {
        setShowIntro(true);
        sessionStorage.setItem('introShown', 'true');
      } else {
        setIntroComplete(true);
      }
    } catch (error) {
      console.warn('SessionStorage unavailable, defaulting to intro:', error);
      setShowIntro(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);
  }, []);

  const WinterComponent = useMemo(() => (isMobile ? WinterMobile : Winter), [isMobile]);
  const SpringComponent = useMemo(() => (isMobile ? SpringMobile : Spring), [isMobile]);
  const SummerComponent = useMemo(() => (isMobile ? SummerMobile : Summer), [isMobile]);
  const AutumnComponent = useMemo(() => (isMobile ? AutumnMobile : Autum), [isMobile]);

 
  const content = introComplete ? (
    <div className={styles.content} role="main">
      <MenuBar B2Home={B2Home}whyShiviraTravel={whyShiviraTravel} contactRef={contactRef} autumnRef={autumnRef} summerPageRef={summer} gridRef={gridRef} TrendRef={TrendRef} winterRef={winterRef} springRef={springRef}/>
      <Starter B2Home={B2Home} whyShiviraTravel={whyShiviraTravel}/>
      <Grid ref={gridRef} />
      <Trending ref={TrendRef}/>
      {WinterComponent && <WinterComponent ref={winterRef} />}
      {SpringComponent && <SpringComponent summer={summer} ref={springRef}/>}
     {SummerComponent && <SummerComponent ref={ isMobile ? summer : null}/>}
       {AutumnComponent && <AutumnComponent ref={autumnRef} />}
      <Contact ref={contactRef} />
    </div>
  ) : null;
  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.main}>
      {showIntro && (
        <Introduction onComplete={handleIntroComplete} aria-label="Introduction animation" />
      )}
      {content}
    </div>
  );
}
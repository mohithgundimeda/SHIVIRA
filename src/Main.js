import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Introduction from './Components/Introduction';
import Starter from './Components/Starter';
import MenuBar from './Components/MenuBar';
import styles from './Styles/Main.module.css';
import Parent from './Components/Parent';
import Trending from './Components/Trending';
import Winter from './Components/Winter';
import WinterMobile from './Components/WinterMobile';
import Spring from './Components/Spring';
import { useIsMobile } from './Components/useIsMobile';

export default function Main() {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  


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

  if (isLoading) {
    return null;  
  }

  

  return (
    <div className={styles.main}>

      {showIntro && (
        <Introduction onComplete={handleIntroComplete} aria-label="Introduction animation" />
      )}

      {introComplete && (
        <div className={styles.content} role="main">
          <MenuBar/>
          <Starter/>
          <Parent/>
          <Trending/>
          {WinterComponent && <WinterComponent />}
          <Spring/>
        </div>
      )}

    </div>
  );
}
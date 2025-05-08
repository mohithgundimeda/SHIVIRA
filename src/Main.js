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
import SpringMobile from './Components/SpringMobile';
import { useIsMobile } from './Components/useIsMobile';
import Summer from './Components/Summer';
import SummerMobile from './Components/SummerMobile';
import Autum from './Components/Autum';
import AutumnMobile from './Components/AutumnMobile';
import WhyShivira from './Components/WhyShivira';

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
  const SpringComponent = useMemo(() => (isMobile ? SpringMobile : Spring), [isMobile]);
  const SummerComponent = useMemo(() => (isMobile ? SummerMobile : Summer), [isMobile]);
  const AutumnComponent = useMemo(() => (isMobile ? AutumnMobile : Autum), [isMobile]);

  const content = useMemo(() => {
    if (!introComplete) return null;
    return (
      <div className={styles.content} role="main">
        <MenuBar />
        <Starter />
        <Parent />
        <Trending />
        {WinterComponent && <WinterComponent />}
        {SpringComponent && <SpringComponent />}
        {SummerComponent && <SummerComponent />}
        {AutumnComponent && <AutumnComponent />}
        <WhyShivira />
      </div>
    );
  }, [introComplete, WinterComponent, SpringComponent, SummerComponent, AutumnComponent]);

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
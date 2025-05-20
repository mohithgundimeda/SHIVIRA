import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../Styles/MenuBar.module.css';
import gsap from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './useIsMobile';

const MENU_ITEMS = {
  explore: [
    { label: 'Home', key: 'home' },
    { label: 'Destinations', key: 'destinations' },
    { label: 'Trending', key: 'trending' },
  ],
  seasons: [
    { label: 'Winter', key: 'winter' },
    { label: 'Spring', key: 'spring' },
    { label: 'Summer', key: 'summer' },
    { label: 'Autumn', key: 'autumn' },
  ],
  company: [
    { label: 'Why Shivira ?', key: 'whyShivira' },
    { label: 'Contact', key: 'contact' },
  ],
};


const logError = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[MenuBar] ${message}`);
  }
};


const MenuBar = ({
  B2Home,
  whyShiviraTravel,
  contactRef,
  autumnRef,
  summerPageRef,
  gridRef,
  TrendRef,
  winterRef,
  springRef,
}) => {
  const menuRef = useRef(null);
  const heroRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || typeof window === 'undefined') return;

    const expand = () => {
      gsap.to(menu, { width: '30rem', height: '13rem', duration: 0.5, ease: 'power2.out' });
    };
    const collapse = () => {
      gsap.to(menu, { width: '23rem', height: '3.15rem', duration: 0.5, ease: 'power2.out' });
    };

    if (window.innerWidth >= 768) {
      gsap.set(menu, { width: '23rem', height: '3.15rem' });
      menu.addEventListener('mouseenter', expand);
      menu.addEventListener('mouseleave', collapse);
    }

    return () => {
      menu.removeEventListener('mouseenter', expand);
      menu.removeEventListener('mouseleave', collapse);
    };
  }, []);

 
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        gsap.fromTo(
          mobileMenuRef.current,
          { x: '-100%' },
          { x: '0%', duration: 0.5, ease: 'power2.out' }
        );
        
        setTimeout(() => firstFocusableRef.current?.focus(), 500);
      } else {
        gsap.to(mobileMenuRef.current, { x: '-100%', duration: 0.5, ease: 'power2.in' });
      }
      return newState;
    });
  }, []);

  
  const handleNavigationToSearch = useCallback(() => {
    navigate('/Search');
    toggleMenu();
  }, [navigate, toggleMenu]);

  const handleNavigationToForm = useCallback(()=>{
    navigate('/Form');
    toggleMenu();
  },[navigate, toggleMenu]);

 
const handleScrollToHome = useCallback(() => {
    if (!B2Home?.current || !window.lenis) {
      logError('Problem in lenis or ref in home nav');
      return;
    }
    window.lenis.scrollTo(B2Home.current, { immediate: true });
    toggleMenu();
  }, [B2Home, toggleMenu]);

const handleScrollToDestinations = useCallback(() => {
    if (!gridRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in destinations nav');
      return;
    }
    window.lenis.scrollTo(gridRef.current, { immediate: true });
    toggleMenu();
  }, [gridRef, toggleMenu]);

  const handleScrollToTrending = useCallback(() => {
    if (!TrendRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in trending nav');
      return;
    }
    window.lenis.scrollTo(TrendRef.current, { immediate: true });
    toggleMenu();
  }, [TrendRef, toggleMenu]);

const handleScrollToWinter = useCallback(() => {
    if (!winterRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in winter nav');
      return;
    }
    window.lenis.scrollTo(winterRef.current, { immediate: true });
    toggleMenu();
  }, [winterRef, toggleMenu]);

const handleScrollToSpring = useCallback(() => {
    if (!springRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in spring nav');
      return;
    }
    window.lenis.scrollTo(springRef.current, { immediate: true, offset: -100 });
    toggleMenu();
  }, [springRef, toggleMenu]);


const handleScrollToSummer = useCallback(() => {
    if (!summerPageRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in summer nav');
      return;
    }
    window.lenis.scrollTo(summerPageRef.current, { immediate: true });
    toggleMenu();
  }, [summerPageRef, toggleMenu]);

const handleScrollToAutumn = useCallback(() => {
    if (!autumnRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in autumn nav');
      return;
    }
    window.lenis.scrollTo(autumnRef.current, { immediate: true });
    toggleMenu();
  }, [autumnRef, toggleMenu]);

const handleScrollToContact = useCallback(() => {
    if (!contactRef?.current || !window.lenis) {
      logError('Problem in lenis or ref in contact nav');
      return;
    }
    window.lenis.scrollTo(contactRef.current, { immediate: true });
    toggleMenu();
  }, [contactRef, toggleMenu]);

const handleScrollToStarter = useCallback(() => {
    if (!whyShiviraTravel?.current || !window.lenis) {
      logError('Problem in lenis or ref in starter nav');
      return;
    }
    window.lenis.scrollTo(whyShiviraTravel.current, {
      immediate: true,
      offset: isMobile ? -100 : 0,
    });
    toggleMenu();
  }, [whyShiviraTravel, isMobile, toggleMenu]);

  
  const menuActions = {
    home: handleScrollToHome,
    destinations: handleScrollToDestinations,
    trending: handleScrollToTrending,
    winter: handleScrollToWinter,
    spring: handleScrollToSpring,
    summer: handleScrollToSummer,
    autumn: handleScrollToAutumn,
    whyShivira: handleScrollToStarter,
    contact: handleScrollToContact,
  };

  
  const allMenuItems = [
    ...MENU_ITEMS.explore,
    ...MENU_ITEMS.seasons,
    ...MENU_ITEMS.company,
  ];

  return (
    <nav ref={heroRef} id="menuBarHero" className={styles.hero} role="navigation">
      
      <div
        ref={menuRef}
        className={`${styles.menu} ${styles.desktopMenu}`}
        role="menu"
        aria-label="Main navigation"
      >
        <div className={styles.menuContent}>
          <p aria-hidden="true">EXPLORE</p>
        </div>
        <div className={styles.menuContent}>
          <p aria-hidden="true">SEASONS</p>
        </div>
        <div className={styles.menuContent}>
          <p aria-hidden="true">COMPANY</p>
        </div>
        <div className={styles.line} aria-hidden="true" />

        <div className={styles.explore}>
          {MENU_ITEMS.explore.map((item) => (
            <button
              key={item.key}
              onClick={menuActions[item.key]}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  menuActions[item.key]();
                }
              }}
              role="menuitem"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.seasons}>
          {MENU_ITEMS.seasons.map((item) => (
            <button
              key={item.key}
              onClick={menuActions[item.key]}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  menuActions[item.key]();
                }
              }}
              role="menuitem"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.company}>
          {MENU_ITEMS.company.map((item) => (
            <button
              key={item.key}
              onClick={menuActions[item.key]}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  menuActions[item.key]();
                }
              }}
              role="menuitem"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hamburger Button */}
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobileMenuID"
      >
        {isOpen ? <FiX style={{ color: '#596f77' }} size={25} /> : <FiMenu style={{ color: '#596f77' }} size={25} />}
      </button>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        id="mobileMenuID"
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-labelledby="mobileMenuLabel"
        onClick={toggleMenu}
      >
        <div className={styles.mobileContent} role="menu">
          {allMenuItems.map((item, index) => (
            <button
              key={item.key}
              ref={index === 0 ? firstFocusableRef : null}
              onClick={(e) => {
                e.stopPropagation();
                menuActions[item.key]();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  menuActions[item.key]();
                }
              }}
              role="menuitem"
              aria-label={`Navigate to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side Items */}
      <div className={styles.sideItems}>
        <button
          onClick={handleNavigationToSearch}
          aria-label="Navigate to search page"
        >
          Search
        </button>
        <button 
        aria-label="Design your trip"
        onClick={handleNavigationToForm}
        >Design My Trip</button>
      </div>
    </nav>
  );
};


MenuBar.propTypes = {
  B2Home: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  whyShiviraTravel: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  contactRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  autumnRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  summerPageRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  gridRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  TrendRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  winterRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  springRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};


export default MenuBar;
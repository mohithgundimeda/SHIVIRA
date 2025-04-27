import React, { useEffect, useRef, useState } from 'react';
import styles from '../Styles/MenuBar.module.css';
import gsap from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

export default function MenuBar() {
  const menuRef = useRef(null);
  const heroRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  useEffect(() => {
    const handleScroll = debounce(() => {
      
      if (!heroRef.current) return;
  
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        gsap.to(heroRef.current, { y: '-100%', opacity: 0, duration: 0.3, ease: 'power2.out' });
      } else if (currentScrollY < lastScrollY.current) {
        gsap.to(heroRef.current, { y: '0%', opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
      lastScrollY.current = currentScrollY;
    }, 100);
  
    window.addEventListener('scroll', handleScroll);
  
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

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

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: '-100%' },
        { y: '0%', duration: 0.5, ease: 'power2.out' }
      );
    } else {
      gsap.to(mobileMenuRef.current, { y: '-100%', duration: 0.5, ease: 'power2.in' });
    }
  };

  const handleNavigationToSearch= () =>{

    navigate('/Search');
  }


  const menuItems = {
    explore: ['Destinations', 'Trending', 'Filters', 'Pack Your Bags'],
    seasons: ['Winter', 'Spring', 'Summer', 'Autumn'],
    company: ['Why Shivira ?', 'Contact'],
  };

  return (
    <nav ref={heroRef} id="heroId" className={styles.hero}>
      <div ref={menuRef} className={`${styles.menu} ${styles.desktopMenu}`} role="navigation">
        <div className={styles.menuContent}>
          <p aria-hidden="true">EXPLORE</p>
        </div>
        <div className={styles.menuContent}>
          <p aria-hidden="true">SEASONS</p>
        </div>
        <div className={styles.menuContent}>
          <p aria-hidden="true">COMPANY</p>
        </div>
        <div className={styles.line} aria-hidden="true"></div>

        <div className={styles.explore}>
          {menuItems.explore.map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
        <div className={styles.seasons}>
          {menuItems.seasons.map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
        <div className={styles.company}>
          {menuItems.company.map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </div>

      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <FiX style={{color:'#596f77'}} size={25} /> : <FiMenu style={{color:'#596f77'}} size={25} />}
      </button>

      <div
        ref={mobileMenuRef}
        id="mobileMenuID"
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-hidden={!isOpen}
      >
        <div className={styles.mobileContent}>
          {Object.entries(menuItems).flatMap(([category, items]) =>
            [<button key={category}>{category.toUpperCase()}</button>, ...items.map((item) => (
              <button key={item}>{item}</button>
            ))]
          )}
        </div>
      </div>

      <div className={styles.sideItems}>
        <button onClick={handleNavigationToSearch}>Search</button>
        <button>Design My Trip</button>
      </div>
    </nav>
  );
}
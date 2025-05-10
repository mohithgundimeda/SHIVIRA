import React, { useRef, useEffect } from "react";
import styles from "../Styles/Contact.module.css";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

gsap.registerPlugin(TextPlugin);

const contactData = [
  {
    initial: "CALL US",
    hover: "+91 9398488812",
    icon: <LocalPhoneOutlinedIcon />,
    href: "tel:+919398488812",
    isExternal: false,
  },
  {
    initial: "EMAIL",
    hover: "info@vlctours.in",
    icon: <EmailOutlinedIcon />,
    href: "mailto:info@vlctours.in",
    isExternal: false,
  },
  {
    initial: "ADDRESS",
    hover: "ANAPURNA COMPLEX, GUNTUR",
    icon: <LocationOnOutlinedIcon />,
    href: "https://www.google.com/maps/search/?api=1&query=Shop+No:+66,+Anapurna+Complex,+Opp+Padmaja+Petrol+Bunk,+Kakani+Road,+Guntur,+522001",
    isExternal: true,
  },
  {
    initial: "WHATSAPP",
    hover: "+91 7032504493",
    icon: <WhatsAppIcon />,
    href: "https://wa.me/917032504493",
    isExternal: true,
  },
  {
    initial: "INSTAGRAM",
    hover: "@shivira_travel",
    icon: <InstagramIcon />,
    href: "https://www.instagram.com/shivira_travel/",
    isExternal: true,
  },
  {
    initial: "YOUTUBE",
    hover: "www.youtube.com/@shivira_travel",
    icon: <YouTubeIcon />,
    href: "https://www.youtube.com/@shivira_travel",
    isExternal: true,
  },
];

export default function Contact() {
  const textRefs = useRef(contactData.map(() => React.createRef()));
  const headerRef = useRef(null);
  const iconRefs = useRef(contactData.map(() => React.createRef()));

  useEffect(() => {
    // Log GSAP version for debugging
    console.log("GSAP Version:", gsap.version);

    // Set initial text for CONTACT header
    gsap.set(headerRef.current, {
      text: "CONTACT",
      opacity: 1,
    });

    // Set initial state for text and icons
    textRefs.current.forEach((ref, index) => {
      gsap.set(ref.current, { opacity: 1 });
      gsap.set(iconRefs.current[index].current, { opacity: 0, scale: 0.8 });
    });
  }, []);

  const handleMouseEnter = (index) => {
    const pRef = textRefs.current[index];
    const iconRef = iconRefs.current[index];
    gsap.killTweensOf([headerRef.current, pRef.current, iconRef.current]);


    gsap.to(headerRef.current, {
      duration: 1.2,
      text: {
        value: contactData[index].hover,
        newText: contactData[index].hover,
        speed: 0,
      },
      ease: "bounce.out",
      overwrite: "auto",
    });

    
    gsap.to(pRef.current, {
      duration: 0.5,
      opacity: 0,
    });
    gsap.to(iconRef.current, {
      duration: 0.5,
      opacity: 1,
    });
  };

  const handleMouseLeave = (index) => {
    const pRef = textRefs.current[index];
    const iconRef = iconRefs.current[index];
    gsap.killTweensOf([headerRef.current, pRef.current, iconRef.current]);

    // Revert header to CONTACT
    gsap.to(headerRef.current, {
      duration: 1,
      text: {
        value: "CONTACT",
        newText: "CONTACT",
      },
      ease: "power2.in",
      overwrite: "auto",
    });

    // Show text, hide icon
    gsap.to(pRef.current, {
      duration: 0.5,
      opacity: 1,
      scale: 1,
      ease: "power2.in",
    });
    gsap.to(iconRef.current, {
      duration: 0.5,
      opacity: 0,
      scale: 0.8,
      ease: "power2.in",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.contactContainer}>
        <div className={styles.NameANDLogo} ref={headerRef}>
          CONTACT
        </div>
      </div>

      <div className={styles.contentContainer}>
       <div className={styles.gridContainer}>
             {contactData.map((item, index) => (
                <div key={item.initial} className={styles.gridItem}>

                    <div
                    style={{ position: "relative", display: "inline-block"}}
                     
                    className={styles.standAlone}
                    >
                    <a
                        style={{textDecoration:'none', color:'white'}}
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        rel={item.isExternal ? "noopener noreferrer" : undefined}
                        aria-label={`Navigate to ${item.initial.toLowerCase()} contact`}
                    >
                     <p
                        ref={textRefs.current[index]}
                        onMouseEnter={() => handleMouseEnter(index)}
                     onMouseLeave={() => handleMouseLeave(index)}
                        className={styles.pAndi}
                    >
                        {item.initial}
                    </p>
                   </a>

                    <div
                        ref={iconRefs.current[index]}
                        className={styles.icon}
                        
                    >
                        {item.icon}
                    </div>

                    </div>

                </div>

            ))}
            <div className={styles.copyright}>
            <p>© 2025 SHIVIRA</p>
            </div>
       </div>
      </div>
    </div>
  );
}
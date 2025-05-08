import { useState, useEffect } from "react";

export const useIsMobile = (breakpoint = 770) => {
  const [isMobile, setIsMobile] = useState(window.matchMedia(`(max-width: ${breakpoint}px)`).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(mediaQuery.matches);
      }, 100);
    };

    mediaQuery.addEventListener("change", handleResize);
    handleResize();

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoint]);

  return isMobile;
};
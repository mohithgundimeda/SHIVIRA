// hooks/useIsMobile.js
import { useState, useEffect } from "react";

export const useIsMobile = (breakpoint = 770) => {
  const [isMobile, setIsMobile] = useState(window.matchMedia(`(max-width: ${breakpoint}px)`).matches);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleResize = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [breakpoint]);
  return isMobile;
};
import React, {useRef} from "react";

import Grid from "./Grid";
import styles from "../Styles/Parent.module.css";
import destinations, { getImagePaths } from "./DestinationsData";
import { useIsMobile } from "./useIsMobile";

export default function Parent() {
  const containerRef = useRef(null); 
  const isMobile = useIsMobile();

  const imagePaths = destinations.map((dest) => getImagePaths(dest.folder));
  const visibleImages = isMobile ? imagePaths.slice(0, 14) : imagePaths;

 
  
  return (
    <div ref={containerRef} className={styles.container}>
       
       <Grid visibleImages={visibleImages} />
       
     </div>
  );
}
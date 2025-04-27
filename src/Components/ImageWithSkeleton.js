import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Skeleton } from "@mui/material";
import styles from "../Styles/DCard.module.css";


const ImageWithSkeleton = React.memo(
  ({ src, alt, className, sources, onError, loading = "lazy", decoding = "async" }) => {
    const [isLoaded, setIsLoaded] = useState(false);

   
    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

   
    const handleError = useCallback(
      (e) => {
        setIsLoaded(true); 
        if (onError) onError(e);
      },
      [onError]
    );

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        
        {!isLoaded && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              backgroundColor:'whitesmoke'
            }}
          />
        )}
        
        <picture>
          {sources.map((source, idx) => (
            <source
              key={`source-${idx}`}
              media={source.media}
              srcSet={source.srcSet}
              type={source.type}
            />
          ))}
          <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.3s" }}
          />
        </picture>
      </div>
    );
  }
);

ImageWithSkeleton.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      media: PropTypes.string,
      srcSet: PropTypes.string,
      type: PropTypes.string,
    })
  ).isRequired,
  onError: PropTypes.func,
  loading: PropTypes.string,
  decoding: PropTypes.string,
};

ImageWithSkeleton.displayName = "ImageWithSkeleton";

export default ImageWithSkeleton;
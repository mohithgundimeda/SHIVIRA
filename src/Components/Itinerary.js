import React, { useEffect, useMemo, useState, useCallback} from "react";
import { useLocation, useParams, useNavigate} from "react-router-dom";
import styles from '../Styles/Itinerary.module.css';
import { useIsMobile } from './useIsMobile.js';
import Skeleton from '@mui/material/Skeleton';
import Tabscomponent from "./Tabscomponent.js";
import { fetchItinerary } from "../services/api.js";
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import FlatwareOutlinedIcon from '@mui/icons-material/FlatwareOutlined';
import Tooltip from '@mui/material/Tooltip'

const CONFIG = {
  BASE_PATH: 'static/admin'
};

const folderFriendly = (place) => {
  if (!place) return '';
  return place.toLowerCase().replace(/\s+/g, '_');
};

  const cleanQuery = (text) => {
    return text?.trim().replace(/\s+/g, ' ').toLowerCase() || '';
  };

const generateImages = (placeName, version) => {
  if (!placeName) {
    return {
      alt: 'Placeholder',
      images: [],
    };
  }
  const placeObj = { alt: placeName };
  placeObj.images = [1, 2, 3, 4].map((index) => {
    return `${CONFIG.BASE_PATH}/${folderFriendly(placeName)}/${folderFriendly(placeName)}-${version}/${folderFriendly(placeName)}${index}.jpg`;
  });
  return placeObj;
};

export default function Itinerary() {
  const isMobile = useIsMobile();
  const { state } = useLocation();
  const { place: paramPlace } = useParams();
  const place = paramPlace || window.location.pathname.split('/').pop();
  const [itineraryData, setItineraryData] = useState(state?.itineraryData || null);
  const [isFetching, setIsFetching] = useState(!state?.itineraryData);
  const [error, setError] = useState(null);
   const [tooltipOpen, setTooltipOpen] = useState(false);
  const [loading, setIsLoading] = useState(() => Array(4).fill(true));
  const navigate = useNavigate();
  const placeDetails = useMemo(() => itineraryData?.place_details || [], [itineraryData]);
  const packageName = itineraryData && (itineraryData.package_name || 'Unknown Package');
  const days = itineraryData?.days || '--';
  const nights = itineraryData?.nights || '--';
  const oldCost = itineraryData?.old_cost || null;
  const new_cost = itineraryData?.cost || '--';
  const overview = itineraryData?.overview || null;
  const highlights = itineraryData?.highlights || [];
  const daysData = itineraryData?.day_details || [];
  const inclusions = itineraryData?.inclusions || [];
  const exclusions = itineraryData?.exclusions || [];
  const note = itineraryData?.note || [];
  const intermediate = useMemo(() => {
    return placeDetails
      .map(({ nights, place }) => ` ${nights}N ${place} `)
      .join('-')
      .trim();
  }, [placeDetails]);
  const Imagesobject = useMemo(() => 
    generateImages(folderFriendly(packageName), isMobile ? 'medium' : 'large'),
    [packageName, isMobile]
  );

  useEffect(() => {
    if (itineraryData) return;
    if (!place) {
      setError('Invalid itinerary URL');
      setIsFetching(false);
      return;
    }

    const abortController = new AbortController();
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const cleanedQuery = cleanQuery(place.replace(/-itinerary$/, ''));
        if (!cleanedQuery) {
          throw new Error('Folder Name Cleaning Problem');
        }
        const data = await fetchItinerary(cleanedQuery, abortController.signal);
        setItineraryData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch itinerary:', err.message);
          setError('Failed to load itinerary data');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [place, itineraryData]);

  useEffect(() => {
    Imagesobject.images.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoading((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      };
      img.onerror = () => {
        setIsLoading((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      };
    });
  }, [Imagesobject.images]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setTooltipOpen(false);
    } catch (error) {
      console.error('Failed to copy:', error);
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setTooltipOpen(false);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleNavigationToForm = useCallback((packageName)=>{
    if(!packageName) return;
    navigate('/Form', {state: {
        destination: packageName.trim(),
      },});
  },[navigate]);

  if (isFetching || !itineraryData) {
    return (
      <div className={styles.container}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" width="100%" height="100vh" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p>{error}</p>
      </div>
    );
  }

  const blocks = Imagesobject.images.length > 0 ? Imagesobject.images.map((image, index) => (
    <div key={index} className={styles.block}>
      {loading[index] && (
        <Skeleton
          width="100%"
          height="100%"
          animation="wave"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}
      <img
        src={image}
        alt={`${Imagesobject.alt} ${index + 1}`}
        className={styles.image}
        loading="lazy"
        decoding="async"
        style={{
          display: loading[index] ? 'none' : 'block',
          opacity: loading[index] ? 0 : 1,
          transition: 'opacity 0.3s ease-in',
        }}
        onLoad={() => {
          setIsLoading((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }}
        onError={() => {
          setIsLoading((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
        }}
      />
    </div>
  )) : (
    <div className={styles.block}>
      <img
        src="static/logo4.png"
        alt="Placeholder"
        style={{ width: '5rem' }}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <p className={styles.packageName}>{packageName}</p>
            <div className={styles.siders}>
            {isMobile ? (
              <button
                onClick={() => handleCopyLink()}
                className={styles.shareButton}
                aria-label="Copy itinerary link"
              >
                {<LinkOutlinedIcon fontSize="medium" />}
              </button>
            ) : (
              <Tooltip
                title="Copy Link"
                placement="top"
                arrow
                open={tooltipOpen}
                onOpen={() => setTooltipOpen(true)}
                onClose={() => setTooltipOpen(false)}
                sx={{
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: '#333',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    padding: '6px 12px',
                    borderRadius: '4px',
                  },
                  '& .MuiTooltip-arrow': {
                    color: '#333',
                  },
                }}
              >
                <button
                  onClick={() => handleCopyLink()}
                  className={styles.shareButton}
                  aria-label="Copy itinerary link"
                >
                  { <LinkOutlinedIcon fontSize="large" />}
                </button>
              </Tooltip>
            )}

            <button
              className={styles.shareButton}
              style={{ paddingBottom: isMobile ? 0 : '0.3rem' }}
              onClick={() => handleNavigationToForm(packageName)}
            >
              send enquiry
            </button>
          </div>
        </div>
        <div className={styles.packageInfo}>
          <p>{`${days}d / ${nights}n`}</p>
          <p>customizable</p>
          <p>{intermediate || 'personalized journey schedule'}</p>      
        </div>
        {
          isMobile &&(
            <div className={styles.mobileCost}>
              <div className={styles.costDisplay}>
                  {oldCost !== null && (<p className={styles.oldCost}>{`₹${Math.floor(oldCost)}`}</p>) }
                  <p className={styles.newCost}>{`₹${Math.floor(new_cost)}`} <span style={{fontSize:'0.7rem'}}>per person</span></p>
              </div>
            </div>
          )
        }
      </div>

      <div className={styles.imageContainer}>
        <div className={styles.square}>
          {blocks}
        </div>
      </div>

      <div className={styles.ItineraryContainer}>
        <Tabscomponent overview={overview} highlights={highlights} daysData={daysData} inclusions={inclusions} exclusions={exclusions} note={note}/>

        {!isMobile ? 
        <div className={styles.costAndInclusions}>
          
          <div className={styles.costContainerDesktop}>
              <p className={styles.startingFrom}>starting from</p>
              {oldCost !== null && (<div className={styles.rowFlex}><p className={styles.oldCostDesktop}>{`₹${Math.floor(oldCost)}`}</p> <p className={styles.perPerson}>per person</p></div>) }
              <div className={styles.rowFlex}><p className={styles.newCostDesktop}>{`₹${Math.floor(new_cost)}`}</p><p className={styles.perPerson}>per person</p></div>
          </div>

          <div  className={styles.inclusionsFlex}>

              <p className={styles.inclusionHeading}>
                inclusions
              </p>
              <div className={styles.inclusionsContainer}>
                <div className={styles.inclusion}><ApartmentOutlinedIcon className={styles.icon} /><p className={styles.iconText}>Hotel</p></div>
                <div className={styles.inclusion}><LandscapeOutlinedIcon className={styles.icon} /><p className={styles.iconText}>sight seeing</p></div>
                <div className={styles.inclusion}><DirectionsCarOutlinedIcon className={styles.icon} /><p className={styles.iconText}>transfer</p></div>
                <div className={styles.inclusion}><FlatwareOutlinedIcon className={styles.icon} /><p className={styles.iconText}>meals</p></div>
              </div>
          </div>
        </div> :
        null
        }
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import styles from '../Styles/SearchPage.module.css';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { IconButton, Alert, Chip } from "@mui/material";
import Skeleton from '@mui/material/Skeleton';
import SearchIcon from '@mui/icons-material/Search';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import TagsComponent from "./TagsComponent";
import { useIsMobile } from './useIsMobile';
import { debounce } from 'lodash';
import { fetchPackages, fetchSuggestions, fetchPackagesByTags } from '../services/api';

const CONFIG = {
  API_BASE_URL: '/api',
  IMAGE_BASE_PATH: "/static/admin",
  FORMATS: ["webp", "jpg"],
  SIZES: ["large", "medium"],
  DEBOUNCE_DELAY: 300,
};

export default function SearchPage() {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const [errorImages, setErrorImages] = useState({});
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const filterButtonRef = useRef(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const prevTagsLengthRef = useRef(0);

  const folderFriendly = useCallback((place) => {
    return place?.toLowerCase().split(' ').join('_') || '';
  }, []);

  const cleanQuery = useCallback((text) => {
    return text?.trim().replace(/\s+/g, ' ').toLowerCase() || '';
  }, []);

  const mapPackagesWithImages = useCallback((data) => {
    return data.map(pkg => ({
      ...pkg,
      images: CONFIG.SIZES.flatMap(size =>
        CONFIG.FORMATS.map(format => ({
          format,
          size,
          src: `${CONFIG.IMAGE_BASE_PATH}/${folderFriendly(pkg.package_name)}/${folderFriendly(pkg.package_name)}-${format}/${folderFriendly(pkg.package_name)}-${format}-${size}/${folderFriendly(pkg.package_name)}1.${format}`,
          alt: pkg.package_name
        }))
      )
    }));
  }, [folderFriendly]);

  useEffect(() => {
    async function loadDefaultPackages() {
      setIsLoading(true);
      setError(null);
      try {
        abortControllerRef.current = new AbortController();
        const data = await fetchPackages('', abortControllerRef.current.signal);
        setPackages(mapPackagesWithImages(data));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load packages');
          setPackages([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadDefaultPackages();
    return () => abortControllerRef.current?.abort();
  }, [mapPackagesWithImages]);

  const debouncedFetchSuggestions = useMemo(() => debounce(async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await fetchSuggestions(query);
      setSuggestions(data.map(pkg => pkg.package_name));
    } catch (err) {
      setSuggestions([]);
    }
  }, CONFIG.DEBOUNCE_DELAY), []);

  useEffect(() => {
    const cleanedQuery = cleanQuery(searchText);
    debouncedFetchSuggestions(cleanedQuery);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchText, cleanQuery, debouncedFetchSuggestions]);

  useEffect(() => {
    async function loadPackages() {
      setIsLoading(true);
      setError(null);
      try {
        abortControllerRef.current = new AbortController();
        let data;
        if (selectedTags.length > 0) {
          data = await fetchPackagesByTags(selectedTags, abortControllerRef.current.signal);
        } else if (prevTagsLengthRef.current > 0) {
          data = await fetchPackages('', abortControllerRef.current.signal);
        } else {
          return;
        }
        setPackages(mapPackagesWithImages(data));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(selectedTags.length > 0 ? 'Failed to load packages for selected tags' : 'Failed to load default packages');
          setPackages([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPackages();
    prevTagsLengthRef.current = selectedTags.length;
    return () => abortControllerRef.current?.abort();
  }, [selectedTags, mapPackagesWithImages]);

  const handleSearch = useCallback(async (term) => {
    if (!term) return;
    setIsLoading(true);
    setError(null);
    try {
      abortControllerRef.current = new AbortController();
      const cleanedQuery = cleanQuery(term);
      if (!cleanedQuery) {
        setPackages([]);
        return;
      }
      const data = await fetchPackages(cleanedQuery, abortControllerRef.current.signal);
      setPackages(mapPackagesWithImages(data));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to search packages');
        setPackages([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cleanQuery, mapPackagesWithImages]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleSearch(searchText);
    }
  }, [searchText, handleSearch]);

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  const handleImageError = useCallback((index, imageUrl) => {
    setErrorImages(prev => ({ ...prev, [index]: true }));
    setLoadedImages(prev => ({ ...prev, [index]: false }));
    console.error(`[SearchPage] Failed to load image ${index}: ${imageUrl}`);
  }, []);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    filterButtonRef.current?.focus();
  }, []);

  const handleNavigate = useCallback((place) => {
    if (!place || typeof place !== 'string') {
      console.error('Invalid place name for navigation');
      return;
    }
    navigate(`/${place}-itinerary`);
  }, [navigate]);

  const handleSearchChange = useCallback((event, value) => {
    setSearchText(value || '');
  }, []);

  const handleSuggestionSelect = useCallback((event, value) => {
    if (value) {
      setSearchText(value);
      handleSearch(value);
    }
  }, [handleSearch]);

  const handleTagDelete = useCallback((tagToDelete) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToDelete));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.inputContainer}>
          <Autocomplete
            freeSolo
            fullWidth
            disabled={isLoading}
            options={suggestions}
            value={searchText}
            onInputChange={handleSearchChange}
            onChange={handleSuggestionSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search packages"
                id="search-input"
                className={styles.input}
                onKeyPress={handleKeyPress}
                sx={{
                  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "gray" },
                    "& .MuiInputBase-input": { textTransform: "none" },
                    "&.Mui-focused fieldset": { borderColor: "gray", borderWidth: 1 },
                  },
                }}
              />
            )}
          />
        </div>
        <div className={`${styles.iconContainer} ${styles.filterIcon}`}>
          <IconButton onClick={() => handleSearch(searchText)} aria-label="Search packages">
            <SearchIcon className={styles.icon} />
          </IconButton>
        </div>
        <div className={`${styles.iconContainer} ${styles.filterIcon}`}>
          <IconButton ref={filterButtonRef} onClick={handleClickOpen} aria-label="Open tag filters">
            <FilterListOutlinedIcon className={styles.icon} />
          </IconButton>
        </div>
      </header>

      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className={styles.tagsWindow} role="region" aria-label="Selected tags">
        {selectedTags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleTagDelete(tag)}
            className={styles.tagBiscuit}
            aria-label={`Remove ${tag} tag`}
          />
        ))}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="filters-dialog-title"
        disableRestoreFocus
        PaperProps={{
          style: {
            minWidth: isMobile ? '400px' : '1000px',
            minHeight: '500px',
            backgroundColor: 'whitesmoke',
          },
        }}
      >
        <DialogTitle id="filters-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          FILTER BY TAGS
          <ClearOutlinedIcon
            onClick={handleClose}
            sx={{ cursor: 'pointer' }}
            aria-label="Close tag filters"
            className={styles.crossIcon}
          />
        </DialogTitle>
        <DialogContent>
          <TagsComponent
            selectedTags={selectedTags}
            onTagChange={setSelectedTags}
          />
        </DialogContent>
      </Dialog>

      <div className={styles.content}>
        {isLoading ? (
          <Skeleton animation="wave" variant="rectangular" width="100%" height="100%" className={styles.skeleton} />
        ) : packages.length > 0 ? (
          packages.map((pkg, index) => {
            const isImageLoaded = !!loadedImages[index];
            const hasImageError = !!errorImages[index];
            const fallbackImage = pkg.images.find(img => img.size === "large" && img.format === "jpg")?.src;

            return (
              <div
                key={pkg.package_name}
                className={styles.gridItem}
                onClick={() => handleNavigate(pkg.package_name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleNavigate(pkg.package_name)}
                aria-label={`View ${pkg.package_name} itinerary`}
              >
                {(!isImageLoaded || hasImageError) && (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    className={styles.skeleton}
                  />
                )}
                <picture>
                  {pkg.images
                    .filter(img => img.size === "medium")
                    .map((img, idx) => (
                      <source
                        key={`medium-${idx}`}
                        media="(max-width: 768px)"
                        srcSet={img.src}
                        type={`image/${img.format}`}
                      />
                    ))}
                  {pkg.images
                    .filter(img => img.size === "large")
                    .map((img, idx) => (
                      <source
                        key={`large-${idx}`}
                        media="(min-width: 769px)"
                        srcSet={img.src}
                        type={`image/${img.format}`}
                      />
                    ))}
                  <img
                    src={fallbackImage}
                    alt={pkg.images[0]?.alt || pkg.package_name}
                    className={styles.gridImage}
                    loading="lazy"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index, fallbackImage)}
                    style={{ opacity: isImageLoaded && !hasImageError ? 1 : 0 }}
                  />
                </picture>
                <div
                  className={styles.textContainer}
                  style={{ opacity: isImageLoaded || hasImageError ? 1 : 0 }}
                >
                  <p className={styles.packageName}>{pkg.package_name}</p>
                  <div className={styles.duration}>
                    <p>{pkg.days} days</p>
                    <p>|</p>
                    <p>{pkg.nights} nights</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.errorMessage}>
            <p className={styles.errorMessageText}>No packages found</p>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import styles from '../Styles/TagsComponent.module.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { fetchTags } from '../services/api';

const TAG_COLORS = {
  default: '#b4aea6',
  checked: '#A27B5C',
};

export default function TagsComponent({ selectedTags = [], onTagChange }) {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTagsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const abortController = new AbortController();
      const data = await fetchTags(abortController.signal);
      setTags(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[TagsComponent] Error fetching tags:', error);
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagsData();
    return () => new AbortController().abort();
  }, [fetchTagsData]);

  const groupedTags = useMemo(() => {
    return tags.reduce((acc, tag) => {
      const category = tag.category || 'Other';
      acc[category] = acc[category] || [];
      acc[category].push(tag);
      return acc;
    }, {});
  }, [tags]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedTags).sort();
  }, [groupedTags]);

  const handleTagChange = useCallback((tagName, checked) => {
    const updatedTags = checked
      ? [...selectedTags, tagName]
      : selectedTags.filter(t => t !== tagName);
    onTagChange(updatedTags);
  }, [selectedTags, onTagChange]);

  return (
    <div className={styles.container} role="region" aria-label="Tags filter">
      {isLoading ? (
        <div className={styles.loading}>
          <LinearProgress
            aria-label="Loading tags"
            sx={{
              width: '100%',
              backgroundColor: TAG_COLORS.default,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#EAE4D5',
              },
            }}
          />
        </div>
      ) : error ? (
        <Alert
          severity="error"
          className={styles.error}
          action={
            <Button color="inherit" size="small" onClick={fetchTagsData} aria-label="Retry loading tags">
              Retry
            </Button>
          }
        >
          Failed to load tags: {error}
        </Alert>
      ) : sortedCategories.length === 0 ? (
        <p className={styles.empty}>No tags available</p>
      ) : (
        sortedCategories.map(category => (
          <div key={category} className={styles.categorySection} role="group" aria-labelledby={`category-${category}`}>
            <p id={`category-${category}`} className={styles.categoryTitle}>{category.toUpperCase()}</p>
            <div className={styles.tagsContainer}>
              {groupedTags[category].map(tag => (
                <FormControlLabel
                  key={tag.tag}
                  control={
                    <Checkbox
                      sx={{
                        color: TAG_COLORS.default,
                        '&.Mui-checked': {
                          color: TAG_COLORS.checked,
                        },
                      }}
                      size="small"
                      aria-label={`Select ${tag.tag} tag`}
                      checked={selectedTags.includes(tag.tag)}
                      onChange={(e) => handleTagChange(tag.tag, e.target.checked)}
                    />
                  }
                  label={tag.tag.toUpperCase()}
                  sx={{
                    '.MuiFormControlLabel-label': {
                      fontSize: '0.85rem',
                      margin: 0,
                      fontFamily: 'Quicksand, sans-serif',
                    },
                  }}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

TagsComponent.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  onTagChange: PropTypes.func.isRequired,
};
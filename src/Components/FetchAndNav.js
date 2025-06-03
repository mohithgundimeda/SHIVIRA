import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchItinerary } from '../services/api.js';

const cleanQuery = (text) => {
  return text?.replace('_', ' ').toLowerCase() || '';
};

export default async function FetchAndNav(package_name = '') {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const handleSearch = useCallback(async (term) => {
    if (!term) {
      console.error('No package name provided');
      return;
    }

    try {
      abortControllerRef.current = new AbortController();
      const cleanedQuery = cleanQuery(term);
      if (!cleanedQuery) {
        throw new Error('Folder Name Cleaning Problem');
      }
      const data = await fetchItinerary(cleanedQuery, abortControllerRef.current.signal);
      console.log('Fetched data:', data);

      
      navigate(`/${term}-itinerary`, { state: { itineraryData: data } });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch itinerary:', err.message);

        navigate(`/${term}-itinerary`, { state: { error: 'Failed to load itinerary data' } });
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [navigate]);

  
  await handleSearch(package_name);
}
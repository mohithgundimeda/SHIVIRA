import './App.css';
import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Main from './Main';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '../src/Components/DCard';
import SearchPage from '../src/Components/SearchPage'
import NotFound from './Components/NotFound';


gsap.registerPlugin(ScrollTrigger);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    errorElement: <NotFound />
  },
  {
    path: '/Destinations/:placeName',  
    element: <Card />,
  },
  {
    path: '/Search',  
    element: <SearchPage />,
  },
]);

export default function App() {

  useEffect(() => {
     
    const lenis = new Lenis({
      smooth: true,
    });

     
    lenis.on('scroll', ScrollTrigger.update);

    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

     
    gsap.ticker.lagSmoothing(0);

     
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}
import './App.css';
import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration as RouterScrollRestoration } from 'react-router-dom';
import Main from './Main';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from './Components/DCard';
import SearchPage from './Components/SearchPage';
import NotFound from './Components/NotFound';
import Form from './Components/Form';

gsap.registerPlugin(ScrollTrigger);


const RootLayout = () => (
  <>
    <RouterScrollRestoration />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Main />,
      },
      {
        path: '/Destinations/:placeName',
        element: <Card />,
      },
      {
        path: '/Search',
        element: <SearchPage />,
      },
      {
        path:'/Form',
        element:<Form/>
      }
    ],
  },
]);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.1,
    });
    window.lenis = lenis;
    

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    
    const handleRouteChangeStart = () => {
      lenis.stop();
    };

    const handleRouteChangeComplete = () => {
      lenis.start();
    };

    
    const unlisten = router.subscribe((state) => {
      handleRouteChangeStart();
      setTimeout(handleRouteChangeComplete, 100);
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      unlisten();
    };
  }, []);

  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}
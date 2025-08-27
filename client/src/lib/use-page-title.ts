import { useEffect } from 'react';

/**
 * Hook to dynamically set the page title
 * @param title - The title to set (will be appended with " | Workout Pal")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Workout Pal`;
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

/**
 * Hook to set dynamic page title with workout split information
 * @param split - The workout split
 * @param basePage - The base page name (e.g., "Workout")
 */
export function useWorkoutPageTitle(split?: string | null, basePage: string = "Workout") {
  const title = split ? `${basePage} - ${split.charAt(0) + split.slice(1).toLowerCase().replace('_', ' ')}` : basePage;
  usePageTitle(title);
}
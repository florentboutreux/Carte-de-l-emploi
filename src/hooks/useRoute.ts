import { useState, useEffect } from 'react';

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
}

export interface RouteData {
  coordinates: [number, number][]; // [lat, lng]
  steps: RouteStep[];
  distance: number; // in meters
  duration: number; // in seconds
}

export function useRoute(startCoords: [number, number] | null | undefined, endCoords: [number, number] | null | undefined) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startCoords || !endCoords) {
      setRoute(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchRoute = async () => {
      try {
        // OSRM expects lng,lat
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`
        );
        const data = await response.json();

        if (isMounted && data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          
          // Convert [lng, lat] to [lat, lng] for Leaflet
          const coordinates = routeData.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          
          const steps = routeData.legs[0].steps.map((step: any) => ({
            instruction: step.maneuver.type + (step.maneuver.modifier ? ' ' + step.maneuver.modifier : ''),
            distance: step.distance,
            duration: step.duration,
            name: step.name
          }));

          setRoute({
            coordinates,
            steps,
            distance: routeData.distance,
            duration: routeData.duration
          });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [startCoords, endCoords]);

  return { route, loading };
}

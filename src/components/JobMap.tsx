import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { JobOffer } from '../types';
import { Maximize2, Minimize2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface JobMapProps {
  jobs: JobOffer[];
  center: [number, number];
  userCoords?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onJobSelect?: (job: JobOffer) => void;
  selectedJobId?: string | null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export const JobMap: React.FC<JobMapProps> = ({ jobs, center, userCoords, onLocationSelect, onJobSelect, selectedJobId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  function MarkerController({ selectedId, jobs }: { selectedId: string | null, jobs: JobOffer[] }) {
    const map = useMap();
    useEffect(() => {
      if (selectedId) {
        const job = jobs.find(j => j.id === selectedId);
        if (job) {
          map.setView([job.lat, job.lng], 15, { animate: true });
        }
      }
    }, [selectedId, jobs, map]);
    return null;
  }

  return (
    <div className={cn(
      "relative transition-all duration-500 ease-in-out overflow-hidden rounded-2xl shadow-lg border border-black/5",
      isExpanded ? "fixed inset-4 z-50 h-[calc(100vh-32px)]" : "h-64 md:h-full w-full"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 right-4 z-[1000] p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        <MapEvents onLocationSelect={onLocationSelect} />
        <MarkerController selectedId={selectedJobId} jobs={jobs} />
        
        {userCoords && (
          <Marker position={userCoords} icon={L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })}>
            <Popup>Votre position</Popup>
          </Marker>
        )}

        {selectedJob && userCoords && (
          <Polyline 
            positions={[userCoords, [selectedJob.lat, selectedJob.lng]]} 
            color="#10b981" 
            dashArray="10, 10"
            weight={3}
          />
        )}
        
        {jobs.map((job) => {
          const isSimilar = job.isSimilarJob;
          const markerIcon = L.icon({
            iconUrl: isSimilar 
              ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png'
              : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          return (
            <Marker 
              key={job.id} 
              position={[job.lat, job.lng]}
              icon={markerIcon}
              opacity={selectedJobId && selectedJobId !== job.id ? 0.5 : 1}
              eventHandlers={{
                click: () => {
                  onJobSelect?.(job);
                },
              }}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  {isSimilar && (
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full mb-1 uppercase tracking-wider">
                      Métier similaire
                    </span>
                  )}
                  <h3 className="font-bold text-sm leading-tight">{job.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{job.company}</p>
                  <div className="flex flex-col gap-2 mt-3">
                    <button 
                      onClick={() => onJobSelect?.(job)}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-center"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
